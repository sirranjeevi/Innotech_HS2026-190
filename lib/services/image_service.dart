import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

class PickedImageResult {
  final String? path;
  final Uint8List? bytes;
  final String name;

  const PickedImageResult({
    this.path,
    this.bytes,
    required this.name,
  });
}

abstract class IImageService {
  Future<PickedImageResult?> pickImage(ImageSource source);
}

class ImageService implements IImageService {
  final ImagePicker _picker = ImagePicker();

  @override
  Future<PickedImageResult?> pickImage(ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (file == null) return null;

      final bytes = await file.readAsBytes();
      return PickedImageResult(
        path: file.path,
        bytes: bytes,
        name: file.name,
      );
    } catch (e) {
      debugPrint('Image picker error: $e');
      return null;
    }
  }
}
