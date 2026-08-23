# 🏛️ Civic Complaint Portal - Architecture & Technical Specification

## 1. High-Level Architecture

The Civic Complaint Portal is architected as a modular, responsive civic-tech web platform using **React 19**, **Vite**, **Firebase (Firestore & Storage)**, and **OpenStreetMap (Leaflet + Nominatim)**.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer (React 19)                 │
├───────────────────┬─────────────────────┬───────────────────┤
│  Citizen Portal   │    Admin Portal     │   Worker Portal   │
│  (/citizen/*)     │    (/admin/*)       │   (/worker/*)     │
└─────────┬─────────┴──────────┬──────────┴─────────┬─────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                ┌──────────────▼──────────────┐
                │   State & Routing Layer     │
                │  - AuthContext              │
                │  - ComplaintContext         │
                │  - ProtectedRoute           │
                └──────────────┬──────────────┘
                               │
                ┌──────────────▼──────────────┐
                │        Service Layer        │
                │  - authService.js           │
                │  - complaintService.js      │
                │  - storageService.js        │
                │  - duplicateDetection.js    │
                └──────────────┬──────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        ▼                                             ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│      Firebase Backend        │              │    OpenStreetMap / Leaflet   │
│  - Firestore NoSQL           │              │  - Nominatim Reverse Geocode │
│  - Cloud Storage             │              │  - Interactive Pin Dropping  │
└──────────────────────────────┘              └──────────────────────────────┘
```

---

## 2. Strict 6-Stage Resolution Lifecycle

The platform guarantees data integrity through an immutable 6-stage status state machine:

```
[01. SUBMITTED]
      ↓ (Admin Verifies Validity & Checks Duplicates)
[02. VERIFIED]
      ↓ (Admin Assigns Department & Field Worker)
[03. ASSIGNED]
      ↓ (Field Worker Accepts Task in Workstation)
[04. ACCEPTED]
      ↓ (Worker Dispatches to Location & Begins Repair)
[05. IN_PROGRESS]
      ↓ (Worker Uploads Post-Repair Photo Evidence)
[06. RESOLVED]
```

---

## 3. Database Schema (Firestore Collections)

### `complaints` Collection
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique Firestore Document ID |
| `complaintNumber` | String | User-facing tracking identifier (e.g. `CMP-2026-8941`) |
| `title` | String | Concise summary of the issue |
| `description` | String | Detailed grievance description |
| `category` | String | One of 7 standard civic categories |
| `status` | String | Current lifecycle status (`SUBMITTED` -> `RESOLVED`) |
| `latitude` | Number | GPS latitude coordinate |
| `longitude` | Number | GPS longitude coordinate |
| `address` | String | Human-readable reverse-geocoded street address |
| `imageUrl` | String | Pre-resolution ground photograph |
| `resolutionImageUrl`| String | Post-resolution photographic proof |
| `resolutionNotes` | String | Field technician closeout notes |
| `citizenId` | String | Authenticated user ID of complainant |
| `citizenName` | String | Citizen display name |
| `departmentId` | String | Assigned department ID |
| `assignedWorkerId` | String | Assigned field worker ID |
| `createdAt` | ISO Timestamp | Submission timestamp |
| `resolvedAt` | ISO Timestamp | Closeout timestamp |

---

## 4. Duplicate Detection Algorithm

The duplicate detection engine evaluates incoming complaints using two combined metrics:
1. **Haversine Distance**: Computes great-circle geographical distance in meters. If distance ≤ 150m and category matches, flagged as duplicate.
2. **Jaccard Semantic Overlap**: Tokenizes description keywords to detect semantic similarity score ≥ 0.40.
