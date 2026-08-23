import 'package:uuid/uuid.dart';
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

abstract class IComplaintService {
  Future<List<ComplaintModel>> getAllComplaints();
  Future<List<ComplaintModel>> getCitizenComplaints(String citizenId);
  Future<ComplaintModel?> getComplaintById(String id);
  Future<ComplaintStats> getCitizenStats(String citizenId);
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
}

class ComplaintService implements IComplaintService {
  final StorageService _storageService;
  final _uuid = const Uuid();

  final List<ComplaintModel> _complaints = [];
  bool _isInitialized = false;

  ComplaintService({StorageService? storageService})
      : _storageService = storageService ?? StorageService();

  Future<void> _ensureInitialized() async {
    if (_isInitialized) return;
    final rawList = await _storageService.getComplaints();
    _complaints.clear();
    for (final raw in rawList) {
      try {
        _complaints.add(ComplaintModel.fromJson(raw));
      } catch (_) {}
    }
    _isInitialized = true;
  }

  Future<void> _persist() async {
    final list = _complaints.map((c) => c.toJson()).toList();
    await _storageService.saveComplaints(list);
  }

  String _generateNextComplaintNumber() {
    // Determine the next number based on existing CMP-XXXX
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
    // Return sorted newest first
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
      createdAt: DateTime.now(),
    );

    _complaints.add(newComplaint);
    await _persist();

    return Success(newComplaint);
  }
}
