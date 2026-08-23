import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/status_badge.dart';
import '../../models/complaint_model.dart';
import '../../routes/app_router.dart';
import '../../state/admin_provider.dart';
import '../../state/auth_provider.dart';
import 'admin_complaint_detail_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().loadAdminData();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
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
    final adminState = context.watch<AdminProvider>();
    final authState = context.watch<AuthProvider>();
    final user = authState.currentUser;
    final complaints = adminState.filteredComplaints;

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
                color: AppColors.primary.withAlpha(20),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.admin_panel_settings_rounded, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.fullName ?? 'Municipal Admin',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                ),
                const Text(
                  'Civic Administration Portal',
                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textSecondary),
            onPressed: () => adminState.loadAdminData(),
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
      body: adminState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => adminState.loadAdminData(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Executive Metric Cards
                    Row(
                      children: [
                        _buildMetricCard(
                          title: 'Total Tickets',
                          value: '${adminState.totalCount}',
                          icon: Icons.assignment_outlined,
                          color: AppColors.primary,
                          isSelected: adminState.filterStatus == null,
                          onTap: () => adminState.setFilterStatus(null),
                        ),
                        const SizedBox(width: 8),
                        _buildMetricCard(
                          title: 'Submitted',
                          value: '${adminState.submittedCount}',
                          icon: Icons.pending_actions_rounded,
                          color: AppColors.statusSubmitted,
                          isSelected: adminState.filterStatus == ComplaintStatus.submitted,
                          onTap: () => adminState.setFilterStatus(ComplaintStatus.submitted),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _buildMetricCard(
                          title: 'In Progress',
                          value: '${adminState.inProgressCount}',
                          icon: Icons.hourglass_top_rounded,
                          color: AppColors.statusInProgress,
                          isSelected: adminState.filterStatus == ComplaintStatus.inProgress,
                          onTap: () => adminState.setFilterStatus(ComplaintStatus.inProgress),
                        ),
                        const SizedBox(width: 8),
                        _buildMetricCard(
                          title: 'Resolved',
                          value: '${adminState.resolvedCount}',
                          icon: Icons.check_circle_outline_rounded,
                          color: AppColors.statusResolved,
                          isSelected: adminState.filterStatus == ComplaintStatus.resolved,
                          onTap: () => adminState.setFilterStatus(ComplaintStatus.resolved),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // 2. Search Bar
                    TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Search by CMP#, keyword, address, or citizen...',
                        prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear_rounded, size: 18),
                                onPressed: () {
                                  _searchController.clear();
                                  adminState.setSearchQuery('');
                                },
                              )
                            : null,
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                      ),
                      onChanged: (val) => adminState.setSearchQuery(val),
                    ),
                    const SizedBox(height: 12),

                    // 3. Category Filter Chips
                    SizedBox(
                      height: 36,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: FilterChip(
                              label: const Text('All Categories', style: TextStyle(fontSize: 12)),
                              selected: adminState.filterCategory == null,
                              onSelected: (_) => adminState.setFilterCategory(null),
                              backgroundColor: Colors.white,
                              selectedColor: AppColors.primary.withAlpha(30),
                              checkmarkColor: AppColors.primary,
                              labelStyle: TextStyle(
                                color: adminState.filterCategory == null ? AppColors.primary : AppColors.textPrimary,
                                fontWeight: adminState.filterCategory == null ? FontWeight.w700 : FontWeight.w500,
                              ),
                            ),
                          ),
                          ...ComplaintCategory.values.map((cat) {
                            final isSel = adminState.filterCategory == cat;
                            return Padding(
                              padding: const EdgeInsets.only(right: 6),
                              child: FilterChip(
                                label: Text(cat.displayName, style: const TextStyle(fontSize: 12)),
                                selected: isSel,
                                onSelected: (_) => adminState.setFilterCategory(isSel ? null : cat),
                                backgroundColor: Colors.white,
                                selectedColor: cat.color.withAlpha(30),
                                checkmarkColor: cat.color,
                                labelStyle: TextStyle(
                                  color: isSel ? cat.color : AppColors.textPrimary,
                                  fontWeight: isSel ? FontWeight.w700 : FontWeight.w500,
                                ),
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // 4. Complaint Feed Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Complaints Registry (${complaints.length})',
                          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                        ),
                        if (adminState.filterStatus != null ||
                            adminState.filterCategory != null ||
                            adminState.searchQuery.isNotEmpty)
                          TextButton(
                            onPressed: () {
                              _searchController.clear();
                              adminState.resetFilters();
                            },
                            child: const Text('Reset Filters', style: TextStyle(fontSize: 12, color: AppColors.primary)),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // 5. Complaint List
                    if (complaints.isEmpty)
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
                            Icon(Icons.inbox_outlined, size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            const Text(
                              'No matching complaints found',
                              style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Try clearing your search query or filters.',
                              style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: complaints.length,
                        itemBuilder: (context, index) {
                          final complaint = complaints[index];
                          final dateStr = DateFormat('MMM dd, yyyy • hh:mm a').format(complaint.createdAt);

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
                                            color: complaint.category.color.withAlpha(25),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Icon(complaint.category.icon, size: 16, color: complaint.category.color),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          complaint.complaintNumber,
                                          style: const TextStyle(
                                            fontFamily: 'monospace',
                                            fontWeight: FontWeight.w700,
                                            fontSize: 13,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                      ],
                                    ),
                                    StatusBadge(status: complaint.status),
                                  ],
                                ),
                                const SizedBox(height: 10),

                                // Description
                                Text(
                                  complaint.description,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textPrimary,
                                    height: 1.3,
                                  ),
                                ),
                                const SizedBox(height: 8),

                                // Reporter & Upvotes Row
                                Row(
                                  children: [
                                    const Icon(Icons.person_outline_rounded, size: 14, color: AppColors.textMuted),
                                    const SizedBox(width: 4),
                                    Text(
                                      complaint.citizenName,
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
                                    ),
                                    if (complaint.upvotesCount > 0) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppColors.primary.withAlpha(15),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Row(
                                          children: [
                                            const Icon(Icons.thumb_up_rounded, size: 10, color: AppColors.primary),
                                            const SizedBox(width: 3),
                                            Text(
                                              '${complaint.upvotesCount}',
                                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primary),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 4),

                                // Location & Date
                                Row(
                                  children: [
                                    const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
                                    const SizedBox(width: 4),
                                    Expanded(
                                      child: Text(
                                        complaint.address,
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
                                    // Assigned Worker Pill or Unassigned
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: complaint.workerName != null ? AppColors.secondary.withAlpha(15) : Colors.grey.shade100,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(
                                            complaint.workerName != null ? Icons.engineering_rounded : Icons.person_off_outlined,
                                            size: 14,
                                            color: complaint.workerName != null ? AppColors.secondary : AppColors.textMuted,
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            complaint.workerName != null
                                                ? complaint.workerName!.split(' ').first
                                                : 'Unassigned',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                              color: complaint.workerName != null ? AppColors.secondary : AppColors.textMuted,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),

                                    // Action Buttons
                                    Row(
                                      children: [
                                        if (complaint.status == ComplaintStatus.submitted)
                                          Padding(
                                            padding: const EdgeInsets.only(right: 6),
                                            child: ElevatedButton(
                                              onPressed: () async {
                                                await adminState.verifyComplaint(complaint.id);
                                              },
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: AppColors.secondary,
                                                foregroundColor: Colors.white,
                                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                minimumSize: const Size(0, 30),
                                                textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                              ),
                                              child: const Text('Verify'),
                                            ),
                                          ),
                                        ElevatedButton(
                                          onPressed: () {
                                            Navigator.of(context).push(
                                              MaterialPageRoute(
                                                builder: (_) => AdminComplaintDetailScreen(complaint: complaint),
                                              ),
                                            );
                                          },
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: AppColors.primary,
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                            minimumSize: const Size(0, 30),
                                            textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
                                          child: const Text('Manage'),
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
