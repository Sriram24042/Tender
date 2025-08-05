import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// Types
export interface Tender {
  id: string;
  title: string;
  description: string;
  deadline: string;
  value: number;
  location: string;
  sector: string;
  status: 'open' | 'closed' | 'awarded';
  createdAt: string;
}

interface TenderState {
  tenders: Map<string, Tender>; // Using Map for O(1) lookups
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    status: string;
    sector: string;
    location: string;
  };
}

// Action types
type TenderAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TENDERS'; payload: Tender[] }
  | { type: 'ADD_TENDER'; payload: Tender }
  | { type: 'UPDATE_TENDER'; payload: Tender }
  | { type: 'DELETE_TENDER'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<TenderState['filters']> };

// Initial state
const initialState: TenderState = {
  tenders: new Map(),
  loading: false,
  error: null,
  filters: {
    search: '',
    status: '',
    sector: '',
    location: '',
  },
};

// Reducer with optimized operations
const tenderReducer = (state: TenderState, action: TenderAction): TenderState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_TENDERS':
      // Convert array to Map for O(1) lookups
      const tenderMap = new Map(action.payload.map(tender => [tender.id, tender]));
      return { ...state, tenders: tenderMap };
    
    case 'ADD_TENDER':
      const newTenders = new Map(state.tenders);
      newTenders.set(action.payload.id, action.payload);
      return { ...state, tenders: newTenders };
    
    case 'UPDATE_TENDER':
      const updatedTenders = new Map(state.tenders);
      updatedTenders.set(action.payload.id, action.payload);
      return { ...state, tenders: updatedTenders };
    
    case 'DELETE_TENDER':
      const filteredTenders = new Map(state.tenders);
      filteredTenders.delete(action.payload);
      return { ...state, tenders: filteredTenders };
    
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
interface TenderContextType {
  state: TenderState;
  dispatch: React.Dispatch<TenderAction>;
  // Optimized getters
  getFilteredTenders: () => Tender[];
  getTenderById: (id: string) => Tender | undefined;
  getTendersByStatus: (status: string) => Tender[];
  getTendersBySector: (sector: string) => Tender[];
  // Actions
  addTender: (tender: Tender) => void;
  updateTender: (tender: Tender) => void;
  deleteTender: (id: string) => void;
  setFilters: (filters: Partial<TenderState['filters']>) => void;
}

const TenderContext = createContext<TenderContextType | undefined>(undefined);

// Provider component
export const TenderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tenderReducer, initialState);

  // Memoized filtered tenders with optimized search algorithm
  const getFilteredTenders = useCallback(() => {
    const { search, status, sector, location } = state.filters;
    const tendersArray = Array.from(state.tenders.values());

    return tendersArray.filter(tender => {
      // Search filter (case-insensitive)
      const searchMatch = !search || 
        tender.title.toLowerCase().includes(search.toLowerCase()) ||
        tender.description.toLowerCase().includes(search.toLowerCase());

      // Status filter
      const statusMatch = !status || tender.status === status;

      // Sector filter
      const sectorMatch = !sector || tender.sector === sector;

      // Location filter
      const locationMatch = !location || tender.location === location;

      return searchMatch && statusMatch && sectorMatch && locationMatch;
    });
  }, [state.tenders, state.filters]);

  // O(1) lookup by ID
  const getTenderById = useCallback((id: string) => {
    return state.tenders.get(id);
  }, [state.tenders]);

  // Optimized filtering by status
  const getTendersByStatus = useCallback((status: string) => {
    return Array.from(state.tenders.values()).filter(tender => tender.status === status);
  }, [state.tenders]);

  // Optimized filtering by sector
  const getTendersBySector = useCallback((sector: string) => {
    return Array.from(state.tenders.values()).filter(tender => tender.sector === sector);
  }, [state.tenders]);

  // Actions
  const addTender = useCallback((tender: Tender) => {
    dispatch({ type: 'ADD_TENDER', payload: tender });
  }, []);

  const updateTender = useCallback((tender: Tender) => {
    dispatch({ type: 'UPDATE_TENDER', payload: tender });
  }, []);

  const deleteTender = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TENDER', payload: id });
  }, []);

  const setFilters = useCallback((filters: Partial<TenderState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const value = useMemo(() => ({
    state,
    dispatch,
    getFilteredTenders,
    getTenderById,
    getTendersByStatus,
    getTendersBySector,
    addTender,
    updateTender,
    deleteTender,
    setFilters,
  }), [
    state,
    getFilteredTenders,
    getTenderById,
    getTendersByStatus,
    getTendersBySector,
    addTender,
    updateTender,
    deleteTender,
    setFilters,
  ]);

  return (
    <TenderContext.Provider value={value}>
      {children}
    </TenderContext.Provider>
  );
};

// Hook
export const useTender = () => {
  const context = useContext(TenderContext);
  if (context === undefined) {
    throw new Error('useTender must be used within a TenderProvider');
  }
  return context;
}; 