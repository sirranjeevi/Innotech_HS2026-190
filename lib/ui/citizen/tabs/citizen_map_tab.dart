import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
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
  double _zoomScale = 1.0;
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
        // 1. Interactive Map Visual Area
        Positioned.fill(
          child: Container(
            color: const Color(0xFFF1F5F9), // Slate map background
            child: LayoutBuilder(
              builder: (context, constraints) {
                final width = constraints.maxWidth;
                final height = constraints.maxHeight;

                return Stack(
                  children: [
                    // Grid / Map Graphic Backdrop
                    CustomPaint(
                      size: Size(width, height),
                      painter: _MapCanvasPainter(),
                    ),

                    // Current User Center Pin
                    Positioned(
                      left: width / 2 - 16,
                      top: height / 2 - 16,
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(50),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Container(
                            width: 14,
                            height: 14,
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2.5),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withAlpha(100),
                                  blurRadius: 6,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Plot Complaint Pin Markers
                    ...filtered.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final complaint = entry.value;

                      // Map relative lat/lng offsets to viewport coordinates with zoom
                      final latDelta = (complaint.latitude - _centerLat) * 4000 * _zoomScale;
                      final lngDelta = (complaint.longitude - _centerLng) * 4000 * _zoomScale;

                      // Stagger pins if lat/lng are identical or very close
                      final offsetX = (width / 2) + lngDelta + (idx % 3 == 0 ? 30 : idx % 3 == 1 ? -40 : 15);
                      final offsetY = (height / 2) - latDelta + (idx % 2 == 0 ? -35 : 45);

                      final isSelected = _selectedComplaint?.id == complaint.id;
                      final pinColor = complaint.category.color;

                      return Positioned(
                        left: offsetX.clamp(20.0, width - 60.0),
                        top: offsetY.clamp(80.0, height - 200.0),
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedComplaint = complaint;
                            });
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: EdgeInsets.all(isSelected ? 4 : 2),
                            decoration: BoxDecoration(
                              color: isSelected ? Colors.black : Colors.transparent,
                              borderRadius: BorderRadius.circular(24),
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: pinColor,
                                    borderRadius: BorderRadius.circular(16),
                                    boxShadow: [
                                      BoxShadow(
                                        color: pinColor.withAlpha(120),
                                        blurRadius: 8,
                                        offset: const Offset(0, 3),
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        complaint.category.icon,
                                        color: Colors.white,
                                        size: 14,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        complaint.complaintNumber,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                CustomPaint(
                                  size: const Size(10, 6),
                                  painter: _PinTrianglePainter(color: pinColor),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }),
                  ],
                );
              },
            ),
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

        // 3. Map Control Buttons (Zoom In, Zoom Out, Recenter)
        Positioned(
          right: 16,
          top: 70,
          child: Column(
            children: [
              _buildMapControlButton(
                icon: Icons.add_rounded,
                tooltip: 'Zoom In',
                onPressed: () {
                  setState(() {
                    _zoomScale = (_zoomScale * 1.25).clamp(0.5, 3.0);
                  });
                },
              ),
              const SizedBox(height: 8),
              _buildMapControlButton(
                icon: Icons.remove_rounded,
                tooltip: 'Zoom Out',
                onPressed: () {
                  setState(() {
                    _zoomScale = (_zoomScale / 1.25).clamp(0.5, 3.0);
                  });
                },
              ),
              const SizedBox(height: 8),
              _buildMapControlButton(
                icon: _isLoadingLocation ? Icons.hourglass_top_rounded : Icons.my_location_rounded,
                tooltip: 'Center Location',
                onPressed: _initUserLocation,
              ),
            ],
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
                    color: Colors.black.withAlpha(25),
                    blurRadius: 16,
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

  Widget _buildMapControlButton({
    required IconData icon,
    required String tooltip,
    required VoidCallback onPressed,
  }) {
    return Container(
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
        icon: Icon(icon, size: 20, color: AppColors.textPrimary),
        tooltip: tooltip,
        onPressed: onPressed,
      ),
    );
  }
}

class _MapCanvasPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final gridPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 1.0;

    final roadPaint = Paint()
      ..color = const Color(0xFFCBD5E1)
      ..strokeWidth = 4.0;

    const step = 40.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    // Draw stylized arterial municipal roads
    canvas.drawLine(Offset(0, size.height * 0.35), Offset(size.width, size.height * 0.4), roadPaint);
    canvas.drawLine(Offset(0, size.height * 0.7), Offset(size.width, size.height * 0.65), roadPaint);
    canvas.drawLine(Offset(size.width * 0.45, 0), Offset(size.width * 0.5, size.height), roadPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _PinTrianglePainter extends CustomPainter {
  final Color color;

  const _PinTrianglePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, 0)
      ..lineTo(size.width / 2, size.height)
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
