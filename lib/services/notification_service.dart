import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../models/notification_model.dart';
import 'firestore_service.dart';
import 'storage_service.dart';

abstract class INotificationService {
  Future<List<NotificationModel>> getUserNotifications(String recipientId);
  Future<void> sendNotification({
    required String recipientId,
    required String title,
    required String message,
    String? complaintId,
    String? complaintNumber,
    NotificationType type,
  });
  Future<void> markAsRead(String notificationId);
  Future<void> markAllAsRead(String recipientId);
  Future<int> getUnreadCount(String recipientId);
}

class NotificationService implements INotificationService {
  final StorageService _storageService;
  final FirestoreService _firestoreService;
  final _uuid = const Uuid();

  final List<NotificationModel> _notifications = [];
  bool _isInitialized = false;

  NotificationService({
    StorageService? storageService,
    FirestoreService? firestoreService,
  })  : _storageService = storageService ?? StorageService(),
        _firestoreService = firestoreService ?? FirestoreService();

  Future<void> _ensureInitialized() async {
    if (_isInitialized) return;

    // 1. Load from local cache
    final rawList = await _storageService.getNotifications();
    _notifications.clear();
    for (final raw in rawList) {
      try {
        _notifications.add(NotificationModel.fromJson(raw));
      } catch (_) {}
    }

    // 2. Sync from Cloud Firestore
    try {
      final cloudList = await _firestoreService.getNotifications();
      if (cloudList.isNotEmpty) {
        for (final item in cloudList) {
          final idx = _notifications.indexWhere((n) => n.id == item.id);
          if (idx >= 0) {
            _notifications[idx] = item;
          } else {
            _notifications.add(item);
          }
        }
        await _persistLocal();
      }
    } catch (_) {}

    _isInitialized = true;
  }

  Future<void> _persistLocal() async {
    final list = _notifications.map((n) => n.toJson()).toList();
    await _storageService.saveNotifications(list);
  }

  @override
  Future<List<NotificationModel>> getUserNotifications(String recipientId) async {
    await _ensureInitialized();
    final userNotifs = _notifications.where((n) => n.recipientId == recipientId).toList();
    userNotifs.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return userNotifs;
  }

  @override
  Future<void> sendNotification({
    required String recipientId,
    required String title,
    required String message,
    String? complaintId,
    String? complaintNumber,
    NotificationType type = NotificationType.statusUpdate,
  }) async {
    await _ensureInitialized();

    final newNotif = NotificationModel(
      id: _uuid.v4(),
      recipientId: recipientId,
      title: title,
      message: message,
      complaintId: complaintId,
      complaintNumber: complaintNumber,
      type: type,
      createdAt: DateTime.now(),
      isRead: false,
    );

    _notifications.add(newNotif);
    await _persistLocal();
    await _firestoreService.saveNotification(newNotif);
    debugPrint('Notification sent to $recipientId: $title');
  }

  @override
  Future<void> markAsRead(String notificationId) async {
    await _ensureInitialized();
    final idx = _notifications.indexWhere((n) => n.id == notificationId);
    if (idx >= 0) {
      final updated = _notifications[idx].copyWith(isRead: true);
      _notifications[idx] = updated;
      await _persistLocal();
      await _firestoreService.saveNotification(updated);
    }
  }

  @override
  Future<void> markAllAsRead(String recipientId) async {
    await _ensureInitialized();
    for (int i = 0; i < _notifications.length; i++) {
      if (_notifications[i].recipientId == recipientId && !_notifications[i].isRead) {
        final updated = _notifications[i].copyWith(isRead: true);
        _notifications[i] = updated;
        await _firestoreService.saveNotification(updated);
      }
    }
    await _persistLocal();
  }

  @override
  Future<int> getUnreadCount(String recipientId) async {
    await _ensureInitialized();
    return _notifications.where((n) => n.recipientId == recipientId && !n.isRead).length;
  }
}
