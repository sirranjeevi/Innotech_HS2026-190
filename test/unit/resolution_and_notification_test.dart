import 'package:flutter_test/flutter_test.dart';
import 'package:citizen_portal/core/widgets/status_badge.dart';
import 'package:citizen_portal/models/complaint_model.dart';
import 'package:citizen_portal/models/notification_model.dart';
import 'package:citizen_portal/services/complaint_service.dart';
import 'package:citizen_portal/services/notification_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:citizen_portal/state/worker_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late NotificationService notificationService;
  late ComplaintService complaintService;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    storageService = StorageService(prefs);
    await storageService.init();

    notificationService = NotificationService(
      storageService: storageService,
    );
    complaintService = ComplaintService(
      storageService: storageService,
      notificationService: notificationService,
    );
  });

  group('NotificationService Unit Tests', () {
    test('Can send and retrieve notifications for a recipient', () async {
      await notificationService.sendNotification(
        recipientId: 'citizen-101',
        title: 'Ticket Verified',
        message: 'Your report CMP-1001 has been verified.',
        complaintId: 'c1',
        complaintNumber: 'CMP-1001',
        type: NotificationType.statusUpdate,
      );

      final notifs = await notificationService.getUserNotifications('citizen-101');
      expect(notifs.length, 1);
      expect(notifs.first.title, 'Ticket Verified');
      expect(notifs.first.isRead, false);

      final unreadCount = await notificationService.getUnreadCount('citizen-101');
      expect(unreadCount, 1);
    });

    test('markAsRead and markAllAsRead update read status and unread count', () async {
      await notificationService.sendNotification(
        recipientId: 'citizen-101',
        title: 'Notif 1',
        message: 'Message 1',
      );
      await notificationService.sendNotification(
        recipientId: 'citizen-101',
        title: 'Notif 2',
        message: 'Message 2',
      );

      var unread = await notificationService.getUnreadCount('citizen-101');
      expect(unread, 2);

      final notifs = await notificationService.getUserNotifications('citizen-101');
      await notificationService.markAsRead(notifs.first.id);

      unread = await notificationService.getUnreadCount('citizen-101');
      expect(unread, 1);

      await notificationService.markAllAsRead('citizen-101');
      unread = await notificationService.getUnreadCount('citizen-101');
      expect(unread, 0);
    });
  });

  group('Complaint Lifecycle Notification Triggers', () {
    test('submitComplaint emits notification to citizen', () async {
      final res = await complaintService.submitComplaint(
        citizenId: 'citizen-101',
        citizenName: 'John Doe',
        citizenPhone: '9876543210',
        category: ComplaintCategory.pothole,
        description: 'Large crater in road near metro station.',
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'MG Road, Bengaluru',
      );

      expect(res.isSuccess, true);
      final complaint = res.dataOrNull!;

      final notifs = await notificationService.getUserNotifications('citizen-101');
      expect(notifs.length, 1);
      expect(notifs.first.title.contains(complaint.complaintNumber), true);
    });

    test('updateComplaintStatus emits assignment and resolution notifications', () async {
      final res = await complaintService.submitComplaint(
        citizenId: 'citizen-101',
        citizenName: 'John Doe',
        citizenPhone: '9876543210',
        category: ComplaintCategory.garbage,
        description: 'Garbage accumulation near market entrance.',
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Russell Market, Bengaluru',
      );
      final complaint = res.dataOrNull!;

      // 1. Verify
      await complaintService.updateComplaintStatus(
        complaintId: complaint.id,
        status: ComplaintStatus.verified,
      );

      // 2. Assign
      await complaintService.updateComplaintStatus(
        complaintId: complaint.id,
        status: ComplaintStatus.assigned,
        workerId: 'worker-roads',
        workerName: 'Suresh Patel',
        workerPhone: '+91 98765 11111',
        departmentId: 'dept-roads',
        departmentName: 'Road Maintenance',
      );

      // Worker should have received a notification
      final workerNotifs = await notificationService.getUserNotifications('worker-roads');
      expect(workerNotifs.length, 1);
      expect(workerNotifs.first.type, NotificationType.assignment);

      // 3. Resolve
      await complaintService.updateComplaintStatus(
        complaintId: complaint.id,
        status: ComplaintStatus.resolved,
        resolutionNotes: 'Garbage cleared and area disinfected thoroughly.',
        resolutionImageUrl: 'data:image/png;base64,mock',
      );

      final citizenNotifs = await notificationService.getUserNotifications('citizen-101');
      // Citizen received: 1. Submitted, 2. Verified, 3. Assigned, 4. Resolved
      expect(citizenNotifs.length, 4);
      expect(citizenNotifs.any((n) => n.type == NotificationType.resolution), true);
    });
  });

  group('Worker Resolution Workflow Unit Tests', () {
    test('WorkerProvider.resolveTask updates status, notes, image, and refreshes task list', () async {
      final res = await complaintService.submitComplaint(
        citizenId: 'citizen-101',
        citizenName: 'John Doe',
        citizenPhone: '9876543210',
        category: ComplaintCategory.drainage,
        description: 'Open overflowing sewage drain on 5th cross.',
        latitude: 12.9716,
        longitude: 77.5946,
        address: '5th Cross, Indiranagar',
      );
      final complaint = res.dataOrNull!;

      // Assign to worker
      await complaintService.updateComplaintStatus(
        complaintId: complaint.id,
        status: ComplaintStatus.assigned,
        workerId: 'worker-sanitation',
        workerName: 'Ramesh Kumar',
      );

      final workerProvider = WorkerProvider(complaintService: complaintService);
      await workerProvider.loadWorkerTasks('worker-sanitation');

      // Start work
      await workerProvider.startWork(complaintId: complaint.id, workerId: 'worker-sanitation');

      // Resolve task
      final resolveRes = await workerProvider.resolveTask(
        complaintId: complaint.id,
        workerId: 'worker-sanitation',
        notes: 'Unblocked sewage line and replaced damaged concrete slab cover.',
        resolutionImageUrl: 'data:image/jpeg;base64,after_photo_mock',
      );

      expect(resolveRes.isSuccess, true);
      final resolvedComplaint = resolveRes.dataOrNull!;
      expect(resolvedComplaint.status, ComplaintStatus.resolved);
      expect(resolvedComplaint.resolvedAt, isNotNull);
      expect(resolvedComplaint.resolutionNotes, 'Unblocked sewage line and replaced damaged concrete slab cover.');
      expect(resolvedComplaint.resolutionImageUrl, 'data:image/jpeg;base64,after_photo_mock');
      expect(workerProvider.resolvedCount, 1);
    });
  });
}
