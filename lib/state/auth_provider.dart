import 'package:flutter/foundation.dart';
import '../core/utils/result.dart';
import '../models/user_model.dart';
import '../models/session_model.dart';
import '../services/auth_service.dart';

enum AuthStatus {
  uninitialized,
  authenticated,
  unauthenticated,
}

class AuthProvider extends ChangeNotifier {
  final IAuthService _authService;

  AuthProvider({IAuthService? authService})
      : _authService = authService ?? AuthService();

  AuthStatus _status = AuthStatus.uninitialized;
  UserModel? _currentUser;
  UserRole _selectedRole = UserRole.citizen;
  bool _isLoading = false;
  String? _errorMessage;

  AuthStatus get status => _status;
  UserModel? get currentUser => _currentUser;
  UserRole get selectedRole => _selectedRole;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _status == AuthStatus.authenticated && _currentUser != null;

  void setSelectedRole(UserRole role) {
    _selectedRole = role;
    _errorMessage = null;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> initialize() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final session = await _authService.restoreSession();
      if (session != null) {
        _currentUser = session.user;
        _selectedRole = session.user.role;
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } catch (e) {
      _status = AuthStatus.unauthenticated;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login({
    required String identifier,
    required String password,
    UserRole? role,
  }) async {
    final targetRole = role ?? _selectedRole;
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _authService.login(
        identifier: identifier,
        password: password,
        expectedRole: targetRole,
      );

      switch (result) {
        case Success<UserModel>(data: final user):
          _currentUser = user;
          _selectedRole = user.role;
          _status = AuthStatus.authenticated;
          _isLoading = false;
          notifyListeners();
          return true;
        case Failure<UserModel>(message: final msg):
          _errorMessage = msg;
          _isLoading = false;
          notifyListeners();
          return false;
      }
    } catch (e) {
      _errorMessage = 'An unexpected error occurred: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> registerCitizen({
    required String fullName,
    required String username,
    required String email,
    required String phone,
    required String password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _authService.registerCitizen(
        fullName: fullName,
        username: username,
        email: email,
        phone: phone,
        password: password,
      );

      switch (result) {
        case Success<UserModel>(data: final user):
          _currentUser = user;
          _selectedRole = UserRole.citizen;
          _status = AuthStatus.authenticated;
          _isLoading = false;
          notifyListeners();
          return true;
        case Failure<UserModel>(message: final msg):
          _errorMessage = msg;
          _isLoading = false;
          notifyListeners();
          return false;
      }
    } catch (e) {
      _errorMessage = 'Registration failed: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    await _authService.logout();
    _currentUser = null;
    _status = AuthStatus.unauthenticated;
    _errorMessage = null;
    _isLoading = false;
    notifyListeners();
  }
}
