import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

class LocationResult {
  final double latitude;
  final double longitude;
  final String address;
  final bool isMock;

  const LocationResult({
    required this.latitude,
    required this.longitude,
    required this.address,
    this.isMock = false,
  });
}

abstract class ILocationService {
  Future<LocationResult?> getCurrentLocation();
}

class LocationService implements ILocationService {
  final LocationResult? mockLocation;

  LocationService({this.mockLocation});

  // Default civic center fallback coordinates (e.g., Civic Center / City Hall)
  static const double defaultLat = 28.6139;
  static const double defaultLng = 77.2090;
  static const String defaultAddress = 'Civic Centre, Minto Road, New Delhi';

  @override
  Future<LocationResult?> getCurrentLocation() async {
    if (mockLocation != null) {
      return mockLocation;
    }
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        // Safe fallback if hardware GPS service is off
        return const LocationResult(
          latitude: defaultLat,
          longitude: defaultLng,
          address: defaultAddress,
          isMock: true,
        );
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return const LocationResult(
            latitude: defaultLat,
            longitude: defaultLng,
            address: '$defaultAddress (Default Location)',
            isMock: true,
          );
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return const LocationResult(
          latitude: defaultLat,
          longitude: defaultLng,
          address: '$defaultAddress (Permission Denied Default)',
          isMock: true,
        );
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 5),
        ),
      );

      String resolvedAddress = 'Lat: ${position.latitude.toStringAsFixed(4)}, Lng: ${position.longitude.toStringAsFixed(4)}';

      try {
        final placemarks = await placemarkFromCoordinates(
          position.latitude,
          position.longitude,
        );
        if (placemarks.isNotEmpty) {
          final place = placemarks.first;
          final parts = [
            place.street,
            place.subLocality,
            place.locality,
            place.postalCode,
          ].where((e) => e != null && e.isNotEmpty).toList();
          if (parts.isNotEmpty) {
            resolvedAddress = parts.join(', ');
          }
        }
      } catch (e) {
        debugPrint('Geocoding lookup error: $e');
      }

      return LocationResult(
        latitude: position.latitude,
        longitude: position.longitude,
        address: resolvedAddress,
        isMock: false,
      );
    } catch (e) {
      debugPrint('Location service error, using fallback: $e');
      return const LocationResult(
        latitude: defaultLat,
        longitude: defaultLng,
        address: defaultAddress,
        isMock: true,
      );
    }
  }
}
