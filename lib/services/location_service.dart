import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

class LocationResult {
  final double latitude;
  final double longitude;
  final String address;
  final String? placeName;
  final bool isMock;

  const LocationResult({
    required this.latitude,
    required this.longitude,
    required this.address,
    this.placeName,
    this.isMock = false,
  });
}

abstract class ILocationService {
  Future<LocationResult?> getCurrentLocation();
  Future<String> getAddressFromCoordinates(double latitude, double longitude);
}

class LocationService implements ILocationService {
  final LocationResult? mockLocation;

  LocationService({this.mockLocation});

  // Default fallback coordinates (e.g. City Centre)
  static const double defaultLat = 11.0168;
  static const double defaultLng = 76.9558;
  static const String defaultAddress = 'Civic Centre, Avinashi Road, Coimbatore, Tamil Nadu';

  @override
  Future<String> getAddressFromCoordinates(double latitude, double longitude) async {
    // 1. Try Free OpenStreetMap Nominatim Reverse Geocoding (Works on Web, Android, iOS, Windows)
    try {
      final uri = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=$latitude&lon=$longitude&zoom=18&addressdetails=1',
      );
      final response = await http.get(
        uri,
        headers: {
          'User-Agent': 'CitizenComplaintPortal/1.0 (com.innotech.citizen_portal)',
          'Accept': 'application/json',
        },
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map<String, dynamic>) {
          final addressObj = data['address'] as Map<String, dynamic>?;
          if (addressObj != null) {
            final road = addressObj['road'] ?? addressObj['street'] ?? addressObj['pedestrian'] ?? addressObj['suburb'];
            final area = addressObj['neighbourhood'] ?? addressObj['residential'] ?? addressObj['suburb'] ?? addressObj['village'];
            final city = addressObj['city'] ?? addressObj['town'] ?? addressObj['municipality'] ?? addressObj['county'] ?? addressObj['state_district'];
            final state = addressObj['state'];
            final postcode = addressObj['postcode'];

            final parts = [road, area, city, state, postcode]
                .where((e) => e != null && e.toString().trim().isNotEmpty)
                .toSet() // deduplicate if road == area
                .toList();

            if (parts.isNotEmpty) {
              return parts.join(', ');
            }
          }

          final displayName = data['display_name'] as String?;
          if (displayName != null && displayName.isNotEmpty) {
            // Trim down very long OSM display names to first 4 segments
            final segments = displayName.split(', ').take(4).join(', ');
            return segments;
          }
        }
      }
    } catch (e) {
      debugPrint('OSM Reverse Geocoding notice: $e');
    }

    // 2. Fallback to clean readable approximate address based on coordinates
    return _getReadableFallbackAddress(latitude, longitude);
  }

  String _getReadableFallbackAddress(double lat, double lng) {
    // If coordinates are around Coimbatore / Tamil Nadu region (e.g. 11.02, 77.02)
    if ((lat - 11.0).abs() < 1.0 && (lng - 77.0).abs() < 1.0) {
      return 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu';
    }
    // If coordinates are around Delhi NCR region (e.g. 28.6, 77.2)
    if ((lat - 28.6).abs() < 1.0 && (lng - 77.2).abs() < 1.0) {
      return 'Civic Centre, Minto Road, New Delhi';
    }
    // If coordinates are around Bangalore region (e.g. 12.97, 77.59)
    if ((lat - 12.97).abs() < 1.0 && (lng - 77.59).abs() < 1.0) {
      return 'MG Road, Central Ward, Bangalore, Karnataka';
    }
    return 'Ward Sector, Civic Municipal Area';
  }

  @override
  Future<LocationResult?> getCurrentLocation() async {
    if (mockLocation != null) {
      return mockLocation;
    }
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        final addr = await getAddressFromCoordinates(defaultLat, defaultLng);
        return LocationResult(
          latitude: defaultLat,
          longitude: defaultLng,
          address: addr,
          isMock: true,
        );
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          final addr = await getAddressFromCoordinates(defaultLat, defaultLng);
          return LocationResult(
            latitude: defaultLat,
            longitude: defaultLng,
            address: addr,
            isMock: true,
          );
        }
      }

      if (permission == LocationPermission.deniedForever) {
        final addr = await getAddressFromCoordinates(defaultLat, defaultLng);
        return LocationResult(
          latitude: defaultLat,
          longitude: defaultLng,
          address: addr,
          isMock: true,
        );
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 5),
        ),
      );

      final resolvedAddress = await getAddressFromCoordinates(
        position.latitude,
        position.longitude,
      );

      return LocationResult(
        latitude: position.latitude,
        longitude: position.longitude,
        address: resolvedAddress,
        isMock: false,
      );
    } catch (e) {
      debugPrint('Location service error, using fallback: $e');
      final addr = await getAddressFromCoordinates(defaultLat, defaultLng);
      return LocationResult(
        latitude: defaultLat,
        longitude: defaultLng,
        address: addr,
        isMock: true,
      );
    }
  }
}
