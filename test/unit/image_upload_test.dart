import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:citizen_portal/services/image_service.dart';
import 'package:citizen_portal/services/storage_service.dart';
import 'package:citizen_portal/state/citizen_provider.dart';

class MockImageService implements IImageService {
  final PickedImageResult? mockResult;
  final bool shouldThrow;

  MockImageService({this.mockResult, this.shouldThrow = false});

  @override
  Future<PickedImageResult?> pickImage(ImageSource source) async {
    if (shouldThrow) {
      throw Exception('Camera not available on web device');
    }
    return mockResult;
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    storageService = StorageService(prefs);
  });

  group('Web-Safe Image Upload & StorageService Tests', () {
    test('StorageService uploads bytes and returns web-safe data URI', () async {
      final sampleBytes = Uint8List.fromList([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      final url = await storageService.uploadImageBytes(
        bytes: sampleBytes,
        fileName: 'pothole.jpg',
      );

      expect(url, startsWith('data:image/jpeg;base64,'));
      final base64Part = url.split(',').last;
      expect(base64Decode(base64Part), equals(sampleBytes));
    });

    test('StorageService handles PNG mime type correctly', () async {
      final sampleBytes = Uint8List.fromList([0x89, 0x50, 0x4E, 0x47]);
      final url = await storageService.uploadImageBytes(
        bytes: sampleBytes,
        fileName: 'evidence.png',
      );

      expect(url, startsWith('data:image/png;base64,'));
    });

    test('CitizenProvider pickImage handles web memory bytes, replace and remove actions', () async {
      final sampleBytes = Uint8List.fromList([1, 2, 3, 4, 5]);
      final mockImage = PickedImageResult(
        path: 'blob:http://localhost/test-blob-id',
        bytes: sampleBytes,
        name: 'civic_photo.jpg',
      );

      final provider = CitizenProvider(
        imageService: MockImageService(mockResult: mockImage),
        storageService: storageService,
      );

      // Initial state
      expect(provider.pickedImage, isNull);
      expect(provider.pickedImageBytes, isNull);

      // Pick image
      final success = await provider.pickImage(ImageSource.gallery);
      expect(success, isTrue);
      expect(provider.pickedImage, isNotNull);
      expect(provider.pickedImageBytes, equals(sampleBytes));

      // Remove image
      provider.removePickedImage();
      expect(provider.pickedImage, isNull);
      expect(provider.pickedImageBytes, isNull);
    });

    test('CitizenProvider handles camera exception on web gracefully without crash', () async {
      final provider = CitizenProvider(
        imageService: MockImageService(shouldThrow: true),
        storageService: storageService,
      );

      final success = await provider.pickImage(ImageSource.camera);
      expect(success, isFalse);
      expect(provider.pickedImage, isNull);
      expect(provider.errorMessage, equals('Unable to select image. Please try again.'));
    });
  });
}
