import React, { useState } from 'react';
import { Download, X, FileText, Check } from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  tender_id: string;
  document_type: string;
  file_size: number;
  uploaded_at: string;
}

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onDownload: (selectedDocs: Document[], zipName: string) => Promise<void>;
  downloading: boolean;
}

const DownloadModal = ({ isOpen, onClose, documents, onDownload, downloading }: DownloadModalProps) => {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [zipName, setZipName] = useState('');

  const handleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(documents.map(doc => doc.id));
    }
  };

  const handleSelectDoc = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleDownload = async () => {
    if (selectedDocs.length === 0 || !zipName.trim()) {
      alert('Please select documents and enter a ZIP file name');
      return;
    }

    const selectedDocuments = documents.filter(doc => selectedDocs.includes(doc.id));
    await onDownload(selectedDocuments, zipName);
    
    // Reset form
    setSelectedDocs([]);
    setZipName('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📈';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📁';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Download Documents</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* ZIP File Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP File Name *
                </label>
                <input
                  type="text"
                  value={zipName}
                  onChange={(e) => setZipName(e.target.value)}
                  placeholder="Enter ZIP file name (without .zip extension)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Select All */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Select Documents ({selectedDocs.length} of {documents.length})
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {selectedDocs.length === documents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Documents List */}
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {documents.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No documents available for download</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                          selectedDocs.includes(doc.id) ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => handleSelectDoc(doc.id)}
                      >
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={selectedDocs.includes(doc.id)}
                            onChange={() => handleSelectDoc(doc.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{getFileIcon(doc.filename)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {doc.filename}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span>Tender: {doc.tender_id}</span>
                                <span>Type: {doc.document_type}</span>
                                <span>{formatFileSize(doc.file_size)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {selectedDocs.includes(doc.id) && (
                          <Check className="h-5 w-5 text-primary-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleDownload}
              disabled={downloading || selectedDocs.length === 0 || !zipName.trim()}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
            >
              {downloading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating ZIP...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download {selectedDocs.length} File{selectedDocs.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal; 