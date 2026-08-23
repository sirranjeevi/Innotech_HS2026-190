import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Civic Palette - Primary Colors
  static const Color primary = Color(0xFF1E3A8A); // Civic Navy / Deep Blue
  static const Color primaryDark = Color(0xFF0F172A);
  static const Color primaryLight = Color(0xFF3B82F6);

  // Secondary Accents
  static const Color secondary = Color(0xFF0D9488); // Teal / Green accent
  static const Color secondaryLight = Color(0xFF14B8A6);
  static const Color secondaryDark = Color(0xFF0F766E);

  // Background & Surface
  static const Color background = Color(0xFFF8FAFC); // Clean Light Slate
  static const Color surface = Color(0xFFFFFFFF);
  static const Color card = Color(0xFFFFFFFF);

  // Status Colors (Matching portal workflow)
  static const Color statusSubmitted = Color(0xFF64748B); // Slate
  static const Color statusVerified = Color(0xFF0284C7);  // Blue
  static const Color statusAssigned = Color(0xFFD97706);  // Amber
  static const Color statusAccepted = Color(0xFF8B5CF6);  // Purple
  static const Color statusInProgress = Color(0xFFEA580C);// Orange
  static const Color statusResolved = Color(0xFF16A34A);  // Emerald Green

  // Feedback & Validation
  static const Color error = Color(0xFFDC2626);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color success = Color(0xFF16A34A);
  static const Color successLight = Color(0xFFDCFCE7);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color info = Color(0xFF0284C7);
  static const Color infoLight = Color(0xFFE0F2FE);

  // Neutral Tones
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderLight = Color(0xFFF1F5F9);
  static const Color divider = Color(0xFFE2E8F0);
  static const Color shadow = Color(0x0D000000);
}
