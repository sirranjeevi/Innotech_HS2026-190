# 🏙️ Citizen Complaint Portal (Civic Report)

A production-ready, full-stack civic issue reporting and resolution platform connecting **Citizens, Municipal Administrators, and Field Workers**. Built for **Hackspora 2026** by **Team Innotech** (Project: `Innotech_HS2026-190`).

---

## 📱 Download & Install Android APK

Get the pre-compiled Android release APK directly from this repository:

* 📥 **Direct APK Download:** [**`apk/app-release.apk`**](https://github.com/sirranjeevi/Innotech_HS2026-190/blob/AppDevelpment/apk/app-release.apk)
* **File Size:** `54.7 MB`
* **Compatibility:** Android 6.0+ (API 23 to API 36)
* **Target Architecture:** Universal (ARMv7, ARM64, x86_64)

### How to Install:
1. Download `app-release.apk` to your Android device or emulator.
2. Tap the downloaded APK and allow **"Install from unknown sources"** when prompted.
3. Launch **Citizen Portal** and sign in using the demo credentials below or create a new Citizen account.

---

## 🔑 Demo Login Credentials

The portal comes pre-seeded with accounts for seamless testing and demonstration across all 3 roles:

### 1. 👨‍💼 Municipal Administrator
| Field | Value |
|---|---|
| **Role to Select** | **Portal Admin** |
| **Username** | `admin` |
| **Password** | `Admin@123` |
| **Capabilities** | Triage new issues, verify complaints, assign departments/workers, view district analytics & map metrics |

---

### 2. 👷 Field Workers (by Department)
| Department | Worker Name | Username | Password |
|---|---|---|---|
| 🚧 **Road Maintenance (Potholes)** | Suresh Patel | `worker_roads` | `Worker@123` |
| 🧹 **Sanitation & Waste** | Ramesh Kumar | `worker_sanitation` | `Worker@123` |
| 💡 **Electrical & Streetlights** | Amit Verma | `worker_electrical` | `Worker@123` |
| 🚰 **Water Supply & Drainage** | Vikram Singh | `worker_water` | `Worker@123` |

* **Field Worker Capabilities:** View assigned tasks with interactive mini-maps, accept assignments, mark work in progress, upload before vs. after resolution photo evidence, and complete tickets.

---

### 3. 👥 Citizen Account
* **New Registration:** Tap **Citizen** > **"Don't have an account? Register"** to create a live profile.
* **Pre-seeded Citizen Login:**
  * **Username:** `citizen`
  * **Password:** `Citizen@123`

---

## 🔄 Lifecycle & Workflow Architecture

```text
[Citizen]                          [Cloud Backend / AI]                    [Admin & Field Workers]
   │                                        │                                         │
   ├─► Register / Login                     │                                         │
   ├─► Report Issue (Photo + GPS)           │                                         │
   │   └─► Auto Reverse-Geocode ───────────►│ (OpenStreetMap Nominatim)               │
   │                                        ├─► Distance & Keyword Match              │
   ├─◄ Duplicate Warning / Upvote Dialog ───┤ (Smart Duplicate Detection Engine)      │
   ├─► Submit Complaint (Unique ID) ───────►│ (Cloud Firestore / REST Sync) ─────────►│
   │                                        │                                         ├─► Admin Verifies Issue
   │                                        │                                         ├─► Assigns Department & Worker
   │                                        │◄─ Worker Assigned Notification ─────────┤
   │                                        │                                         ├─► Worker Accepts Task
   │                                        │                                         ├─► Marks Work In-Progress
   │                                        │                                         ├─► Uploads Resolution Photo
   │                                        │                                         └─► Marks Task Resolved
   ├─◄ Push Notification & Live Timeline ───┤
   └─► Citizen Inspects Before/After Photo  │
```

---

## ✨ Key Features

* 📍 **Interactive Civic Map**: OpenStreetMap integration with interactive category pins, GPS location tracking, radius filters, and bottom complaint preview sheets.
* 🏷️ **Human-Readable Location Names**: Automatic reverse geocoding converting GPS coordinates (`11.0168, 76.9558`) into readable street and district names (e.g. *Avinashi Road, Peelamedu, Coimbatore*).
* 🔍 **Smart Duplicate Detection**: Haversine geographic distance (<100m) and NLP keyword matching alert citizens to existing reports and offer instant one-tap **Upvote / Support**.
* 📸 **Before & After Photo Proof**: Side-by-side comparative inspection card displaying the original issue photo alongside worker repair evidence.
* 🔔 **Multi-Role In-App Notification Center**: Instant real-time status alerts for complaint registration, verification, worker assignment, progress updates, and resolutions.
* ☁️ **Dual-Engine Persistence**: Cloud Firestore bidirectional synchronization with offline local caching for zero-latency sessions.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Flutter (Dart SDK ^3.13.1) |
| **State Management** | Provider (ChangeNotifier pattern) |
| **Mapping Engine** | `flutter_map` + `latlong2` (OpenStreetMap tile layers) |
| **Geocoding** | OpenStreetMap Nominatim REST API + Regional fallback |
| **Backend & Cloud** | Google Cloud Firestore, Firebase Auth, Firebase Storage |
| **Device Hardware** | Camera (`image_picker`), GPS (`geolocator`), Local storage (`shared_preferences`) |
| **Test Suite** | 59 Automated Unit, Widget & Integration Tests (100% Pass) |

---

## 🧪 Verification & Automated Testing

Run the full automated test suite:

```bash
# Run static analysis
dart analyze

# Run all 59 unit & widget tests
flutter test --no-pub
```

### Test Coverage:
* `test/unit/` — Haversine distance, duplicate detection algorithm, authentication state, validation rules.
* `test/widget/` — Citizen flow, admin triage & assignment, worker task resolution with photo evidence, duplicate warning dialog, and interactive map tabs.

---

## 🏆 Hackathon Submission Details

* **Event:** Hackspora 2026
* **Team:** Team Innotech
* **Project Repository:** [github.com/sirranjeevi/Innotech_HS2026-190](https://github.com/sirranjeevi/Innotech_HS2026-190)
* **Branch:** `AppDevelpment`
* **Release Tag:** `final-apk`
