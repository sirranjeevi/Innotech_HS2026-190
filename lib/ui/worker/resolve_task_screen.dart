import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/custom_button.dart';
import '../../core/widgets/custom_text_field.dart';
import '../../models/complaint_model.dart';
import '../../services/image_service.dart';
import '../../services/storage_service.dart';
import '../../state/auth_provider.dart';
import '../../state/worker_provider.dart';

class ResolveTaskScreen extends StatefulWidget {
  final ComplaintModel complaint;

  const ResolveTaskScreen({
    super.key,
    required this.complaint,
  });

  @override
  State<ResolveTaskScreen> createState() => _ResolveTaskScreenState();
}

class _ResolveTaskScreenState extends State<ResolveTaskScreen> {
  final _formKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  final _imageService = ImageService();
  final _storageService = StorageService();

  Uint8List? _imageBytes;
  String? _imageName;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    final result = await _imageService.pickImage(source);
    if (result != null) {
      setState(() {
        _imageBytes = result.bytes;
        _imageName = result.name;
      });
    }
  }

  void _showImageSourceDialog() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Upload Resolution Proof',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.camera_alt_rounded, color: AppColors.primary),
                title: const Text('Take Photo On-Site'),
                onTap: () {
                  Navigator.of(ctx).pop();
                  _pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library_rounded, color: AppColors.secondary),
                title: const Text('Choose from Gallery'),
                onTap: () {
                  Navigator.of(ctx).pop();
                  _pickImage(ImageSource.gallery);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleResolutionSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final worker = context.read<AuthProvider>().currentUser;
    if (worker == null) return;

    final workerProvider = context.read<WorkerProvider>();
    setState(() => _isSubmitting = true);

    String? resolutionImageUrl;
    if (_imageBytes != null) {
      try {
        resolutionImageUrl = await _storageService.uploadImageBytes(
          bytes: _imageBytes!,
          fileName: _imageName ?? 'resolution_${widget.complaint.id}.jpg',
          folder: 'resolutions',
        );
      } catch (e) {
        debugPrint('Image upload error: $e');
      }
    }

    final result = await workerProvider.resolveTask(
      complaintId: widget.complaint.id,
      workerId: worker.id,
      notes: _notesController.text.trim(),
      resolutionImageUrl: resolutionImageUrl,
    );

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (result.isSuccess) {
        Navigator.of(context).pop(true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Task marked as Resolved successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.errorOrNull ?? 'Failed to resolve task'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppScaffold(
      title: 'Resolve ${widget.complaint.complaintNumber}',
      showBackButton: true,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.success.withAlpha(15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.success.withAlpha(60), width: 1.2),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: const BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check_circle_rounded, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Complete Resolution Proof',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.textPrimary),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Please provide detailed repair notes and photo evidence for ${widget.complaint.complaintNumber}.',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 1. Resolution Notes
              Text(
                'Resolution & Repair Notes *',
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 6),
              const Text(
                'Describe the action taken to fix this civic problem (materials used, actions completed).',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              const SizedBox(height: 10),
              CustomTextField(
                label: 'Resolution Details',
                controller: _notesController,
                hint: 'e.g. Cleared 150kg garbage dump, disinfected area with lime powder, and installed new municipal bin.',
                maxLines: 4,
                validator: (val) {
                  if (val == null || val.trim().length < 10) {
                    return 'Please enter at least 10 characters describing the resolution.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // 2. Resolution Proof Photo
              Text(
                'Photo Evidence of Completed Work',
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 6),
              const Text(
                'Upload a clear after photo showing the resolved area.',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              const SizedBox(height: 10),

              if (_imageBytes != null) ...[
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.memory(
                        _imageBytes!,
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: CircleAvatar(
                        backgroundColor: Colors.black.withAlpha(160),
                        radius: 18,
                        child: IconButton(
                          icon: const Icon(Icons.close_rounded, size: 18, color: Colors.white),
                          onPressed: () => setState(() {
                            _imageBytes = null;
                            _imageName = null;
                          }),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Center(
                  child: TextButton.icon(
                    onPressed: _showImageSourceDialog,
                    icon: const Icon(Icons.refresh_rounded, size: 16),
                    label: const Text('Retake / Change Photo'),
                  ),
                ),
              ] else ...[
                InkWell(
                  onTap: _showImageSourceDialog,
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    width: double.infinity,
                    height: 140,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border, width: 1.5, style: BorderStyle.solid),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.secondary.withAlpha(20),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.add_a_photo_rounded, size: 28, color: AppColors.secondary),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Tap to capture or upload after photo',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 32),

              // Submit Button
              CustomButton(
                text: 'Submit Resolution & Complete Task',
                isLoading: _isSubmitting,
                onPressed: _handleResolutionSubmit,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
