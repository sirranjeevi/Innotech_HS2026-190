import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/status_badge.dart';
import '../../models/complaint_model.dart';
import '../../state/admin_provider.dart';
import 'widgets/worker_assignment_dialog.dart';

class AdminComplaintDetailScreen extends StatefulWidget {
  final ComplaintModel complaint;

  const AdminComplaintDetailScreen({
    super.key,
    required this.complaint,
  });

  @override
  State<AdminComplaintDetailScreen> createState() => _AdminComplaintDetailScreenState();
}

class _AdminComplaintDetailScreenState extends State<AdminComplaintDetailScreen> {
  late ComplaintModel _complaint;
  bool _isVerifying = false;

  @override
  void initState() {
    super.initState();
    _complaint = widget.complaint;
  }

  Widget _buildImage(String url) {
    if (url.startsWith('data:image')) {
      final base64String = url.split(',').last;
      return Image.memory(
        base64Decode(base64String),
        fit: BoxFit.cover,
        width: double.infinity,
      );
    } else {
      return Image.network(
        url,
        fit: BoxFit.cover,
        width: double.infinity,
        errorBuilder: (context, error, stackTrace) => const Center(
          child: Icon(Icons.broken_image_rounded, size: 40, color: AppColors.textMuted),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adminState = context.watch<AdminProvider>();
    final timelineEvents = _complaint.getTimelineEvents();
    final dateStr = DateFormat('MMM dd, yyyy • hh:mm a').format(_complaint.createdAt);

    return AppScaffold(
      title: 'Manage ${_complaint.complaintNumber}',
      showBackButton: true,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Header: Category & Status Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: _complaint.category.color.withAlpha(25),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        _complaint.category.icon,
                        color: _complaint.category.color,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _complaint.category.displayName,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          dateStr,
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                StatusBadge(status: _complaint.status),
              ],
            ),
            const SizedBox(height: 16),

            // Admin Action Ribbon (Verify / Assign)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary.withAlpha(80), width: 1.5),
                boxShadow: const [
                  BoxShadow(color: AppColors.shadow, blurRadius: 8, offset: Offset(0, 3)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.admin_panel_settings_rounded, color: AppColors.primary, size: 20),
                      const SizedBox(width: 8),
                      const Text(
                        'Administrative Action Required',
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      // Verify Button (if submitted)
                      if (_complaint.status == ComplaintStatus.submitted) ...[
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _isVerifying
                                ? null
                                : () async {
                                    setState(() => _isVerifying = true);
                                    final res = await adminState.verifyComplaint(_complaint.id);
                                    if (context.mounted) {
                                      setState(() => _isVerifying = false);
                                      if (res.isSuccess) {
                                        setState(() => _complaint = res.dataOrNull ?? _complaint);
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Complaint verified successfully!'),
                                            backgroundColor: AppColors.success,
                                          ),
                                        );
                                      }
                                    }
                                  },
                            icon: const Icon(Icons.check_circle_outline_rounded, size: 16),
                            label: const Text('Verify Issue'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.secondary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                      ],

                      // Assign Worker Button
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            final assigned = await showDialog<bool>(
                              context: context,
                              builder: (ctx) => WorkerAssignmentDialog(complaint: _complaint),
                            );
                            if (assigned == true && context.mounted) {
                              final updated = adminState.allComplaints.firstWhere(
                                (c) => c.id == _complaint.id,
                                orElse: () => _complaint,
                              );
                              setState(() => _complaint = updated);
                            }
                          },
                          icon: const Icon(Icons.person_add_alt_1_rounded, size: 16),
                          label: Text(_complaint.workerName != null ? 'Reassign Worker' : 'Assign Worker'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Citizen Reporter Card
            Text(
              'Citizen Reporter Information',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border, width: 1.2),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: AppColors.primary.withAlpha(20),
                    child: const Icon(Icons.person_outline_rounded, color: AppColors.primary),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _complaint.citizenName,
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textPrimary),
                        ),
                        if (_complaint.citizenPhone.isNotEmpty)
                          Text(
                            'Phone: ${_complaint.citizenPhone}',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.thumb_up_rounded, size: 12, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text(
                          '${_complaint.upvotesCount} Endorsements',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Assigned Field Worker Card (if assigned)
            if (_complaint.workerName != null) ...[
              Text(
                'Assigned Field Worker',
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border, width: 1.2),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: AppColors.secondary.withAlpha(20),
                      child: const Icon(Icons.engineering_rounded, color: AppColors.secondary),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _complaint.workerName!,
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textPrimary),
                          ),
                          Text(
                            'Department: ${_complaint.departmentName ?? "Civic Maintenance"}',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                          if (_complaint.workerPhone != null)
                            Text(
                              'Phone: ${_complaint.workerPhone}',
                              style: const TextStyle(fontSize: 12, color: AppColors.primary),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // 6-Stage Timeline Stepper
            Text(
              'Status Lifecycle Timeline',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border, width: 1.2),
              ),
              child: Column(
                children: List.generate(timelineEvents.length, (index) {
                  final event = timelineEvents[index];
                  final isLast = index == timelineEvents.length - 1;

                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 26,
                            height: 26,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: event.isCompleted
                                  ? AppColors.success
                                  : event.isCurrent
                                      ? AppColors.primary
                                      : Colors.grey.shade200,
                            ),
                            child: Icon(
                              event.isCompleted
                                  ? Icons.check_rounded
                                  : event.isCurrent
                                      ? Icons.hourglass_top_rounded
                                      : Icons.circle_rounded,
                              size: 13,
                              color: (event.isCompleted || event.isCurrent) ? Colors.white : Colors.grey.shade400,
                            ),
                          ),
                          if (!isLast)
                            Container(
                              width: 2,
                              height: 36,
                              color: event.isCompleted ? AppColors.success.withAlpha(120) : Colors.grey.shade300,
                            ),
                        ],
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 2, bottom: 10),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                event.title,
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                  color: (event.isCompleted || event.isCurrent) ? AppColors.textPrimary : AppColors.textMuted,
                                ),
                              ),
                              Text(
                                event.description,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: (event.isCompleted || event.isCurrent) ? AppColors.textSecondary : AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  );
                }),
              ),
            ),
            const SizedBox(height: 20),

            // Issue Description & Photos
            Text(
              'Issue Description & Evidence',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border, width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _complaint.description,
                    style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textPrimary, height: 1.4),
                  ),
                  const Divider(height: 24),
                  Row(
                    children: [
                      const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _complaint.address,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                            ),
                            Text(
                              'Lat: ${_complaint.latitude.toStringAsFixed(4)}, Lng: ${_complaint.longitude.toStringAsFixed(4)}',
                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (_complaint.imageUrl != null && _complaint.imageUrl!.isNotEmpty) ...[
                    const Divider(height: 24),
                    const Text('Attached Photo Evidence', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        height: 200,
                        width: double.infinity,
                        color: Colors.grey.shade100,
                        child: _buildImage(_complaint.imageUrl!),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
