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
import 'package:citizen_portal/ui/citizen/tabs/citizen_notifications_tab.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;
  late NotificationService notificationService;
  late ComplaintService complaintService;
  late AuthProvider authProvider;
  late UserModel citizenUser;

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

    final regRes = await authService.registerCitizen(
      fullName: 'Ananya Sharma',
      username: 'ananya_s',
      email: 'ananya@example.com',
      phone: '+91 98765 22222',
      password: 'Password@123',
    );
    citizenUser = regRes.dataOrNull!;

    authProvider = AuthProvider(authService: authService);
    await authProvider.login(
      identifier: 'ananya_s',
      password: 'Password@123',
      role: UserRole.citizen,
    );
  });

  Widget createNotificationsApp() {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
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
        home: const Scaffold(body: CitizenNotificationsTab()),
      ),
    );
  }

  testWidgets('CitizenNotificationsTab shows empty state when no notifications', (WidgetTester tester) async {
    await tester.pumpWidget(createNotificationsApp());
    await tester.pumpAndSettle();

    expect(find.text('No Notifications Yet'), findsOneWidget);
    expect(find.textContaining('You will receive instant updates'), findsOneWidget);
  });

  testWidgets('Citizen receives notifications and can Mark All Read', (WidgetTester tester) async {
    // Generate 2 complaint actions
    final res = await complaintService.submitComplaint(
      citizenId: citizenUser.id,
      citizenName: citizenUser.fullName,
      citizenPhone: citizenUser.phone,
      category: ComplaintCategory.streetlight,
      description: 'Streetlight pole dark for 5 days.',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Main Avenue',
    );
    final complaint = res.dataOrNull!;

    await complaintService.updateComplaintStatus(
      complaintId: complaint.id,
      status: ComplaintStatus.verified,
    );

    await tester.pumpWidget(createNotificationsApp());
    await tester.pumpAndSettle();

    // Verify notifications rendered
    expect(find.textContaining('Complaint Registered: ${complaint.complaintNumber}'), findsOneWidget);
    expect(find.textContaining('Issue Verified: ${complaint.complaintNumber}'), findsOneWidget);
    expect(find.text('Mark all read'), findsOneWidget);

    // Tap Mark all read
    await tester.tap(find.text('Mark all read'));
    await tester.pumpAndSettle();

    // Mark all read button disappears because unread count is now 0
    expect(find.text('Mark all read'), findsNothing);
  });
}
