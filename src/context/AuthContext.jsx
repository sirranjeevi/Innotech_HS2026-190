import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWithFirebase, registerCitizenWithFirebase, logoutFromFirebase } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('civic_portal_user_v4');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('civic_portal_user_v4', JSON.stringify(user));
      } else {
        localStorage.removeItem('civic_portal_user_v4');
      }
    } catch (e) {
      console.error('Error saving user session:', e);
    }
  }, [user]);

  /**
   * Login with Firebase Auth and fallback credentials
   */
  const login = async (usernameOrEmail, password, expectedRole) => {
    // 1. Try Firebase Auth
    const res = await loginWithFirebase(usernameOrEmail, password, expectedRole);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true, user: res.user };
    }

    // 2. Mock credential validation
    const cleanUser = usernameOrEmail.trim().toLowerCase();

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
      const registered = localStorage.getItem('civic_registered_citizens_v4');
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
   * Register Citizen in Firebase Auth and Firestore
   */
  const registerCitizen = async ({ fullName, username, email, phone, password }) => {
    // 1. Try Firebase Auth
    const fbRes = await registerCitizenWithFirebase({ fullName, username, email, phone, password });
    if (fbRes.success && fbRes.user) {
      setUser(fbRes.user);
      return { success: true, user: fbRes.user };
    }

    // 2. Mock fallback registration
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
      const existing = localStorage.getItem('civic_registered_citizens_v4');
      const list = existing ? JSON.parse(existing) : [];
      list.push(newCitizen);
      localStorage.setItem('civic_registered_citizens_v4', JSON.stringify(list));
    } catch (e) {
      console.error('Error saving new citizen:', e);
    }

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
