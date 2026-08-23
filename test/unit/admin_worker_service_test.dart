import 'package:flutter_test/flutter_test.dart';
import 'package:citizen_portal/core/widgets/status_badge.dart';
import 'package:citizen_portal/models/complaint_model.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:citizen_portal/state/admin_provider.dart';
import 'package:citizen_portal/state/worker_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;
  late ComplaintService complaintService;
  late AdminProvider adminProvider;
  late WorkerProvider workerProvider;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    storageService = StorageService();
    await storageService.init();

    authService = AuthService(storageService: storageService);
    complaintService = ComplaintService(storageService: storageService);

    adminProvider = AdminProvider(
      complaintService: complaintService,
      authService: authService,
    );

    workerProvider = WorkerProvider(
      complaintService: complaintService,
    );
  });

  group('Phase 4: Admin Management Unit Tests', () {
    test('AdminProvider loads complaints, workers, and calculates metrics', () async {
      // 1. Seed two complaints
      await complaintService.submitComplaint(
        citizenId: 'cit-1',
        citizenName: 'Alice',
        citizenPhone: '9876543210',
        category: ComplaintCategory.pothole,
        description: 'Dangerous pothole on 5th avenue road',
        latitude: 28.6139,
        longitude: 77.2090,
        address: '5th Avenue',
      );

      await complaintService.submitComplaint(
        citizenId: 'cit-2',
        citizenName: 'Bob',
        citizenPhone: '9876543211',
        category: ComplaintCategory.garbage,
        description: 'Overflowing dumpster in market area',
        latitude: 28.6140,
        longitude: 77.2092,
        address: 'Market Area',
      );

      await adminProvider.loadAdminData();

      expect(adminProvider.allComplaints.length, 2);
      expect(adminProvider.workers.isNotEmpty, true);
      expect(adminProvider.totalCount, 2);
      expect(adminProvider.submittedCount, 2);
      expect(adminProvider.inProgressCount, 0);
      expect(adminProvider.resolvedCount, 0);
    });

    test('AdminProvider filters complaints by search query, status, and category', () async {
      await complaintService.submitComplaint(
        citizenId: 'cit-1',
        citizenName: 'Alice Johnson',
        citizenPhone: '9876543210',
        category: ComplaintCategory.pothole,
        description: 'Dangerous road pothole',
        latitude: 28.6139,
        longitude: 77.2090,
        address: '5th Avenue',
      );

      await complaintService.submitComplaint(
        citizenId: 'cit-2',
        citizenName: 'Bob Smith',
        citizenPhone: '9876543211',
        category: ComplaintCategory.garbage,
        description: 'Garbage dump overflowing',
        latitude: 28.6140,
        longitude: 77.2092,
        address: 'Sector 5',
      );

      await adminProvider.loadAdminData();

      // Test Search Query
      adminProvider.setSearchQuery('pothole');
      expect(adminProvider.filteredComplaints.length, 1);
      expect(adminProvider.filteredComplaints.first.category, ComplaintCategory.pothole);

      // Test Category Filter
      adminProvider.resetFilters();
      adminProvider.setFilterCategory(ComplaintCategory.garbage);
      expect(adminProvider.filteredComplaints.length, 1);
      expect(adminProvider.filteredComplaints.first.citizenName, 'Bob Smith');
    });

    test('AdminProvider verifies complaint (SUBMITTED -> VERIFIED)', () async {
      final subRes = await complaintService.submitComplaint(
        citizenId: 'cit-1',
        citizenName: 'Alice',
        citizenPhone: '9876543210',
        category: ComplaintCategory.streetlight,
        description: 'Streetlight pole dark at night intersection',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Main St',
      );

      final complaintId = subRes.dataOrNull!.id;
      await adminProvider.loadAdminData();

      final verifyRes = await adminProvider.verifyComplaint(complaintId);
      expect(verifyRes.isSuccess, true);
      expect(verifyRes.dataOrNull!.status, ComplaintStatus.verified);
      expect(verifyRes.dataOrNull!.verifiedAt, isNotNull);
      expect(adminProvider.verifiedCount, 1);
    });

    test('AdminProvider assigns worker (VERIFIED -> ASSIGNED with details)', () async {
      final subRes = await complaintService.submitComplaint(
        citizenId: 'cit-1',
        citizenName: 'Alice',
        citizenPhone: '9876543210',
        category: ComplaintCategory.waterLeakage,
        description: 'Main pipeline water leak on sidewalk',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Water Works Road',
      );

      final complaintId = subRes.dataOrNull!.id;
      await adminProvider.loadAdminData();

      final worker = adminProvider.workers.first;
      final assignRes = await adminProvider.assignWorker(
        complaintId: complaintId,
        worker: worker,
        departmentName: 'Water Supply',
      );

      expect(assignRes.isSuccess, true);
      final assigned = assignRes.dataOrNull!;
      expect(assigned.status, ComplaintStatus.assigned);
      expect(assigned.workerId, worker.id);
      expect(assigned.workerName, worker.fullName);
      expect(assigned.departmentName, 'Water Supply');
      expect(assigned.assignedAt, isNotNull);
    });
  });

  group('Phase 4: Field Worker Portal Unit Tests', () {
    test('WorkerProvider filters tasks assigned to worker and handles lifecycle (ASSIGNED -> ACCEPTED -> IN_PROGRESS)', () async {
      final worker = (await authService.getPrebuiltWorkers()).first;

      // Submit and assign complaint to this worker
      final subRes = await complaintService.submitComplaint(
        citizenId: 'cit-1',
        citizenName: 'Alice',
        citizenPhone: '9876543210',
        category: ComplaintCategory.garbage,
        description: 'Sanitation clean-up required urgently',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Sanitation Lane',
      );

      final complaintId = subRes.dataOrNull!.id;
      await complaintService.updateComplaintStatus(
        complaintId: complaintId,
        status: ComplaintStatus.assigned,
        workerId: worker.id,
        workerName: worker.fullName,
        workerPhone: worker.phone,
        departmentName: 'Sanitation',
      );

      await workerProvider.loadWorkerTasks(worker.id);
      expect(workerProvider.totalTasks, 1);
      expect(workerProvider.pendingAcceptanceCount, 1);

      // 1. Accept Task (ASSIGNED -> ACCEPTED)
      final acceptRes = await workerProvider.acceptTask(
        complaintId: complaintId,
        workerId: worker.id,
      );
      expect(acceptRes.isSuccess, true);
      expect(acceptRes.dataOrNull!.status, ComplaintStatus.accepted);
      expect(acceptRes.dataOrNull!.acceptedAt, isNotNull);

      // 2. Start Work (ACCEPTED -> IN_PROGRESS)
      final startRes = await workerProvider.startWork(
        complaintId: complaintId,
        workerId: worker.id,
      );
      expect(startRes.isSuccess, true);
      expect(startRes.dataOrNull!.status, ComplaintStatus.inProgress);
      expect(startRes.dataOrNull!.startedAt, isNotNull);
      expect(workerProvider.inProgressCount, 1);
    });
  });
}
