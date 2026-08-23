import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:citizen_portal/models/complaint_model.dart';
import 'package:citizen_portal/routes/app_router.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:citizen_portal/state/admin_provider.dart';
import 'package:citizen_portal/state/auth_provider.dart';
import 'package:citizen_portal/ui/admin/admin_dashboard_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;
  late ComplaintService complaintService;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    storageService = StorageService();
    await storageService.init();

    authService = AuthService(storageService: storageService);
    complaintService = ComplaintService(storageService: storageService);

    // Seed test complaint
    await complaintService.submitComplaint(
      citizenId: 'cit-test-1',
      citizenName: 'John Doe',
      citizenPhone: '9876543210',
      category: ComplaintCategory.pothole,
      description: 'Major road crater on 2nd cross street',
      latitude: 28.6139,
      longitude: 77.2090,
      address: '2nd Cross Street',
    );
  });

  Widget createAdminTestApp() {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(authService: authService),
        ),
        ChangeNotifierProvider(
          create: (_) => AdminProvider(
            complaintService: complaintService,
            authService: authService,
          ),
        ),
      ],
      child: MaterialApp(
        onGenerateRoute: AppRoutes.onGenerateRoute,
        home: const AdminDashboardScreen(),
      ),
    );
  }

  testWidgets('Admin Dashboard renders metrics, complaint registry, and navigates to manage', (WidgetTester tester) async {
    await tester.pumpWidget(createAdminTestApp());
    await tester.pumpAndSettle();

    // Verify Metric Cards
    expect(find.text('Total Tickets'), findsOneWidget);
    expect(find.text('Submitted'), findsWidgets);
    expect(find.text('In Progress'), findsOneWidget);
    expect(find.text('Resolved'), findsOneWidget);

    // Verify complaint in registry
    expect(find.text('CMP-1001'), findsOneWidget);
    expect(find.text('Major road crater on 2nd cross street'), findsOneWidget);
    expect(find.text('Manage'), findsOneWidget);

    // Tap Manage button to open AdminComplaintDetailScreen
    await tester.tap(find.text('Manage').first);
    await tester.pumpAndSettle();

    // Verify Detail Screen
    expect(find.text('Manage CMP-1001'), findsOneWidget);
    expect(find.text('Administrative Action Required'), findsOneWidget);
    expect(find.text('Verify Issue'), findsOneWidget);
    expect(find.text('Assign Worker'), findsOneWidget);
  });

  testWidgets('Admin verifies complaint and assigns field worker', (WidgetTester tester) async {
    await tester.pumpWidget(createAdminTestApp());
    await tester.pumpAndSettle();

    // Tap Manage
    await tester.tap(find.text('Manage').first);
    await tester.pumpAndSettle();

    // 1. Verify Issue
    await tester.tap(find.text('Verify Issue'));
    await tester.pumpAndSettle();
    expect(find.text('Complaint verified successfully!'), findsOneWidget);

    // 2. Open Assign Worker Dialog
    await tester.tap(find.text('Assign Worker'));
    await tester.pumpAndSettle();

    expect(find.text('Assign Field Worker'), findsOneWidget);
    expect(find.text('Responsible Department'), findsOneWidget);
    expect(find.text('Select Field Worker'), findsOneWidget);

    // Select Suresh Patel (Road Maintenance)
    final workerFinder = find.textContaining('Suresh Patel');
    expect(workerFinder, findsOneWidget);
    await tester.tap(workerFinder);
    await tester.pumpAndSettle();

    // Tap Assign Worker in dialog (the one inside AlertDialog actions)
    await tester.tap(find.widgetWithText(ElevatedButton, 'Assign Worker').last);
    await tester.pumpAndSettle();

    // Verify assigned field worker card is now visible
    expect(find.text('Assigned Field Worker'), findsOneWidget);
    expect(find.textContaining('Suresh Patel'), findsWidgets);
  });
}
