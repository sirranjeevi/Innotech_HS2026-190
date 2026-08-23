import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:citizen_portal/core/theme/app_theme.dart';
import 'package:citizen_portal/core/widgets/status_badge.dart';
import 'package:citizen_portal/models/complaint_model.dart';
import 'package:citizen_portal/models/user_model.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/services/notification_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:citizen_portal/state/auth_provider.dart';
import 'package:citizen_portal/state/citizen_provider.dart';
import 'package:citizen_portal/state/notification_provider.dart';
import 'package:citizen_portal/state/worker_provider.dart';
import 'package:citizen_portal/ui/citizen/complaint_detail_screen.dart';
import 'package:citizen_portal/ui/worker/resolve_task_screen.dart';
import 'package:citizen_portal/ui/worker/worker_task_detail_screen.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;
  late NotificationService notificationService;
  late ComplaintService complaintService;
  late AuthProvider authProvider;

  final testWorker = UserModel(
    id: 'worker-002',
    fullName: 'Suresh Patel (Road Maintenance)',
    username: 'worker_roads',
    email: 'suresh.roads@portal.gov',
    phone: '+919876543202',
    role: UserRole.worker,
    departmentId: 'dept-roads',
    departmentName: 'Road Maintenance',
    createdAt: DateTime.now(),
  );

  final testCitizen = UserModel(
    id: 'citizen-101',
    fullName: 'Ananya Sharma',
    username: 'ananya_s',
    email: 'ananya@example.com',
    phone: '+91 98765 22222',
    role: UserRole.citizen,
    createdAt: DateTime.now(),
  );

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    storageService = StorageService(prefs);
    await storageService.init();

    authService = AuthService(storageService: storageService);
    notificationService = NotificationService(storageService: storageService);
    complaintService = ComplaintService(
      storageService: storageService,
      notificationService: notificationService,
    );

    authProvider = AuthProvider(authService: authService);
    await authProvider.login(
      identifier: 'worker_roads',
      password: 'Worker@123',
      role: UserRole.worker,
    );
  });

  Widget createTestApp(Widget child, {AuthProvider? customAuth}) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>.value(
          value: customAuth ?? authProvider,
        ),
        ChangeNotifierProvider(
          create: (_) => WorkerProvider(complaintService: complaintService),
        ),
        ChangeNotifierProvider(
          create: (_) => CitizenProvider(
            complaintService: complaintService,
            storageService: storageService,
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => NotificationProvider(notificationService: notificationService),
        ),
      ],
      child: MaterialApp(
        theme: AppTheme.lightTheme,
        home: child,
      ),
    );
  }

  testWidgets('Worker Task Detail shows Complete & Resolve Task button when in progress', (WidgetTester tester) async {
    final complaintRes = await complaintService.submitComplaint(
      citizenId: testCitizen.id,
      citizenName: testCitizen.fullName,
      citizenPhone: testCitizen.phone,
      category: ComplaintCategory.pothole,
      description: 'Dangerous pothole on bridge ramp.',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Bridge Ramp, Bangalore',
    );
    final complaint = complaintRes.dataOrNull!;

    // Assign and Start Work
    await complaintService.updateComplaintStatus(
      complaintId: complaint.id,
      status: ComplaintStatus.inProgress,
      workerId: testWorker.id,
      workerName: testWorker.fullName,
      workerPhone: testWorker.phone,
      departmentId: 'dept-roads',
      departmentName: 'Road Maintenance',
    );

    final updated = (await complaintService.getComplaintById(complaint.id))!;

    await tester.pumpWidget(
      createTestApp(
        WorkerTaskDetailScreen(complaint: updated),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Complete & Resolve Task'), findsOneWidget);
    expect(find.text('Actively resolving issue on-site.'), findsOneWidget);
  });

  testWidgets('Worker opens ResolveTaskScreen, enters notes and completes task', (WidgetTester tester) async {
    final complaintRes = await complaintService.submitComplaint(
      citizenId: testCitizen.id,
      citizenName: testCitizen.fullName,
      citizenPhone: testCitizen.phone,
      category: ComplaintCategory.garbage,
      description: 'Garbage dump near school gate.',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'School Gate Road',
    );
    final complaint = complaintRes.dataOrNull!;

    await complaintService.updateComplaintStatus(
      complaintId: complaint.id,
      status: ComplaintStatus.inProgress,
      workerId: testWorker.id,
      workerName: testWorker.fullName,
      departmentName: 'Sanitation',
    );

    final inProgressComplaint = (await complaintService.getComplaintById(complaint.id))!;

    await tester.pumpWidget(
      createTestApp(
        ResolveTaskScreen(complaint: inProgressComplaint),
      ),
    );
    await tester.pumpAndSettle();

    // Verify Resolution Screen header
    expect(find.text('Complete Resolution Proof'), findsOneWidget);
    expect(find.text('Resolution & Repair Notes *'), findsOneWidget);

    // Enter notes
    await tester.enterText(
      find.byType(TextFormField),
      'Sanitation team cleared all garbage waste and disinfected the school perimeter.',
    );
    await tester.pumpAndSettle();

    // Scroll to and tap submit button
    await tester.ensureVisible(find.text('Submit Resolution & Complete Task'));
    await tester.tap(find.text('Submit Resolution & Complete Task'));
    await tester.pumpAndSettle();

    // Verify complaint in service is now RESOLVED
    final resolvedInDb = (await complaintService.getComplaintById(complaint.id))!;
    expect(resolvedInDb.status, ComplaintStatus.resolved);
    expect(resolvedInDb.resolutionNotes, contains('Sanitation team cleared all garbage'));
  });

  testWidgets('Citizen ComplaintDetailScreen renders Before vs After comparison and repair notes', (WidgetTester tester) async {
    final citizenAuth = AuthProvider(authService: authService);
    await citizenAuth.login(identifier: 'admin', password: 'Admin@123', role: UserRole.admin);

    final complaintRes = await complaintService.submitComplaint(
      citizenId: testCitizen.id,
      citizenName: testCitizen.fullName,
      citizenPhone: testCitizen.phone,
      category: ComplaintCategory.pothole,
      description: 'Severe pothole filled with rainwater.',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Outer Ring Road',
    );
    final complaint = complaintRes.dataOrNull!;

    await complaintService.updateComplaintStatus(
      complaintId: complaint.id,
      status: ComplaintStatus.resolved,
      workerId: testWorker.id,
      workerName: testWorker.fullName,
      workerPhone: testWorker.phone,
      departmentName: 'Road Maintenance',
      resolutionNotes: 'Filled crater with bituminous cold-mix asphalt and compacted with roller.',
      resolutionImageUrl: 'data:image/jpeg;base64,mock',
    );

    final resolved = (await complaintService.getComplaintById(complaint.id))!;

    await tester.pumpWidget(
      createTestApp(
        ComplaintDetailScreen(complaint: resolved),
        customAuth: citizenAuth,
      ),
    );
    await tester.pumpAndSettle();

    // Verify Resolution section
    expect(find.text('Resolution Proof & Verification'), findsOneWidget);
    expect(find.text('Issue Resolved by Field Worker'), findsOneWidget);
    expect(find.textContaining('Filled crater with bituminous cold-mix asphalt'), findsWidgets);
    expect(find.text('BEFORE (Reported)'), findsOneWidget);
    expect(find.text('AFTER (Resolved)'), findsOneWidget);
  });
}
