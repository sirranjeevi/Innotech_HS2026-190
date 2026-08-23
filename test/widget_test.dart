import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:citizen_portal/main.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/storage_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('App root smoke test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    final storageService = StorageService(prefs);
    final authService = AuthService(storageService: storageService);

    await tester.pumpWidget(CitizenPortalApp(authService: authService));
    expect(find.byType(CitizenPortalApp), findsOneWidget);
    await tester.pumpAndSettle(const Duration(seconds: 2));
  });
}
