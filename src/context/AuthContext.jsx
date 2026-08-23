import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWithFirebase, registerCitizenWithFirebase, logoutFromFirebase } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('civic_portal_user_v5');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('civic_portal_user_v5', JSON.stringify(user));
      } else {
        localStorage.removeItem('civic_portal_user_v5');
      }
    } catch (e) {
      console.error('Error saving user session:', e);
    }
  }, [user]);

  /**
   * Login with Firestore database / Firebase Auth and fallback credentials
   */
  const login = async (usernameOrEmail, password, expectedRole) => {
    const cleanUser = usernameOrEmail.trim().toLowerCase();

    // 1. Try Firestore Database / Firebase Auth
    const res = await loginWithFirebase(cleanUser, password, expectedRole);
    if (res.success && res.user) {
      const { password: _, ...cleanUserData } = res.user;
      setUser(cleanUserData);
      return { success: true, user: cleanUserData };
    }

    // 2. Prebuilt credential validation
    if (expectedRole === 'admin') {
      if ((cleanUser === 'admin' || cleanUser === 'admin@civic.gov') && password === 'admin123') {
        const adminUser = {
          id: 'user-admin-01',
          name: 'Municipal Admin Officer',
          username: 'admin',
          email: 'admin@civic.gov',
          phone: '+91 98765 00001',
          role: 'admin',
        };
        setUser(adminUser);
        return { success: true, user: adminUser };
      }
      return { success: false, error: 'Invalid admin credentials. Use admin / admin123' };
    }

    if (expectedRole === 'worker') {
      if ((cleanUser === 'worker' || cleanUser === 'worker@civic.gov') && password === 'worker123') {
        const workerUser = {
          id: 'user-worker-01',
          name: 'Rajesh Kumar (Field Tech #4)',
          username: 'worker',
          email: 'rajesh.worker@civic.gov',
          phone: '+91 98765 00002',
          role: 'worker',
          departmentId: 'dept-02',
          departmentName: 'Roads & Infrastructure Maintenance',
          zone: 'North District Zone 4',
        };
        setUser(workerUser);
        return { success: true, user: workerUser };
      }
      return { success: false, error: 'Invalid field worker credentials. Use worker / worker123' };
    }

    if (expectedRole === 'citizen') {
      if ((cleanUser === 'citizen' || cleanUser === 'citizen@example.com') && password === 'password123') {
        const citizenUser = {
          id: 'user-citizen-01',
          name: 'Ananya Sharma',
          username: 'citizen',
          email: 'ananya.sharma@example.com',
          phone: '+91 98765 43210',
          role: 'citizen',
        };
        setUser(citizenUser);
        return { success: true, user: citizenUser };
      }

      // Check registered citizen in local storage
      const registered = localStorage.getItem('civic_registered_citizens_v5');
      if (registered) {
        const list = JSON.parse(registered);
        const match = list.find(
          (c) =>
            (c.username.toLowerCase() === cleanUser || c.email.toLowerCase() === cleanUser) &&
            c.password === password
        );
        if (match) {
          const { password: _, ...cleanUserData } = match;
          setUser(cleanUserData);
          return { success: true, user: cleanUserData };
        }
      }
      return { success: false, error: 'Invalid citizen credentials. Use citizen / password123 or register.' };
    }

    return { success: false, error: 'Role mismatch' };
  };

  /**
   * Register Citizen in Firestore database and Firebase Auth
   */
  const registerCitizen = async ({ fullName, username, email, phone, password }) => {
    // 1. Register in Firestore / Firebase
    const fbRes = await registerCitizenWithFirebase({ fullName, username, email, phone, password });
    if (fbRes.success && fbRes.user) {
      const { password: _, ...cleanUser } = fbRes.user;

      // Save locally as well for offline resilience
      try {
        const existing = localStorage.getItem('civic_registered_citizens_v5');
        const list = existing ? JSON.parse(existing) : [];
        list.push({ ...fbRes.user, password });
        localStorage.setItem('civic_registered_citizens_v5', JSON.stringify(list));
      } catch (e) {}

      setUser(cleanUser);
      return { success: true, user: cleanUser };
    }

    // 2. Fallback
    const newCitizen = {
      id: `user-citizen-${Date.now()}`,
      name: fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      phone,
      password,
      role: 'citizen',
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem('civic_registered_citizens_v5');
      const list = existing ? JSON.parse(existing) : [];
      list.push(newCitizen);
      localStorage.setItem('civic_registered_citizens_v5', JSON.stringify(list));
    } catch (e) {}

    const { password: _, ...cleanCitizen } = newCitizen;
    setUser(cleanCitizen);
    return { success: true, user: cleanCitizen };
  };

  const logout = async () => {
    await logoutFromFirebase();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || null,
        login,
        registerCitizen,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
