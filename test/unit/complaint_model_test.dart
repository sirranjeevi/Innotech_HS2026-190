import 'package:flutter_test/flutter_test.dart';
import 'package:citizen_portal/core/widgets/status_badge.dart';
import 'package:citizen_portal/models/complaint_model.dart';

void main() {
  group('ComplaintModel Unit Tests', () {
    test('ComplaintCategory parsing works across variations', () {
      expect(ComplaintCategory.fromString('garbage'), ComplaintCategory.garbage);
      expect(ComplaintCategory.fromString('Pothole'), ComplaintCategory.pothole);
      expect(ComplaintCategory.fromString('Streetlight'), ComplaintCategory.streetlight);
      expect(ComplaintCategory.fromString('Water Leakage'), ComplaintCategory.waterLeakage);
      expect(ComplaintCategory.fromString('water'), ComplaintCategory.waterLeakage);
      expect(ComplaintCategory.fromString('Drainage'), ComplaintCategory.drainage);
      expect(ComplaintCategory.fromString('Public Infrastructure'), ComplaintCategory.publicInfrastructure);
      expect(ComplaintCategory.fromString('unknown_category'), ComplaintCategory.other);
      expect(ComplaintCategory.fromString(null), ComplaintCategory.other);
    });

    test('ComplaintStatus parsing matches portal status list', () {
      expect(ComplaintStatusExtension.fromString('SUBMITTED'), ComplaintStatus.submitted);
      expect(ComplaintStatusExtension.fromString('VERIFIED'), ComplaintStatus.verified);
      expect(ComplaintStatusExtension.fromString('ASSIGNED'), ComplaintStatus.assigned);
      expect(ComplaintStatusExtension.fromString('ACCEPTED'), ComplaintStatus.accepted);
      expect(ComplaintStatusExtension.fromString('IN_PROGRESS'), ComplaintStatus.inProgress);
      expect(ComplaintStatusExtension.fromString('RESOLVED'), ComplaintStatus.resolved);
    });

    test('ComplaintModel serialization and deserialization preserves all fields', () {
      final now = DateTime(2026, 8, 23, 10, 30);
      final model = ComplaintModel(
        id: 'test-cmp-id',
        complaintNumber: 'CMP-1001',
        citizenId: 'citizen-123',
        citizenName: 'John Citizen',
        citizenPhone: '+919876543210',
        category: ComplaintCategory.pothole,
        description: 'Large deep pothole on Main Road near civic library.',
        imageUrl: '/path/to/image.jpg',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Connaught Place, New Delhi',
        status: ComplaintStatus.submitted,
        createdAt: now,
      );

      final json = model.toJson();
      expect(json['id'], 'test-cmp-id');
      expect(json['complaintNumber'], 'CMP-1001');
      expect(json['category'], 'Pothole');
      expect(json['status'], 'SUBMITTED');

      final fromJson = ComplaintModel.fromJson(json);
      expect(fromJson.id, model.id);
      expect(fromJson.complaintNumber, model.complaintNumber);
      expect(fromJson.category, ComplaintCategory.pothole);
      expect(fromJson.status, ComplaintStatus.submitted);
      expect(fromJson.latitude, 28.6139);
      expect(fromJson.longitude, 77.2090);
    });
  });
}
