import 'package:flutter_test/flutter_test.dart';
import 'package:citizen_portal/core/widgets/status_badge.dart';
import 'package:citizen_portal/models/complaint_model.dart';
import 'package:citizen_portal/models/user_model.dart';
import 'package:citizen_portal/services/auth_service.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/services/notification_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late AuthService authService;
  late NotificationService notificationService;
  late ComplaintService complaintService;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    storageService = StorageService(prefs);
    await storageService.init();

    authService = AuthService(storageService: storageService);
    notificationService = NotificationService(storageService: storageService);
    complaintService = ComplaintService(
      storageService: storageService,
      notificationService: notificationService,
    );
  });

  group('Full Citizen Complaint Portal End-to-End Lifecycle', () {
    test('Executes all 6 lifecycle stages across Citizen, Duplicate Prevention, Admin, and Worker roles', () async {
      // 1. Citizen Registration & Login
      final regRes = await authService.registerCitizen(
        fullName: 'Ananya Sharma',
        username: 'ananya_s',
        email: 'ananya@example.com',
        phone: '+91 98765 11111',
        password: 'Password@123',
      );
      expect(regRes.isSuccess, isTrue);
      final citizen = regRes.dataOrNull!;

      // 2. Citizen Submits Complaint
      final subRes = await complaintService.submitComplaint(
        citizenId: citizen.id,
        citizenName: citizen.fullName,
        citizenPhone: citizen.phone,
        category: ComplaintCategory.pothole,
        description: 'Large hazardous pothole on Main Street near Bridge.',
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Main Street Bridge, Bangalore',
        imageUrl: 'data:image/jpeg;base64,mockBeforePhoto',
      );
      expect(subRes.isSuccess, isTrue);
      final complaint = subRes.dataOrNull!;
      expect(complaint.status, ComplaintStatus.submitted);
      expect(complaint.complaintNumber, 'CMP-1001');

      // Verify Citizen received submission notification
      final citizenNotifs1 = await notificationService.getUserNotifications(citizen.id);
      expect(citizenNotifs1.length, 1);
      expect(citizenNotifs1.first.title, contains('Complaint Registered'));

      // 3. Duplicate Detection & Prevention Flow
      final secondCitizenRes = await authService.registerCitizen(
        fullName: 'Rahul Verma',
        username: 'rahul_v',
        email: 'rahul@example.com',
        phone: '+91 98765 22222',
        password: 'Password@123',
      );
      final secondCitizen = secondCitizenRes.dataOrNull!;

      // Second citizen reports at identical coordinates
      final duplicates = await complaintService.detectDuplicates(
        latitude: 12.9716,
        longitude: 77.5946,
        category: ComplaintCategory.pothole,
      );
      expect(duplicates.isNotEmpty, isTrue);
      expect(duplicates.first.complaint.id, complaint.id);

      // Second citizen upvotes instead of creating duplicate
      final upvoteRes = await complaintService.upvoteComplaint(
        complaintId: complaint.id,
        citizenId: secondCitizen.id,
      );
      expect(upvoteRes.isSuccess, isTrue);
      final upvotedComplaint = (await complaintService.getComplaintById(complaint.id))!;
      expect(upvotedComplaint.upvotesCount, 1);
      expect(upvotedComplaint.isUpvotedBy(secondCitizen.id), isTrue);

      // 4. Admin Verification & Worker Assignment
      final adminLoginRes = await authService.login(
        identifier: 'admin',
        password: 'Admin@123',
        expectedRole: UserRole.admin,
      );
      expect(adminLoginRes.isSuccess, isTrue);

      // Admin verifies complaint
      final verifyRes = await complaintService.updateComplaintStatus(
        complaintId: complaint.id,
        status: ComplaintStatus.verified,
      );
      expect(verifyRes.isSuccess, isTrue);

      // Admin assigns field worker (Suresh Patel - Road Maintenance)
      final assignRes = await complaintService.updateComplaintStatus(
        complaintId: complaint.id,
        status: ComplaintStatus.assigned,
        workerId: 'worker-002',
        workerName: 'Suresh Patel',
        workerPhone: '+919876543202',
        departmentId: 'dept-roads',
        departmentName: 'Road Maintenance',
      );
      expect(assignRes.isSuccess, isTrue);

      // Verify Worker received task assignment notification
      final workerNotifs = await notificationService.getUserNotifications('worker-002');
      expect(workerNotifs.isNotEmpty, isTrue);
      expect(workerNotifs.first.title, contains('New Task Assigned'));

      // 5. Worker Task Execution & Resolution
      final workerLoginRes = await authService.login(
        identifier: 'worker_roads',
        password: 'Worker@123',
        expectedRole: UserRole.worker,
      );
      expect(workerLoginRes.isSuccess, isTrue);

      // Worker accepts task
      await complaintService.updateComplaintStatus(
        complaintId: complaint.id,
        status: ComplaintStatus.accepted,
        workerId: 'worker-002',
        workerName: 'Suresh Patel',
      );
      final acceptedComplaint = (await complaintService.getComplaintById(complaint.id))!;
      expect(acceptedComplaint.status, ComplaintStatus.accepted);

      // Worker marks in-progress / on-site
      await complaintService.updateComplaintStatus(
        complaintId: complaint.id,
        status: ComplaintStatus.inProgress,
        workerId: 'worker-002',
        workerName: 'Suresh Patel',
      );
      final inProgressComplaint = (await complaintService.getComplaintById(complaint.id))!;
      expect(inProgressComplaint.status, ComplaintStatus.inProgress);

      // Worker resolves task with notes & after photo evidence
      final resolveRes = await complaintService.updateComplaintStatus(
        complaintId: complaint.id,
        status: ComplaintStatus.resolved,
        workerId: 'worker-002',
        workerName: 'Suresh Patel',
        workerPhone: '+919876543202',
        departmentName: 'Road Maintenance',
        resolutionNotes: 'Filled 2x1m crater with hot asphalt mix, compacted, and traffic restored.',
        resolutionImageUrl: 'data:image/jpeg;base64,mockAfterPhoto',
      );
      expect(resolveRes.isSuccess, isTrue);

      // 6. Final State Verification
      final finalComplaint = (await complaintService.getComplaintById(complaint.id))!;
      expect(finalComplaint.status, ComplaintStatus.resolved);
      expect(finalComplaint.resolvedAt, isNotNull);
      expect(finalComplaint.resolutionNotes, contains('Filled 2x1m crater'));
      expect(finalComplaint.resolutionImageUrl, isNotNull);
      expect(finalComplaint.upvotesCount, 1);

      // Verify all 6 timeline events exist and are properly ordered
      final events = finalComplaint.getTimelineEvents();
      expect(events.length, 6);
      for (int i = 0; i < 5; i++) {
        expect(events[i].isCompleted, isTrue);
      }
      expect(events.last.isCurrent, isTrue);

      // Verify Citizen received resolution notification
      final citizenNotifsFinal = await notificationService.getUserNotifications(citizen.id);
      expect(citizenNotifsFinal.any((n) => n.title.contains('Issue Resolved')), isTrue);
    });
  });
}
