# 🏙️ Citizen Complaint Portal

A full-stack civic issue reporting and resolution platform connecting **Citizens, Admins, and Field Workers**.

## 🎯 Problem

Citizens need a simple way to report civic issues and track them until resolution. Administrators need centralized complaint management, while field workers need a clear way to receive and resolve assigned issues.

## 🔄 Workflow

```text
Citizen
   ↓
Login / Register
   ↓
Report Issue
   ↓
Photo + Description + Category
   ↓
📍 Location Tagging
   ↓
Submit Complaint
   ↓
Unique Complaint ID
   ↓
Duplicate Detection
   ↓
Admin Verification
   ↓
Department & Worker Assignment
   ↓
Worker Accepts Task
   ↓
Start Work
   ↓
Update Progress
   ↓
Upload Resolution Evidence
   ↓
Mark Resolved
   ↓
Citizen Views Resolution
```

## 👥 Roles

**Citizen**

* Register & login
* Report issues
* Add photos and location
* Track complaints
* View resolutions

**Admin**

* Pre-built login
* Verify complaints
* Assign departments/workers
* Monitor complaints

**Field Worker**

* Pre-built login
* View assigned tasks
* Update progress
* Upload resolution evidence
* Mark complaints resolved

## 🛠️ Tech Stack

* **Mobile:** Flutter
* **Web:** React.js
* **Backend:** Firebase
* **Authentication:** Firebase Auth
* **Database:** Firestore / Realtime Database
* **Storage:** Firebase Storage
* **Maps:** Google Maps API
* **Smart Feature:** Duplicate complaint detection

## 🏗️ Architecture

```text
Mobile App ──┐
             ├── Common Backend ── Database
Web Portal ──┘                    ├── Authentication
                                  ├── Storage
                                  └── Maps
```

## 🚀 Key Features

* 📍 Location-based complaint reporting
* 📸 Image evidence
* 🔍 Duplicate detection
* 👨‍💼 Centralized admin dashboard
* 👷 Field-worker task management
* 🔄 Real-time complaint status tracking
* ✅ Resolution evidence

## 🏆 Hackathon

**Hackspora 2026 — Citizen Complaint Portal**

Built by **Team Innotech**.
