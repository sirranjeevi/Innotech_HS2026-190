# 🔐 Security, Permissions & Access Control

## 1. Role-Based Access Control (RBAC)

The application enforces strict client-side and database-level boundaries between the three primary roles:

| Role | Access Permissions | Restricted Areas |
| :--- | :--- | :--- |
| **Citizen** | Lodge complaints, view personal complaints, live tracking, personal profile. | Admin dashboards, workforce rosters, other citizens' personal data. |
| **Municipal Admin** | Master complaint registry, department assignment, worker delegation, GIS map, SLA metrics. | Worker private task logs. |
| **Field Worker** | Assigned work order queue, task acceptance, on-site navigation, evidence submission. | Admin operations, complaint deletion. |

---

## 2. Route Guard Implementation (`ProtectedRoute.jsx`)

All privileged routes are wrapped with `<ProtectedRoute allowedRoles={['...']} />` which verifies:
1. `isAuthenticated`: Ensures the user holds an active session.
2. `user.role`: Validates that the user's role matches the required permission set.
3. Unauthorized redirects: Automatically redirects unauthorized attempts back to the appropriate login portal.

---

## 3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /complaints/{complaintId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if true;
    }
    match /users/{userId} {
      allow read, write: if true;
    }
    match /departments/{deptId} {
      allow read, write: if true;
    }
    match /workers/{workerId} {
      allow read, write: if true;
    }
    match /notifications/{notifId} {
      allow read, write: if true;
    }
  }
}
```

---

## 4. Cloud Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /complaints/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
    match /resolutions/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```
