import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../core/utils/result.dart';
import '../models/complaint_model.dart';
import '../services/complaint_service.dart';
import '../services/location_service.dart';
import '../services/image_service.dart';

class CitizenProvider extends ChangeNotifier {
  final IComplaintService _complaintService;
  final ILocationService _locationService;
  final IImageService _imageService;

  CitizenProvider({
    IComplaintService? complaintService,
    ILocationService? locationService,
    IImageService? imageService,
  })  : _complaintService = complaintService ?? ComplaintService(),
        _locationService = locationService ?? LocationService(),
        _imageService = imageService ?? ImageService();

  List<ComplaintModel> _complaints = [];
  ComplaintStats _stats = ComplaintStats.empty();
  bool _isLoading = false;
  String? _errorMessage;

  // Report Issue Draft State
  ComplaintCategory _selectedCategory = ComplaintCategory.garbage;
  String? _pickedImagePath;
  LocationResult? _currentLocation;
  bool _isFetchingLocation = false;
  bool _isSubmitting = false;

  List<ComplaintModel> get complaints => _complaints;
  ComplaintStats get stats => _stats;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  ComplaintCategory get selectedCategory => _selectedCategory;
  String? get pickedImagePath => _pickedImagePath;
  LocationResult? get currentLocation => _currentLocation;
  bool get isFetchingLocation => _isFetchingLocation;
  bool get isSubmitting => _isSubmitting;

  void setSelectedCategory(ComplaintCategory category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setPickedImagePath(String? path) {
    _pickedImagePath = path;
    notifyListeners();
  }

  void removePickedImage() {
    _pickedImagePath = null;
    notifyListeners();
  }

  Future<void> fetchLocation() async {
    _isFetchingLocation = true;
    notifyListeners();

    try {
      final loc = await _locationService.getCurrentLocation();
      _currentLocation = loc;
    } catch (e) {
      debugPrint('Fetch location error: $e');
    } finally {
      _isFetchingLocation = false;
      notifyListeners();
    }
  }

  Future<void> pickImage(ImageSource source) async {
    try {
      final result = await _imageService.pickImage(source);
      if (result != null) {
        _pickedImagePath = result.path;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Pick image error: $e');
    }
  }

  void resetDraft() {
    _selectedCategory = ComplaintCategory.garbage;
    _pickedImagePath = null;
    _currentLocation = null;
    _isFetchingLocation = false;
    _isSubmitting = false;
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> loadCitizenData(String citizenId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _complaints = await _complaintService.getCitizenComplaints(citizenId);
      _stats = await _complaintService.getCitizenStats(citizenId);
    } catch (e) {
      _errorMessage = 'Failed to load complaints: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Result<ComplaintModel>> submitComplaint({
    required String citizenId,
    required String citizenName,
    required String citizenPhone,
    required String description,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Ensure we have location (or fetch fallback if not yet tagged)
      if (_currentLocation == null) {
        await fetchLocation();
      }

      final lat = _currentLocation?.latitude ?? LocationService.defaultLat;
      final lng = _currentLocation?.longitude ?? LocationService.defaultLng;
      final addr = _currentLocation?.address ?? LocationService.defaultAddress;

      final result = await _complaintService.submitComplaint(
        citizenId: citizenId,
        citizenName: citizenName,
        citizenPhone: citizenPhone,
        category: _selectedCategory,
        description: description,
        imageUrl: _pickedImagePath,
        latitude: lat,
        longitude: lng,
        address: addr,
      );

      if (result.isSuccess) {
        // Refresh citizen list and stats
        _complaints = await _complaintService.getCitizenComplaints(citizenId);
        _stats = await _complaintService.getCitizenStats(citizenId);
        resetDraft();
      } else {
        _errorMessage = result.errorOrNull;
      }

      _isSubmitting = false;
      notifyListeners();
      return result;
    } catch (e) {
      _isSubmitting = false;
      _errorMessage = 'Submission failed: $e';
      notifyListeners();
      return Failure('Submission failed: $e');
    }
  }
}
