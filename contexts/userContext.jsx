import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
}

interface AdminContextType {
  admin: Admin | null;
  notifications: Notification[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load admin data on initial mount
  useEffect(() => {
    const loadAdminData = async () => {
      const token = localStorage.getItem('adminToken');
 
    };
    
    loadAdminData();
  }, []);

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await fetch('/api/admin/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });
      
//       const { admin, token } = await response.json();
//       localStorage.setItem('adminToken', token);
//       setAdmin(admin);
//       addNotification('Login successful', 'success');
//     } catch (error) {
//       addNotification('Login failed. Please check your credentials', 'error');
//       throw error;
//     }
//   };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    addNotification('Logged out successfully', 'success');
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AdminContext.Provider 
      value={{ admin, notifications, login, logout, addNotification, removeNotification }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};