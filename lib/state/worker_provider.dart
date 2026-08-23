import 'package:flutter/foundation.dart';
import '../core/utils/result.dart';
import '../core/widgets/status_badge.dart';
import '../models/complaint_model.dart';
import '../services/complaint_service.dart';

class WorkerProvider extends ChangeNotifier {
  final IComplaintService _complaintService;

  WorkerProvider({IComplaintService? complaintService})
      : _complaintService = complaintService ?? ComplaintService();

  List<ComplaintModel> _tasks = [];
  bool _isLoading = false;
  String? _errorMessage;
  ComplaintStatus? _filterStatus;

  List<ComplaintModel> get tasks => _tasks;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  ComplaintStatus? get filterStatus => _filterStatus;

  // Worker metrics
  int get totalTasks => _tasks.length;
  int get pendingAcceptanceCount => _tasks.where((t) => t.status == ComplaintStatus.assigned).length;
  int get inProgressCount => _tasks.where((t) =>
      t.status == ComplaintStatus.accepted || t.status == ComplaintStatus.inProgress).length;
  int get resolvedCount => _tasks.where((t) => t.status == ComplaintStatus.resolved).length;

  List<ComplaintModel> get filteredTasks {
    if (_filterStatus == null) return _tasks;
    return _tasks.where((t) => t.status == _filterStatus).toList();
  }

  void setFilterStatus(ComplaintStatus? status) {
    _filterStatus = status;
    notifyListeners();
  }

  Future<void> loadWorkerTasks(String workerId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final all = await _complaintService.getAllComplaints();
      _tasks = all.where((c) => c.workerId == workerId).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Failed to load field worker tasks: $e';
      notifyListeners();
    }
  }

  Future<Result<ComplaintModel>> acceptTask({
    required String complaintId,
    required String workerId,
  }) async {
    _isLoading = true;
    notifyListeners();

    final result = await _complaintService.updateComplaintStatus(
      complaintId: complaintId,
      status: ComplaintStatus.accepted,
    );

    if (result.isSuccess) {
      await loadWorkerTasks(workerId);
    } else {
      _errorMessage = result.errorOrNull;
      _isLoading = false;
      notifyListeners();
    }

    return result;
  }

  Future<Result<ComplaintModel>> startWork({
    required String complaintId,
    required String workerId,
  }) async {
    _isLoading = true;
    notifyListeners();

    final result = await _complaintService.updateComplaintStatus(
      complaintId: complaintId,
      status: ComplaintStatus.inProgress,
    );

    if (result.isSuccess) {
      await loadWorkerTasks(workerId);
    } else {
      _errorMessage = result.errorOrNull;
      _isLoading = false;
      notifyListeners();
    }

    return result;
  }

  Future<Result<ComplaintModel>> resolveTask({
    required String complaintId,
    required String workerId,
    required String notes,
    String? resolutionImageUrl,
  }) async {
    _isLoading = true;
    notifyListeners();

    final result = await _complaintService.updateComplaintStatus(
      complaintId: complaintId,
      status: ComplaintStatus.resolved,
      resolutionNotes: notes,
      resolutionImageUrl: resolutionImageUrl,
    );

    if (result.isSuccess) {
      await loadWorkerTasks(workerId);
    } else {
      _errorMessage = result.errorOrNull;
      _isLoading = false;
      notifyListeners();
    }

    return result;
  }
}
