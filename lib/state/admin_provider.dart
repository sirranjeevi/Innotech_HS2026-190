import 'package:flutter/foundation.dart';
import '../core/utils/result.dart';
import '../core/widgets/status_badge.dart';
import '../models/complaint_model.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../services/complaint_service.dart';

class AdminProvider extends ChangeNotifier {
  final IComplaintService _complaintService;
  final IAuthService _authService;

  AdminProvider({
    IComplaintService? complaintService,
    IAuthService? authService,
  })  : _complaintService = complaintService ?? ComplaintService(),
        _authService = authService ?? AuthService();

  List<ComplaintModel> _allComplaints = [];
  List<UserModel> _workers = [];
  bool _isLoading = false;
  String? _errorMessage;

  // Filters
  String _searchQuery = '';
  ComplaintStatus? _filterStatus;
  ComplaintCategory? _filterCategory;
  String? _filterDepartment;

  // Getters
  List<ComplaintModel> get allComplaints => _allComplaints;
  List<UserModel> get workers => _workers;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get searchQuery => _searchQuery;
  ComplaintStatus? get filterStatus => _filterStatus;
  ComplaintCategory? get filterCategory => _filterCategory;
  String? get filterDepartment => _filterDepartment;

  // Metrics
  int get totalCount => _allComplaints.length;
  int get submittedCount => _allComplaints.where((c) => c.status == ComplaintStatus.submitted).length;
  int get verifiedCount => _allComplaints.where((c) => c.status == ComplaintStatus.verified).length;
  int get inProgressCount => _allComplaints.where((c) =>
      c.status == ComplaintStatus.assigned ||
      c.status == ComplaintStatus.accepted ||
      c.status == ComplaintStatus.inProgress).length;
  int get resolvedCount => _allComplaints.where((c) => c.status == ComplaintStatus.resolved).length;

  List<ComplaintModel> get filteredComplaints {
    return _allComplaints.where((c) {
      // Search query filter (matches complaintNumber, description, address, citizenName)
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchNum = c.complaintNumber.toLowerCase().contains(q);
        final matchDesc = c.description.toLowerCase().contains(q);
        final matchAddr = c.address.toLowerCase().contains(q);
        final matchCitizen = c.citizenName.toLowerCase().contains(q);
        if (!matchNum && !matchDesc && !matchAddr && !matchCitizen) {
          return false;
        }
      }

      // Status filter
      if (_filterStatus != null && c.status != _filterStatus) {
        return false;
      }

      // Category filter
      if (_filterCategory != null && c.category != _filterCategory) {
        return false;
      }

      // Department filter
      if (_filterDepartment != null && _filterDepartment!.isNotEmpty) {
        if (c.departmentName != _filterDepartment) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  // Load all complaints and workers
  Future<void> loadAdminData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _allComplaints = await _complaintService.getAllComplaints();
      _workers = await _authService.getPrebuiltWorkers();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Failed to load administrative data: $e';
      notifyListeners();
    }
  }

  void setSearchQuery(String query) {
    _searchQuery = query.trim();
    notifyListeners();
  }

  void setFilterStatus(ComplaintStatus? status) {
    _filterStatus = status;
    notifyListeners();
  }

  void setFilterCategory(ComplaintCategory? category) {
    _filterCategory = category;
    notifyListeners();
  }

  void setFilterDepartment(String? department) {
    _filterDepartment = department;
    notifyListeners();
  }

  void resetFilters() {
    _searchQuery = '';
    _filterStatus = null;
    _filterCategory = null;
    _filterDepartment = null;
    notifyListeners();
  }

  // Verification Action
  Future<Result<ComplaintModel>> verifyComplaint(String complaintId) async {
    _isLoading = true;
    notifyListeners();

    final result = await _complaintService.updateComplaintStatus(
      complaintId: complaintId,
      status: ComplaintStatus.verified,
    );

    if (result.isSuccess) {
      _allComplaints = await _complaintService.getAllComplaints();
    } else {
      _errorMessage = result.errorOrNull;
    }

    _isLoading = false;
    notifyListeners();
    return result;
  }

  // Assignment Action
  Future<Result<ComplaintModel>> assignWorker({
    required String complaintId,
    required UserModel worker,
    required String departmentName,
  }) async {
    _isLoading = true;
    notifyListeners();

    final result = await _complaintService.updateComplaintStatus(
      complaintId: complaintId,
      status: ComplaintStatus.assigned,
      workerId: worker.id,
      workerName: worker.fullName,
      workerPhone: worker.phone,
      departmentId: worker.departmentId ?? 'dept-general',
      departmentName: departmentName,
    );

    if (result.isSuccess) {
      _allComplaints = await _complaintService.getAllComplaints();
    } else {
      _errorMessage = result.errorOrNull;
    }

    _isLoading = false;
    notifyListeners();
    return result;
  }

  // Helper: Get active task count for a worker
  int getWorkerActiveTaskCount(String workerId) {
    return _allComplaints.where((c) =>
        c.workerId == workerId &&
        (c.status == ComplaintStatus.assigned ||
            c.status == ComplaintStatus.accepted ||
            c.status == ComplaintStatus.inProgress)).length;
  }
}
