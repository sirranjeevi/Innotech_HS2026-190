class AppStrings {
  AppStrings._();

  static const String appName = 'Citizen Portal';
  static const String appTagline = 'Civic Issue Reporting & Resolution System';

  // Roles
  static const String roleCitizen = 'Citizen';
  static const String roleAdmin = 'Portal Admin';
  static const String roleWorker = 'Field Worker';

  // Role Descriptions
  static const String roleCitizenDesc = 'Report civic complaints, track real-time progress, and view resolution.';
  static const String roleAdminDesc = 'Verify complaints, assign departments, and manage field workers.';
  static const String roleWorkerDesc = 'View assigned civic tasks, update progress, and upload resolution proof.';

  // Auth Strings
  static const String loginTitle = 'Welcome Back';
  static const String registerTitle = 'Citizen Registration';
  static const String loginSubTitle = 'Sign in to access your civic portal';
  static const String registerSubTitle = 'Create an account to report and track issues';

  // Form Fields
  static const String fullName = 'Full Name';
  static const String username = 'Username';
  static const String email = 'Email Address';
  static const String phone = 'Phone Number';
  static const String password = 'Password';
  static const String confirmPassword = 'Confirm Password';

  // Buttons
  static const String login = 'Sign In';
  static const String register = 'Create Account';
  static const String logout = 'Sign Out';
  static const String continueText = 'Continue';
  static const String submit = 'Submit';
  static const String cancel = 'Cancel';

  // Statuses
  static const String statusSubmitted = 'SUBMITTED';
  static const String statusVerified = 'VERIFIED';
  static const String statusAssigned = 'ASSIGNED';
  static const String statusAccepted = 'ACCEPTED';
  static const String statusInProgress = 'IN_PROGRESS';
  static const String statusResolved = 'RESOLVED';
}
