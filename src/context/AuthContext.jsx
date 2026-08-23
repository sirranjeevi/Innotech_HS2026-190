import React, { createContext, useContext, useState, useEffect } from 'react';

// Prebuilt system accounts
const PREBUILT_ACCOUNTS = [
  {
    id: 'user-admin-01',
    username: 'admin',
    password: 'admin123',
    name: 'Municipal Admin Officer',
    email: 'admin@civic.gov',
    phone: '+91 98765 00001',
    role: 'admin',
    department: 'Municipal Operations',
  },
  {
    id: 'user-worker-01',
    username: 'worker',
    password: 'worker123',
    name: 'Rajesh Kumar (Field Specialist)',
    email: 'rajesh.worker@civic.gov',
    phone: '+91 98765 00002',
    role: 'worker',
    zone: 'North District Zone 4',
  },
  {
    id: 'user-citizen-01',
    username: 'citizen',
    password: 'password123',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'citizen',
    address: '42 Blossom Enclave, Sector 12',
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_portal_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [registeredCitizens, setRegisteredCitizens] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_registered_citizens');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('civic_portal_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('civic_portal_user');
      }
    } catch (e) {
      console.error('Error saving user to localStorage:', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('civic_registered_citizens', JSON.stringify(registeredCitizens));
    } catch (e) {
      console.error('Error saving registered citizens to localStorage:', e);
    }
  }, [registeredCitizens]);

  /**
   * Universal Login Function
   * @param {string} username
   * @param {string} password
   * @param {'citizen'|'admin'|'worker'} requiredRole
   */
  const login = async (username, password, requiredRole) => {
    setLoading(true);
    try {
      // Small simulated delay for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 300));

      const cleanUsername = username?.trim().toLowerCase();
      const cleanPassword = password?.trim();

      // Check prebuilt accounts first
      const matchedPrebuilt = PREBUILT_ACCOUNTS.find(
        (acc) =>
          acc.username.toLowerCase() === cleanUsername &&
          acc.password === cleanPassword &&
          (!requiredRole || acc.role === requiredRole)
      );

      if (matchedPrebuilt) {
        const { password: _, ...userSession } = matchedPrebuilt;
        setUser(userSession);
        return { success: true, user: userSession };
      }

      // If citizen role, check registered citizens
      if (!requiredRole || requiredRole === 'citizen') {
        const matchedCitizen = registeredCitizens.find(
          (c) =>
            (c.username.toLowerCase() === cleanUsername || c.email.toLowerCase() === cleanUsername) &&
            c.password === cleanPassword
        );

        if (matchedCitizen) {
          const { password: _, ...userSession } = matchedCitizen;
          setUser(userSession);
          return { success: true, user: userSession };
        }
      }

      return {
        success: false,
        error: `Invalid credentials for ${requiredRole || 'user'} login.`,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Citizen Registration
   */
  const registerCitizen = async ({ fullName, username, email, phone, password }) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));

      const cleanUsername = username.trim().toLowerCase();
      const cleanEmail = email.trim().toLowerCase();

      // Check if username or email already taken
      const existsInPrebuilt = PREBUILT_ACCOUNTS.some(
        (acc) => acc.username.toLowerCase() === cleanUsername || acc.email.toLowerCase() === cleanEmail
      );
      const existsInRegistered = registeredCitizens.some(
        (c) => c.username.toLowerCase() === cleanUsername || c.email.toLowerCase() === cleanEmail
      );

      if (existsInPrebuilt || existsInRegistered) {
        return {
          success: false,
          error: 'A user with this username or email already exists.',
        };
      }

      const newCitizen = {
        id: `citizen-${Date.now()}`,
        name: fullName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        phone: phone.trim(),
        password: password, // For demo session checking
        role: 'citizen',
        createdAt: new Date().toISOString(),
      };

      setRegisteredCitizens((prev) => [...prev, newCitizen]);

      // Automatically sign in the registered citizen
      const { password: _, ...userSession } = newCitizen;
      setUser(userSession);

      return { success: true, user: userSession };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('civic_portal_user');
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
        loading,
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
