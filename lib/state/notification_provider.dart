import 'package:flutter/foundation.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';

class NotificationProvider extends ChangeNotifier {
  final INotificationService _notificationService;

  NotificationProvider({INotificationService? notificationService})
      : _notificationService = notificationService ?? NotificationService();

  List<NotificationModel> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;

  List<NotificationModel> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;

  Future<void> loadNotifications(String recipientId) async {
    _isLoading = true;
    notifyListeners();

    try {
      _notifications = await _notificationService.getUserNotifications(recipientId);
      _unreadCount = await _notificationService.getUnreadCount(recipientId);
    } catch (_) {}

    _isLoading = false;
    notifyListeners();
  }

  Future<void> markAsRead(String notificationId, String recipientId) async {
    await _notificationService.markAsRead(notificationId);
    await loadNotifications(recipientId);
  }

  Future<void> markAllAsRead(String recipientId) async {
    await _notificationService.markAllAsRead(recipientId);
    await loadNotifications(recipientId);
  }
}
