class AppConstants {
  AppConstants._();

  // Storage Keys
  static const String keyUserSession = 'citizen_portal_user_session';
  static const String keyUsersDatabase = 'citizen_portal_mock_users_db';
  static const String keySelectedRole = 'citizen_portal_selected_role';

  // Validation Limits
  static const int minPasswordLength = 6;
  static const int minUsernameLength = 3;
  static const int maxUsernameLength = 20;

  // Animation Timers
  static const Duration splashDuration = Duration(milliseconds: 1500);
  static const Duration animationFast = Duration(milliseconds: 200);
  static const Duration animationMedium = Duration(milliseconds: 350);
}
