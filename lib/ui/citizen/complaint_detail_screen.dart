import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/civic_map_view.dart';
import '../../core/widgets/status_badge.dart';
import '../../models/complaint_model.dart';
import '../../state/auth_provider.dart';
import '../../state/citizen_provider.dart';

class ComplaintDetailScreen extends StatefulWidget {
  final ComplaintModel complaint;

  const ComplaintDetailScreen({
    super.key,
    required this.complaint,
  });

  @override
  State<ComplaintDetailScreen> createState() => _ComplaintDetailScreenState();
}

class _ComplaintDetailScreenState extends State<ComplaintDetailScreen> {
  late ComplaintModel _currentComplaint;
  bool _isUpvoting = false;

  @override
  void initState() {
    super.initState();
    _currentComplaint = widget.complaint;
  }

  Future<void> _handleUpvote() async {
    final auth = context.read<AuthProvider>();
    final user = auth.currentUser;
    if (user == null) return;

    if (_currentComplaint.isUpvotedBy(user.id)) return;

    setState(() => _isUpvoting = true);
    final citizenProvider = context.read<CitizenProvider>();
    final result = await citizenProvider.upvoteComplaint(
      complaintId: _currentComplaint.id,
      citizenId: user.id,
    );

    if (mounted) {
      setState(() => _isUpvoting = false);
      if (result.isSuccess) {
        setState(() {
          _currentComplaint = result.dataOrNull ?? _currentComplaint;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Thank you for supporting this civic issue!'),
            backgroundColor: AppColors.success,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.errorOrNull ?? 'Failed to upvote'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Widget _buildImage(String url) {
    if (url.startsWith('data:image')) {
      try {
        final base64String = url.split(',').last;
        final bytes = base64Decode(base64String);
        return Image.memory(
          bytes,
          fit: BoxFit.cover,
          width: double.infinity,
          errorBuilder: (context, error, stackTrace) => const Center(
            child: Icon(Icons.image_rounded, size: 36, color: AppColors.textMuted),
          ),
        );
      } catch (_) {
        return const Center(
          child: Icon(Icons.image_rounded, size: 36, color: AppColors.textMuted),
        );
      }
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
    final auth = context.watch<AuthProvider>();
    final currentUserId = auth.currentUser?.id ?? '';
    final isUpvoted = _currentComplaint.isUpvotedBy(currentUserId);
    final timelineEvents = _currentComplaint.getTimelineEvents();
    final dateStr = DateFormat('MMM dd, yyyy • hh:mm a').format(_currentComplaint.createdAt);

    return AppScaffold(
      title: _currentComplaint.complaintNumber,
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
                        color: _currentComplaint.category.color.withAlpha(25),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        _currentComplaint.category.icon,
                        color: _currentComplaint.category.color,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _currentComplaint.category.displayName,
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
                StatusBadge(status: _currentComplaint.status),
              ],
            ),
            const SizedBox(height: 16),

            // Community Support / Upvote Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isUpvoted ? AppColors.primary.withAlpha(15) : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isUpvoted ? AppColors.primary.withAlpha(60) : AppColors.border,
                  width: 1.2,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        isUpvoted ? Icons.thumb_up_rounded : Icons.thumb_up_outlined,
                        color: isUpvoted ? AppColors.primary : AppColors.textSecondary,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        '${_currentComplaint.upvotesCount} Citizen Supporters',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                          color: isUpvoted ? AppColors.primary : AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  if (!isUpvoted)
                    ElevatedButton.icon(
                      onPressed: _isUpvoting ? null : _handleUpvote,
                      icon: const Icon(Icons.thumb_up_alt_rounded, size: 14),
                      label: const Text('Support'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        minimumSize: const Size(0, 32),
                        textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    )
                  else
                    const Chip(
                      label: Text('Supported', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary)),
                      backgroundColor: Colors.white,
                      padding: EdgeInsets.zero,
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 6-Stage Lifecycle Timeline Stepper
            Text(
              'Complaint Status Lifecycle',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 4),
            Text(
              'Track real-time progress from submission to municipal resolution.',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 14),

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
                      // Status Dot / Checkmark and Vertical Line
                      Column(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: event.isCompleted
                                  ? AppColors.success
                                  : event.isCurrent
                                      ? AppColors.primary
                                      : Colors.grey.shade200,
                              border: event.isCurrent
                                  ? Border.all(color: AppColors.primary.withAlpha(80), width: 3)
                                  : null,
                            ),
                            child: Icon(
                              event.isCompleted
                                  ? Icons.check_rounded
                                  : event.isCurrent
                                      ? Icons.hourglass_top_rounded
                                      : Icons.circle_rounded,
                              size: 14,
                              color: (event.isCompleted || event.isCurrent)
                                  ? Colors.white
                                  : Colors.grey.shade400,
                            ),
                          ),
                          if (!isLast)
                            Container(
                              width: 2,
                              height: 40,
                              color: event.isCompleted
                                  ? AppColors.success.withAlpha(120)
                                  : Colors.grey.shade300,
                            ),
                        ],
                      ),
                      const SizedBox(width: 14),

                      // Event Content
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 2, bottom: 12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    event.title,
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14,
                                      color: (event.isCompleted || event.isCurrent)
                                          ? AppColors.textPrimary
                                          : AppColors.textMuted,
                                    ),
                                  ),
                                  if (event.isCompleted || event.isCurrent)
                                    Text(
                                      DateFormat('MMM d, h:mm a').format(event.timestamp),
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                event.description,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: (event.isCompleted || event.isCurrent)
                                      ? AppColors.textSecondary
                                      : AppColors.textMuted,
                                  height: 1.3,
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
            const SizedBox(height: 24),

            // Assigned Field Worker Card (if assigned)
            if (_currentComplaint.workerName != null) ...[
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
                      radius: 22,
                      backgroundColor: AppColors.secondary.withAlpha(25),
                      child: const Icon(Icons.person_rounded, color: AppColors.secondary),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _currentComplaint.workerName!,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            'Department: ${_currentComplaint.departmentName ?? "Civic Maintenance"}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          if (_currentComplaint.workerPhone != null)
                            Text(
                              'Phone: ${_currentComplaint.workerPhone}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.primary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Resolution Summary & Before/After Comparison (if resolved or notes exist)
            if (_currentComplaint.status == ComplaintStatus.resolved || _currentComplaint.resolutionNotes != null) ...[
              Text(
                'Resolution Proof & Verification',
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.success.withAlpha(12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.success.withAlpha(80), width: 1.2),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.verified_rounded, color: AppColors.success, size: 20),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Text(
                            'Issue Resolved by Field Worker',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.success),
                          ),
                        ),
                        if (_currentComplaint.resolvedAt != null)
                          Text(
                            DateFormat('dd MMM, HH:mm').format(_currentComplaint.resolvedAt!),
                            style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w500),
                          ),
                      ],
                    ),
                    if (_currentComplaint.resolutionNotes != null && _currentComplaint.resolutionNotes!.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.success.withAlpha(40)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Field Worker Repair Notes:',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _currentComplaint.resolutionNotes!,
                              style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, height: 1.35),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Before vs After Comparison Photos
                    if (_currentComplaint.imageUrl != null || _currentComplaint.resolutionImageUrl != null) ...[
                      const SizedBox(height: 16),
                      const Text(
                        'Before vs After Visual Proof',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          // Before Image
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade200,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text('BEFORE (Reported)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
                                ),
                                const SizedBox(height: 6),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Container(
                                    height: 120,
                                    width: double.infinity,
                                    color: Colors.grey.shade200,
                                    child: _currentComplaint.imageUrl != null
                                        ? _buildImage(_currentComplaint.imageUrl!)
                                        : const Center(child: Icon(Icons.broken_image_rounded, color: Colors.grey)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          // After Image
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.success.withAlpha(30),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text('AFTER (Resolved)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.success)),
                                ),
                                const SizedBox(height: 6),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Container(
                                    height: 120,
                                    width: double.infinity,
                                    color: Colors.grey.shade200,
                                    child: _currentComplaint.resolutionImageUrl != null
                                        ? _buildImage(_currentComplaint.resolutionImageUrl!)
                                        : const Center(child: Icon(Icons.check_circle_outline_rounded, color: AppColors.success, size: 36)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Issue Description & Evidence
            Text(
              'Issue Details',
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
                    _currentComplaint.description,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: AppColors.textPrimary,
                      height: 1.4,
                    ),
                  ),
                  const Divider(height: 24),

                  // Location Info
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _currentComplaint.address,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'GPS Location: ${_currentComplaint.latitude.toStringAsFixed(4)}° N, ${_currentComplaint.longitude.toStringAsFixed(4)}° E',
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
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: SizedBox(
                      height: 160,
                      width: double.infinity,
                      child: CivicMapView(
                        initialLat: _currentComplaint.latitude,
                        initialLng: _currentComplaint.longitude,
                        initialZoom: 15.0,
                        complaints: [_currentComplaint],
                        isInteractive: true,
                      ),
                    ),
                  ),

                  // Photo Evidence Preview
                  if (_currentComplaint.imageUrl != null && _currentComplaint.imageUrl!.isNotEmpty) ...[
                    const Divider(height: 24),
                    const Text(
                      'Photo Evidence Attached',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        height: 200,
                        width: double.infinity,
                        color: Colors.grey.shade100,
                        child: _buildImage(_currentComplaint.imageUrl!),
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
