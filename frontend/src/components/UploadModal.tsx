import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Trash2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], tenderId: string, documentType: string) => Promise<void>;
  uploading: boolean;
}

const UploadModal = ({ isOpen, onClose, onUpload, uploading }: UploadModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [tenderId, setTenderId] = useState('');
  const [documentType, setDocumentType] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Filter for PDF files only
    const pdfFiles = files.filter(file => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        alert(`File "${file.name}" is not a PDF. Only PDF files are allowed.`);
      }
      return isPdf;
    });
    
    setSelectedFiles(prev => [...prev, ...pdfFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0 || !tenderId || !documentType) {
      alert('Please fill in all fields and select at least one file');
      return;
    }

    await onUpload(selectedFiles, tenderId, documentType);
    
    // Reset form
    setSelectedFiles([]);
    setTenderId('');
    setDocumentType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tender ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tender ID *
                </label>
                <input
                  type="text"
                  value={tenderId}
                  onChange={(e) => setTenderId(e.target.value)}
                  placeholder="Enter tender ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type *
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select type</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Technical Specs">Technical Specifications</option>
                  <option value="Financial">Financial Documents</option>
                  <option value="Legal">Legal Documents</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Files *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,application/pdf"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Click to select PDF files or drag and drop</span>
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Only PDF files are allowed</p>
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Files ({selectedFiles.length})
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getFileIcon(file.name)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSubmit}
              disabled={uploading || selectedFiles.length === 0 || !tenderId || !documentType}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}</span>
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

export default UploadModal; 