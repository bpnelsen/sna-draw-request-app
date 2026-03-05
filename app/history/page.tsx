'use client';

import { useEffect, useState } from 'react';
import { Download, Trash2, Loader } from 'lucide-react';

interface UploadRecord {
  id: string;
  fileName: string;
  originalFileName: string;
  uploadDate: string;
  status: 'success' | 'error';
  downloadUrl?: string;
  errorMessage?: string;
}

export default function HistoryPage() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/history');
      const data = await response.json();
      setUploads(data.uploads || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUploads(uploads.filter((u) => u.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sna-navy mb-2">Upload History</h1>
        <p className="text-gray-600">
          View and download all previously processed files
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader className="w-6 h-6 animate-spin text-sna-teal" />
        </div>
      ) : uploads.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No uploads yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Go to the <a href="/" className="text-sna-teal hover:underline">upload page</a> to get started
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sna-navy text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">File Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Upload Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {uploads.map((upload) => (
                  <tr key={upload.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {upload.originalFileName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {upload.fileName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(upload.uploadDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {upload.status === 'success' ? (
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ✓ Success
                        </span>
                      ) : (
                        <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ✗ Error
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {upload.status === 'success' && upload.downloadUrl && (
                          <a
                            href={upload.downloadUrl}
                            download
                            className="inline-flex items-center gap-1 px-3 py-2 bg-sna-teal text-white rounded hover:bg-opacity-90 transition text-sm font-semibold"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(upload.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
