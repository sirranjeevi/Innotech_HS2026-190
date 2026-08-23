import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:citizen_portal/core/theme/app_theme.dart';
import 'package:citizen_portal/core/widgets/status_badge.dart';
import 'package:citizen_portal/models/complaint_model.dart';
import 'package:citizen_portal/models/session_model.dart';
import 'package:citizen_portal/models/user_model.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:citizen_portal/state/auth_provider.dart';
import 'package:citizen_portal/state/citizen_provider.dart';
import 'package:citizen_portal/ui/citizen/complaint_detail_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;
  late ComplaintService complaintService;

  final testCitizen = UserModel(
    id: 'citizen-detail-test-1',
    fullName: 'Ananya Verma',
    username: 'ananya99',
    email: 'ananya@example.com',
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
  });

  Widget createWidgetUnderTest(ComplaintModel complaint, {AuthProvider? authProvider}) {
    return MultiProvider(
      providers: [
        if (authProvider != null)
          ChangeNotifierProvider.value(value: authProvider)
        else
          ChangeNotifierProvider(
            create: (_) => AuthProvider(authService: authService),
          ),
        ChangeNotifierProvider(
          create: (_) => CitizenProvider(
            complaintService: complaintService,
            storageService: storageService,
          ),
        ),
      ],
      child: MaterialApp(
        theme: AppTheme.lightTheme,
        home: ComplaintDetailScreen(complaint: complaint),
      ),
    );
  }

  group('ComplaintDetailScreen & Timeline Stepper Widget Tests', () {
    testWidgets('Renders all 6 lifecycle stages and complaint information',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final complaint = ComplaintModel(
        id: 'cmp-detail-1',
        complaintNumber: 'CMP-1001',
        citizenId: 'citizen-1',
        citizenName: 'Aarav',
        citizenPhone: '9876543210',
        category: ComplaintCategory.waterLeakage,
        description: 'Underground pipe burst causing water flood near Main Gate.',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Main Gate, Sector 4',
        status: ComplaintStatus.inProgress,
        workerName: 'Ramesh Yadav',
        workerPhone: '+919876543210',
        departmentName: 'Water & Sewage',
        createdAt: DateTime.now(),
      );

      // Pre-save complaint into service
      await complaintService.submitComplaint(
        citizenId: complaint.citizenId,
        citizenName: complaint.citizenName,
        citizenPhone: complaint.citizenPhone,
        category: complaint.category,
        description: complaint.description,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        address: complaint.address,
      );

      await tester.pumpWidget(createWidgetUnderTest(complaint));
      await tester.pump(const Duration(milliseconds: 100));
      await tester.pumpAndSettle();

      // Verify Header & details
      expect(find.text('CMP-1001'), findsWidgets);
      expect(find.text('Water Leakage'), findsOneWidget);
      expect(find.text('In Progress'), findsWidgets);
      expect(find.text('Main Gate, Sector 4'), findsOneWidget);

      // Verify all 6 timeline stages are present
      expect(find.text('Complaint Status Lifecycle'), findsOneWidget);
      expect(find.text('Submitted'), findsWidgets);
      expect(find.text('Verified'), findsOneWidget);
      expect(find.text('Assigned'), findsOneWidget);
      expect(find.text('Accepted'), findsOneWidget);
      expect(find.text('Resolved'), findsOneWidget);

      // Verify Assigned Field Worker card
      expect(find.text('Assigned Field Worker'), findsOneWidget);
      expect(find.text('Ramesh Yadav'), findsOneWidget);
      expect(find.text('Department: Water & Sewage'), findsOneWidget);
    });

    testWidgets('Citizen can upvote complaint and increment supporter counter',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final sub = await complaintService.submitComplaint(
        citizenId: 'other-citizen',
        citizenName: 'Other Person',
        citizenPhone: '9876543210',
        category: ComplaintCategory.pothole,
        description: 'Dangerous pothole on highway ramp.',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Highway Ramp',
      );

      final initialComplaint = sub.dataOrNull!;

      await authService.registerCitizen(
        fullName: testCitizen.fullName,
        username: testCitizen.username,
        email: testCitizen.email,
        phone: testCitizen.phone,
        password: 'password123',
      );
      final authProvider = AuthProvider(authService: authService);
      await authProvider.login(
        identifier: testCitizen.username,
        password: 'password123',
        role: UserRole.citizen,
      );

      await tester.pumpWidget(createWidgetUnderTest(initialComplaint, authProvider: authProvider));
      await tester.pumpAndSettle();

      expect(find.text('0 Citizen Supporters'), findsOneWidget);
      expect(find.text('Support'), findsOneWidget);

      // Tap Support button
      await tester.tap(find.text('Support'));
      await tester.pumpAndSettle();

      // Verify supporter count updated
      expect(find.text('1 Citizen Supporters'), findsOneWidget);
      expect(find.text('Supported'), findsOneWidget);
    });
  });
}
