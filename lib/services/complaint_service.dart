import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../core/utils/geo_utils.dart';
import '../core/utils/result.dart';
import '../core/widgets/status_badge.dart';
import '../models/complaint_model.dart';
import 'storage_service.dart';

class ComplaintStats {
  final int total;
  final int submitted;
  final int inProgress;
  final int resolved;

  const ComplaintStats({
    required this.total,
    required this.submitted,
    required this.inProgress,
    required this.resolved,
  });

  factory ComplaintStats.empty() {
    return const ComplaintStats(total: 0, submitted: 0, inProgress: 0, resolved: 0);
  }
}

class DuplicateMatch {
  final ComplaintModel complaint;
  final double distanceMeters;

  const DuplicateMatch({
    required this.complaint,
    required this.distanceMeters,
  });
}

abstract class IComplaintService {
  Future<List<ComplaintModel>> getAllComplaints();
  Future<List<ComplaintModel>> getCitizenComplaints(String citizenId);
  Future<ComplaintModel?> getComplaintById(String id);
  Future<ComplaintStats> getCitizenStats(String citizenId);
  Future<List<DuplicateMatch>> detectDuplicates({
    required double latitude,
    required double longitude,
    required ComplaintCategory category,
    double thresholdMeters = 150.0,
  });
  Future<Result<ComplaintModel>> upvoteComplaint({
    required String complaintId,
    required String citizenId,
  });
  Future<Result<ComplaintModel>> submitComplaint({
    required String citizenId,
    required String citizenName,
    required String citizenPhone,
    required ComplaintCategory category,
    required String description,
    String? imageUrl,
    required double latitude,
    required double longitude,
    required String address,
  });
  Future<Result<ComplaintModel>> updateComplaintStatus({
    required String complaintId,
    required ComplaintStatus status,
    String? workerId,
    String? workerName,
    String? workerPhone,
    String? departmentId,
    String? departmentName,
    String? resolutionNotes,
    String? resolutionImageUrl,
  });
}

class ComplaintService implements IComplaintService {
  final StorageService _storageService;
  final FirebaseFirestore? _firestore;
  final _uuid = const Uuid();

  final List<ComplaintModel> _complaints = [];
  bool _isInitialized = false;

  ComplaintService({
    StorageService? storageService,
    FirebaseFirestore? firestore,
  })  : _storageService = storageService ?? StorageService(),
        _firestore = firestore ?? _tryGetFirestore();

  static FirebaseFirestore? _tryGetFirestore() {
    try {
      return FirebaseFirestore.instance;
    } catch (_) {
      return null;
    }
  }

  Future<void> _ensureInitialized() async {
    if (_isInitialized) return;

    // 1. Load from local cache first
    final rawList = await _storageService.getComplaints();
    _complaints.clear();
    for (final raw in rawList) {
      try {
        _complaints.add(ComplaintModel.fromJson(raw));
      } catch (_) {}
    }

    // 2. Sync from live Cloud Firestore if online
    if (_firestore != null) {
      try {
        final snapshot = await _firestore.collection('complaints').get();
        if (snapshot.docs.isNotEmpty) {
          final cloudComplaints = <ComplaintModel>[];
          for (final doc in snapshot.docs) {
            try {
              cloudComplaints.add(ComplaintModel.fromJson(doc.data()));
            } catch (e) {
              debugPrint('Error parsing Firestore doc ${doc.id}: $e');
            }
          }
          if (cloudComplaints.isNotEmpty) {
            _complaints.clear();
            _complaints.addAll(cloudComplaints);
            await _persistLocal();
          }
        }
      } catch (e) {
        debugPrint('Firestore read note (using local cache): $e');
      }
    }

    _isInitialized = true;
  }

  Future<void> _persistLocal() async {
    final list = _complaints.map((c) => c.toJson()).toList();
    await _storageService.saveComplaints(list);
  }

  Future<void> _persistDocToCloud(ComplaintModel complaint) async {
    if (_firestore != null) {
      try {
        await _firestore.collection('complaints').doc(complaint.id).set(complaint.toJson());
      } catch (e) {
        debugPrint('Cloud Firestore sync note: $e');
      }
    }
  }

  String _generateNextComplaintNumber() {
    int highestNum = 1000;
    for (final c in _complaints) {
      if (c.complaintNumber.startsWith('CMP-')) {
        final numPart = int.tryParse(c.complaintNumber.substring(4));
        if (numPart != null && numPart > highestNum) {
          highestNum = numPart;
        }
      }
    }
    return 'CMP-${highestNum + 1}';
  }

  @override
  Future<List<ComplaintModel>> getAllComplaints() async {
    await _ensureInitialized();
    final sorted = List<ComplaintModel>.from(_complaints);
    sorted.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return sorted;
  }

  @override
  Future<List<ComplaintModel>> getCitizenComplaints(String citizenId) async {
    await _ensureInitialized();
    final userComplaints =
        _complaints.where((c) => c.citizenId == citizenId).toList();
    userComplaints.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return userComplaints;
  }

  @override
  Future<ComplaintModel?> getComplaintById(String id) async {
    await _ensureInitialized();
    try {
      return _complaints.firstWhere((c) => c.id == id || c.complaintNumber == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<ComplaintStats> getCitizenStats(String citizenId) async {
    await _ensureInitialized();
    final userComplaints =
        _complaints.where((c) => c.citizenId == citizenId).toList();

    int submitted = 0;
    int inProgress = 0;
    int resolved = 0;

    for (final c in userComplaints) {
      switch (c.status) {
        case ComplaintStatus.submitted:
        case ComplaintStatus.verified:
          submitted++;
          break;
        case ComplaintStatus.assigned:
        case ComplaintStatus.accepted:
        case ComplaintStatus.inProgress:
          inProgress++;
          break;
        case ComplaintStatus.resolved:
          resolved++;
          break;
      }
    }

    return ComplaintStats(
      total: userComplaints.length,
      submitted: submitted,
      inProgress: inProgress,
      resolved: resolved,
    );
  }

  @override
  Future<List<DuplicateMatch>> detectDuplicates({
    required double latitude,
    required double longitude,
    required ComplaintCategory category,
    double thresholdMeters = 150.0,
  }) async {
    await _ensureInitialized();

    final matches = <DuplicateMatch>[];
    for (final c in _complaints) {
      if (c.status == ComplaintStatus.resolved) continue;
      if (c.category != category) continue;

      final dist = GeoUtils.calculateDistanceMeters(
        lat1: latitude,
        lng1: longitude,
        lat2: c.latitude,
        lng2: c.longitude,
      );

      if (dist <= thresholdMeters) {
        matches.add(DuplicateMatch(complaint: c, distanceMeters: dist));
      }
    }

    matches.sort((a, b) => a.distanceMeters.compareTo(b.distanceMeters));
    return matches;
  }

  @override
  Future<Result<ComplaintModel>> upvoteComplaint({
    required String complaintId,
    required String citizenId,
  }) async {
    await _ensureInitialized();
    final index = _complaints.indexWhere((c) => c.id == complaintId || c.complaintNumber == complaintId);
    if (index == -1) {
      return const Failure('Complaint not found.');
    }

    final complaint = _complaints[index];
    if (complaint.isUpvotedBy(citizenId)) {
      return const Failure('You have already supported this complaint.');
    }

    final updatedUpvotedBy = List<String>.from(complaint.upvotedBy)..add(citizenId);
    final updatedComplaint = complaint.copyWith(
      upvotesCount: complaint.upvotesCount + 1,
      upvotedBy: updatedUpvotedBy,
    );

    _complaints[index] = updatedComplaint;
    await _persistLocal();
    await _persistDocToCloud(updatedComplaint);

    return Success(updatedComplaint);
  }

  @override
  Future<Result<ComplaintModel>> submitComplaint({
    required String citizenId,
    required String citizenName,
    required String citizenPhone,
    required ComplaintCategory category,
    required String description,
    String? imageUrl,
    required double latitude,
    required double longitude,
    required String address,
  }) async {
    await _ensureInitialized();

    final cleanDesc = description.trim();
    if (cleanDesc.length < 10) {
      return const Failure('Description must be at least 10 characters long.');
    }

    final newComplaint = ComplaintModel(
      id: _uuid.v4(),
      complaintNumber: _generateNextComplaintNumber(),
      citizenId: citizenId,
      citizenName: citizenName,
      citizenPhone: citizenPhone,
      category: category,
      description: cleanDesc,
      imageUrl: imageUrl,
      latitude: latitude,
      longitude: longitude,
      address: address.trim().isEmpty ? 'Coordinates: $latitude, $longitude' : address.trim(),
      status: ComplaintStatus.submitted,
      upvotesCount: 0,
      upvotedBy: const [],
      createdAt: DateTime.now(),
    );

    _complaints.add(newComplaint);
    await _persistLocal();
    await _persistDocToCloud(newComplaint);

    return Success(newComplaint);
  }

  @override
  Future<Result<ComplaintModel>> updateComplaintStatus({
    required String complaintId,
    required ComplaintStatus status,
    String? workerId,
    String? workerName,
    String? workerPhone,
    String? departmentId,
    String? departmentName,
    String? resolutionNotes,
    String? resolutionImageUrl,
  }) async {
    await _ensureInitialized();
    final index = _complaints.indexWhere((c) => c.id == complaintId || c.complaintNumber == complaintId);
    if (index == -1) {
      return const Failure('Complaint not found.');
    }

    final existing = _complaints[index];
    final now = DateTime.now();

    final updated = existing.copyWith(
      status: status,
      workerId: workerId ?? existing.workerId,
      workerName: workerName ?? existing.workerName,
      workerPhone: workerPhone ?? existing.workerPhone,
      departmentId: departmentId ?? existing.departmentId,
      departmentName: departmentName ?? existing.departmentName,
      verifiedAt: status == ComplaintStatus.verified ? now : existing.verifiedAt,
      assignedAt: status == ComplaintStatus.assigned ? now : existing.assignedAt,
      acceptedAt: status == ComplaintStatus.accepted ? now : existing.acceptedAt,
      startedAt: status == ComplaintStatus.inProgress ? now : existing.startedAt,
      resolvedAt: status == ComplaintStatus.resolved ? now : existing.resolvedAt,
      resolutionNotes: resolutionNotes ?? existing.resolutionNotes,
      resolutionImageUrl: resolutionImageUrl ?? existing.resolutionImageUrl,
    );

    _complaints[index] = updated;
    await _persistLocal();
    await _persistDocToCloud(updated);

    return Success(updated);
  }
}
