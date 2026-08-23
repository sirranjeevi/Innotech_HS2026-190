import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../routes/app_router.dart';
import '../../../state/auth_provider.dart';
import '../../../state/citizen_provider.dart';
import '../widgets/complaint_card.dart';

class CitizenComplaintsTab extends StatefulWidget {
  const CitizenComplaintsTab({super.key});

  @override
  State<CitizenComplaintsTab> createState() => _CitizenComplaintsTabState();
}

class _CitizenComplaintsTabState extends State<CitizenComplaintsTab> {
  String _selectedFilter = 'ALL';
  String _searchQuery = '';
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final auth = context.watch<AuthProvider>();
    final citizenState = context.watch<CitizenProvider>();
    final user = auth.currentUser;

    final allComplaints = citizenState.complaints;

    final filtered = allComplaints.where((c) {
      // Filter by status
      if (_selectedFilter == 'SUBMITTED' &&
          c.status != ComplaintStatus.submitted &&
          c.status != ComplaintStatus.verified) {
        return false;
      }
      if (_selectedFilter == 'IN_PROGRESS' &&
          c.status != ComplaintStatus.assigned &&
          c.status != ComplaintStatus.accepted &&
          c.status != ComplaintStatus.inProgress) {
        return false;
      }
      if (_selectedFilter == 'RESOLVED' &&
          c.status != ComplaintStatus.resolved) {
        return false;
      }

      // Filter by search query
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final matchNumber = c.complaintNumber.toLowerCase().contains(query);
        final matchCategory = c.category.displayName.toLowerCase().contains(query);
        final matchDesc = c.description.toLowerCase().contains(query);
        final matchAddress = c.address.toLowerCase().contains(query);
        return matchNumber || matchCategory || matchDesc || matchAddress;
      }

      return true;
    }).toList();

    return RefreshIndicator(
      onRefresh: () async {
        if (user != null) {
          await citizenState.loadCitizenData(user.id);
        }
      },
      child: Column(
        children: [
          // Search & Filter Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: Column(
              children: [
                // Search Input
                TextField(
                  controller: _searchController,
                  onChanged: (val) {
                    setState(() {
                      _searchQuery = val.trim();
                    });
                  },
                  decoration: InputDecoration(
                    hintText: 'Search by ID, category, or keyword...',
                    prefixIcon: const Icon(Icons.search_rounded, size: 20),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              setState(() {
                                _searchQuery = '';
                              });
                            },
                          )
                        : null,
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                ),
                const SizedBox(height: 12),

                // Status Filter Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _FilterChip(
                        label: 'All (${allComplaints.length})',
                        isSelected: _selectedFilter == 'ALL',
                        onTap: () => setState(() => _selectedFilter = 'ALL'),
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Submitted (${citizenState.stats.submitted})',
                        isSelected: _selectedFilter == 'SUBMITTED',
                        color: AppColors.statusSubmitted,
                        onTap: () => setState(() => _selectedFilter = 'SUBMITTED'),
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'In Progress (${citizenState.stats.inProgress})',
                        isSelected: _selectedFilter == 'IN_PROGRESS',
                        color: AppColors.statusInProgress,
                        onTap: () => setState(() => _selectedFilter = 'IN_PROGRESS'),
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Resolved (${citizenState.stats.resolved})',
                        isSelected: _selectedFilter == 'RESOLVED',
                        color: AppColors.statusResolved,
                        onTap: () => setState(() => _selectedFilter = 'RESOLVED'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // List Body
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.search_off_rounded,
                            size: 56,
                            color: AppColors.textMuted.withAlpha(120),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _searchQuery.isNotEmpty
                                ? 'No Complaints Match "$_searchQuery"'
                                : 'No Complaints in this Filter',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _searchQuery.isNotEmpty
                                ? 'Try searching with different keywords or clear the search filter.'
                                : 'Report a new civic issue to track its resolution.',
                            textAlign: TextAlign.center,
                            style: theme.textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 20),
                          CustomButton(
                            text: 'Report New Issue',
                            icon: Icons.add_rounded,
                            width: 200,
                            onPressed: () {
                              Navigator.of(context).pushNamed(AppRoutes.reportIssue);
                            },
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      return ComplaintCard(complaint: filtered[index]);
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final Color? color;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = color ?? AppColors.primary;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? activeColor : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? activeColor : AppColors.border,
            width: 1.2,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textSecondary,
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
