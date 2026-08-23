import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:citizen_portal/core/widgets/status_badge.dart';
import 'package:citizen_portal/models/complaint_model.dart';
import 'package:citizen_portal/models/user_model.dart';
import 'package:citizen_portal/routes/app_router.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:citizen_portal/state/auth_provider.dart';
import 'package:citizen_portal/state/worker_provider.dart';
import 'package:citizen_portal/ui/worker/worker_dashboard_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;
  late ComplaintService complaintService;
  late AuthProvider authProvider;
  late UserModel workerUser;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    storageService = StorageService();
    await storageService.init();

    authService = AuthService(storageService: storageService);
    complaintService = ComplaintService(storageService: storageService);
    authProvider = AuthProvider(authService: authService);

    final workers = await authService.getPrebuiltWorkers();
    workerUser = workers.first;

    // Log in worker
    await authProvider.login(
      identifier: workerUser.username,
      password: 'Worker@123',
      role: UserRole.worker,
    );

    // Seed task assigned to this worker
    final subRes = await complaintService.submitComplaint(
      citizenId: 'cit-test-1',
      citizenName: 'Jane Smith',
      citizenPhone: '9876543210',
      category: ComplaintCategory.garbage,
      description: 'Garbage dump needs immediate cleanup',
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Main Market Area',
    );

    await complaintService.updateComplaintStatus(
      complaintId: subRes.dataOrNull!.id,
      status: ComplaintStatus.assigned,
      workerId: workerUser.id,
      workerName: workerUser.fullName,
      workerPhone: workerUser.phone,
      departmentName: 'Sanitation',
    );
  });

  Widget createWorkerTestApp() {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: authProvider),
        ChangeNotifierProvider(
          create: (_) => WorkerProvider(complaintService: complaintService),
        ),
      ],
      child: MaterialApp(
        onGenerateRoute: AppRoutes.onGenerateRoute,
        home: const WorkerDashboardScreen(),
      ),
    );
  }

  testWidgets('Worker Dashboard renders metrics, assigned task and opens details', (WidgetTester tester) async {
    await tester.pumpWidget(createWorkerTestApp());
    await tester.pumpAndSettle();

    // Verify Metric Cards
    expect(find.text('Pending'), findsOneWidget);
    expect(find.text('In Progress'), findsWidgets);
    expect(find.text('Resolved'), findsWidgets);
    expect(find.text('Assigned'), findsWidgets);

    // Verify Task Card
    expect(find.text('CMP-1001'), findsOneWidget);
    expect(find.text('Garbage dump needs immediate cleanup'), findsOneWidget);
    expect(find.text('Accept'), findsOneWidget);
    expect(find.text('View Task'), findsOneWidget);

    // Tap View Task
    await tester.tap(find.text('View Task'));
    await tester.pumpAndSettle();

    // Verify Task Detail Screen
    expect(find.text('Task CMP-1001'), findsOneWidget);
    expect(find.text('New Task Assigned to You'), findsOneWidget);
    expect(find.text('Accept Assigned Task'), findsOneWidget);
    expect(find.text('Jane Smith'), findsOneWidget);
  });

  testWidgets('Worker accepts task and starts work on-site', (WidgetTester tester) async {
    await tester.pumpWidget(createWorkerTestApp());
    await tester.pumpAndSettle();

    // Tap View Task
    await tester.tap(find.text('View Task'));
    await tester.pumpAndSettle();

    // 1. Accept Task (ASSIGNED -> ACCEPTED)
    await tester.tap(find.text('Accept Assigned Task'));
    await tester.pumpAndSettle();

    expect(find.text('Task accepted! Scheduled for site visit.'), findsOneWidget);
    expect(find.text('Start Work / Mark On-Site'), findsOneWidget);

    // 2. Start Work (ACCEPTED -> IN_PROGRESS)
    await tester.tap(find.text('Start Work / Mark On-Site'));
    await tester.pumpAndSettle();

    expect(find.text('Work In Progress On-Site'), findsOneWidget);
  });
}
