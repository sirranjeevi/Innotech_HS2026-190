import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:citizen_portal/core/theme/app_theme.dart';
import 'package:citizen_portal/models/complaint_model.dart';
import 'package:citizen_portal/models/user_model.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:citizen_portal/state/auth_provider.dart';
import 'package:citizen_portal/state/citizen_provider.dart';
import 'package:citizen_portal/ui/citizen/tabs/citizen_map_tab.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;
  late ComplaintService complaintService;
  late AuthProvider authProvider;
  late UserModel citizenUser;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    storageService = StorageService(prefs);
    await storageService.init();

    authService = AuthService(storageService: storageService);
    complaintService = ComplaintService(storageService: storageService);

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

  Widget createMapApp() {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
        ChangeNotifierProvider(
          create: (_) {
            final citizen = CitizenProvider(
              complaintService: complaintService,
              storageService: storageService,
            );
            citizen.loadCitizenData(citizenUser.id);
            return citizen;
          },
        ),
      ],
      child: MaterialApp(
        theme: AppTheme.lightTheme,
        home: const Scaffold(body: CitizenMapTab()),
      ),
    );
  }

  testWidgets('CitizenMapTab renders map, filter chips, and interactive pins', (WidgetTester tester) async {
    final complaintRes = await complaintService.submitComplaint(
      citizenId: citizenUser.id,
      citizenName: citizenUser.fullName,
      citizenPhone: citizenUser.phone,
      category: ComplaintCategory.pothole,
      description: 'Major road crater on highway.',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Highway Circle',
    );
    final complaint = complaintRes.dataOrNull!;

    await tester.pumpWidget(createMapApp());
    await tester.pumpAndSettle();

    // Verify filter chips
    expect(find.textContaining('All Issues'), findsOneWidget);

    // Verify pin marker rendered with complaint number
    expect(find.text(complaint.complaintNumber), findsOneWidget);

    // Tap on the pin marker to select complaint
    await tester.tap(find.text(complaint.complaintNumber));
    await tester.pumpAndSettle();

    // Verify preview bottom card appeared
    expect(find.text('View Ticket Details'), findsOneWidget);
    expect(find.text('Major road crater on highway.'), findsOneWidget);
    expect(find.text('Highway Circle'), findsOneWidget);
  });
}
