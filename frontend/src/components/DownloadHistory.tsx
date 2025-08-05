import React, { useState } from 'react';
import { Download, Calendar, FileText, X, Eye } from 'lucide-react';

interface DownloadRecord {
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

interface DownloadHistoryProps {
  downloads: DownloadRecord[];
  onClearHistory?: () => void;
}

const DownloadHistory = ({ downloads, onClearHistory }: DownloadHistoryProps) => {
  const [selectedDownload, setSelectedDownload] = useState<DownloadRecord | null>(null);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Download History</h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">{downloads.length} downloads</span>
          {downloads.length > 0 && onClearHistory && (
            <button
              onClick={onClearHistory}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear History
            </button>
          )}
        </div>
      </div>

      {downloads.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No download history</h3>
          <p className="text-gray-500">Download history will appear here after you create ZIP files.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((download) => (
            <div
              key={download.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedDownload(download)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Download className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{download.zipName}.zip</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(download.downloadDate)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{download.documents.length} file{download.documents.length !== 1 ? 's' : ''}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Download Details Modal */}
      {selectedDownload && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setSelectedDownload(null)}
            ></div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Download Details</h3>
                  <button
                    onClick={() => setSelectedDownload(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{selectedDownload.zipName}.zip</h4>
                    <p className="text-sm text-gray-500">
                      Downloaded on {formatDate(selectedDownload.downloadDate)}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">
                      Included Documents ({selectedDownload.documents.length})
                    </h5>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                      <div className="divide-y divide-gray-200">
                        {selectedDownload.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center p-3">
                            <span className="text-lg mr-3">{getFileIcon(doc.filename)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {doc.filename}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span>Tender: {doc.tender_id}</span>
                                <span>Type: {doc.document_type}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setSelectedDownload(null)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadHistory; 