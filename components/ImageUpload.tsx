
import React, { useState, useCallback, useRef } from 'react';
import Button from './Button';
import { ImagePrompt } from '../types';

interface ImageUploadProps {
  onFilesProcessed: (images: Omit<ImagePrompt, 'prompt' | 'isLoading' | 'error'>[]) => void;
  onClearAll: () => void;
  uploadedImages: Omit<ImagePrompt, 'prompt' | 'isLoading' | 'error'>[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFilesProcessed, onClearAll, uploadedImages }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsBase64 = async (file: File): Promise<{ filename: string; base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve({
          filename: file.name,
          base64: base64String,
          mimeType: file.type,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: Omit<ImagePrompt, 'prompt' | 'isLoading' | 'error'>[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        console.warn(`Skipping non-image file: ${file.name}`);
        continue;
      }
      try {
        const { filename, base64, mimeType } = await readFileAsBase64(file);
        newImages.push({ id: crypto.randomUUID(), filename, base64, mimeType });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }
    onFilesProcessed(newImages);
  }, [onFilesProcessed]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Clear the input value to allow selecting the same file(s) again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const handleDeleteImage = useCallback((id: string) => {
    onFilesProcessed(uploadedImages.filter(img => img.id !== id));
  }, [uploadedImages, onFilesProcessed]);

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ease-in-out
          ${isDragOver ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800 hover:border-blue-600'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-gray-400 mb-4">将图片拖放到此处，或</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          ref={fileInputRef}
        />
        <Button onClick={() => fileInputRef.current?.click()} type="button" variant="secondary">
          浏览文件
        </Button>
      </div>

      {uploadedImages.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">已上传图片:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-64 overflow-y-auto pr-2">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative group overflow-hidden rounded-lg shadow-md">
                <img
                  src={`data:${image.mimeType};base64,${image.base64}`}
                  alt={image.filename}
                  className="w-full h-24 object-cover object-center"
                />
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`移除 ${image.filename}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <Button onClick={onClearAll} variant="danger" size="sm">
              清除所有图片
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;