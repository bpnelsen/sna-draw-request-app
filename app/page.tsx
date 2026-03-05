'use client';

import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }

      setSuccess(true);
      setDownloadLink(data.downloadUrl);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setDownloadLink(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-sna-navy/10">
          <h1 className="text-3xl font-bold text-sna-navy mb-2">
            SNA Draw Request Reorganizer
          </h1>
          <p className="text-gray-600 mb-8">
            Upload an Excel file to reorganize by SN Loan # with automatic totals per lot.
          </p>

          {/* Info Banner */}
          <div className="mb-8 p-4 bg-blue-50 border-l-4 border-sna-navy rounded">
            <p className="text-sm text-sna-navy font-semibold">
              📝 MVP Note: For production file processing, run the Python script locally or on your VPS.
            </p>
            <p className="text-xs text-sna-navy/70 mt-1">
              Download the script: <code className="bg-white px-2 py-1 rounded font-mono">reorganize_sna_draw_request.py</code>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drag Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-sna-teal bg-teal-50'
                  : 'border-gray-300 hover:border-sna-teal'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-sna-teal' : 'text-gray-400'}`} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {file ? file.name : 'Drag and drop your Excel file here'}
              </h3>
              <p className="text-sm text-gray-500">
                or click to select from your computer
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Excel files only (.xlsx, .xls)
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Error</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && downloadLink && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">Success!</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Your file has been reorganized successfully.
                  </p>
                  <a
                    href={downloadLink}
                    download
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm font-semibold"
                  >
                    Download Reorganized File
                  </a>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
                !file || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-sna-navy hover:bg-opacity-90'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit & Process'
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Upload your SNA Draw Request Excel file</li>
              <li>✓ File is reorganized by SN Loan # (Lot Name)</li>
              <li>✓ Each lot gets its own tab with a TOTAL row</li>
              <li>✓ Download your reorganized file immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
