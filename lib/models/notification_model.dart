enum NotificationType {
  statusUpdate,
  assignment,
  resolution,
  general,
}

class NotificationModel {
  final String id;
  final String recipientId; // User ID (citizen or worker or admin)
  final String title;
  final String message;
  final String? complaintId;
  final String? complaintNumber;
  final NotificationType type;
  final DateTime createdAt;
  final bool isRead;

  const NotificationModel({
    required this.id,
    required this.recipientId,
    required this.title,
    required this.message,
    this.complaintId,
    this.complaintNumber,
    this.type = NotificationType.statusUpdate,
    required this.createdAt,
    this.isRead = false,
  });

  NotificationModel copyWith({
    String? id,
    String? recipientId,
    String? title,
    String? message,
    String? complaintId,
    String? complaintNumber,
    NotificationType? type,
    DateTime? createdAt,
    bool? isRead,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      recipientId: recipientId ?? this.recipientId,
      title: title ?? this.title,
      message: message ?? this.message,
      complaintId: complaintId ?? this.complaintId,
      complaintNumber: complaintNumber ?? this.complaintNumber,
      type: type ?? this.type,
      createdAt: createdAt ?? this.createdAt,
      isRead: isRead ?? this.isRead,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'recipientId': recipientId,
      'title': title,
      'message': message,
      'complaintId': complaintId,
      'complaintNumber': complaintNumber,
      'type': type.name,
      'createdAt': createdAt.toIso8601String(),
      'isRead': isRead,
    };
  }

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    NotificationType parseType(String? val) {
      if (val == null) return NotificationType.statusUpdate;
      return NotificationType.values.firstWhere(
        (t) => t.name.toLowerCase() == val.toLowerCase(),
        orElse: () => NotificationType.statusUpdate,
      );
    }

    return NotificationModel(
      id: json['id'] as String? ?? '',
      recipientId: json['recipientId'] as String? ?? '',
      title: json['title'] as String? ?? 'Notification',
      message: json['message'] as String? ?? '',
      complaintId: json['complaintId'] as String?,
      complaintNumber: json['complaintNumber'] as String?,
      type: parseType(json['type'] as String?),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      isRead: json['isRead'] as bool? ?? false,
    );
  }
}
