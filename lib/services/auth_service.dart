import 'package:uuid/uuid.dart';
import '../core/utils/result.dart';
import '../models/user_model.dart';
import '../models/session_model.dart';
import 'firestore_service.dart';
import 'storage_service.dart';

abstract class IAuthService {
  Future<Result<UserModel>> login({
    required String identifier,
    required String password,
    required UserRole expectedRole,
  });

  Future<Result<UserModel>> registerCitizen({
    required String fullName,
    required String username,
    required String email,
    required String phone,
    required String password,
  });

  Future<SessionModel?> restoreSession();

  Future<void> logout();

  Future<List<UserModel>> getPrebuiltWorkers();
}

class AuthService implements IAuthService {
  final StorageService _storageService;
  final FirestoreService _firestoreService;
  final _uuid = const Uuid();

  // In-memory cache of registered citizens (persisted to storage)
  final Map<String, _UserCredential> _registeredUsers = {};
  bool _isInitialized = false;

  // Pre-configured Admin Accounts
  static final List<_PrebuiltAccount> _adminAccounts = [
    _PrebuiltAccount(
      user: UserModel(
        id: 'admin-001',
        fullName: 'Municipal Administrator',
        username: 'admin',
        email: 'admin@portal.gov',
        phone: '+919876543200',
        role: UserRole.admin,
        createdAt: DateTime(2026, 1, 1),
      ),
      password: 'Admin@123',
    ),
  ];

  // Pre-configured Field Worker Accounts
  static final List<_PrebuiltAccount> _workerAccounts = [
    _PrebuiltAccount(
      user: UserModel(
        id: 'worker-001',
        fullName: 'Ramesh Kumar (Sanitation)',
        username: 'worker_sanitation',
        email: 'ramesh.sanitation@portal.gov',
        phone: '+919876543201',
        role: UserRole.worker,
        departmentId: 'dept-sanitation',
        departmentName: 'Sanitation',
        createdAt: DateTime(2026, 1, 1),
      ),
      password: 'Worker@123',
    ),
    _PrebuiltAccount(
      user: UserModel(
        id: 'worker-002',
        fullName: 'Suresh Patel (Road Maintenance)',
        username: 'worker_roads',
        email: 'suresh.roads@portal.gov',
        phone: '+919876543202',
        role: UserRole.worker,
        departmentId: 'dept-roads',
        departmentName: 'Road Maintenance',
        createdAt: DateTime(2026, 1, 1),
      ),
      password: 'Worker@123',
    ),
    _PrebuiltAccount(
      user: UserModel(
        id: 'worker-003',
        fullName: 'Amit Verma (Electrical)',
        username: 'worker_electrical',
        email: 'amit.electrical@portal.gov',
        phone: '+919876543203',
        role: UserRole.worker,
        departmentId: 'dept-electrical',
        departmentName: 'Electrical',
        createdAt: DateTime(2026, 1, 1),
      ),
      password: 'Worker@123',
    ),
    _PrebuiltAccount(
      user: UserModel(
        id: 'worker-004',
        fullName: 'Vikram Singh (Water Supply)',
        username: 'worker_water',
        email: 'vikram.water@portal.gov',
        phone: '+919876543204',
        role: UserRole.worker,
        departmentId: 'dept-water',
        departmentName: 'Water Supply',
        createdAt: DateTime(2026, 1, 1),
      ),
      password: 'Worker@123',
    ),
    _PrebuiltAccount(
      user: UserModel(
        id: 'worker-005',
        fullName: 'Field Worker Demo',
        username: 'worker',
        email: 'worker@portal.gov',
        phone: '+919876543205',
        role: UserRole.worker,
        departmentId: 'dept-sanitation',
        departmentName: 'Sanitation',
        createdAt: DateTime(2026, 1, 1),
      ),
      password: 'Worker@123',
    ),
  ];

  AuthService({
    StorageService? storageService,
    FirestoreService? firestoreService,
  })  : _storageService = storageService ?? StorageService(),
        _firestoreService = firestoreService ?? FirestoreService();

  Future<void> _loadPersistedUsers() async {
    if (_isInitialized) return;

    final rawUsers = await _storageService.getRegisteredUsers();
    for (final raw in rawUsers) {
      try {
        final user = UserModel.fromJson(raw['user'] as Map<String, dynamic>);
        final password = raw['password'] as String;
        _registeredUsers[user.username.toLowerCase()] =
            _UserCredential(user: user, password: password);
      } catch (_) {}
    }

    _isInitialized = true;
  }

  Future<void> _savePersistedUsers() async {
    final list = _registeredUsers.values
        .map((c) => {
              'user': c.user.toJson(),
              'password': c.password,
            })
        .toList();
    await _storageService.saveRegisteredUsers(list);
  }

  @override
  Future<Result<UserModel>> login({
    required String identifier,
    required String password,
    required UserRole expectedRole,
  }) async {
    await _loadPersistedUsers();
    final cleanId = identifier.trim().toLowerCase();

    if (cleanId.isEmpty || password.isEmpty) {
      return const Failure('Username/email and password cannot be empty.');
    }

    // 1. Check Admin Accounts
    if (expectedRole == UserRole.admin) {
      for (final acc in _adminAccounts) {
        if ((acc.user.username.toLowerCase() == cleanId ||
                acc.user.email.toLowerCase() == cleanId) &&
            acc.password == password) {
          final session = SessionModel(
            user: acc.user,
            token: 'token-admin-${acc.user.id}',
            loggedInAt: DateTime.now(),
          );
          await _storageService.saveSession(session);
          return Success(acc.user);
        }
      }
      return const Failure('Invalid admin credentials. Use admin / Admin@123');
    }

    // 2. Check Worker Accounts
    if (expectedRole == UserRole.worker) {
      for (final acc in _workerAccounts) {
        if ((acc.user.username.toLowerCase() == cleanId ||
                acc.user.email.toLowerCase() == cleanId) &&
            acc.password == password) {
          final session = SessionModel(
            user: acc.user,
            token: 'token-worker-${acc.user.id}',
            loggedInAt: DateTime.now(),
          );
          await _storageService.saveSession(session);
          return Success(acc.user);
        }
      }
      return const Failure(
          'Invalid worker credentials. Use worker_sanitation / Worker@123');
    }

    // 3. Check Citizen Accounts
    if (expectedRole == UserRole.citizen) {
      // First check registered citizens
      for (final cred in _registeredUsers.values) {
        if ((cred.user.username.toLowerCase() == cleanId ||
                cred.user.email.toLowerCase() == cleanId) &&
            cred.password == password) {
          final session = SessionModel(
            user: cred.user,
            token: 'token-citizen-${cred.user.id}',
            loggedInAt: DateTime.now(),
          );
          await _storageService.saveSession(session);
          return Success(cred.user);
        }
      }

      // Also allow a default citizen demo account if fresh install
      if (cleanId == 'citizen' && password == 'Citizen@123') {
        final demoCitizen = UserModel(
          id: 'citizen-demo-001',
          fullName: 'Demo Citizen',
          username: 'citizen',
          email: 'citizen@example.com',
          phone: '+919876543210',
          role: UserRole.citizen,
          createdAt: DateTime(2026, 1, 1),
        );
        final session = SessionModel(
          user: demoCitizen,
          token: 'token-citizen-demo-001',
          loggedInAt: DateTime.now(),
        );
        await _storageService.saveSession(session);
        return Success(demoCitizen);
      }

      return const Failure(
          'Invalid citizen credentials. Please check your details or create an account.');
    }

    return const Failure('Unauthorized role request.');
  }

  @override
  Future<Result<UserModel>> registerCitizen({
    required String fullName,
    required String username,
    required String email,
    required String phone,
    required String password,
  }) async {
    await _loadPersistedUsers();

    final cleanUsername = username.trim();
    final cleanEmail = email.trim();
    final cleanFullName = fullName.trim();
    final cleanPhone = phone.trim();

    // Check duplicate username
    final usernameLower = cleanUsername.toLowerCase();
    if (_registeredUsers.containsKey(usernameLower) ||
        _adminAccounts.any((a) => a.user.username.toLowerCase() == usernameLower) ||
        _workerAccounts.any((w) => w.user.username.toLowerCase() == usernameLower) ||
        usernameLower == 'citizen') {
      return const Failure('This username is already taken. Please choose another.');
    }

    // Check duplicate email
    final emailLower = cleanEmail.toLowerCase();
    if (_registeredUsers.values.any((c) => c.user.email.toLowerCase() == emailLower) ||
        _adminAccounts.any((a) => a.user.email.toLowerCase() == emailLower) ||
        _workerAccounts.any((w) => w.user.email.toLowerCase() == emailLower)) {
      return const Failure('An account with this email already exists.');
    }

    final newCitizen = UserModel(
      id: _uuid.v4(),
      fullName: cleanFullName,
      username: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      role: UserRole.citizen,
      createdAt: DateTime.now(),
    );

    _registeredUsers[usernameLower] = _UserCredential(
      user: newCitizen,
      password: password,
    );

    await _savePersistedUsers();
    await _firestoreService.saveUser(newCitizen, password);

    // Auto login new citizen
    final session = SessionModel(
      user: newCitizen,
      token: 'token-citizen-${newCitizen.id}',
      loggedInAt: DateTime.now(),
    );
    await _storageService.saveSession(session);

    return Success(newCitizen);
  }

  @override
  Future<SessionModel?> restoreSession() async {
    return await _storageService.getSession();
  }

  @override
  Future<void> logout() async {
    await _storageService.clearSession();
  }

  @override
  Future<List<UserModel>> getPrebuiltWorkers() async {
    return _workerAccounts.map((a) => a.user).toList();
  }
}

class _PrebuiltAccount {
  final UserModel user;
  final String password;
  const _PrebuiltAccount({required this.user, required this.password});
}

class _UserCredential {
  final UserModel user;
  final String password;
  const _UserCredential({required this.user, required this.password});
}
