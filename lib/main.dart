import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/constants/app_strings.dart';
import 'core/theme/app_theme.dart';
import 'routes/app_router.dart';
import 'services/auth_service.dart';
import 'services/complaint_service.dart';
import 'services/image_service.dart';
import 'services/location_service.dart';
import 'services/storage_service.dart';
import 'state/auth_provider.dart';
import 'state/citizen_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storageService = StorageService();
  await storageService.init();

  final authService = AuthService(storageService: storageService);
  final complaintService = ComplaintService(storageService: storageService);
  final locationService = LocationService();
  final imageService = ImageService();

  runApp(
    CitizenPortalApp(
      storageService: storageService,
      authService: authService,
      complaintService: complaintService,
      locationService: locationService,
      imageService: imageService,
    ),
  );
}

class CitizenPortalApp extends StatelessWidget {
  final StorageService? storageService;
  final IAuthService authService;
  final IComplaintService? complaintService;
  final ILocationService? locationService;
  final IImageService? imageService;

  const CitizenPortalApp({
    super.key,
    this.storageService,
    required this.authService,
    this.complaintService,
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
