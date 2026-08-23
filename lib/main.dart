import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/constants/app_strings.dart';
import 'core/theme/app_theme.dart';
import 'firebase_options.dart';
import 'routes/app_router.dart';
import 'services/auth_service.dart';
import 'services/complaint_service.dart';
import 'services/image_service.dart';
import 'services/location_service.dart';
import 'services/notification_service.dart';
import 'services/storage_service.dart';
import 'state/admin_provider.dart';
import 'state/auth_provider.dart';
import 'state/citizen_provider.dart';
import 'state/notification_provider.dart';
import 'state/worker_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint('Firebase initialization note: $e');
  }

  final storageService = StorageService();
  await storageService.init();

  final authService = AuthService(storageService: storageService);
  final notificationService = NotificationService(storageService: storageService);
  final complaintService = ComplaintService(
    storageService: storageService,
    notificationService: notificationService,
  );
  final locationService = LocationService();
  final imageService = ImageService();

  runApp(
    CitizenPortalApp(
      storageService: storageService,
      authService: authService,
      complaintService: complaintService,
      notificationService: notificationService,
      locationService: locationService,
      imageService: imageService,
    ),
  );
}

class CitizenPortalApp extends StatelessWidget {
  final StorageService? storageService;
  final IAuthService authService;
  final IComplaintService? complaintService;
  final INotificationService? notificationService;
  final ILocationService? locationService;
  final IImageService? imageService;

  const CitizenPortalApp({
    super.key,
    this.storageService,
    required this.authService,
    this.complaintService,
    this.notificationService,
    this.locationService,
    this.imageService,
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(authService: authService),
        ),
        ChangeNotifierProvider(
          create: (_) => CitizenProvider(
            complaintService: complaintService,
            locationService: locationService,
            imageService: imageService,
            storageService: storageService,
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => AdminProvider(
            complaintService: complaintService,
            authService: authService,
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => WorkerProvider(
            complaintService: complaintService,
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => NotificationProvider(
            notificationService: notificationService,
          ),
        ),
      ],
      child: MaterialApp(
        title: AppStrings.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: AppRoutes.splash,
        onGenerateRoute: AppRoutes.onGenerateRoute,
      ),
    );
  }
}
