import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../models/notification_model.dart';
import '../../../state/auth_provider.dart';
import '../../../state/citizen_provider.dart';
import '../../../state/notification_provider.dart';
import '../complaint_detail_screen.dart';

class CitizenNotificationsTab extends StatefulWidget {
  const CitizenNotificationsTab({super.key});

  @override
  State<CitizenNotificationsTab> createState() => _CitizenNotificationsTabState();
}

class _CitizenNotificationsTabState extends State<CitizenNotificationsTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthProvider>().currentUser;
      if (user != null) {
        context.read<NotificationProvider>().loadNotifications(user.id);
      }
    });
  }

  IconData _getIconForType(NotificationType type) {
    switch (type) {
      case NotificationType.statusUpdate:
        return Icons.info_outline_rounded;
      case NotificationType.assignment:
        return Icons.engineering_outlined;
      case NotificationType.resolution:
        return Icons.check_circle_outline_rounded;
      case NotificationType.general:
        return Icons.notifications_none_rounded;
    }
  }

  Color _getColorForType(NotificationType type) {
    switch (type) {
      case NotificationType.statusUpdate:
        return AppColors.primary;
      case NotificationType.assignment:
        return AppColors.secondary;
      case NotificationType.resolution:
        return AppColors.success;
      case NotificationType.general:
        return AppColors.textPrimary;
    }
  }

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat('dd MMM').format(date);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = context.watch<AuthProvider>().currentUser;
    final notifProvider = context.watch<NotificationProvider>();
    final citizenProvider = context.watch<CitizenProvider>();
    final notifications = notifProvider.notifications;

    return Column(
      children: [
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Notifications (${notifications.length})',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              if (notifications.isNotEmpty && notifProvider.unreadCount > 0 && user != null)
                TextButton(
                  onPressed: () {
                    notifProvider.markAllAsRead(user.id);
                  },
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: const Size(0, 0),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text(
                    'Mark all read',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: notifications.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.notifications_none_rounded,
                          size: 56,
                          color: AppColors.textMuted.withAlpha(120),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No Notifications Yet',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'You will receive instant updates when municipal workers verify, assign, or resolve your complaints.',
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () async {
                    if (user != null) {
                      await notifProvider.loadNotifications(user.id);
                    }
                  },
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: notifications.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = notifications[index];
                      final icon = _getIconForType(item.type);
                      final color = _getColorForType(item.type);

                      return InkWell(
                        onTap: () async {
                          if (user != null && !item.isRead) {
                            await notifProvider.markAsRead(item.id, user.id);
                          }
                          if (item.complaintId != null || item.complaintNumber != null) {
                            final target = citizenProvider.complaints.firstWhere(
                              (c) => c.id == item.complaintId || c.complaintNumber == item.complaintNumber,
                              orElse: () => citizenProvider.complaints.first,
                            );
                            if (context.mounted) {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => ComplaintDetailScreen(complaint: target),
                                ),
                              );
                            }
                          }
                        },
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: item.isRead ? Colors.white : AppColors.primary.withAlpha(8),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: item.isRead ? AppColors.border : AppColors.primary.withAlpha(60),
                              width: item.isRead ? 1.2 : 1.5,
                            ),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: color.withAlpha(25),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(icon, color: color, size: 20),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            item.title,
                                            style: TextStyle(
                                              fontWeight: item.isRead ? FontWeight.w600 : FontWeight.w700,
                                              fontSize: 14,
                                              color: AppColors.textPrimary,
                                            ),
                                          ),
                                        ),
                                        if (!item.isRead)
                                          Container(
                                            width: 8,
                                            height: 8,
                                            decoration: const BoxDecoration(
                                              color: AppColors.primary,
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      item.message,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: AppColors.textSecondary,
                                        height: 1.35,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      _formatTime(item.createdAt),
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
        ),
      ],
    );
  }
}
