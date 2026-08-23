import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../ui/splash/splash_screen.dart';
import '../ui/role_selection/role_selection_screen.dart';
import '../ui/auth/login_screen.dart';
import '../ui/auth/register_screen.dart';
import '../ui/citizen/citizen_home_placeholder.dart';
import '../ui/admin/admin_home_placeholder.dart';
import '../ui/worker/worker_home_placeholder.dart';

class AppRoutes {
  AppRoutes._();

  static const String splash = '/';
  static const String roleSelection = '/role-selection';
  static const String login = '/login';
  static const String register = '/register';

  // Role Protected Dashboards
  static const String citizenHome = '/citizen-home';
  static const String adminHome = '/admin-home';
  static const String workerHome = '/worker-home';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());

      case roleSelection:
        return MaterialPageRoute(builder: (_) => const RoleSelectionScreen());

      case login:
        final role = settings.arguments as UserRole? ?? UserRole.citizen;
        return MaterialPageRoute(
          builder: (_) => LoginScreen(role: role),
        );

      case register:
        return MaterialPageRoute(builder: (_) => const RegisterScreen());

      case citizenHome:
        return MaterialPageRoute(builder: (_) => const CitizenHomePlaceholder());

      case adminHome:
        return MaterialPageRoute(builder: (_) => const AdminHomePlaceholder());

      case workerHome:
        return MaterialPageRoute(builder: (_) => const WorkerHomePlaceholder());

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('Route not found: ${settings.name}'),
            ),
          ),
        );
    }
  }

  static String getHomeRouteForRole(UserRole role) {
    switch (role) {
      case UserRole.citizen:
        return citizenHome;
      case UserRole.admin:
        return adminHome;
      case UserRole.worker:
        return workerHome;
    }
  }
}
