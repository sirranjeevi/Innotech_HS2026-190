import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../routes/app_router.dart';
import '../../state/auth_provider.dart';
import '../../state/citizen_provider.dart';
import 'tabs/citizen_dashboard_tab.dart';
import 'tabs/citizen_complaints_tab.dart';
import 'tabs/citizen_notifications_tab.dart';
import 'tabs/citizen_profile_tab.dart';

class CitizenMainScreen extends StatefulWidget {
  final int initialTabIndex;

  const CitizenMainScreen({super.key, this.initialTabIndex = 0});

  @override
  State<CitizenMainScreen> createState() => _CitizenMainScreenState();
}

class _CitizenMainScreenState extends State<CitizenMainScreen> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialTabIndex;

    // Load initial citizen data on load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthProvider>().currentUser;
      if (user != null) {
        context.read<CitizenProvider>().loadCitizenData(user.id);
      }
    });
  }

  void _navigateToTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    final tabs = [
      CitizenDashboardTab(
        onNavigateToComplaints: () => _navigateToTab(1),
      ),
      const CitizenComplaintsTab(),
      const CitizenNotificationsTab(),
      const CitizenProfileTab(),
    ];

    final titles = [
      AppStrings.appName,
      'My Complaints',
      'Notifications',
      'Citizen Profile',
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(titles[_currentIndex]),
        actions: [
          if (_currentIndex == 3)
            IconButton(
              icon: const Icon(Icons.logout_rounded, color: AppColors.error),
              tooltip: 'Sign Out',
              onPressed: () async {
                await auth.logout();
                if (context.mounted) {
                  Navigator.of(context).pushNamedAndRemoveUntil(
                    AppRoutes.roleSelection,
                    (route) => false,
                  );
                }
              },
            )
          else
            IconButton(
              icon: const Icon(Icons.add_circle_outline_rounded,
                  color: AppColors.primary),
              tooltip: 'Report Issue',
              onPressed: () {
                Navigator.of(context).pushNamed(AppRoutes.reportIssue);
              },
            ),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: IndexedStack(
              index: _currentIndex,
              children: tabs,
            ),
          ),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.border, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _navigateToTab,
          backgroundColor: Colors.white,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textMuted,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 12),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home_rounded),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.list_alt_outlined),
              activeIcon: Icon(Icons.list_alt_rounded),
              label: 'My Complaints',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.notifications_outlined),
              activeIcon: Icon(Icons.notifications_rounded),
              label: 'Notifications',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ],
        ),
      ),
      floatingActionButton: _currentIndex == 0 || _currentIndex == 1
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.of(context).pushNamed(AppRoutes.reportIssue);
              },
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.add_rounded),
              label: const Text(
                'Report Issue',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
            )
          : null,
    );
  }
}
