import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:citizen_portal/main.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/storage_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    storageService = StorageService(prefs);
    authService = AuthService(storageService: storageService);
  });

  Widget createTestApp() {
    return CitizenPortalApp(
      authService: authService,
    );
  }

  group('Auth Flow Widget Tests', () {
    testWidgets('App starts, shows splash and navigates to Role Selection',
        (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());

      // Splash screen shows title
      expect(find.text('Citizen Portal'), findsOneWidget);

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
      expect(find.text('Sign In'), findsOneWidget);
      expect(find.text('Register Here'), findsOneWidget);
    });

    testWidgets('Citizen registration flow works end-to-end',
        (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Navigate to Citizen Login -> Register
      await tester.tap(find.text('Citizen'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Register Here'));
      await tester.pumpAndSettle();

      expect(find.text('Citizen Registration'), findsOneWidget);

      // Fill in Registration form
      final textFields = find.byType(TextFormField);
      expect(textFields, findsNWidgets(6));

      await tester.enterText(textFields.at(0), 'Alice Cooper');
      await tester.enterText(textFields.at(1), 'alice99');
      await tester.enterText(textFields.at(2), 'alice@example.com');
      await tester.enterText(textFields.at(3), '+919876543210');
      await tester.enterText(textFields.at(4), 'Secret@123');
      await tester.enterText(textFields.at(5), 'Secret@123');

      // Tap Create Account
      await tester.tap(find.text('Create Account'));
      await tester.pumpAndSettle();

      // Should now be in Citizen Portal placeholder
      expect(find.text('Welcome, Alice Cooper'), findsOneWidget);
      expect(find.text('@alice99 • alice@example.com'), findsOneWidget);
      expect(find.text('Sign Out'), findsOneWidget);

      // Tap Logout
      await tester.tap(find.text('Sign Out'));
      await tester.pumpAndSettle();

      // Returns to Role Selection
      expect(find.text('Select Your Role'), findsOneWidget);
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

      expect(find.text('Administrator Console'), findsOneWidget);
      expect(find.text('Municipal Administrator'), findsOneWidget);
      expect(find.text('Sign Out'), findsOneWidget);
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

      expect(find.text('Field Worker Portal'), findsOneWidget);
      expect(find.text('Ramesh Kumar (Sanitation)'), findsOneWidget);
      expect(find.text('Department: Sanitation'), findsOneWidget);
    });
  });
}
