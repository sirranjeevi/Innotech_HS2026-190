import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:citizen_portal/main.dart';
import 'package:citizen_portal/models/complaint_model.dart';
import 'package:citizen_portal/models/session_model.dart';
import 'package:citizen_portal/models/user_model.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/services/location_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:citizen_portal/ui/citizen/complaint_detail_screen.dart';
import 'package:citizen_portal/ui/citizen/report_issue_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;
  late ComplaintService complaintService;
  late LocationService locationService;

  final testCitizen = UserModel(
    id: 'citizen-dup-tester',
    fullName: 'Ravi Teja',
    username: 'raviteja',
    email: 'ravi@example.com',
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
        address: 'Sector 5 Main Market, New Delhi',
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

  group('Duplicate Detection & Smart Prevention Flow Tests', () {
    testWidgets('Shows DuplicateWarningDialog and allows upvoting existing issue',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      // 1. Seed an existing active complaint in Garbage category at (28.6139, 77.2090)
      await complaintService.submitComplaint(
        citizenId: 'other-user',
        citizenName: 'Original Reporter',
        citizenPhone: '9876543210',
        category: ComplaintCategory.garbage,
        description: 'Large garbage heap overflowing into the street.',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Sector 5 Main Market, New Delhi',
      );

      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Open Report Issue screen
      await tester.tap(find.text('Report an Issue Now'));
      await tester.pumpAndSettle();

      expect(find.byType(ReportIssueScreen), findsOneWidget);

      // Category is Garbage by default. Enter description.
      final descField = find.byType(TextFormField);
      await tester.enterText(descField, 'Uncleaned garbage dump smelling bad.');
      await tester.pumpAndSettle();

      // Tap Submit
      final submitBtn = find.text('Submit Civic Complaint');
      await tester.ensureVisible(submitBtn);
      await tester.pumpAndSettle();
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      // Duplicate warning modal is shown!
      expect(find.text('Similar Issue Nearby!'), findsOneWidget);
      expect(find.text('Large garbage heap overflowing into the street.'), findsOneWidget);
      expect(find.text('Upvote & Support Existing Issue'), findsOneWidget);

      // Tap "Upvote & Support Existing Issue"
      await tester.tap(find.text('Upvote & Support Existing Issue'));
      await tester.pumpAndSettle();

      // Navigated to ComplaintDetailScreen with incremented supporters
      expect(find.byType(ComplaintDetailScreen), findsOneWidget);
      expect(find.text('1 Citizen Supporters'), findsOneWidget);
      expect(find.text('Supported'), findsOneWidget);
    });

    testWidgets('Allows citizen to Submit as New Issue Anyway',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      // 1. Seed an existing active complaint
      await complaintService.submitComplaint(
        citizenId: 'other-user',
        citizenName: 'Original Reporter',
        citizenPhone: '9876543210',
        category: ComplaintCategory.pothole,
        description: 'Pothole near crossroad.',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Sector 5 Main Market, New Delhi',
      );

      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Open Report Issue screen
      await tester.tap(find.text('Report an Issue Now'));
      await tester.pumpAndSettle();

      // Select Pothole
      await tester.tap(find.text('Pothole'));
      await tester.pumpAndSettle();

      // Enter description
      final descField = find.byType(TextFormField);
      await tester.enterText(descField, 'Different distinct pothole near petrol pump.');
      await tester.pumpAndSettle();

      // Tap Submit
      final submitBtn = find.text('Submit Civic Complaint');
      await tester.ensureVisible(submitBtn);
      await tester.pumpAndSettle();
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      // Duplicate warning modal is shown
      expect(find.text('Similar Issue Nearby!'), findsOneWidget);

      // Tap "Submit as New Issue Anyway"
      await tester.tap(find.text('Submit as New Issue Anyway'));
      await tester.pumpAndSettle();

      // Verify success dialog
      expect(find.text('Complaint Registered Successfully'), findsOneWidget);
      expect(find.text('CMP-1002'), findsOneWidget);
    });
  });
}
