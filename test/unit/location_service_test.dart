import 'package:flutter_test/flutter_test.dart';
import 'package:citizen_portal/services/location_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('LocationService Unit Tests', () {
    test('LocationService returns non-null coordinates with fallback when sensors unavailable',
        () async {
      final service = LocationService();
      final location = await service.getCurrentLocation();

      expect(location, isNotNull);
      expect(location!.latitude, isNot(0.0));
      expect(location.longitude, isNot(0.0));
      expect(location.address, isNotEmpty);
    });
  });
}
