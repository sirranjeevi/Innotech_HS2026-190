# Contributing to Civic Complaint Portal

Thank you for contributing to the Civic Complaint Portal! This guide helps you get started with contributing to this municipal civic-tech project.

---

## 🛠️ Development Workflow

### 1. Clone the Repository
```bash
git clone https://github.com/sirranjeevi/Innotech_HS2026-190.git
cd Innotech_HS2026-190
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
Copy the sample environment variables:
```bash
cp .env.example .env
```
Provide your Firebase configuration keys in `.env`.

### 4. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 5. Run Development Server
```bash
npm run dev
```

---

## 📋 Coding Standards & Architectural Guidelines

- **Component Structure**: Keep UI components modular, accessible, and stateless where possible.
- **Service Layer**: Keep Firebase and data operations inside `src/services/`.
- **Constants**: Use centralized constants from `src/constants/` for roles and status codes.
- **Workflow Compliance**: Never bypass or alter the 6-stage lifecycle (`SUBMITTED` → `VERIFIED` → `ASSIGNED` → `ACCEPTED` → `IN_PROGRESS` → `RESOLVED`).

---

## 🚀 Submitting Changes

1. Run production build verification:
   ```bash
   npm run build
   ```
2. Commit with conventional commit messages:
   ```bash
   git commit -m "feat: add your feature description"
   ```
3. Push to your branch and open a Pull Request.

---

## 📄 License
By contributing, you agree that your contributions will be licensed under the project's **MIT License**.
