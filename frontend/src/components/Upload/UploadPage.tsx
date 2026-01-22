import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { uploadAPI } from '../../services/api';
import type { FileUploadResult } from '../../types';

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [demandType, setDemandType] = useState<'Hard Demand' | 'Soft Demand'>('Hard Demand');
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<FileUploadResult[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.name.match(/\.(xlsx|xls|xlsm)$/i)
    );

    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  }, []);

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  // Remove file from list
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadResults([]);

    try {
      const result = await uploadAPI.uploadFiles(files, demandType);
      setUploadResults(result.results);

      // Clear files after successful upload
      if (result.success) {
        setFiles([]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  // Clear all data
  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }

    try {
      await uploadAPI.clearAllData();
      alert('All data cleared successfully');
      setUploadResults([]);
    } catch (error) {
      console.error('Clear data error:', error);
      alert(`Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Budget Trackers</h1>
          <p className="text-gray-600 mt-2">
            Upload Excel budget tracker files to extract hours data and populate analytics dashboards
          </p>
        </div>
        <button
          onClick={handleClearData}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
        >
          <Trash2 size={18} />
          Clear All Data
        </button>
      </div>

      {/* Demand Type Selection */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Demand Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="demandType"
              value="Hard Demand"
              checked={demandType === 'Hard Demand'}
              onChange={(e) => setDemandType(e.target.value as 'Hard Demand')}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span>Hard Demand</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="demandType"
              value="Soft Demand"
              checked={demandType === 'Soft Demand'}
              onChange={(e) => setDemandType(e.target.value as 'Soft Demand')}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span>Soft Demand</span>
          </label>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`card border-2 border-dashed transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 bg-white'
        }`}
      >
        <div className="text-center py-12">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-primary-600 hover:text-primary-700 font-medium">
                Click to upload
              </span>
              <span className="text-gray-600"> or drag and drop</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                accept=".xlsx,.xls,.xlsm"
                onChange={handleFileInput}
                className="sr-only"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Excel files (.xlsx, .xls, .xlsm) up to 50MB each
          </p>
        </div>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Selected Files ({files.length})</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="text-green-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Upload Results</h3>
          <div className="space-y-3">
            {uploadResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-md border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  ) : (
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{result.filename}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {result.recordsImported} records imported
                    </p>

                    {result.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-800">Errors:</p>
                        <ul className="text-sm text-red-700 list-disc list-inside">
                          {result.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.warnings.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-yellow-800">Warnings:</p>
                        <ul className="text-sm text-yellow-700 list-disc list-inside">
                          {result.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">File Requirements</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Files must be Excel format (.xlsx, .xls, or .xlsm)</li>
          <li>Must contain a "Detail" sheet with budget tracker format</li>
          <li>Row 3 should contain week dates (starting from column H)</li>
          <li>Row 4 should contain phase names</li>
          <li>Row 5 should contain milestone names</li>
          <li>Row 6 onwards should contain employee data with hours per week</li>
          <li>Employee ID should be in column B</li>
          <li>Resource Name should be in column C</li>
        </ul>
      </div>
    </div>
  );
}
