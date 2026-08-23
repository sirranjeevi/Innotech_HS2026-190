import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:citizen_portal/main.dart';
import 'package:citizen_portal/models/user_model.dart';
import 'package:citizen_portal/models/session_model.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:citizen_portal/ui/citizen/citizen_main_screen.dart';

import 'package:citizen_portal/services/location_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;
  late ComplaintService complaintService;
  late LocationService locationService;

  final testCitizen = UserModel(
    id: 'citizen-widget-test-1',
    fullName: 'Rahul Sharma',
    username: 'rahul99',
    email: 'rahul@example.com',
    phone: '+919876543210',
    role: UserRole.citizen,
    createdAt: DateTime(2026, 1, 1),
  );

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    storageService = StorageService(prefs);
    await storageService.saveSession(
      SessionModel(
        user: testCitizen,
        token: 'token-test',
        loggedInAt: DateTime.now(),
      ),
    );
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
      authService: authService,
      complaintService: complaintService,
      locationService: locationService,
    );
  }

  group('Citizen Dashboard & Navigation Widget Tests', () {
    testWidgets('Dashboard displays greeting, metric cards, and report CTA',
        (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Should automatically restore citizen session and land on CitizenMainScreen
      expect(find.byType(CitizenMainScreen), findsOneWidget);
      expect(find.text('Hello, Rahul 👋'), findsOneWidget);
      expect(find.text('Spotted a Civic Issue?'), findsOneWidget);
      expect(find.text('Total'), findsOneWidget);
      expect(find.text('Submitted'), findsOneWidget);
      expect(find.text('In Progress'), findsOneWidget);
      expect(find.text('Resolved'), findsOneWidget);
      expect(find.text('No Complaints Yet'), findsOneWidget);
    });

    testWidgets('Bottom navigation switches tabs cleanly',
        (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Tap "My Complaints" tab
      await tester.tap(find.text('My Complaints'));
      await tester.pumpAndSettle();
      expect(find.text('All (0)'), findsOneWidget);
      expect(find.text('Search by ID, category, or keyword...'), findsOneWidget);

      // Tap "Notifications" tab
      await tester.tap(find.text('Notifications'));
      await tester.pumpAndSettle();
      expect(find.text('Notifications (0)'), findsOneWidget);

      // Tap "Profile" tab
      await tester.tap(find.text('Profile'));
      await tester.pumpAndSettle();
      expect(find.text('Account Details'), findsOneWidget);
      expect(find.text('Rahul Sharma'), findsWidgets);
    });
  });
}
