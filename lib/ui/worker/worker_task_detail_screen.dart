import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/status_badge.dart';
import '../../models/complaint_model.dart';
import '../../state/auth_provider.dart';
import '../../state/worker_provider.dart';
import 'resolve_task_screen.dart';

class WorkerTaskDetailScreen extends StatefulWidget {
  final ComplaintModel complaint;

  const WorkerTaskDetailScreen({
    super.key,
    required this.complaint,
  });

  @override
  State<WorkerTaskDetailScreen> createState() => _WorkerTaskDetailScreenState();
}

class _WorkerTaskDetailScreenState extends State<WorkerTaskDetailScreen> {
  late ComplaintModel _complaint;
  bool _isProcessing = false;

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
    final workerState = context.watch<WorkerProvider>();
    final authState = context.watch<AuthProvider>();
    final currentWorker = authState.currentUser;
    final timelineEvents = _complaint.getTimelineEvents();
    final dateStr = DateFormat('MMM dd, yyyy • hh:mm a').format(_complaint.createdAt);

    return AppScaffold(
      title: 'Task ${_complaint.complaintNumber}',
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

            // Worker Action Card (Accept / Start Work)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.secondary.withAlpha(80), width: 1.5),
                boxShadow: const [
                  BoxShadow(color: AppColors.shadow, blurRadius: 8, offset: Offset(0, 3)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.engineering_rounded, color: AppColors.secondary, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        _complaint.status == ComplaintStatus.assigned
                            ? 'New Task Assigned to You'
                            : _complaint.status == ComplaintStatus.accepted
                                ? 'Task Accepted • Ready to Start'
                                : _complaint.status == ComplaintStatus.inProgress
                                    ? 'Work In Progress On-Site'
                                    : 'Task Completed',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  if (_complaint.status == ComplaintStatus.assigned)
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isProcessing || currentWorker == null
                            ? null
                            : () async {
                                setState(() => _isProcessing = true);
                                final res = await workerState.acceptTask(
                                  complaintId: _complaint.id,
                                  workerId: currentWorker.id,
                                );
                                if (context.mounted) {
                                  setState(() => _isProcessing = false);
                                  if (res.isSuccess) {
                                    setState(() => _complaint = res.dataOrNull ?? _complaint);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('Task accepted! Scheduled for site visit.'),
                                        backgroundColor: AppColors.success,
                                      ),
                                    );
                                  }
                                }
                              },
                        icon: const Icon(Icons.thumb_up_alt_outlined, size: 16),
                        label: const Text('Accept Assigned Task', style: TextStyle(fontWeight: FontWeight.w600)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.secondary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    )
                  else if (_complaint.status == ComplaintStatus.accepted)
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isProcessing || currentWorker == null
                            ? null
                            : () async {
                                setState(() => _isProcessing = true);
                                final res = await workerState.startWork(
                                  complaintId: _complaint.id,
                                  workerId: currentWorker.id,
                                );
                                if (context.mounted) {
                                  setState(() => _isProcessing = false);
                                  if (res.isSuccess) {
                                    setState(() => _complaint = res.dataOrNull ?? _complaint);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('Work started on-site!'),
                                        backgroundColor: AppColors.primary,
                                      ),
                                    );
                                  }
                                }
                              },
                        icon: const Icon(Icons.play_arrow_rounded, size: 18),
                        label: const Text('Start Work / Mark On-Site', style: TextStyle(fontWeight: FontWeight.w600)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    )
                  else if (_complaint.status == ComplaintStatus.inProgress)
                    Column(
                      children: [
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.statusInProgress.withAlpha(20),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.build_circle_rounded, color: AppColors.statusInProgress, size: 20),
                              SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  'Actively resolving issue on-site.',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.statusInProgress),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () async {
                              final resolved = await Navigator.of(context).push<bool>(
                                MaterialPageRoute(
                                  builder: (_) => ResolveTaskScreen(complaint: _complaint),
                                ),
                              );
                              if (resolved == true && context.mounted) {
                                final updated = workerState.tasks.firstWhere(
                                  (t) => t.id == _complaint.id,
                                  orElse: () => _complaint,
                                );
                                setState(() => _complaint = updated);
                              }
                            },
                            icon: const Icon(Icons.verified_rounded, size: 18),
                            label: const Text('Complete & Resolve Task', style: TextStyle(fontWeight: FontWeight.w600)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.success,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                      ],
                    )
                  else
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.success.withAlpha(20),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.check_circle_rounded, color: AppColors.success, size: 20),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'This issue has been successfully resolved.',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.success),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Citizen Reporter Card & Direct Call Action
            Text(
              'Citizen Reporter',
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
                        Text(
                          _complaint.citizenPhone.isNotEmpty ? _complaint.citizenPhone : 'Phone not provided',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  if (_complaint.citizenPhone.isNotEmpty)
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.success.withAlpha(20),
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.phone_rounded, color: AppColors.success, size: 20),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Calling citizen at ${_complaint.citizenPhone}...'),
                              backgroundColor: AppColors.success,
                            ),
                          );
                        },
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Location & Directions Card
            Text(
              'Location & Directions',
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _complaint.address,
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textPrimary),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'GPS Coordinates: ${_complaint.latitude.toStringAsFixed(5)}, ${_complaint.longitude.toStringAsFixed(5)}',
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

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

            // Issue Description & Evidence
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
