enum UserRole {
  citizen,
  admin,
  worker;

  String get roleCode {
    switch (this) {
      case UserRole.citizen:
        return 'CITIZEN';
      case UserRole.admin:
        return 'ADMIN';
      case UserRole.worker:
        return 'WORKER';
    }
  }

  String get displayName {
    switch (this) {
      case UserRole.citizen:
        return 'Citizen';
      case UserRole.admin:
        return 'Administrator';
      case UserRole.worker:
        return 'Field Worker';
    }
  }

  static UserRole fromString(String? role) {
    if (role == null) return UserRole.citizen;
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return UserRole.admin;
      case 'WORKER':
        return UserRole.worker;
      case 'CITIZEN':
      default:
        return UserRole.citizen;
    }
  }
}

class UserModel {
  final String id;
  final String fullName;
  final String username;
  final String email;
  final String phone;
  final UserRole role;
  final String? departmentId;
  final String? departmentName;
  final DateTime createdAt;

  const UserModel({
    required this.id,
    required this.fullName,
    required this.username,
    required this.email,
    required this.phone,
    required this.role,
    this.departmentId,
    this.departmentName,
    required this.createdAt,
  });

  UserModel copyWith({
    String? id,
    String? fullName,
    String? username,
    String? email,
    String? phone,
    UserRole? role,
    String? departmentId,
    String? departmentName,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      username: username ?? this.username,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      departmentId: departmentId ?? this.departmentId,
      departmentName: departmentName ?? this.departmentName,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'username': username,
      'email': email,
      'phone': phone,
      'role': role.roleCode,
      'departmentId': departmentId,
      'departmentName': departmentName,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      username: json['username'] as String? ?? '',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      role: UserRole.fromString(json['role'] as String?),
      departmentId: json['departmentId'] as String?,
      departmentName: json['departmentName'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserModel &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          username == other.username &&
          email == other.email &&
          role == other.role;

  @override
  int get hashCode => id.hashCode ^ username.hashCode ^ role.hashCode;
}
