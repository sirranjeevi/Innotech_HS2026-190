import 'package:flutter/material.dart';
import '../core/widgets/status_badge.dart';

enum ComplaintCategory {
  garbage,
  pothole,
  streetlight,
  waterLeakage,
  drainage,
  publicInfrastructure,
  other;

  String get displayName {
    switch (this) {
      case ComplaintCategory.garbage:
        return 'Garbage';
      case ComplaintCategory.pothole:
        return 'Pothole';
      case ComplaintCategory.streetlight:
        return 'Streetlight';
      case ComplaintCategory.waterLeakage:
        return 'Water Leakage';
      case ComplaintCategory.drainage:
        return 'Drainage';
      case ComplaintCategory.publicInfrastructure:
        return 'Public Infrastructure';
      case ComplaintCategory.other:
        return 'Other';
    }
  }

  IconData get icon {
    switch (this) {
      case ComplaintCategory.garbage:
        return Icons.delete_outline_rounded;
      case ComplaintCategory.pothole:
        return Icons.remove_road_rounded;
      case ComplaintCategory.streetlight:
        return Icons.lightbulb_outline_rounded;
      case ComplaintCategory.waterLeakage:
        return Icons.water_drop_outlined;
      case ComplaintCategory.drainage:
        return Icons.waves_rounded;
      case ComplaintCategory.publicInfrastructure:
        return Icons.apartment_rounded;
      case ComplaintCategory.other:
        return Icons.category_outlined;
    }
  }

  Color get color {
    switch (this) {
      case ComplaintCategory.garbage:
        return const Color(0xFF059669); // Emerald
      case ComplaintCategory.pothole:
        return const Color(0xFFD97706); // Amber
      case ComplaintCategory.streetlight:
        return const Color(0xFFEAB308); // Yellow
      case ComplaintCategory.waterLeakage:
        return const Color(0xFF0284C7); // Sky Blue
      case ComplaintCategory.drainage:
        return const Color(0xFF0D9488); // Teal
      case ComplaintCategory.publicInfrastructure:
        return const Color(0xFF6366F1); // Indigo
      case ComplaintCategory.other:
        return const Color(0xFF64748B); // Slate
    }
  }

  static ComplaintCategory fromString(String? name) {
    if (name == null) return ComplaintCategory.other;
    final clean = name.toLowerCase().replaceAll(' ', '');
    switch (clean) {
      case 'garbage':
        return ComplaintCategory.garbage;
      case 'pothole':
        return ComplaintCategory.pothole;
      case 'streetlight':
        return ComplaintCategory.streetlight;
      case 'waterleakage':
      case 'water':
        return ComplaintCategory.waterLeakage;
      case 'drainage':
        return ComplaintCategory.drainage;
      case 'publicinfrastructure':
      case 'infrastructure':
        return ComplaintCategory.publicInfrastructure;
      default:
        return ComplaintCategory.other;
    }
  }
}

class ComplaintModel {
  final String id;
  final String complaintNumber; // e.g. CMP-1001
  final String citizenId;
  final String citizenName;
  final String citizenPhone;
  final ComplaintCategory category;
  final String description;
  final String? imageUrl;
  final double latitude;
  final double longitude;
  final String address;
  final ComplaintStatus status;
  final String? departmentId;
  final String? departmentName;
  final String? workerId;
  final String? workerName;
  final DateTime createdAt;
  final DateTime? verifiedAt;
  final DateTime? assignedAt;
  final DateTime? acceptedAt;
  final DateTime? startedAt;
  final DateTime? resolvedAt;
  final String? resolutionImageUrl;
  final String? resolutionNotes;

  const ComplaintModel({
    required this.id,
    required this.complaintNumber,
    required this.citizenId,
    required this.citizenName,
    required this.citizenPhone,
    required this.category,
    required this.description,
    this.imageUrl,
    required this.latitude,
    required this.longitude,
    required this.address,
    this.status = ComplaintStatus.submitted,
    this.departmentId,
    this.departmentName,
    this.workerId,
    this.workerName,
    required this.createdAt,
    this.verifiedAt,
    this.assignedAt,
    this.acceptedAt,
    this.startedAt,
    this.resolvedAt,
    this.resolutionImageUrl,
    this.resolutionNotes,
  });

  ComplaintModel copyWith({
    String? id,
    String? complaintNumber,
    String? citizenId,
    String? citizenName,
    String? citizenPhone,
    ComplaintCategory? category,
    String? description,
    String? imageUrl,
    double? latitude,
    double? longitude,
    String? address,
    ComplaintStatus? status,
    String? departmentId,
    String? departmentName,
    String? workerId,
    String? workerName,
    DateTime? createdAt,
    DateTime? verifiedAt,
    DateTime? assignedAt,
    DateTime? acceptedAt,
    DateTime? startedAt,
    DateTime? resolvedAt,
    String? resolutionImageUrl,
    String? resolutionNotes,
  }) {
    return ComplaintModel(
      id: id ?? this.id,
      complaintNumber: complaintNumber ?? this.complaintNumber,
      citizenId: citizenId ?? this.citizenId,
      citizenName: citizenName ?? this.citizenName,
      citizenPhone: citizenPhone ?? this.citizenPhone,
      category: category ?? this.category,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      status: status ?? this.status,
      departmentId: departmentId ?? this.departmentId,
      departmentName: departmentName ?? this.departmentName,
      workerId: workerId ?? this.workerId,
      workerName: workerName ?? this.workerName,
      createdAt: createdAt ?? this.createdAt,
      verifiedAt: verifiedAt ?? this.verifiedAt,
      assignedAt: assignedAt ?? this.assignedAt,
      acceptedAt: acceptedAt ?? this.acceptedAt,
      startedAt: startedAt ?? this.startedAt,
      resolvedAt: resolvedAt ?? this.resolvedAt,
      resolutionImageUrl: resolutionImageUrl ?? this.resolutionImageUrl,
      resolutionNotes: resolutionNotes ?? this.resolutionNotes,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'complaintNumber': complaintNumber,
      'citizenId': citizenId,
      'citizenName': citizenName,
      'citizenPhone': citizenPhone,
      'category': category.displayName,
      'description': description,
      'imageUrl': imageUrl,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'status': status.nameCode,
      'departmentId': departmentId,
      'departmentName': departmentName,
      'workerId': workerId,
      'workerName': workerName,
      'createdAt': createdAt.toIso8601String(),
      'verifiedAt': verifiedAt?.toIso8601String(),
      'assignedAt': assignedAt?.toIso8601String(),
      'acceptedAt': acceptedAt?.toIso8601String(),
      'startedAt': startedAt?.toIso8601String(),
      'resolvedAt': resolvedAt?.toIso8601String(),
      'resolutionImageUrl': resolutionImageUrl,
      'resolutionNotes': resolutionNotes,
    };
  }

  factory ComplaintModel.fromJson(Map<String, dynamic> json) {
    return ComplaintModel(
      id: json['id'] as String? ?? '',
      complaintNumber: json['complaintNumber'] as String? ?? '',
      citizenId: json['citizenId'] as String? ?? '',
      citizenName: json['citizenName'] as String? ?? 'Citizen',
      citizenPhone: json['citizenPhone'] as String? ?? '',
      category: ComplaintCategory.fromString(json['category'] as String?),
      description: json['description'] as String? ?? '',
      imageUrl: json['imageUrl'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      address: json['address'] as String? ?? 'Location Coordinates Tagged',
      status: ComplaintStatusExtension.fromString(json['status'] as String?),
      departmentId: json['departmentId'] as String?,
      departmentName: json['departmentName'] as String?,
      workerId: json['workerId'] as String?,
      workerName: json['workerName'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      verifiedAt: json['verifiedAt'] != null
          ? DateTime.tryParse(json['verifiedAt'] as String)
          : null,
      assignedAt: json['assignedAt'] != null
          ? DateTime.tryParse(json['assignedAt'] as String)
          : null,
      acceptedAt: json['acceptedAt'] != null
          ? DateTime.tryParse(json['acceptedAt'] as String)
          : null,
      startedAt: json['startedAt'] != null
          ? DateTime.tryParse(json['startedAt'] as String)
          : null,
      resolvedAt: json['resolvedAt'] != null
          ? DateTime.tryParse(json['resolvedAt'] as String)
          : null,
      resolutionImageUrl: json['resolutionImageUrl'] as String?,
      resolutionNotes: json['resolutionNotes'] as String?,
    );
  }
}
