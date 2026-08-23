import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/result.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/custom_button.dart';
import '../../models/complaint_model.dart';
import '../../state/auth_provider.dart';
import '../../state/citizen_provider.dart';
import 'widgets/submission_success_dialog.dart';

class ReportIssueScreen extends StatefulWidget {
  const ReportIssueScreen({super.key});

  @override
  State<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends State<ReportIssueScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Auto-fetch location on opening report screen if not fetched
      final citizenState = context.read<CitizenProvider>();
      if (citizenState.currentLocation == null) {
        citizenState.fetchLocation();
      }
    });
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  void _showImageSourcePicker() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Attach Photo Evidence',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 16),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(25),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.camera_alt_rounded,
                        color: AppColors.primary),
                  ),
                  title: const Text('Take Photo with Camera'),
                  onTap: () async {
                    Navigator.of(ctx).pop();
                    final success = await context.read<CitizenProvider>().pickImage(ImageSource.camera);
                    if (!success && mounted) {
                      final err = context.read<CitizenProvider>().errorMessage;
                      if (err != null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(err), backgroundColor: AppColors.error),
                        );
                      }
                    }
                  },
                ),
                const SizedBox(height: 8),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.secondary.withAlpha(25),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.photo_library_rounded,
                        color: AppColors.secondary),
                  ),
                  title: const Text('Choose from Gallery'),
                  onTap: () async {
                    Navigator.of(ctx).pop();
                    final success = await context.read<CitizenProvider>().pickImage(ImageSource.gallery);
                    if (!success && mounted) {
                      final err = context.read<CitizenProvider>().errorMessage;
                      if (err != null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(err), backgroundColor: AppColors.error),
                        );
                      }
                    }
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _handleSubmit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final user = auth.currentUser;
    if (user == null) return;

    final citizenState = context.read<CitizenProvider>();
    final result = await citizenState.submitComplaint(
      citizenId: user.id,
      citizenName: user.fullName,
      citizenPhone: user.phone,
      description: _descriptionController.text.trim(),
    );

    if (result.isSuccess && mounted) {
      final complaint = (result as Success<ComplaintModel>).data;
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => SubmissionSuccessDialog(
          complaint: complaint,
          onViewComplaints: () {},
        ),
      );
      if (mounted) {
        Navigator.of(context).pop();
      }
    } else if (result.isFailure && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.errorOrNull ?? 'Submission failed'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final citizenState = context.watch<CitizenProvider>();
    final selectedCategory = citizenState.selectedCategory;
    final location = citizenState.currentLocation;
    final imageBytes = citizenState.pickedImageBytes;

    return AppScaffold(
      title: 'Report Civic Issue',
      showBackButton: true,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Category Selection Section
              Text(
                '1. Select Issue Category',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Choose the category that best describes the issue.',
                style: theme.textTheme.bodySmall,
              ),
              const SizedBox(height: 12),

              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: ComplaintCategory.values.map((cat) {
                  final isSelected = selectedCategory == cat;
                  return ChoiceChip(
                    avatar: Icon(
                      cat.icon,
                      size: 18,
                      color: isSelected ? Colors.white : cat.color,
                    ),
                    label: Text(
                      cat.displayName,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                        color: isSelected ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    backgroundColor: Colors.white,
                    side: BorderSide(
                      color: isSelected ? AppColors.primary : AppColors.border,
                      width: 1.2,
                    ),
                    onSelected: (selected) {
                      if (selected) {
                        citizenState.setSelectedCategory(cat);
                      }
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // 2. Description Section
              Text(
                '2. Issue Description',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Provide details like landmarks or specific issue details.',
                style: theme.textTheme.bodySmall,
              ),
              const SizedBox(height: 10),

              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Describe the civic problem clearly (minimum 10 characters)...',
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Description is required';
                  }
                  if (val.trim().length < 10) {
                    return 'Please enter at least 10 characters describing the issue';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // 3. Photo Attachment Section
              Text(
                '3. Photo Evidence (Optional)',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Upload a photo to help field workers identify the issue faster.',
                style: theme.textTheme.bodySmall,
              ),
              const SizedBox(height: 12),

              if (imageBytes != null) ...[
                // Image Preview Card (Web & Mobile safe)
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border, width: 1.2),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(13)),
                        child: Image.memory(
                          imageBytes,
                          height: 180,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            TextButton.icon(
                              onPressed: _showImageSourcePicker,
                              icon: const Icon(Icons.sync_rounded, size: 18, color: AppColors.primary),
                              label: const Text(
                                'Replace',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.primary,
                                ),
                              ),
                            ),
                            TextButton.icon(
                              onPressed: () => citizenState.removePickedImage(),
                              icon: const Icon(Icons.delete_outline_rounded, size: 18, color: AppColors.error),
                              label: const Text(
                                'Remove',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.error,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                // Upload Placeholder
                InkWell(
                  onTap: _showImageSourcePicker,
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: AppColors.border,
                        width: 1.5,
                      ),
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withAlpha(20),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.add_a_photo_outlined,
                            color: AppColors.primary,
                            size: 26,
                          ),
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          'Tap to attach photo (Camera or Gallery)',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Supports JPG, PNG up to 10MB',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 24),

              // 4. Location Tagging Section
              Text(
                '4. Location Tagging',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Accurate GPS location helps dispatch workers promptly.',
                style: theme.textTheme.bodySmall,
              ),
              const SizedBox(height: 12),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border, width: 1.2),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.secondary.withAlpha(25),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.location_on_rounded,
                            color: AppColors.secondary,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                location != null ? 'Location Captured' : 'Location Required',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              Text(
                                location != null
                                    ? 'Lat: ${location.latitude.toStringAsFixed(4)}, Lng: ${location.longitude.toStringAsFixed(4)}'
                                    : 'Tap below to capture current location',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (citizenState.isFetchingLocation)
                          const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        else
                          IconButton(
                            icon: const Icon(Icons.my_location_rounded,
                                color: AppColors.primary),
                            tooltip: 'Refresh Location',
                            onPressed: () => citizenState.fetchLocation(),
                          ),
                      ],
                    ),
                    if (location != null) ...[
                      const Divider(height: 20),
                      Text(
                        'Address: ${location.address}',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Submit Button
              CustomButton(
                text: 'Submit Civic Complaint',
                icon: Icons.send_rounded,
                isLoading: citizenState.isSubmitting,
                onPressed: _handleSubmit,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
