import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, Eye, Trash2, Calendar, FileText, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';
import { useDocument, type DownloadRecord } from '../context/DocumentContext';
import { documentAPI } from '../services/api';
import UploadModal from '../components/UploadModal';
import DownloadHistory from '../components/DownloadHistory';
import DownloadModal from '../components/DownloadModal';

const Documents = () => {
  const { getFilteredDocuments, addDocument, deleteDocument, state, setAllDocuments, addDownloadRecord, clearDownloadHistory, loadDownloadHistory } = useDocument();
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Get download history from context
  const downloadHistory = state.downloadHistory;

  const documents = getFilteredDocuments();

  // Load all documents from uploads folder on component mount
  useEffect(() => {
    loadAllDocuments();
  }, []);

  // Load download history when the page is accessed
  useEffect(() => {
    loadDownloadHistory();
  }, [loadDownloadHistory]);

  const loadAllDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentAPI.getAll();
      const serverDocuments = response.documents || [];
      
      // Convert server documents to match our document format
      const formattedDocuments = serverDocuments.map((doc: any) => ({
        id: doc.id,
        tender_id: doc.tender_id,
        document_type: doc.document_type,
        filename: doc.filename,
        file_path: doc.file_path,
        saved_filename: doc.saved_filename,
        file_size: doc.file_size,
        uploaded_at: new Date(doc.uploaded_at * 1000).toISOString(), // Convert Unix timestamp to ISO string
        status: doc.status
      }));
      
      // Clear existing documents and add all server documents
      // This ensures we have the exact state from the server
      setAllDocuments(formattedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: File[], tenderId: string, documentType: string) => {
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tender_id', tenderId);
        formData.append('document_type', documentType);

        console.log('Uploading file:', file.name);
        console.log('Tender ID:', tenderId);
        console.log('Document Type:', documentType);

        const response = await documentAPI.upload(formData);
        
        console.log('Upload response:', response);
        
        // Extract filename from the saved file path
        const savedFilename = response.file_path.split('\\').pop() || file.name;
        
        // Add to context
        const newDocument = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          tender_id: tenderId,
          document_type: documentType,
          filename: file.name,
          file_path: response.file_path,
          saved_filename: savedFilename,
          file_size: file.size,
          uploaded_at: new Date().toISOString(),
          status: 'completed' as const,
        };
        
        addDocument(newDocument);
      }
      
      alert('Documents uploaded successfully!');
      setShowUploadModal(false);
      // Refresh documents list after upload
      await loadAllDocuments();
    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to upload documents. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = `Upload failed: ${error.response.data.detail}`;
      } else if (error.message) {
        errorMessage = `Upload failed: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (selectedDocs: any[], zipName: string) => {
    setDownloading(true);
    try {
      console.log('Creating ZIP file:', zipName);
      console.log('Selected documents:', selectedDocs);
      
      // Create a real ZIP file by downloading and bundling the actual documents
      const zip = new JSZip();
      
      // Download each selected document and add it to the ZIP
      for (const doc of selectedDocs) {
        try {
          const filename = doc.saved_filename || doc.file_path.split('\\').pop() || doc.filename;
          const downloadUrl = `http://localhost:8000/files/${filename}`;
          
          console.log('Downloading file for ZIP:', filename, 'URL:', downloadUrl);
          
          // Fetch the file content
          const response = await fetch(downloadUrl);
          if (!response.ok) {
            throw new Error(`Failed to download ${filename}: ${response.statusText}`);
          }
          
          const fileBlob = await response.blob();
          
          // Add file to ZIP with original filename
          zip.file(doc.filename, fileBlob);
          
        } catch (error) {
          console.error(`Error downloading ${doc.filename}:`, error);
          // Continue with other files even if one fails
        }
      }
      
      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link for the ZIP file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${zipName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      URL.revokeObjectURL(link.href);
      
      // Add to download history
      const newDownload = {
        id: Date.now().toString(),
        zipName: zipName,
        downloadDate: new Date().toISOString(),
        documents: selectedDocs
      };
      
      await addDownloadRecord(newDownload);
      
      alert('ZIP file downloaded successfully!');
      setShowDownloadModal(false);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to create ZIP file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleViewFile = (doc: any) => {
    const filename = doc.saved_filename || doc.file_path.split('\\').pop() || doc.filename;
    const viewUrl = `http://localhost:8000/files/${filename}`;
    
    console.log('Viewing file:', filename, 'URL:', viewUrl);
    
    window.open(viewUrl, '_blank');
  };

  const handleDownloadFile = (doc: any) => {
    const filename = doc.saved_filename || doc.file_path.split('\\').pop() || doc.filename;
    const downloadUrl = `http://localhost:8000/files/${filename}`;
    
    console.log('Downloading file:', filename, 'URL:', downloadUrl);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-600 mt-2">Upload and manage your tender documents (PDF files only)</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add File</span>
        </button>
        
        <button
          onClick={() => setShowDownloadModal(true)}
          disabled={documents.length === 0}
          className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>

        <button
          onClick={loadAllDocuments}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Documents List */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">All Documents</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Total: {documents.length} documents
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {loading && documents.length === 0 && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading documents...</p>
            </div>
          )}
          
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{getFileIcon(doc.filename)}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{doc.filename}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>Tender: {doc.tender_id}</span>
                    <span>Type: {doc.document_type}</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>Uploaded: {formatDate(doc.uploaded_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleViewFile(doc)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  title="View file"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDownloadFile(doc)}
                  className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => deleteDocument(doc.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  title="Delete file"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {documents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
            <p className="text-gray-500">
              Upload your first PDF document to get started with tender management.
            </p>
          </div>
        )}
      </div>

      {/* Download History */}
      <div className="card">
        <DownloadHistory downloads={downloadHistory} onClearHistory={clearDownloadHistory} />
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Storage</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatFileSize(documents.reduce((total, doc) => total + doc.file_size, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(doc => {
                  const uploadDate = new Date(doc.uploaded_at);
                  const now = new Date();
                  return uploadDate.getMonth() === now.getMonth() && 
                         uploadDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        uploading={uploading}
      />

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        documents={documents}
        onDownload={handleDownload}
        downloading={downloading}
      />
    </div>
  );
};

export default Documents; 