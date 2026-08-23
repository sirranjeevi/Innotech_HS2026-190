import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:citizen_portal/core/utils/result.dart';
import 'package:citizen_portal/models/complaint_model.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/services/storage_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late ComplaintService complaintService;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    storageService = StorageService(prefs);
    complaintService = ComplaintService(storageService: storageService);
  });

  group('ComplaintService Unit Tests', () {
    test('Sequential complaint numbers are formatted correctly (CMP-1001, CMP-1002)',
        () async {
      final res1 = await complaintService.submitComplaint(
        citizenId: 'citizen-1',
        citizenName: 'Citizen One',
        citizenPhone: '+919876543210',
        category: ComplaintCategory.garbage,
        description: 'Garbage dump near community park entrance.',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Sector 5 Park',
      );

      expect(res1.isSuccess, isTrue);
      final c1 = (res1 as Success<ComplaintModel>).data;
      expect(c1.complaintNumber, 'CMP-1001');

      final res2 = await complaintService.submitComplaint(
        citizenId: 'citizen-1',
        citizenName: 'Citizen One',
        citizenPhone: '+919876543210',
        category: ComplaintCategory.streetlight,
        description: 'Streetlight pole broken and not lighting up.',
        latitude: 28.6140,
        longitude: 77.2091,
        address: 'Street 4, Sector 5',
      );

      expect(res2.isSuccess, isTrue);
      final c2 = (res2 as Success<ComplaintModel>).data;
      expect(c2.complaintNumber, 'CMP-1002');
    });

    test('Description validation fails if less than 10 characters', () async {
      final result = await complaintService.submitComplaint(
        citizenId: 'citizen-1',
        citizenName: 'Citizen One',
        citizenPhone: '+919876543210',
        category: ComplaintCategory.pothole,
        description: 'Short',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Main Rd',
      );

      expect(result.isFailure, isTrue);
      expect((result as Failure<ComplaintModel>).message, contains('at least 10 characters'));
    });

    test('getCitizenComplaints returns only complaints belonging to citizen',
        () async {
      await complaintService.submitComplaint(
        citizenId: 'citizen-A',
        citizenName: 'User A',
        citizenPhone: '+919876543210',
        category: ComplaintCategory.garbage,
        description: 'Garbage collection issue in Sector 1.',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Sector 1',
      );

      await complaintService.submitComplaint(
        citizenId: 'citizen-B',
        citizenName: 'User B',
        citizenPhone: '+919876543211',
        category: ComplaintCategory.pothole,
        description: 'Pothole on Cross Road 2.',
        latitude: 28.6145,
        longitude: 77.2095,
        address: 'Cross Rd 2',
      );

      final listA = await complaintService.getCitizenComplaints('citizen-A');
      expect(listA.length, 1);
      expect(listA.first.citizenId, 'citizen-A');

      final listB = await complaintService.getCitizenComplaints('citizen-B');
      expect(listB.length, 1);
      expect(listB.first.citizenId, 'citizen-B');
    });

    test('getCitizenStats computes total, submitted, inProgress, and resolved metrics correctly',
        () async {
      await complaintService.submitComplaint(
        citizenId: 'citizen-stats',
        citizenName: 'Stats User',
        citizenPhone: '+919876543210',
        category: ComplaintCategory.waterLeakage,
        description: 'Pipeline leakage on 5th avenue.',
        latitude: 28.6139,
        longitude: 77.2090,
        address: '5th Avenue',
      );

      final stats = await complaintService.getCitizenStats('citizen-stats');
      expect(stats.total, 1);
      expect(stats.submitted, 1);
      expect(stats.inProgress, 0);
      expect(stats.resolved, 0);
    });
  });
}
