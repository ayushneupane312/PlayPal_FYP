import React from 'react';
import { Upload, FileText } from 'lucide-react';
import { RequiredMark } from '../../components/RequiredMark';

export default function FileUpload({ 
  id, 
  label, 
  accept = ".pdf,image/*", 
  required = false,
  selectedFile,
  onChange,
  maxSize = "10MB",
  description = "PDF or Image"
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required ? <RequiredMark className="inline" /> : null}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition cursor-pointer">
        <input
          type="file"
          id={id}
          onChange={onChange}
          accept={accept}
          className="hidden"
          required={required}
        />
        <label htmlFor={id} className="cursor-pointer">
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            {selectedFile ? (
              <span className="text-green-600 font-medium flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                {selectedFile.name}
              </span>
            ) : (
              'Drop files here or click to upload'
            )}
          </p>
          <p className="text-xs text-gray-500">{description} • Max {maxSize}</p>
        </label>
      </div>
    </div>
  );
}