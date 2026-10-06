import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  isLoading?: boolean;
}

export function ImageUploader({ onImageSelect, onImageRemove, isLoading }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Please upload an image file (JPG, PNG)');
      return;
    }
    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageRemove();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 transition-colors cursor-pointer flex flex-col items-center justify-center text-center ${
            dragActive ? 'border-forest-green bg-soft-mint/50' : 'border-gray-300 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/jpeg, image/png, image/jpg"
            onChange={handleChange}
          />
          <div className="bg-soft-mint p-4 rounded-full mb-4">
            <UploadCloud className="w-8 h-8 text-forest-green" />
          </div>
          <h3 className="text-lg font-semibold text-main-text mb-1">Click to upload or drag and drop</h3>
          <p className="text-sm text-secondary-text mb-6">JPG, JPEG or PNG (max. 5MB)</p>
          <button type="button" className="btn-primary" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
            Browse Files
          </button>
        </div>
      ) : (
        <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
          <img src={preview} alt="Preview" className="w-full h-auto max-h-[400px] object-contain" />
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-forest-green animate-spin mb-4" />
              <p className="text-main-text font-medium animate-pulse">Analyzing plant leaf...</p>
            </div>
          )}

          {!isLoading && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={handleRemove}
                className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-error-red transition-colors"
                title="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
