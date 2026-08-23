import 'package:flutter/material.dart';
import '../models/complaint_model.dart';
import '../models/user_model.dart';
import '../ui/admin/admin_complaint_detail_screen.dart';
import '../ui/admin/admin_dashboard_screen.dart';
import '../ui/auth/login_screen.dart';
import '../ui/auth/register_screen.dart';
import '../ui/citizen/citizen_main_screen.dart';
import '../ui/citizen/report_issue_screen.dart';
import '../ui/role_selection/role_selection_screen.dart';
import '../ui/splash/splash_screen.dart';
import '../ui/worker/worker_dashboard_screen.dart';
import '../ui/worker/worker_task_detail_screen.dart';

class AppRoutes {
  AppRoutes._();

  static const String splash = '/';
  static const String roleSelection = '/role-selection';
  static const String login = '/login';
  static const String register = '/register';

  // Citizen Flow
  static const String citizenHome = '/citizen-home';
  static const String reportIssue = '/citizen-report-issue';

  // Admin Flow
  static const String adminHome = '/admin-home';
  static const String adminComplaintDetail = '/admin-complaint-detail';

  // Worker Flow
  static const String workerHome = '/worker-home';
  static const String workerTaskDetail = '/worker-task-detail';

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
        return MaterialPageRoute(builder: (_) => const CitizenMainScreen());

      case reportIssue:
        return MaterialPageRoute(builder: (_) => const ReportIssueScreen());

      case adminHome:
        return MaterialPageRoute(builder: (_) => const AdminDashboardScreen());

      case adminComplaintDetail:
        final complaint = settings.arguments as ComplaintModel;
        return MaterialPageRoute(
          builder: (_) => AdminComplaintDetailScreen(complaint: complaint),
        );

      case workerHome:
        return MaterialPageRoute(builder: (_) => const WorkerDashboardScreen());

      case workerTaskDetail:
        final complaint = settings.arguments as ComplaintModel;
        return MaterialPageRoute(
          builder: (_) => WorkerTaskDetailScreen(complaint: complaint),
        );

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
