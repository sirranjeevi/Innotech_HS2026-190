import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:citizen_portal/main.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:citizen_portal/services/location_service.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/ui/admin/admin_dashboard_screen.dart';
import 'package:citizen_portal/ui/citizen/citizen_main_screen.dart';
import 'package:citizen_portal/ui/splash/splash_screen.dart';
import 'package:citizen_portal/ui/worker/worker_dashboard_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;
  late ComplaintService complaintService;
  late LocationService locationService;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    storageService = StorageService(prefs);
    authService = AuthService(storageService: storageService);
    complaintService = ComplaintService(storageService: storageService);
    locationService = LocationService(
      mockLocation: const LocationResult(
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Civic Centre, New Delhi',
      ),
    );
  });

  Widget createTestApp() {
    return CitizenPortalApp(
      storageService: storageService,
      authService: authService,
      complaintService: complaintService,
      locationService: locationService,
    );
  }

  group('Auth Flow Widget Tests', () {
    testWidgets('App starts, shows splash and navigates to Role Selection',
        (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());

      // Splash screen shows AppLogoWidget
      expect(find.byType(SplashScreen), findsOneWidget);

      // Advance timer past splash duration
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Should now be on Role Selection Screen
      expect(find.text('Select Your Role'), findsOneWidget);
      expect(find.text('Citizen'), findsOneWidget);
      expect(find.text('Portal Admin'), findsOneWidget);
      expect(find.text('Field Worker'), findsOneWidget);
    });

    testWidgets('Selecting Citizen role opens Citizen Login Screen',
        (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Tap on Citizen Card
      await tester.tap(find.text('Citizen'));
      await tester.pumpAndSettle();

      expect(find.text('Citizen Login'), findsOneWidget);
      expect(find.text('Username or Email'), findsOneWidget);
      expect(find.text('Register Here'), findsOneWidget);
    });

    testWidgets('Citizen registration flow works', (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Go to Citizen Login
      await tester.tap(find.text('Citizen'));
      await tester.pumpAndSettle();

      // Tap Register
      await tester.tap(find.text('Register Here'));
      await tester.pumpAndSettle();

      expect(find.text('Create Account'), findsOneWidget);

      // Fill registration form
      await tester.enterText(
          find.widgetWithText(TextField, 'e.g. John Doe'), 'Test Citizen');
      await tester.enterText(
          find.widgetWithText(TextField, 'e.g. johndoe_99'), 'test_citizen_widget');
      await tester.enterText(
          find.widgetWithText(TextField, 'e.g. john@example.com'),
          'testwidget@example.com');
      await tester.enterText(
          find.widgetWithText(TextField, 'e.g. +919876543210'), '9876543210');
      await tester.enterText(
          find.widgetWithText(TextField, 'Minimum 6 characters'), 'Password@123');
      await tester.enterText(
          find.widgetWithText(TextField, 'Re-enter your password'), 'Password@123');

      // Scroll to submit button and tap
      await tester.ensureVisible(find.text('Create Account'));
      await tester.tap(find.text('Create Account'));
      await tester.pumpAndSettle();

      // Should land on CitizenMainScreen
      expect(find.byType(CitizenMainScreen), findsOneWidget);
      expect(find.text('Report Issue'), findsOneWidget);
    });

    testWidgets('Admin Login works with pre-built credentials',
        (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Tap on Admin Card
      await tester.tap(find.text('Portal Admin'));
      await tester.pumpAndSettle();

      expect(find.text('Administrator Portal'), findsOneWidget);

      // Pre-filled admin credentials submit
      await tester.tap(find.text('Sign In'));
      await tester.pumpAndSettle();

      expect(find.byType(AdminDashboardScreen), findsOneWidget);
      expect(find.text('Civic Administration Portal'), findsOneWidget);
    });

    testWidgets('Worker Login works with pre-built credentials',
        (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Tap on Worker Card
      await tester.tap(find.text('Field Worker'));
      await tester.pumpAndSettle();

      expect(find.text('Field Worker Portal'), findsOneWidget);

      // Pre-filled worker credentials submit
      await tester.tap(find.text('Sign In'));
      await tester.pumpAndSettle();

      expect(find.byType(WorkerDashboardScreen), findsOneWidget);
      expect(find.text('Dept: Sanitation'), findsOneWidget);
    });
  });
}
