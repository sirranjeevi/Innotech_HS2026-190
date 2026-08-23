import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

enum ComplaintStatus {
  submitted,
  verified,
  assigned,
  accepted,
  inProgress,
  resolved,
}

extension ComplaintStatusExtension on ComplaintStatus {
  String get nameCode {
    switch (this) {
      case ComplaintStatus.submitted:
        return 'SUBMITTED';
      case ComplaintStatus.verified:
        return 'VERIFIED';
      case ComplaintStatus.assigned:
        return 'ASSIGNED';
      case ComplaintStatus.accepted:
        return 'ACCEPTED';
      case ComplaintStatus.inProgress:
        return 'IN_PROGRESS';
      case ComplaintStatus.resolved:
        return 'RESOLVED';
    }
  }

  String get displayName {
    switch (this) {
      case ComplaintStatus.submitted:
        return 'Submitted';
      case ComplaintStatus.verified:
        return 'Verified';
      case ComplaintStatus.assigned:
        return 'Assigned';
      case ComplaintStatus.accepted:
        return 'Accepted';
      case ComplaintStatus.inProgress:
        return 'In Progress';
      case ComplaintStatus.resolved:
        return 'Resolved';
    }
  }

  Color get color {
    switch (this) {
      case ComplaintStatus.submitted:
        return AppColors.statusSubmitted;
      case ComplaintStatus.verified:
        return AppColors.statusVerified;
      case ComplaintStatus.assigned:
        return AppColors.statusAssigned;
      case ComplaintStatus.accepted:
        return AppColors.statusAccepted;
      case ComplaintStatus.inProgress:
        return AppColors.statusInProgress;
      case ComplaintStatus.resolved:
        return AppColors.statusResolved;
    }
  }

  IconData get icon {
    switch (this) {
      case ComplaintStatus.submitted:
        return Icons.send_outlined;
      case ComplaintStatus.verified:
        return Icons.verified_outlined;
      case ComplaintStatus.assigned:
        return Icons.person_pin_circle_outlined;
      case ComplaintStatus.accepted:
        return Icons.thumb_up_outlined;
      case ComplaintStatus.inProgress:
        return Icons.build_circle_outlined;
      case ComplaintStatus.resolved:
        return Icons.check_circle_outline;
    }
  }

  static ComplaintStatus fromString(String? status) {
    if (status == null) return ComplaintStatus.submitted;
    switch (status.toUpperCase()) {
      case 'SUBMITTED':
        return ComplaintStatus.submitted;
      case 'VERIFIED':
        return ComplaintStatus.verified;
      case 'ASSIGNED':
        return ComplaintStatus.assigned;
      case 'ACCEPTED':
        return ComplaintStatus.accepted;
      case 'IN_PROGRESS':
      case 'INPROGRESS':
        return ComplaintStatus.inProgress;
      case 'RESOLVED':
        return ComplaintStatus.resolved;
      default:
        return ComplaintStatus.submitted;
    }
  }
}

class StatusBadge extends StatelessWidget {
  final ComplaintStatus status;
  final bool showIcon;
  final double fontSize;

  const StatusBadge({
    super.key,
    required this.status,
    this.showIcon = true,
    this.fontSize = 12,
  });

  @override
  Widget build(BuildContext context) {
    final statusColor = status.color;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: statusColor.withAlpha(25),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: statusColor.withAlpha(80), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(status.icon, size: fontSize + 2, color: statusColor),
            const SizedBox(width: 4),
          ],
          Text(
            status.displayName,
            style: TextStyle(
              color: statusColor,
              fontWeight: FontWeight.w600,
              fontSize: fontSize,
            ),
          ),
        ],
      ),
    );
  }
}
