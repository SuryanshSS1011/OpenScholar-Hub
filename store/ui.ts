import { create } from 'zustand';
import { UIState, Notification } from '@/types';

interface UIActions {
  // Global loading
  setGlobalLoading: (loading: boolean, text?: string) => void;
  
  // Modal management
  openModal: (modalId: string, props?: Record<string, any>) => void;
  closeModal: () => void;
  
  // Navigation
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Layout
  setLayoutCompact: (compact: boolean) => void;
  toggleLayoutCompact: () => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set, get) => ({
  // State
  globalLoading: false,
  loadingText: '',
  activeModal: null,
  modalProps: {},
  sidebarOpen: true,
  mobileMenuOpen: false,
  notifications: [],
  theme: 'system',
  layoutCompact: false,

  // Actions
  setGlobalLoading: (loading, text = '') => {
    set({ globalLoading: loading, loadingText: text });
  },

  openModal: (modalId, props = {}) => {
    set({ activeModal: modalId, modalProps: props });
  },

  closeModal: () => {
    set({ activeModal: null, modalProps: {} });
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setMobileMenuOpen: (open) => {
    set({ mobileMenuOpen: open });
  },

  toggleMobileMenu: () => {
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }));
  },

  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 5000);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setTheme: (theme) => {
    set({ theme });
    
    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System theme
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }
  },

  setLayoutCompact: (compact) => {
    set({ layoutCompact: compact });
  },

  toggleLayoutCompact: () => {
    set((state) => ({ layoutCompact: !state.layoutCompact }));
  },
}));

// Selectors
export const useGlobalLoading = () => useUIStore((state) => ({
  loading: state.globalLoading,
  text: state.loadingText,
}));

export const useModal = () => useUIStore((state) => ({
  activeModal: state.activeModal,
  modalProps: state.modalProps,
  openModal: state.openModal,
  closeModal: state.closeModal,
}));

export const useNavigation = () => useUIStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  mobileMenuOpen: state.mobileMenuOpen,
  setSidebarOpen: state.setSidebarOpen,
  toggleSidebar: state.toggleSidebar,
  setMobileMenuOpen: state.setMobileMenuOpen,
  toggleMobileMenu: state.toggleMobileMenu,
}));

export const useNotifications = () => useUIStore((state) => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));

export const useTheme = () => useUIStore((state) => ({
  theme: state.theme,
  setTheme: state.setTheme,
}));

export const useLayout = () => useUIStore((state) => ({
  compact: state.layoutCompact,
  setCompact: state.setLayoutCompact,
  toggleCompact: state.toggleLayoutCompact,
}));