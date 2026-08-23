import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/status_badge.dart';
import '../../routes/app_router.dart';
import '../../state/auth_provider.dart';
import '../../state/worker_provider.dart';
import 'worker_task_detail_screen.dart';

class WorkerDashboardScreen extends StatefulWidget {
  const WorkerDashboardScreen({super.key});

  @override
  State<WorkerDashboardScreen> createState() => _WorkerDashboardScreenState();
}

class _WorkerDashboardScreenState extends State<WorkerDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthProvider>().currentUser;
      if (user != null) {
        context.read<WorkerProvider>().loadWorkerTasks(user.id);
      }
    });
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required VoidCallback? onTap,
    bool isSelected = false,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? color.withAlpha(25) : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? color : AppColors.border,
              width: isSelected ? 2 : 1.2,
            ),
            boxShadow: const [
              BoxShadow(color: AppColors.shadow, blurRadius: 6, offset: Offset(0, 2)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: color.withAlpha(20),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, size: 16, color: color),
                  ),
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: color,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final workerState = context.watch<WorkerProvider>();
    final authState = context.watch<AuthProvider>();
    final user = authState.currentUser;
    final tasks = workerState.filteredTasks;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.secondary.withAlpha(20),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.engineering_rounded, color: AppColors.secondary, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.fullName ?? 'Field Worker',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                ),
                Text(
                  'Dept: ${user?.departmentName ?? "Civic Maintenance"}',
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textSecondary),
            onPressed: () {
              if (user != null) workerState.loadWorkerTasks(user.id);
            },
          ),
          IconButton(
            tooltip: 'Logout',
            icon: const Icon(Icons.logout_rounded, color: AppColors.error),
            onPressed: () async {
              await authState.logout();
              if (context.mounted) {
                Navigator.of(context).pushNamedAndRemoveUntil(AppRoutes.roleSelection, (r) => false);
              }
            },
          ),
        ],
      ),
      body: workerState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                if (user != null) await workerState.loadWorkerTasks(user.id);
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Task Metric Cards
                    Row(
                      children: [
                        _buildMetricCard(
                          title: 'Assigned',
                          value: '${workerState.totalTasks}',
                          icon: Icons.assignment_outlined,
                          color: AppColors.primary,
                          isSelected: workerState.filterStatus == null,
                          onTap: () => workerState.setFilterStatus(null),
                        ),
                        const SizedBox(width: 8),
                        _buildMetricCard(
                          title: 'Pending',
                          value: '${workerState.pendingAcceptanceCount}',
                          icon: Icons.pending_actions_rounded,
                          color: AppColors.statusAssigned,
                          isSelected: workerState.filterStatus == ComplaintStatus.assigned,
                          onTap: () => workerState.setFilterStatus(ComplaintStatus.assigned),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _buildMetricCard(
                          title: 'In Progress',
                          value: '${workerState.inProgressCount}',
                          icon: Icons.hourglass_top_rounded,
                          color: AppColors.statusInProgress,
                          isSelected: workerState.filterStatus == ComplaintStatus.inProgress,
                          onTap: () => workerState.setFilterStatus(ComplaintStatus.inProgress),
                        ),
                        const SizedBox(width: 8),
                        _buildMetricCard(
                          title: 'Resolved',
                          value: '${workerState.resolvedCount}',
                          icon: Icons.check_circle_outline_rounded,
                          color: AppColors.statusResolved,
                          isSelected: workerState.filterStatus == ComplaintStatus.resolved,
                          onTap: () => workerState.setFilterStatus(ComplaintStatus.resolved),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // 2. Status Filter Tabs
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          ChoiceChip(
                            label: const Text('All Tasks', style: TextStyle(fontSize: 12)),
                            selected: workerState.filterStatus == null,
                            onSelected: (_) => workerState.setFilterStatus(null),
                            selectedColor: AppColors.primary.withAlpha(25),
                            backgroundColor: Colors.white,
                            labelStyle: TextStyle(
                              color: workerState.filterStatus == null ? AppColors.primary : AppColors.textPrimary,
                              fontWeight: workerState.filterStatus == null ? FontWeight.w700 : FontWeight.w500,
                            ),
                          ),
                          const SizedBox(width: 6),
                          ChoiceChip(
                            label: const Text('Pending Acceptance', style: TextStyle(fontSize: 12)),
                            selected: workerState.filterStatus == ComplaintStatus.assigned,
                            onSelected: (_) => workerState.setFilterStatus(
                              workerState.filterStatus == ComplaintStatus.assigned ? null : ComplaintStatus.assigned,
                            ),
                            selectedColor: AppColors.statusAssigned.withAlpha(25),
                            backgroundColor: Colors.white,
                            labelStyle: TextStyle(
                              color: workerState.filterStatus == ComplaintStatus.assigned ? AppColors.statusAssigned : AppColors.textPrimary,
                              fontWeight: workerState.filterStatus == ComplaintStatus.assigned ? FontWeight.w700 : FontWeight.w500,
                            ),
                          ),
                          const SizedBox(width: 6),
                          ChoiceChip(
                            label: const Text('In Progress', style: TextStyle(fontSize: 12)),
                            selected: workerState.filterStatus == ComplaintStatus.inProgress,
                            onSelected: (_) => workerState.setFilterStatus(
                              workerState.filterStatus == ComplaintStatus.inProgress ? null : ComplaintStatus.inProgress,
                            ),
                            selectedColor: AppColors.statusInProgress.withAlpha(25),
                            backgroundColor: Colors.white,
                            labelStyle: TextStyle(
                              color: workerState.filterStatus == ComplaintStatus.inProgress ? AppColors.statusInProgress : AppColors.textPrimary,
                              fontWeight: workerState.filterStatus == ComplaintStatus.inProgress ? FontWeight.w700 : FontWeight.w500,
                            ),
                          ),
                          const SizedBox(width: 6),
                          ChoiceChip(
                            label: const Text('Resolved', style: TextStyle(fontSize: 12)),
                            selected: workerState.filterStatus == ComplaintStatus.resolved,
                            onSelected: (_) => workerState.setFilterStatus(
                              workerState.filterStatus == ComplaintStatus.resolved ? null : ComplaintStatus.resolved,
                            ),
                            selectedColor: AppColors.statusResolved.withAlpha(25),
                            backgroundColor: Colors.white,
                            labelStyle: TextStyle(
                              color: workerState.filterStatus == ComplaintStatus.resolved ? AppColors.statusResolved : AppColors.textPrimary,
                              fontWeight: workerState.filterStatus == ComplaintStatus.resolved ? FontWeight.w700 : FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // 3. Task List Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'My Assigned Tasks (${tasks.length})',
                          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                        ),
                        if (workerState.filterStatus != null)
                          TextButton(
                            onPressed: () => workerState.setFilterStatus(null),
                            child: const Text('Show All', style: TextStyle(fontSize: 12, color: AppColors.primary)),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // 4. Tasks List
                    if (tasks.isEmpty)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.task_alt_rounded, size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            const Text(
                              'No tasks found for this filter',
                              style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'New municipal assignments will appear here.',
                              style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: tasks.length,
                        itemBuilder: (context, index) {
                          final task = tasks[index];
                          final dateStr = DateFormat('MMM dd, yyyy • hh:mm a').format(task.createdAt);

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.border, width: 1.2),
                              boxShadow: const [
                                BoxShadow(color: AppColors.shadow, blurRadius: 6, offset: Offset(0, 2)),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Top Row: Category + Status Badge
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: task.category.color.withAlpha(25),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Icon(task.category.icon, size: 16, color: task.category.color),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          task.complaintNumber,
                                          style: const TextStyle(
                                            fontFamily: 'monospace',
                                            fontWeight: FontWeight.w700,
                                            fontSize: 13,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                      ],
                                    ),
                                    StatusBadge(status: task.status),
                                  ],
                                ),
                                const SizedBox(height: 10),

                                // Description
                                Text(
                                  task.description,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textPrimary,
                                    height: 1.3,
                                  ),
                                ),
                                const SizedBox(height: 8),

                                // Location
                                Row(
                                  children: [
                                    const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
                                    const SizedBox(width: 4),
                                    Expanded(
                                      child: Text(
                                        task.displayAddress,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                      ),
                                    ),
                                    Text(
                                      dateStr,
                                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                    ),
                                  ],
                                ),
                                const Divider(height: 16),

                                // Bottom Action Buttons
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    // Citizen name
                                    Row(
                                      children: [
                                        const Icon(Icons.person_outline_rounded, size: 14, color: AppColors.textSecondary),
                                        const SizedBox(width: 4),
                                        Text(
                                          task.citizenName,
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
                                        ),
                                      ],
                                    ),

                                    // Actions
                                    Row(
                                      children: [
                                        if (task.status == ComplaintStatus.assigned && user != null)
                                          Padding(
                                            padding: const EdgeInsets.only(right: 6),
                                            child: ElevatedButton(
                                              onPressed: () async {
                                                await workerState.acceptTask(
                                                  complaintId: task.id,
                                                  workerId: user.id,
                                                );
                                              },
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: AppColors.secondary,
                                                foregroundColor: Colors.white,
                                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                minimumSize: const Size(0, 30),
                                                textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                              ),
                                              child: const Text('Accept'),
                                            ),
                                          )
                                        else if (task.status == ComplaintStatus.accepted && user != null)
                                          Padding(
                                            padding: const EdgeInsets.only(right: 6),
                                            child: ElevatedButton(
                                              onPressed: () async {
                                                await workerState.startWork(
                                                  complaintId: task.id,
                                                  workerId: user.id,
                                                );
                                              },
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: AppColors.primary,
                                                foregroundColor: Colors.white,
                                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                minimumSize: const Size(0, 30),
                                                textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                              ),
                                              child: const Text('Start Work'),
                                            ),
                                          ),
                                        ElevatedButton(
                                          onPressed: () {
                                            Navigator.of(context).push(
                                              MaterialPageRoute(
                                                builder: (_) => WorkerTaskDetailScreen(complaint: task),
                                              ),
                                            );
                                          },
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.grey.shade800,
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                            minimumSize: const Size(0, 30),
                                            textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
                                          child: const Text('View Task'),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ),
    );
  }
}
