import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:citizen_portal/core/utils/result.dart';
import 'package:citizen_portal/models/user_model.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/storage_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    storageService = StorageService(prefs);
    authService = AuthService(storageService: storageService);
  });

  group('AuthService Unit Tests', () {
    test('Admin login succeeds with valid pre-built credentials', () async {
      final result = await authService.login(
        identifier: 'admin',
        password: 'Admin@123',
        expectedRole: UserRole.admin,
      );

      expect(result.isSuccess, isTrue);
      final user = (result as Success<UserModel>).data;
      expect(user.role, UserRole.admin);
      expect(user.username, 'admin');

      // Verify session was persisted
      final session = await authService.restoreSession();
      expect(session, isNotNull);
      expect(session!.user.id, user.id);
    });

    test('Admin login fails with invalid password or identifier', () async {
      final result = await authService.login(
        identifier: 'admin',
        password: 'WrongPassword',
        expectedRole: UserRole.admin,
      );

      expect(result.isFailure, isTrue);
      expect((result as Failure<UserModel>).message, contains('Invalid admin credentials'));
    });

    test('Worker login succeeds with pre-built credentials', () async {
      final result = await authService.login(
        identifier: 'worker_sanitation',
        password: 'Worker@123',
        expectedRole: UserRole.worker,
      );

      expect(result.isSuccess, isTrue);
      final user = (result as Success<UserModel>).data;
      expect(user.role, UserRole.worker);
      expect(user.departmentName, 'Sanitation');
    });

    test('Citizen registration succeeds and persists new user', () async {
      final regResult = await authService.registerCitizen(
        fullName: 'Jane Doe',
        username: 'janedoe',
        email: 'jane@example.com',
        phone: '+919876543222',
        password: 'Password@123',
      );

      expect(regResult.isSuccess, isTrue);
      final citizen = (regResult as Success<UserModel>).data;
      expect(citizen.username, 'janedoe');
      expect(citizen.role, UserRole.citizen);

      // Verify automatic session creation
      final session = await authService.restoreSession();
      expect(session?.user.username, 'janedoe');

      // Logout and log back in
      await authService.logout();
      expect(await authService.restoreSession(), isNull);

      final loginResult = await authService.login(
        identifier: 'janedoe',
        password: 'Password@123',
        expectedRole: UserRole.citizen,
      );
      expect(loginResult.isSuccess, isTrue);
    });

    test('Citizen registration prevents duplicate username', () async {
      await authService.registerCitizen(
        fullName: 'Original User',
        username: 'unique_user',
        email: 'original@example.com',
        phone: '+919876543222',
        password: 'Password@123',
      );

      final dupResult = await authService.registerCitizen(
        fullName: 'Duplicate User',
        username: 'unique_user',
        email: 'different@example.com',
        phone: '+919876543223',
        password: 'Password@123',
      );

      expect(dupResult.isFailure, isTrue);
      expect((dupResult as Failure<UserModel>).message, contains('already taken'));
    });

    test('Citizen registration prevents duplicate email', () async {
      await authService.registerCitizen(
        fullName: 'Original User',
        username: 'user_one',
        email: 'same@example.com',
        phone: '+919876543222',
        password: 'Password@123',
      );

      final dupResult = await authService.registerCitizen(
        fullName: 'Duplicate User',
        username: 'user_two',
        email: 'same@example.com',
        phone: '+919876543223',
        password: 'Password@123',
      );

      expect(dupResult.isFailure, isTrue);
      expect((dupResult as Failure<UserModel>).message, contains('email already exists'));
    });

    test('Unauthorized role access prevents logging in with mismatched role', () async {
      final result = await authService.login(
        identifier: 'admin',
        password: 'Admin@123',
        expectedRole: UserRole.citizen,
      );

      expect(result.isFailure, isTrue);
    });
  });
}
