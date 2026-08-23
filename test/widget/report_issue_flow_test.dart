import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:citizen_portal/main.dart';
import 'package:citizen_portal/models/user_model.dart';
import 'package:citizen_portal/models/session_model.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:citizen_portal/ui/citizen/report_issue_screen.dart';
import 'package:citizen_portal/services/location_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;
  late ComplaintService complaintService;
  late LocationService locationService;

  final testCitizen = UserModel(
    id: 'citizen-report-test-1',
    fullName: 'Priya Sharma',
    username: 'priyasharma',
    email: 'priya@example.com',
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

  group('Report Issue Flow Widget Tests', () {
    testWidgets('Opens report issue form, validates, captures location, and registers complaint',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Tap "Report an Issue Now" on the dashboard banner
      final reportBtn = find.text('Report an Issue Now');
      expect(reportBtn, findsOneWidget);
      await tester.tap(reportBtn);
      await tester.pumpAndSettle();

      expect(find.byType(ReportIssueScreen), findsOneWidget);
      expect(find.text('1. Select Issue Category'), findsOneWidget);
      expect(find.text('2. Issue Description'), findsOneWidget);
      expect(find.text('4. Location Tagging'), findsOneWidget);

      // Select "Pothole" Category
      await tester.tap(find.text('Pothole'));
      await tester.pumpAndSettle();

      // Enter short description to test validation
      final descField = find.byType(TextFormField);
      await tester.enterText(descField, 'Short');

      // Scroll to submit button and tap
      final submitBtn = find.text('Submit Civic Complaint');
      await tester.ensureVisible(submitBtn);
      await tester.pumpAndSettle();
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      // Validation error shown
      expect(find.text('Please enter at least 10 characters describing the issue'), findsOneWidget);

      // Enter valid description
      await tester.enterText(descField, 'Deep pothole on Main Road causing traffic issues.');
      await tester.pumpAndSettle();

      // Tap Submit again
      await tester.ensureVisible(submitBtn);
      await tester.pumpAndSettle();
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      // Verify Submission Success Dialog
      expect(find.text('Complaint Registered Successfully'), findsOneWidget);
      expect(find.text('CMP-1001'), findsOneWidget);
      expect(find.text('Pothole'), findsWidgets);
      expect(find.text('Submitted'), findsWidgets);

      // Tap "View My Complaints" (closes dialog and returns to CitizenMainScreen)
      final viewComplaintsBtn = find.text('View My Complaints');
      await tester.tap(viewComplaintsBtn);
      await tester.pumpAndSettle();

      // Verify complaint is listed on Citizen Dashboard
      expect(find.text('CMP-1001'), findsOneWidget);
      expect(find.text('Deep pothole on Main Road causing traffic issues.'), findsOneWidget);

      // Switch to "My Complaints" tab
      await tester.tap(find.text('My Complaints'));
      await tester.pumpAndSettle();

      // Verify complaint is also listed in My Complaints list
      expect(find.text('CMP-1001'), findsOneWidget);
      expect(find.text('Deep pothole on Main Road causing traffic issues.'), findsOneWidget);
    });
  });
}
