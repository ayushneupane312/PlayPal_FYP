import React from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({ 
  id, 
  label, 
  selectedImages = [],
  onChange,
  onRemove,
  maxImages = 10,
  required = false
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition cursor-pointer">
        <input
          type="file"
          id={id}
          onChange={onChange}
          accept="image/*"
          multiple
          className="hidden"
          required={required && selectedImages.length === 0}
        />
        <label htmlFor={id} className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">Add Images</p>
          <p className="text-xs text-gray-500">
            Click to upload multiple images (Max {maxImages})
          </p>
          {selectedImages.length > 0 && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              {selectedImages.length} image(s) selected
            </p>
          )}
        </label>
      </div>

      {/* Image Preview Grid */}
      {selectedImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {image.name.length > 20 ? image.name.substring(0, 20) + '...' : image.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}