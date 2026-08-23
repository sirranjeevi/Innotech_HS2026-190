import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/utils/validators.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/custom_button.dart';
import '../../core/widgets/custom_text_field.dart';
import '../../models/user_model.dart';
import '../../routes/app_router.dart';
import '../../state/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  final UserRole role;

  const LoginScreen({super.key, required this.role});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Pre-fill helpful demo credentials depending on selected role
    if (widget.role == UserRole.admin) {
      _identifierController.text = 'admin';
      _passwordController.text = 'Admin@123';
    } else if (widget.role == UserRole.worker) {
      _identifierController.text = 'worker_sanitation';
      _passwordController.text = 'Worker@123';
    }
  }

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final success = await auth.login(
      identifier: _identifierController.text.trim(),
      password: _passwordController.text,
      role: widget.role,
    );

    if (success && mounted) {
      final user = auth.currentUser!;
      final targetRoute = AppRoutes.getHomeRouteForRole(user.role);
      Navigator.of(context).pushNamedAndRemoveUntil(
        targetRoute,
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final auth = context.watch<AuthProvider>();

    final roleTitle = switch (widget.role) {
      UserRole.citizen => 'Citizen Login',
      UserRole.admin => 'Administrator Portal',
      UserRole.worker => 'Field Worker Portal',
    };

    final roleIcon = switch (widget.role) {
      UserRole.citizen => Icons.person_rounded,
      UserRole.admin => Icons.admin_panel_settings_rounded,
      UserRole.worker => Icons.engineering_rounded,
    };

    final roleColor = switch (widget.role) {
      UserRole.citizen => AppColors.primary,
      UserRole.admin => const Color(0xFF6366F1),
      UserRole.worker => AppColors.secondary,
    };

    return AppScaffold(
      showBackButton: true,
      onBackPressed: () {
        auth.clearError();
        Navigator.of(context).pop();
      },
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Brand Logo & Role Badge Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.border, width: 1.2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(12),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: Image.asset(
                        'assets/images/app_logo.png',
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) => Icon(
                          Icons.location_city_rounded,
                          color: roleColor,
                          size: 24,
                        ),
                      ),
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: roleColor.withAlpha(25),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: roleColor.withAlpha(70)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(roleIcon, size: 16, color: roleColor),
                        const SizedBox(width: 6),
                        Text(
                          roleTitle,
                          style: TextStyle(
                            color: roleColor,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              Text(
                AppStrings.loginTitle,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                AppStrings.loginSubTitle,
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 28),

              // Error Banner
              if (auth.errorMessage != null) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.errorLight,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.error.withAlpha(100)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline,
                          color: AppColors.error, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          auth.errorMessage!,
                          style: const TextStyle(
                            color: AppColors.error,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Username / Email input
              CustomTextField(
                label: widget.role == UserRole.citizen
                    ? 'Username or Email'
                    : 'System Identifier',
                hint: widget.role == UserRole.citizen
                    ? 'e.g. john_doe or john@example.com'
                    : 'e.g. admin or worker_sanitation',
                controller: _identifierController,
                prefixIcon: Icons.alternate_email_rounded,
                keyboardType: TextInputType.emailAddress,
                validator: (val) =>
                    Validators.requiredField(val, 'Username or Email'),
              ),
              const SizedBox(height: 18),

              // Password input
              CustomTextField(
                label: AppStrings.password,
                hint: '••••••••',
                controller: _passwordController,
                isPassword: true,
                prefixIcon: Icons.lock_outline_rounded,
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _handleLogin(),
                validator: Validators.validatePassword,
              ),
              const SizedBox(height: 28),

              // Login Button
              CustomButton(
                text: AppStrings.login,
                isLoading: auth.isLoading,
                onPressed: _handleLogin,
              ),

              // Citizen Register Link
              if (widget.role == UserRole.citizen) ...[
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Don't have an account? ",
                      style: theme.textTheme.bodyMedium,
                    ),
                    TextButton(
                      onPressed: () {
                        auth.clearError();
                        Navigator.of(context).pushNamed(AppRoutes.register);
                      },
                      child: const Text('Register Here'),
                    ),
                  ],
                ),
              ],

              // Pre-built Credentials Helper Box for Admin & Worker
              if (widget.role != UserRole.citizen) ...[
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.infoLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.info.withAlpha(80)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.info_outline,
                              color: AppColors.info, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            widget.role == UserRole.admin
                                ? 'Pre-built Admin Access'
                                : 'Pre-built Worker Access',
                            style: const TextStyle(
                              color: AppColors.info,
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        widget.role == UserRole.admin
                          ? 'Username: admin\nPassword: Admin@123'
                          : 'Workers: worker_sanitation, worker_roads, worker_electrical\nPassword: Worker@123',
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 12,
                          fontFamily: 'monospace',
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
