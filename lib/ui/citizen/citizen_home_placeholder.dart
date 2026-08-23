import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/custom_button.dart';
import '../../routes/app_router.dart';
import '../../state/auth_provider.dart';

class CitizenHomePlaceholder extends StatelessWidget {
  const CitizenHomePlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final auth = context.watch<AuthProvider>();
    final user = auth.currentUser;

    return AppScaffold(
      title: 'Citizen Portal',
      actions: [
        IconButton(
          icon: const Icon(Icons.logout_rounded, color: AppColors.error),
          tooltip: 'Sign Out',
          onPressed: () async {
            await auth.logout();
            if (context.mounted) {
              Navigator.of(context).pushNamedAndRemoveUntil(
                AppRoutes.roleSelection,
                (route) => false,
              );
            }
          },
        ),
      ],
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.primaryLight],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withAlpha(50),
                    blurRadius: 15,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: Colors.white,
                        child: Text(
                          (user?.fullName.isNotEmpty == true)
                              ? user!.fullName[0].toUpperCase()
                              : 'C',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome, ${user?.fullName ?? 'Citizen'}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '@${user?.username ?? 'user'} • ${user?.email ?? ''}',
                              style: TextStyle(
                                color: Colors.white.withAlpha(200),
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(40),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'Phase 1: Authentication Verified',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Profile info card
            Text(
              'Account Information',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _InfoRow(
                      icon: Icons.person_outline,
                      label: 'Full Name',
                      value: user?.fullName ?? 'N/A',
                    ),
                    const Divider(height: 20),
                    _InfoRow(
                      icon: Icons.alternate_email,
                      label: 'Username',
                      value: user?.username ?? 'N/A',
                    ),
                    const Divider(height: 20),
                    _InfoRow(
                      icon: Icons.mail_outline,
                      label: 'Email',
                      value: user?.email ?? 'N/A',
                    ),
                    const Divider(height: 20),
                    _InfoRow(
                      icon: Icons.phone_outlined,
                      label: 'Phone',
                      value: user?.phone ?? 'N/A',
                    ),
                    const Divider(height: 20),
                    _InfoRow(
                      icon: Icons.security_outlined,
                      label: 'Role',
                      value: user?.role.displayName ?? 'Citizen',
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 28),

            // Logout Button
            CustomButton(
              text: AppStrings.logout,
              variant: ButtonVariant.outline,
              icon: Icons.logout_rounded,
              onPressed: () async {
                await auth.logout();
                if (context.mounted) {
                  Navigator.of(context).pushNamedAndRemoveUntil(
                    AppRoutes.roleSelection,
                    (route) => false,
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(width: 12),
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(width: 8),
        const Spacer(),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
