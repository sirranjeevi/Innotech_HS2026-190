import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/widgets/app_logo_widget.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../models/user_model.dart';
import '../../routes/app_router.dart';
import '../../state/auth_provider.dart';

class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppScaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            // Header
            Row(
              children: [
                const AppLogoWidget(
                  size: 44,
                  borderRadius: 22,
                ),
                const SizedBox(width: 12),
                Text(
                  AppStrings.appName,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),
            Text(
              'Select Your Role',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Choose how you want to interact with the civic complaint portal.',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 32),

            // Role 1: Citizen
            _RoleCard(
              title: AppStrings.roleCitizen,
              description: AppStrings.roleCitizenDesc,
              icon: Icons.person_rounded,
              accentColor: AppColors.primary,
              onTap: () => _selectRole(context, UserRole.citizen),
            ),
            const SizedBox(height: 16),

            // Role 2: Field Worker
            _RoleCard(
              title: AppStrings.roleWorker,
              description: AppStrings.roleWorkerDesc,
              icon: Icons.engineering_rounded,
              accentColor: AppColors.secondary,
              onTap: () => _selectRole(context, UserRole.worker),
            ),
            const SizedBox(height: 16),

            // Role 3: Portal Admin
            _RoleCard(
              title: AppStrings.roleAdmin,
              description: AppStrings.roleAdminDesc,
              icon: Icons.admin_panel_settings_rounded,
              accentColor: const Color(0xFF6366F1), // Indigo
              onTap: () => _selectRole(context, UserRole.admin),
            ),
            const SizedBox(height: 32),

            // Footer note
            Center(
              child: Text(
                'Innotech Civic Portal • Hackspora 2026',
                style: theme.textTheme.bodySmall,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _selectRole(BuildContext context, UserRole role) {
    context.read<AuthProvider>().setSelectedRole(role);
    Navigator.of(context).pushNamed(AppRoutes.login, arguments: role);
  }
}

class _RoleCard extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final Color accentColor;
  final VoidCallback onTap;

  const _RoleCard({
    required this.title,
    required this.description,
    required this.icon,
    required this.accentColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Ink(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border, width: 1.2),
          boxShadow: const [
            BoxShadow(
              color: AppColors.shadow,
              blurRadius: 10,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: accentColor.withAlpha(25),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: accentColor, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        title,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 16,
                        color: AppColors.textMuted,
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    description,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
