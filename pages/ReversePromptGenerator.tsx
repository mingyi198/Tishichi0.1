
import React, { useState, useCallback } from 'react';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageUpload from '../components/ImageUpload';
import { reverseImagePrompt } from '../services/geminiService';
import { ImagePrompt } from '../types';

const ReversePromptGenerator: React.FC = () => {
  const [imagePrompts, setImagePrompts] = useState<ImagePrompt[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const handleFilesProcessed = useCallback((newImages: Omit<ImagePrompt, 'prompt' | 'isLoading' | 'error'>[]) => {
    setImagePrompts(prev => {
      const newImagePrompts = newImages.map(img => ({
        ...img,
        prompt: '',
        isLoading: false,
        error: null,
      }));
      // Filter out duplicates if newImages contain images already in prev based on id
      const uniqueNewImages = newImagePrompts.filter(
        (newImg) => !prev.some((existingImg) => existingImg.id === newImg.id)
      );
      return [...prev, ...uniqueNewImages];
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setImagePrompts([]);
  }, []);

  const generatePromptForImage = useCallback(async (id: string) => {
    setImagePrompts(prev =>
      prev.map(img => (img.id === id ? { ...img, isLoading: true, error: null } : img))
    );

    const imageToProcess = imagePrompts.find(img => img.id === id);
    if (!imageToProcess) return;

    try {
      const imagePart = {
        inlineData: {
          mimeType: imageToProcess.mimeType, // Use the correct mimeType
          data: imageToProcess.base64,
        },
      };
      const prompt = await reverseImagePrompt([imagePart]);
      setImagePrompts(prev =>
        prev.map(img => (img.id === id ? { ...img, prompt, isLoading: false } : img))
      );
    } catch (error) {
      console.error('Error generating prompt:', error);
      setImagePrompts(prev =>
        prev.map(img => (img.id === id ? { ...img, error: error instanceof Error ? error.message : String(error), isLoading: false } : img))
      );
    }
  }, [imagePrompts]);

  const generateAllPrompts = useCallback(async () => {
    setIsGeneratingAll(true);
    for (const image of imagePrompts) {
      if (!image.prompt && !image.isLoading) { // Only generate for images without a prompt yet
        await generatePromptForImage(image.id);
      }
    }
    setIsGeneratingAll(false);
  }, [imagePrompts, generatePromptForImage]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('提示词已复制到剪贴板！');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('复制提示词到剪贴板失败。');
    });
  }, []);

  const removeImagePrompt = useCallback((id: string) => {
    setImagePrompts(prev => prev.filter(img => img.id !== id));
  }, []);

  const anyImageWithoutPrompt = imagePrompts.some(img => !img.prompt && !img.isLoading && !img.error);
  const anyLoading = imagePrompts.some(img => img.isLoading);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-3xl font-bold text-center text-gray-100 mb-8">反推图片提示词</h2>

      <ImageUpload onFilesProcessed={handleFilesProcessed} onClearAll={handleClearAll} uploadedImages={imagePrompts} />

      {imagePrompts.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-end mb-4">
            <Button
              onClick={generateAllPrompts}
              disabled={isGeneratingAll || anyLoading || !anyImageWithoutPrompt}
              className="mr-2"
            >
              {isGeneratingAll ? '生成中...' : '批量生成提示词'}
            </Button>
          </div>

          <div className="space-y-6">
            {imagePrompts.map((image) => (
              <div key={image.id} className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col md:flex-row gap-4 relative">
                <button
                  onClick={() => removeImagePrompt(image.id)}
                  className="absolute top-3 right-3 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                  aria-label="移除图片和提示词"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex-shrink-0 w-full md:w-48 h-48 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={`data:${image.mimeType};base64,${image.base64}`}
                    alt={image.filename}
                    className="object-contain max-h-full max-w-full"
                  />
                </div>

                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">{image.filename}</h3>
                  {image.isLoading ? (
                    <LoadingSpinner />
                  ) : image.error ? (
                    <div className="text-red-400 p-3 bg-red-900/30 rounded-md">
                      错误: {image.error}
                      <Button onClick={() => generatePromptForImage(image.id)} className="ml-4" size="sm">重试</Button>
                    </div>
                  ) : image.prompt ? (
                    <div>
                      <div className="bg-gray-700 text-gray-200 p-4 rounded-md text-sm max-h-32 overflow-y-auto mb-3 custom-scrollbar">
                        {image.prompt}
                      </div>
                      <Button onClick={() => copyToClipboard(image.prompt)} size="sm">
                        复制提示词
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => generatePromptForImage(image.id)} disabled={image.isLoading}>
                      生成提示词
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReversePromptGenerator;