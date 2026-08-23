import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../core/widgets/status_badge.dart';
import '../models/complaint_model.dart';
import '../models/notification_model.dart';
import '../models/user_model.dart';

class FirestoreService {
  static const String projectId = 'civicconnect-defca';
  static const String baseUrl =
      'https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents';

  FirebaseFirestore? get _firestore {
    try {
      if (Firebase.apps.isNotEmpty) {
        return FirebaseFirestore.instance;
      }
    } catch (_) {}
    return null;
  }

  // Convert ComplaintModel to Firestore REST fields map
  Map<String, dynamic> _complaintToRestFields(ComplaintModel c) {
    final fields = <String, dynamic>{
      'id': {'stringValue': c.id},
      'complaintNumber': {'stringValue': c.complaintNumber},
      'citizenId': {'stringValue': c.citizenId},
      'citizenName': {'stringValue': c.citizenName},
      'citizenPhone': {'stringValue': c.citizenPhone},
      'category': {'stringValue': c.category.displayName},
      'description': {'stringValue': c.description},
      'address': {'stringValue': c.address},
      'latitude': {'doubleValue': c.latitude},
      'longitude': {'doubleValue': c.longitude},
      'status': {'stringValue': c.status.nameCode},
      'upvotesCount': {'integerValue': '${c.upvotesCount}'},
      'upvotedBy': c.upvotedBy.isEmpty
          ? <String, dynamic>{'arrayValue': <String, dynamic>{}}
          : <String, dynamic>{
              'arrayValue': {
                'values': c.upvotedBy.map((id) => {'stringValue': id}).toList(),
              }
            },
      'createdAt': {'stringValue': c.createdAt.toIso8601String()},
    };

    if (c.imageUrl != null && c.imageUrl!.isNotEmpty) {
      fields['imageUrl'] = {'stringValue': c.imageUrl!};
    }
    if (c.workerId != null) fields['workerId'] = {'stringValue': c.workerId!};
    if (c.workerName != null) fields['workerName'] = {'stringValue': c.workerName!};
    if (c.workerPhone != null) fields['workerPhone'] = {'stringValue': c.workerPhone!};
    if (c.departmentId != null) fields['departmentId'] = {'stringValue': c.departmentId!};
    if (c.departmentName != null) fields['departmentName'] = {'stringValue': c.departmentName!};
    if (c.verifiedAt != null) fields['verifiedAt'] = {'stringValue': c.verifiedAt!.toIso8601String()};
    if (c.assignedAt != null) fields['assignedAt'] = {'stringValue': c.assignedAt!.toIso8601String()};
    if (c.acceptedAt != null) fields['acceptedAt'] = {'stringValue': c.acceptedAt!.toIso8601String()};
    if (c.startedAt != null) fields['startedAt'] = {'stringValue': c.startedAt!.toIso8601String()};
    if (c.resolvedAt != null) fields['resolvedAt'] = {'stringValue': c.resolvedAt!.toIso8601String()};
    if (c.resolutionNotes != null) fields['resolutionNotes'] = {'stringValue': c.resolutionNotes!};
    if (c.resolutionImageUrl != null) fields['resolutionImageUrl'] = {'stringValue': c.resolutionImageUrl!};

    return {'fields': fields};
  }

  // Parse Firestore REST document to ComplaintModel
  ComplaintModel? _parseRestDocToComplaint(Map<String, dynamic> doc) {
    try {
      final fields = doc['fields'] as Map<String, dynamic>?;
      if (fields == null) return null;

      String getString(String key, [String fallback = '']) {
        return (fields[key]?['stringValue'] as String?) ?? fallback;
      }

      double getDouble(String key, [double fallback = 0.0]) {
        final val = fields[key];
        if (val == null) return fallback;
        if (val['doubleValue'] != null) return (val['doubleValue'] as num).toDouble();
        if (val['integerValue'] != null) return (val['integerValue'] as num).toDouble();
        return fallback;
      }

      int getInt(String key, [int fallback = 0]) {
        final val = fields[key];
        if (val == null) return fallback;
        if (val['integerValue'] != null) return int.tryParse(val['integerValue'].toString()) ?? fallback;
        if (val['doubleValue'] != null) return (val['doubleValue'] as num).toInt();
        return fallback;
      }

      List<String> getArray(String key) {
        final val = fields[key]?['arrayValue']?['values'] as List<dynamic>?;
        if (val == null) return [];
        return val.map((e) => e['stringValue']?.toString() ?? '').where((s) => s.isNotEmpty).toList();
      }

      DateTime? getDateTime(String key) {
        final str = fields[key]?['stringValue'] as String?;
        if (str == null) return null;
        return DateTime.tryParse(str);
      }

      final id = getString('id', doc['name']?.toString().split('/').last ?? '');
      final complaintNumber = getString('complaintNumber', 'CMP-1000');
      final citizenId = getString('citizenId');
      final citizenName = getString('citizenName', 'Citizen');
      final citizenPhone = getString('citizenPhone');
      final categoryStr = getString('category', 'other');
      final description = getString('description');
      final imageUrl = fields['imageUrl']?['stringValue'] as String?;
      final latitude = getDouble('latitude');
      final longitude = getDouble('longitude');
      final address = getString('address', 'Location Coordinates Tagged');
      final statusStr = getString('status', 'submitted');
      final upvotedBy = getArray('upvotedBy');
      final upvotesCount = getInt('upvotesCount', upvotedBy.length);

      return ComplaintModel(
        id: id,
        complaintNumber: complaintNumber,
        citizenId: citizenId,
        citizenName: citizenName,
        citizenPhone: citizenPhone,
        category: ComplaintCategory.fromString(categoryStr),
        description: description,
        imageUrl: imageUrl,
        latitude: latitude,
        longitude: longitude,
        address: address,
        status: ComplaintStatusExtension.fromString(statusStr),
        upvotesCount: upvotesCount,
        upvotedBy: upvotedBy,
        workerId: fields['workerId']?['stringValue'] as String?,
        workerName: fields['workerName']?['stringValue'] as String?,
        workerPhone: fields['workerPhone']?['stringValue'] as String?,
        departmentId: fields['departmentId']?['stringValue'] as String?,
        departmentName: fields['departmentName']?['stringValue'] as String?,
        createdAt: getDateTime('createdAt') ?? DateTime.now(),
        verifiedAt: getDateTime('verifiedAt'),
        assignedAt: getDateTime('assignedAt'),
        acceptedAt: getDateTime('acceptedAt'),
        startedAt: getDateTime('startedAt'),
        resolvedAt: getDateTime('resolvedAt'),
        resolutionNotes: fields['resolutionNotes']?['stringValue'] as String?,
        resolutionImageUrl: fields['resolutionImageUrl']?['stringValue'] as String?,
      );
    } catch (e) {
      debugPrint('Error parsing REST doc to complaint: $e');
      return null;
    }
  }

  /// Write a complaint to Cloud Firestore
  Future<void> saveComplaint(ComplaintModel complaint) async {
    // 1. Try Native/Web Firestore SDK
    if (_firestore != null) {
      try {
        await _firestore!.collection('complaints').doc(complaint.id).set(complaint.toJson());
        debugPrint('Saved complaint ${complaint.complaintNumber} via Firestore SDK');
      } catch (e) {
        debugPrint('Firestore SDK write note: $e');
      }
    }

    // 2. Direct REST write (Guaranteed fallback)
    try {
      final url = Uri.parse('$baseUrl/complaints/${complaint.id}');
      final body = jsonEncode(_complaintToRestFields(complaint));
      final res = await http.patch(
        url,
        headers: {'Content-Type': 'application/json'},
        body: body,
      );
      if (res.statusCode >= 200 && res.statusCode < 300) {
        debugPrint('Synced complaint ${complaint.complaintNumber} to Cloud Firestore via REST (Status: ${res.statusCode})');
      } else {
        debugPrint('REST sync response: ${res.statusCode} ${res.body}');
      }
    } catch (e) {
      debugPrint('REST sync network note: $e');
    }
  }

  /// Read all complaints from Cloud Firestore
  Future<List<ComplaintModel>> getComplaints() async {
    final list = <ComplaintModel>[];

    // 1. Try Native/Web Firestore SDK
    if (_firestore != null) {
      try {
        final snapshot = await _firestore!.collection('complaints').get();
        if (snapshot.docs.isNotEmpty) {
          for (final doc in snapshot.docs) {
            try {
              list.add(ComplaintModel.fromJson(doc.data()));
            } catch (_) {}
          }
          if (list.isNotEmpty) return list;
        }
      } catch (e) {
        debugPrint('Firestore SDK read note: $e');
      }
    }

    // 2. Direct REST read fallback
    try {
      final url = Uri.parse('$baseUrl/complaints');
      final res = await http.get(url);
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final docs = data['documents'] as List<dynamic>?;
        if (docs != null) {
          for (final raw in docs) {
            final parsed = _parseRestDocToComplaint(raw as Map<String, dynamic>);
            if (parsed != null) {
              list.add(parsed);
            }
          }
        }
      }
    } catch (e) {
      debugPrint('REST getComplaints network note: $e');
    }

    return list;
  }

  /// Write a user to Cloud Firestore
  Future<void> saveUser(UserModel user, String password) async {
    // 1. Try SDK
    if (_firestore != null) {
      try {
        final json = user.toJson();
        json['password'] = password;
        await _firestore!.collection('users').doc(user.id).set(json);
      } catch (_) {}
    }

    // 2. Try REST
    try {
      final url = Uri.parse('$baseUrl/users/${user.id}');
      final body = jsonEncode({
        'fields': {
          'id': {'stringValue': user.id},
          'fullName': {'stringValue': user.fullName},
          'username': {'stringValue': user.username},
          'email': {'stringValue': user.email},
          'phone': {'stringValue': user.phone},
          'role': {'stringValue': user.role.name},
          'password': {'stringValue': password},
          'createdAt': {'stringValue': user.createdAt.toIso8601String()},
        }
      });
      await http.patch(url, headers: {'Content-Type': 'application/json'}, body: body);
    } catch (_) {}
  }

  /// Write a notification to Cloud Firestore
  Future<void> saveNotification(NotificationModel n) async {
    if (_firestore != null) {
      try {
        await _firestore!.collection('notifications').doc(n.id).set(n.toJson());
      } catch (_) {}
    }

    try {
      final url = Uri.parse('$baseUrl/notifications/${n.id}');
      final body = jsonEncode({
        'fields': {
          'id': {'stringValue': n.id},
          'recipientId': {'stringValue': n.recipientId},
          'title': {'stringValue': n.title},
          'message': {'stringValue': n.message},
          'complaintId': n.complaintId != null ? {'stringValue': n.complaintId!} : {'nullValue': null},
          'complaintNumber': n.complaintNumber != null ? {'stringValue': n.complaintNumber!} : {'nullValue': null},
          'type': {'stringValue': n.type.name},
          'isRead': {'booleanValue': n.isRead},
          'createdAt': {'stringValue': n.createdAt.toIso8601String()},
        }
      });
      await http.patch(url, headers: {'Content-Type': 'application/json'}, body: body);
    } catch (_) {}
  }

  /// Read all notifications from Cloud Firestore
  Future<List<NotificationModel>> getNotifications() async {
    final list = <NotificationModel>[];

    if (_firestore != null) {
      try {
        final snapshot = await _firestore!.collection('notifications').get();
        for (final doc in snapshot.docs) {
          try {
            list.add(NotificationModel.fromJson(doc.data()));
          } catch (_) {}
        }
        if (list.isNotEmpty) return list;
      } catch (_) {}
    }

    try {
      final url = Uri.parse('$baseUrl/notifications');
      final res = await http.get(url);
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final docs = data['documents'] as List<dynamic>?;
        if (docs != null) {
          for (final raw in docs) {
            final fields = (raw as Map<String, dynamic>)['fields'] as Map<String, dynamic>?;
            if (fields != null) {
              final id = fields['id']?['stringValue'] ?? '';
              final recipientId = fields['recipientId']?['stringValue'] ?? '';
              final title = fields['title']?['stringValue'] ?? '';
              final message = fields['message']?['stringValue'] ?? '';
              final complaintId = fields['complaintId']?['stringValue'];
              final complaintNumber = fields['complaintNumber']?['stringValue'];
              final typeStr = fields['type']?['stringValue'] ?? 'statusUpdate';
              final isRead = fields['isRead']?['booleanValue'] ?? false;
              final createdAtStr = fields['createdAt']?['stringValue'];
              final createdAt = createdAtStr != null ? DateTime.tryParse(createdAtStr) ?? DateTime.now() : DateTime.now();

              list.add(NotificationModel(
                id: id,
                recipientId: recipientId,
                title: title,
                message: message,
                complaintId: complaintId,
                complaintNumber: complaintNumber,
                type: NotificationType.values.firstWhere((t) => t.name.toLowerCase() == typeStr.toLowerCase(), orElse: () => NotificationType.statusUpdate),
                isRead: isRead,
                createdAt: createdAt,
              ));
            }
          }
        }
      }
    } catch (_) {}

    return list;
  }
}
