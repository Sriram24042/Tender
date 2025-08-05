import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { documentAPI } from '../services/api';

// Types
export interface Document {
  id: string;
  tender_id: string;
  document_type: string;
  filename: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
}

export interface DownloadRecord {
  id: string;
  zipName: string;
  downloadDate: string;
  documents: Array<{
    id: string;
    filename: string;
    tender_id: string;
    document_type: string;
  }>;
}

interface DocumentState {
  documents: Map<string, Document>; // Using Map for O(1) lookups
  loading: boolean;
  error: string | null;
  downloadHistory: DownloadRecord[];
  filters: {
    document_type: string;
    status: string;
    tender_id: string;
  };
}

// Action types
type DocumentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Document }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'SET_DOWNLOAD_HISTORY'; payload: DownloadRecord[] }
  | { type: 'ADD_DOWNLOAD_RECORD'; payload: DownloadRecord }
  | { type: 'CLEAR_DOWNLOAD_HISTORY'; payload: void }
  | { type: 'SET_FILTERS'; payload: Partial<DocumentState['filters']> };

// Initial state
const initialState: DocumentState = {
  documents: new Map(),
  loading: false,
  error: null,
  downloadHistory: [],
  filters: {
    document_type: '',
    status: '',
    tender_id: '',
  },
};

// Reducer with optimized operations
const documentReducer = (state: DocumentState, action: DocumentAction): DocumentState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_DOCUMENTS':
      // Convert array to Map for O(1) lookups
      const documentMap = new Map(action.payload.map(doc => [doc.id, doc]));
      return { ...state, documents: documentMap };
    
    case 'ADD_DOCUMENT':
      const newDocuments = new Map(state.documents);
      newDocuments.set(action.payload.id, action.payload);
      return { ...state, documents: newDocuments };
    
    case 'UPDATE_DOCUMENT':
      const updatedDocuments = new Map(state.documents);
      updatedDocuments.set(action.payload.id, action.payload);
      return { ...state, documents: updatedDocuments };
    
    case 'DELETE_DOCUMENT':
      const filteredDocuments = new Map(state.documents);
      filteredDocuments.delete(action.payload);
      return { ...state, documents: filteredDocuments };
    
    case 'SET_DOWNLOAD_HISTORY':
      return {
        ...state,
        downloadHistory: action.payload,
      };
    
    case 'ADD_DOWNLOAD_RECORD':
      return {
        ...state,
        downloadHistory: [action.payload, ...state.downloadHistory],
      };
    
    case 'CLEAR_DOWNLOAD_HISTORY':
      return {
        ...state,
        downloadHistory: [],
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
interface DocumentContextType {
  state: DocumentState;
  dispatch: React.Dispatch<DocumentAction>;
  // Optimized getters
  getFilteredDocuments: () => Document[];
  getDocumentById: (id: string) => Document | undefined;
  getDocumentsByType: (type: string) => Document[];
  getDocumentsByStatus: (status: string) => Document[];
  getDocumentsByTender: (tenderId: string) => Document[];
  getTotalFileSize: () => number;
  // Actions
  addDocument: (document: Document) => void;
  updateDocument: (document: Document) => void;
  deleteDocument: (id: string) => void;
  addDownloadRecord: (record: DownloadRecord) => void;
  clearDownloadHistory: () => void;
  setFilters: (filters: Partial<DocumentState['filters']>) => void;
  setAllDocuments: (documents: Document[]) => void;
  loadDownloadHistory: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

// Provider component
export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  // Load download history on component mount (but not history - history should only load when explicitly requested)
  useEffect(() => {
    // Don't auto-load download history - it should only load when explicitly requested
    // loadDownloadHistory();
  }, []);

  // Load download history from backend
  const loadDownloadHistory = useCallback(async () => {
    try {
      const response = await documentAPI.getDownloadHistory();
      const downloads = response.downloads || [];
      dispatch({ type: 'SET_DOWNLOAD_HISTORY', payload: downloads });
    } catch (error) {
      console.error('Error loading download history:', error);
      // Don't set error state for this, just log it
    }
  }, []);

  // Memoized filtered documents with optimized filtering
  const getFilteredDocuments = useCallback(() => {
    const { document_type, status, tender_id } = state.filters;
    const documentsArray = Array.from(state.documents.values());

    return documentsArray.filter(doc => {
      const typeMatch = !document_type || doc.document_type === document_type;
      const statusMatch = !status || doc.status === status;
      const tenderMatch = !tender_id || doc.tender_id === tender_id;

      return typeMatch && statusMatch && tenderMatch;
    });
  }, [state.documents, state.filters]);

  // O(1) lookup by ID
  const getDocumentById = useCallback((id: string) => {
    return state.documents.get(id);
  }, [state.documents]);

  // Optimized filtering by type
  const getDocumentsByType = useCallback((type: string) => {
    return Array.from(state.documents.values()).filter(doc => doc.document_type === type);
  }, [state.documents]);

  // Optimized filtering by status
  const getDocumentsByStatus = useCallback((status: string) => {
    return Array.from(state.documents.values()).filter(doc => doc.status === status);
  }, [state.documents]);

  // Optimized filtering by tender
  const getDocumentsByTender = useCallback((tenderId: string) => {
    return Array.from(state.documents.values()).filter(doc => doc.tender_id === tenderId);
  }, [state.documents]);

  // Calculate total file size (optimized with reduce)
  const getTotalFileSize = useCallback(() => {
    return Array.from(state.documents.values()).reduce((total, doc) => total + doc.file_size, 0);
  }, [state.documents]);

  // Actions
  const addDocument = useCallback((document: Document) => {
    dispatch({ type: 'ADD_DOCUMENT', payload: document });
  }, []);

  const updateDocument = useCallback((document: Document) => {
    dispatch({ type: 'UPDATE_DOCUMENT', payload: document });
  }, []);

  const deleteDocument = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DOCUMENT', payload: id });
  }, []);

  const setFilters = useCallback((filters: Partial<DocumentState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setAllDocuments = useCallback((documents: Document[]) => {
    dispatch({ type: 'SET_DOCUMENTS', payload: documents });
  }, []);

  const addDownloadRecord = useCallback(async (record: DownloadRecord) => {
    // Add to local state immediately
    dispatch({ type: 'ADD_DOWNLOAD_RECORD', payload: record });
    
    // Save to backend
    try {
      await documentAPI.addDownloadHistory({
        zip_name: record.zipName,
        download_date: record.downloadDate,
        documents: record.documents
      });
    } catch (error) {
      console.error('Error saving download history to backend:', error);
      // Don't revert the local state change, just log the error
    }
  }, []);

  const clearDownloadHistory = useCallback(async () => {
    // Clear local state immediately
    dispatch({ type: 'CLEAR_DOWNLOAD_HISTORY', payload: undefined });
    
    // Clear from backend
    try {
      await documentAPI.clearDownloadHistory();
    } catch (error) {
      console.error('Error clearing download history from backend:', error);
      // Don't revert the local state change, just log the error
    }
  }, []);

  const value = useMemo(() => ({
    state,
    dispatch,
    getFilteredDocuments,
    getDocumentById,
    getDocumentsByType,
    getDocumentsByStatus,
    getDocumentsByTender,
    getTotalFileSize,
    addDocument,
    updateDocument,
    deleteDocument,
    addDownloadRecord,
    clearDownloadHistory,
    setFilters,
    setAllDocuments,
    loadDownloadHistory,
  }), [
    state,
    getFilteredDocuments,
    getDocumentById,
    getDocumentsByType,
    getDocumentsByStatus,
    getDocumentsByTender,
    getTotalFileSize,
    addDocument,
    updateDocument,
    deleteDocument,
    addDownloadRecord,
    clearDownloadHistory,
    setFilters,
    setAllDocuments,
    loadDownloadHistory,
  ]);

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

// Hook
export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}; 