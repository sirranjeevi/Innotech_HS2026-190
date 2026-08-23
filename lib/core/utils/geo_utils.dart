import 'dart:math' as math;

class GeoUtils {
  static const double earthRadiusMeters = 6371000; // Mean Earth radius in meters

  /// Calculates distance in meters between two lat/lng coordinates using the Haversine formula
  static double calculateDistanceMeters({
    required double lat1,
    required double lng1,
    required double lat2,
    required double lng2,
  }) {
    final dLat = _degToRad(lat2 - lat1);
    final dLng = _degToRad(lng2 - lng1);

    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_degToRad(lat1)) *
            math.cos(_degToRad(lat2)) *
            math.sin(dLng / 2) *
            math.sin(dLng / 2);

    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return earthRadiusMeters * c;
  }

  static double _degToRad(double degree) {
    return degree * (math.pi / 180.0);
  }

  /// Formats distance in a readable way (e.g. "45m away" or "1.2km away")
  static String formatDistance(double meters) {
    if (meters < 1000) {
      return '${meters.round()}m away';
    } else {
      return '${(meters / 1000).toStringAsFixed(1)}km away';
    }
  }
}
