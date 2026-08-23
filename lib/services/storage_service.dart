import 'dart:convert';
import 'dart:typed_data';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';
import '../models/session_model.dart';

class StorageService {
  SharedPreferences? _prefs;

  StorageService([this._prefs]);

  Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  Future<bool> saveSession(SessionModel session) async {
    await init();
    final jsonString = jsonEncode(session.toJson());
    return await _prefs!.setString(AppConstants.keyUserSession, jsonString);
  }

  Future<SessionModel?> getSession() async {
    await init();
    final jsonString = _prefs!.getString(AppConstants.keyUserSession);
    if (jsonString == null || jsonString.isEmpty) {
      return null;
    }
    try {
      final jsonMap = jsonDecode(jsonString) as Map<String, dynamic>;
      return SessionModel.fromJson(jsonMap);
    } catch (_) {
      await clearSession();
      return null;
    }
  }

  Future<bool> clearSession() async {
    await init();
    return await _prefs!.remove(AppConstants.keyUserSession);
  }

  Future<bool> saveRegisteredUsers(List<Map<String, dynamic>> users) async {
    await init();
    final jsonString = jsonEncode(users);
    return await _prefs!.setString(AppConstants.keyUsersDatabase, jsonString);
  }

  Future<List<Map<String, dynamic>>> getRegisteredUsers() async {
    await init();
    final jsonString = _prefs!.getString(AppConstants.keyUsersDatabase);
    if (jsonString == null || jsonString.isEmpty) {
      return [];
    }
    try {
      final decoded = jsonDecode(jsonString) as List<dynamic>;
      return decoded.cast<Map<String, dynamic>>();
    } catch (_) {
      return [];
    }
  }

  Future<bool> saveComplaints(List<Map<String, dynamic>> complaints) async {
    await init();
    final jsonString = jsonEncode(complaints);
    return await _prefs!.setString(AppConstants.keyComplaintsDatabase, jsonString);
  }

  Future<List<Map<String, dynamic>>> getComplaints() async {
    await init();
    final jsonString = _prefs!.getString(AppConstants.keyComplaintsDatabase);
    if (jsonString == null || jsonString.isEmpty) {
      return [];
    }
    try {
      final decoded = jsonDecode(jsonString) as List<dynamic>;
      return decoded.cast<Map<String, dynamic>>();
    } catch (_) {
      return [];
    }
  }

  Future<String> uploadImageBytes({
    required Uint8List bytes,
    required String fileName,
    String folder = 'complaints',
  }) async {
    try {
      // In web and local fallback, store as data URI for instant cross-platform loading
      final base64Str = base64Encode(bytes);
      final extension = fileName.contains('.') ? fileName.split('.').last.toLowerCase() : 'jpg';
      final mimeType = extension == 'png' ? 'image/png' : 'image/jpeg';
      return 'data:$mimeType;base64,$base64Str';
    } catch (e) {
      throw Exception('Image upload failed: $e');
    }
  }
}
