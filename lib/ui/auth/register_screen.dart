import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/utils/validators.dart';
import '../../core/widgets/app_logo_widget.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/custom_button.dart';
import '../../core/widgets/custom_text_field.dart';
import '../../routes/app_router.dart';
import '../../state/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  @override
  void dispose() {
    _fullNameController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final success = await auth.registerCitizen(
      fullName: _fullNameController.text.trim(),
      username: _usernameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      password: _passwordController.text,
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Account created successfully! Welcome to Citizen Portal.'),
          backgroundColor: AppColors.success,
        ),
      );
      Navigator.of(context).pushNamedAndRemoveUntil(
        AppRoutes.citizenHome,
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final auth = context.watch<AuthProvider>();

    return AppScaffold(
      title: 'Citizen Registration',
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
              // Brand Logo & Badge
              const AppLogoWidget(
                size: 44,
                borderRadius: 22,
              ),
              const SizedBox(height: 16),
              Text(
                'Join the Portal',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                AppStrings.registerSubTitle,
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),

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
                const SizedBox(height: 16),
              ],

              // Full Name
              CustomTextField(
                label: AppStrings.fullName,
                hint: 'e.g. John Doe',
                controller: _fullNameController,
                prefixIcon: Icons.badge_outlined,
                validator: (val) => Validators.requiredField(val, 'Full Name'),
              ),
              const SizedBox(height: 16),

              // Username
              CustomTextField(
                label: AppStrings.username,
                hint: 'e.g. johndoe_99',
                controller: _usernameController,
                prefixIcon: Icons.person_outline_rounded,
                validator: Validators.validateUsername,
              ),
              const SizedBox(height: 16),

              // Email
              CustomTextField(
                label: AppStrings.email,
                hint: 'e.g. john@example.com',
                controller: _emailController,
                prefixIcon: Icons.mail_outline_rounded,
                keyboardType: TextInputType.emailAddress,
                validator: Validators.validateEmail,
              ),
              const SizedBox(height: 16),

              // Phone
              CustomTextField(
                label: AppStrings.phone,
                hint: 'e.g. +919876543210',
                controller: _phoneController,
                prefixIcon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
                validator: Validators.validatePhone,
              ),
              const SizedBox(height: 16),

              // Password
              CustomTextField(
                label: AppStrings.password,
                hint: 'Minimum 6 characters',
                controller: _passwordController,
                isPassword: true,
                prefixIcon: Icons.lock_outline_rounded,
                validator: Validators.validatePassword,
              ),
              const SizedBox(height: 16),

              // Confirm Password
              CustomTextField(
                label: AppStrings.confirmPassword,
                hint: 'Re-enter your password',
                controller: _confirmPasswordController,
                isPassword: true,
                prefixIcon: Icons.lock_reset_rounded,
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _handleRegister(),
                validator: (val) => Validators.validateConfirmPassword(
                  val,
                  _passwordController.text,
                ),
              ),
              const SizedBox(height: 28),

              // Register Button
              CustomButton(
                text: AppStrings.register,
                isLoading: auth.isLoading,
                onPressed: _handleRegister,
              ),
              const SizedBox(height: 20),

              // Already have account
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Already registered? ',
                    style: theme.textTheme.bodyMedium,
                  ),
                  TextButton(
                    onPressed: () {
                      auth.clearError();
                      Navigator.of(context).pop();
                    },
                    child: const Text('Sign In'),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
