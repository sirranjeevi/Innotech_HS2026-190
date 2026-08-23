import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' hide Path;
import '../constants/app_colors.dart';
import '../../models/complaint_model.dart';

class CivicMapView extends StatefulWidget {
  final double initialLat;
  final double initialLng;
  final double initialZoom;
  final List<ComplaintModel> complaints;
  final ComplaintModel? selectedComplaint;
  final ValueChanged<ComplaintModel>? onComplaintSelected;
  final ValueChanged<LatLng>? onMapTap;
  final bool isInteractive;
  final bool showUserLocation;
  final double? userLat;
  final double? userLng;

  const CivicMapView({
    super.key,
    required this.initialLat,
    required this.initialLng,
    this.initialZoom = 14.0,
    this.complaints = const [],
    this.selectedComplaint,
    this.onComplaintSelected,
    this.onMapTap,
    this.isInteractive = true,
    this.showUserLocation = false,
    this.userLat,
    this.userLng,
  });

  @override
  State<CivicMapView> createState() => _CivicMapViewState();
}

class _CivicMapViewState extends State<CivicMapView> {
  late final MapController _mapController;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
  }

  @override
  void didUpdateWidget(covariant CivicMapView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialLat != widget.initialLat ||
        oldWidget.initialLng != widget.initialLng) {
      _mapController.move(
        LatLng(widget.initialLat, widget.initialLng),
        widget.initialZoom,
      );
    }
  }

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final markers = <Marker>[];

    // 1. User current location marker
    if (widget.showUserLocation && widget.userLat != null && widget.userLng != null) {
      markers.add(
        Marker(
          point: LatLng(widget.userLat!, widget.userLng!),
          width: 44,
          height: 44,
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(50),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2.5),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withAlpha(120),
                      blurRadius: 6,
                      spreadRadius: 2,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    // 2. Complaint markers
    for (final complaint in widget.complaints) {
      final isSelected = widget.selectedComplaint?.id == complaint.id;
      final pinColor = complaint.category.color;

      markers.add(
        Marker(
          point: LatLng(complaint.latitude, complaint.longitude),
          width: isSelected ? 140 : 120,
          height: isSelected ? 56 : 46,
          child: GestureDetector(
            onTap: () => widget.onComplaintSelected?.call(complaint),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: pinColor,
                    borderRadius: BorderRadius.circular(16),
                    border: isSelected ? Border.all(color: Colors.white, width: 2) : null,
                    boxShadow: [
                      BoxShadow(
                        color: pinColor.withAlpha(140),
                        blurRadius: isSelected ? 10 : 6,
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
                        size: isSelected ? 14 : 12,
                      ),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          complaint.complaintNumber,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: isSelected ? 11 : 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                CustomPaint(
                  size: const Size(10, 6),
                  painter: _PinArrowPainter(color: pinColor),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final isTest = WidgetsBinding.instance.runtimeType.toString().contains('Test');

    return ClipRRect(
      child: FlutterMap(
        mapController: _mapController,
        options: MapOptions(
          initialCenter: LatLng(widget.initialLat, widget.initialLng),
          initialZoom: widget.initialZoom,
          interactionOptions: InteractionOptions(
            flags: widget.isInteractive
                ? InteractiveFlag.all
                : InteractiveFlag.none,
          ),
          onTap: (tapPosition, point) {
            widget.onMapTap?.call(point);
          },
        ),
        children: [
          // OpenStreetMap standard tile layer (Free, Fast, Global, No API Key needed)
          if (!isTest)
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.innotech.citizen_portal',
              maxZoom: 19,
              tileBuilder: (context, tileWidget, tile) {
                return tileWidget;
              },
              errorTileCallback: (tile, error, stackTrace) {
                debugPrint('Map tile error: $error');
              },
            ),
          MarkerLayer(markers: markers),
        ],
      ),
    );
  }
}

class _PinArrowPainter extends CustomPainter {
  final Color color;

  const _PinArrowPainter({required this.color});

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
