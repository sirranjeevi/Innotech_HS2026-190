import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/civic_map_view.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../models/complaint_model.dart';
import '../../../services/location_service.dart';
import '../../../state/citizen_provider.dart';
import '../complaint_detail_screen.dart';

class CitizenMapTab extends StatefulWidget {
  const CitizenMapTab({super.key});

  @override
  State<CitizenMapTab> createState() => _CitizenMapTabState();
}

class _CitizenMapTabState extends State<CitizenMapTab> {
  ComplaintCategory? _selectedCategory;
  ComplaintModel? _selectedComplaint;
  final LocationService _locationService = LocationService();
  double _centerLat = 12.9716;
  double _centerLng = 77.5946;
  final double _zoom = 13.5;
  bool _isLoadingLocation = false;

  @override
  void initState() {
    super.initState();
    _initUserLocation();
  }

  Future<void> _initUserLocation() async {
    setState(() => _isLoadingLocation = true);
    final pos = await _locationService.getCurrentLocation();
    if (pos != null && mounted) {
      setState(() {
        _centerLat = pos.latitude;
        _centerLng = pos.longitude;
        _isLoadingLocation = false;
      });
    } else {
      if (mounted) setState(() => _isLoadingLocation = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final citizenProvider = context.watch<CitizenProvider>();
    final allComplaints = citizenProvider.complaints;

    final filtered = _selectedCategory == null
        ? allComplaints
        : allComplaints.where((c) => c.category == _selectedCategory).toList();

    return Stack(
      children: [
        // 1. Real Interactive OpenStreetMap View
        Positioned.fill(
          child: CivicMapView(
            initialLat: _centerLat,
            initialLng: _centerLng,
            initialZoom: _zoom,
            complaints: filtered,
            selectedComplaint: _selectedComplaint,
            showUserLocation: true,
            userLat: _centerLat,
            userLng: _centerLng,
            onComplaintSelected: (c) {
              setState(() {
                _selectedComplaint = c;
              });
            },
          ),
        ),

        // 2. Top Category Filter Chips Bar
        Positioned(
          top: 12,
          left: 0,
          right: 0,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                FilterChip(
                  label: Text('All Issues (${allComplaints.length})'),
                  selected: _selectedCategory == null,
                  onSelected: (selected) {
                    setState(() => _selectedCategory = null);
                  },
                  backgroundColor: Colors.white,
                  selectedColor: AppColors.primary.withAlpha(30),
                  labelStyle: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _selectedCategory == null ? AppColors.primary : AppColors.textSecondary,
                  ),
                  elevation: 2,
                  shadowColor: Colors.black12,
                ),
                const SizedBox(width: 8),
                ...ComplaintCategory.values.map((cat) {
                  final isSel = _selectedCategory == cat;
                  final count = allComplaints.where((c) => c.category == cat).length;
                  if (count == 0 && !isSel) return const SizedBox.shrink();

                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text('${cat.displayName} ($count)'),
                      selected: isSel,
                      onSelected: (selected) {
                        setState(() => _selectedCategory = selected ? cat : null);
                      },
                      backgroundColor: Colors.white,
                      selectedColor: cat.color.withAlpha(30),
                      labelStyle: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isSel ? cat.color : AppColors.textSecondary,
                      ),
                      elevation: 2,
                      shadowColor: Colors.black12,
                    ),
                  );
                }),
              ],
            ),
          ),
        ),

        // 3. Map Control Buttons (Center GPS Location)
        Positioned(
          right: 16,
          top: 70,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(20),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: IconButton(
              icon: Icon(
                _isLoadingLocation ? Icons.hourglass_top_rounded : Icons.my_location_rounded,
                size: 20,
                color: AppColors.primary,
              ),
              tooltip: 'Center My Location',
              onPressed: _initUserLocation,
            ),
          ),
        ),

        // 4. Bottom Selected Complaint Preview Card
        if (_selectedComplaint != null)
          Positioned(
            left: 16,
            right: 16,
            bottom: 16,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(30),
                    blurRadius: 18,
                    offset: const Offset(0, 4),
                  ),
                ],
                border: Border.all(color: AppColors.border, width: 1.2),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _selectedComplaint!.category.color.withAlpha(25),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _selectedComplaint!.complaintNumber,
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                            color: _selectedComplaint!.category.color,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      StatusBadge(status: _selectedComplaint!.status),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.textMuted),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => setState(() => _selectedComplaint = null),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _selectedComplaint!.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          _selectedComplaint!.address,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.thumb_up_alt_rounded, size: 14, color: AppColors.primary),
                          const SizedBox(width: 4),
                          Text(
                            '${_selectedComplaint!.upvotesCount} supporters',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
                          ),
                        ],
                      ),
                      const Spacer(),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => ComplaintDetailScreen(complaint: _selectedComplaint!),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          minimumSize: const Size(0, 36),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('View Ticket Details', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
