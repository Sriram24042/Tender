import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { reminderAPI } from '../services/api';

// Types
export interface Reminder {
  id: string;
  tender_id: string;
  reminder_type: string;
  due_date: string;
  email: string;
  status: 'pending' | 'sent' | 'cancelled';
  created_at: string;
}

export interface ReminderHistoryRecord {
  id: string;
  reminder_id: string;
  action: 'created' | 'sent' | 'cancelled' | 'updated';
  timestamp: string;
  details: {
    tender_id: string;
    reminder_type: string;
    due_date: string;
    email: string;
    status: string;
  };
}

interface ReminderState {
  reminders: Map<string, Reminder>; // Using Map for O(1) lookups
  loading: boolean;
  error: string | null;
  reminderHistory: ReminderHistoryRecord[];
  filters: {
    status: string;
    reminder_type: string;
    email: string;
  };
}

// Action types
type ReminderAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REMINDERS'; payload: Reminder[] }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'SET_HISTORY'; payload: ReminderHistoryRecord[] }
  | { type: 'ADD_HISTORY_RECORD'; payload: ReminderHistoryRecord }
  | { type: 'CLEAR_HISTORY'; payload: void }
  | { type: 'SET_FILTERS'; payload: Partial<ReminderState['filters']> };

// Initial state
const initialState: ReminderState = {
  reminders: new Map(),
  loading: false,
  error: null,
  reminderHistory: [],
  filters: {
    status: '',
    reminder_type: '',
    email: '',
  },
};

// Reducer with optimized operations
const reminderReducer = (state: ReminderState, action: ReminderAction): ReminderState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_REMINDERS':
      // Convert array to Map for O(1) lookups
      const reminderMap = new Map(action.payload.map(reminder => [reminder.id, reminder]));
      return { ...state, reminders: reminderMap };
    
    case 'ADD_REMINDER':
      const newReminders = new Map(state.reminders);
      newReminders.set(action.payload.id, action.payload);
      return { ...state, reminders: newReminders };
    
    case 'UPDATE_REMINDER':
      const updatedReminders = new Map(state.reminders);
      updatedReminders.set(action.payload.id, action.payload);
      return { ...state, reminders: updatedReminders };
    
    case 'DELETE_REMINDER':
      const filteredReminders = new Map(state.reminders);
      filteredReminders.delete(action.payload);
      return { ...state, reminders: filteredReminders };
    
    case 'SET_HISTORY':
      return {
        ...state,
        reminderHistory: action.payload,
      };
    
    case 'ADD_HISTORY_RECORD':
      return {
        ...state,
        reminderHistory: [action.payload, ...state.reminderHistory],
      };
    
    case 'CLEAR_HISTORY':
      return {
        ...state,
        reminderHistory: [],
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    default:
      return state;
  }
};

// Context
interface ReminderContextType {
  state: ReminderState;
  dispatch: React.Dispatch<ReminderAction>;
  // Optimized getters
  getFilteredReminders: () => Reminder[];
  getReminderById: (id: string) => Reminder | undefined;
  getRemindersByStatus: (status: string) => Reminder[];
  getRemindersByType: (type: string) => Reminder[];
  getUpcomingReminders: (days: number) => Reminder[];
  // Actions
  addReminder: (reminder: Reminder) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  addHistoryRecord: (record: ReminderHistoryRecord) => void;
  clearHistory: () => void;
  setFilters: (filters: Partial<ReminderState['filters']>) => void;
  loadReminders: () => Promise<void>;
  loadReminderHistory: () => Promise<void>;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

// Provider component
export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reminderReducer, initialState);

  // Load reminders on component mount (but not history - history should only load when explicitly requested)
  useEffect(() => {
    loadReminders();
    // Don't auto-load history - it should only load when explicitly requested
    // loadReminderHistory();
  }, []);

  // Load reminders from backend
  const loadReminders = useCallback(async () => {
    try {
      const response = await reminderAPI.getAll();
      const reminders = response.reminders || [];
      dispatch({ type: 'SET_REMINDERS', payload: reminders });
    } catch (error) {
      console.error('Error loading reminders:', error);
      // Don't set error state for this, just log it
    }
  }, []);

  // Load reminder history from backend
  const loadReminderHistory = useCallback(async () => {
    try {
      const response = await reminderAPI.getHistory();
      const history = response.history || [];
      dispatch({ type: 'SET_HISTORY', payload: history });
    } catch (error) {
      console.error('Error loading reminder history:', error);
      // Don't set error state for this, just log it
    }
  }, []);

  // Memoized filtered reminders with optimized filtering
  const getFilteredReminders = useCallback(() => {
    const { status, reminder_type, email } = state.filters;
    const remindersArray = Array.from(state.reminders.values());

    return remindersArray.filter(reminder => {
      const statusMatch = !status || reminder.status === status;
      const typeMatch = !reminder_type || reminder.reminder_type === reminder_type;
      const emailMatch = !email || reminder.email.toLowerCase().includes(email.toLowerCase());

      return statusMatch && typeMatch && emailMatch;
    });
  }, [state.reminders, state.filters]);

  // O(1) lookup by ID
  const getReminderById = useCallback((id: string) => {
    return state.reminders.get(id);
  }, [state.reminders]);

  // Optimized filtering by status
  const getRemindersByStatus = useCallback((status: string) => {
    return Array.from(state.reminders.values()).filter(reminder => reminder.status === status);
  }, [state.reminders]);

  // Optimized filtering by type
  const getRemindersByType = useCallback((type: string) => {
    return Array.from(state.reminders.values()).filter(reminder => reminder.reminder_type === type);
  }, [state.reminders]);

  // Get upcoming reminders (optimized date comparison)
  const getUpcomingReminders = useCallback((days: number) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return Array.from(state.reminders.values()).filter(reminder => {
      const reminderDate = new Date(reminder.due_date);
      return reminderDate >= now && reminderDate <= futureDate && reminder.status === 'pending';
    }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [state.reminders]);

  // Actions
  const addReminder = useCallback((reminder: Reminder) => {
    dispatch({ type: 'ADD_REMINDER', payload: reminder });
  }, []);

  const updateReminder = useCallback((reminder: Reminder) => {
    dispatch({ type: 'UPDATE_REMINDER', payload: reminder });
  }, []);

  const deleteReminder = useCallback((id: string) => {
    dispatch({ type: 'DELETE_REMINDER', payload: id });
  }, []);

  const setFilters = useCallback((filters: Partial<ReminderState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const addHistoryRecord = useCallback(async (record: ReminderHistoryRecord) => {
    // Add to local state immediately
    dispatch({ type: 'ADD_HISTORY_RECORD', payload: record });
    
    // Save to backend
    try {
      await reminderAPI.addHistory({
        reminder_id: record.reminder_id,
        action: record.action,
        timestamp: record.timestamp,
        details: record.details
      });
    } catch (error) {
      console.error('Error saving reminder history to backend:', error);
      // Don't revert the local state change, just log the error
    }
  }, []);

  const clearHistory = useCallback(async () => {
    // Clear local state immediately
    dispatch({ type: 'CLEAR_HISTORY', payload: undefined });
    
    // Clear from backend
    try {
      await reminderAPI.clearHistory();
    } catch (error) {
      console.error('Error clearing reminder history from backend:', error);
      // Don't revert the local state change, just log the error
    }
  }, []);

  const value = useMemo(() => ({
    state,
    dispatch,
    getFilteredReminders,
    getReminderById,
    getRemindersByStatus,
    getRemindersByType,
    getUpcomingReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    addHistoryRecord,
    clearHistory,
    setFilters,
    loadReminders,
    loadReminderHistory,
  }), [
    state,
    getFilteredReminders,
    getReminderById,
    getRemindersByStatus,
    getRemindersByType,
    getUpcomingReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    addHistoryRecord,
    clearHistory,
    setFilters,
    loadReminders,
    loadReminderHistory,
  ]);

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
};

// Hook
export const useReminder = () => {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminder must be used within a ReminderProvider');
  }
  return context;
}; 