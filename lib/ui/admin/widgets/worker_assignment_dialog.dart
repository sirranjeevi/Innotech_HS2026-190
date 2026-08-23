import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../models/complaint_model.dart';
import '../../../models/user_model.dart';
import '../../../state/admin_provider.dart';

class WorkerAssignmentDialog extends StatefulWidget {
  final ComplaintModel complaint;

  const WorkerAssignmentDialog({
    super.key,
    required this.complaint,
  });

  @override
  State<WorkerAssignmentDialog> createState() => _WorkerAssignmentDialogState();
}

class _WorkerAssignmentDialogState extends State<WorkerAssignmentDialog> {
  UserModel? _selectedWorker;
  String _selectedDepartment = '';
  bool _isSubmitting = false;

  final List<String> _departments = const [
    'Sanitation',
    'Road Maintenance',
    'Electrical',
    'Water Supply',
    'General Maintenance',
  ];

  @override
  void initState() {
    super.initState();
    // Default department to match complaint category
    _selectedDepartment = _getDepartmentForCategory(widget.complaint.category);
  }

  String _getDepartmentForCategory(ComplaintCategory cat) {
    switch (cat) {
      case ComplaintCategory.garbage:
        return 'Sanitation';
      case ComplaintCategory.pothole:
      case ComplaintCategory.publicInfrastructure:
        return 'Road Maintenance';
      case ComplaintCategory.streetlight:
        return 'Electrical';
      case ComplaintCategory.waterLeakage:
      case ComplaintCategory.drainage:
        return 'Water Supply';
      case ComplaintCategory.other:
        return 'General Maintenance';
    }
  }

  @override
  Widget build(BuildContext context) {
    final adminState = context.watch<AdminProvider>();
    final allWorkers = adminState.workers;

    // Filter workers by selected department
    final departmentWorkers = allWorkers.where((w) {
      if (w.departmentName == null) return true;
      return w.departmentName!.toLowerCase().contains(_selectedDepartment.toLowerCase().split(' ').first);
    }).toList();

    // If no exact match, show all workers
    final availableWorkers = departmentWorkers.isNotEmpty ? departmentWorkers : allWorkers;

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      actionsPadding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(25),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.person_add_alt_1_rounded, color: AppColors.primary, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Assign Field Worker',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                ),
                Text(
                  widget.complaint.complaintNumber,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary, fontFamily: 'monospace'),
                ),
              ],
            ),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Department Selection
            const Text(
              'Responsible Department',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border, width: 1.2),
                color: Colors.white,
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _departments.contains(_selectedDepartment) ? _selectedDepartment : _departments.first,
                  isExpanded: true,
                  items: _departments.map((dept) {
                    return DropdownMenuItem<String>(
                      value: dept,
                      child: Text(dept, style: const TextStyle(fontSize: 14, color: AppColors.textPrimary)),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _selectedDepartment = val;
                        _selectedWorker = null;
                      });
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 2. Worker Selection
            const Text(
              'Select Field Worker',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),

            if (availableWorkers.isEmpty)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: const Text('No workers registered under this department.', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
              )
            else
              Column(
                children: availableWorkers.map((worker) {
                  final isSelected = _selectedWorker?.id == worker.id;
                  final activeLoad = adminState.getWorkerActiveTaskCount(worker.id);

                  return InkWell(
                    onTap: () {
                      setState(() {
                        _selectedWorker = worker;
                      });
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary.withAlpha(15) : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.border,
                          width: isSelected ? 1.8 : 1.2,
                        ),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 18,
                            backgroundColor: isSelected ? AppColors.primary : Colors.grey.shade200,
                            child: Icon(
                              Icons.person_rounded,
                              size: 18,
                              color: isSelected ? Colors.white : Colors.grey.shade700,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  worker.fullName,
                                  style: TextStyle(
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                                    fontSize: 13,
                                    color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                  ),
                                ),
                                Text(
                                  worker.phone,
                                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: activeLoad > 2 ? AppColors.warning.withAlpha(20) : AppColors.success.withAlpha(20),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '$activeLoad active',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: activeLoad > 2 ? AppColors.warning : AppColors.success,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
          ],
        ),
      ),
      actions: [
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.textSecondary,
                  side: const BorderSide(color: AppColors.border),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Cancel'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: (_selectedWorker == null || _isSubmitting)
                    ? null
                    : () async {
                        setState(() => _isSubmitting = true);
                        final result = await adminState.assignWorker(
                          complaintId: widget.complaint.id,
                          worker: _selectedWorker!,
                          departmentName: _selectedDepartment,
                        );

                        if (context.mounted) {
                          setState(() => _isSubmitting = false);
                          if (result.isSuccess) {
                            Navigator.of(context).pop(true);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Assigned to ${_selectedWorker!.fullName} successfully!'),
                                backgroundColor: AppColors.success,
                              ),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(result.errorOrNull ?? 'Assignment failed'),
                                backgroundColor: AppColors.error,
                              ),
                            );
                          }
                        }
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: _isSubmitting
                    ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Assign Worker', style: TextStyle(fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
