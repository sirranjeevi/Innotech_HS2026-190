import 'user_model.dart';

class SessionModel {
  final UserModel user;
  final String token;
  final DateTime loggedInAt;

  const SessionModel({
    required this.user,
    required this.token,
    required this.loggedInAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'token': token,
      'loggedInAt': loggedInAt.toIso8601String(),
    };
  }

  factory SessionModel.fromJson(Map<String, dynamic> json) {
    return SessionModel(
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String? ?? '',
      loggedInAt: json['loggedInAt'] != null
          ? DateTime.tryParse(json['loggedInAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
