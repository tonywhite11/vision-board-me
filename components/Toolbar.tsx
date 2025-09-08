
import React, { useState, useRef } from 'react';
import { AddImageIcon, AddTextIcon, AddStickerIcon, ShuffleIcon, ExportIcon } from './icons';
import { generateImageFromText } from '../services/geminiService';
import { STICKERS } from '../constants';

interface ToolbarProps {
  onAddImage: (base64: string) => void;
  onAddText: () => void;
  onAddSticker: (sticker: string) => void;
  onShuffle: () => void;
  onExport: () => void;
}

const ToolButton: React.FC<{ children: React.ReactNode; onClick: () => void; tooltip: string }> = ({ children, onClick, tooltip }) => (
  <div className="relative group">
    <button
      onClick={onClick}
      className="p-3 sm:p-3 min-w-[44px] min-h-[44px] bg-gray-700/50 backdrop-blur-sm rounded-lg text-white hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
      aria-label={tooltip}
    >
      {children}
    </button>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
      {tooltip}
    </div>
  </div>
);

const Toolbar: React.FC<ToolbarProps> = ({ onAddImage, onAddText, onAddSticker, onShuffle, onExport }) => {
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const base64Image = await generateImageFromText(prompt);
      onAddImage(base64Image);
      setShowImagePanel(false);
      setPrompt('');
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onAddImage(e.target?.result as string);
        setShowImagePanel(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Overlay to close panels when clicking outside */}
      {(showImagePanel || showStickerPanel) && (
        <div 
          className="fixed inset-0 z-10 bg-black/20" 
          onClick={() => {
            setShowImagePanel(false);
            setShowStickerPanel(false);
          }}
        />
      )}
      
      <div className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3 p-2 bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-700 shadow-lg max-w-[95vw] overflow-x-auto safe-area-bottom">
        <ToolButton onClick={() => { setShowImagePanel(!showImagePanel); setShowStickerPanel(false); }} tooltip="Add Image">
          <AddImageIcon className="w-6 h-6" />
        </ToolButton>
        <ToolButton onClick={onAddText} tooltip="Add Text">
          <AddTextIcon className="w-6 h-6" />
        </ToolButton>
        <ToolButton onClick={() => { setShowStickerPanel(!showStickerPanel); setShowImagePanel(false); }} tooltip="Add Sticker">
          <AddStickerIcon className="w-6 h-6" />
        </ToolButton>
        <div className="w-px h-8 bg-gray-600 mx-1 sm:mx-2"></div>
        <ToolButton onClick={onShuffle} tooltip="Shuffle Items">
          <ShuffleIcon className="w-6 h-6" />
        </ToolButton>
        <ToolButton onClick={onExport} tooltip="Export as PNG">
          <ExportIcon className="w-6 h-6" />
        </ToolButton>
      </div>

      {showImagePanel && (
        <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-1rem)] max-w-sm sm:w-80 p-4 bg-gray-800/95 backdrop-blur-md rounded-xl border border-gray-700 shadow-lg flex flex-col gap-3 max-h-[calc(100vh-8rem)] overflow-y-auto mobile-panel safe-area-bottom">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-semibold">Add an Image</h3>
            <button 
              onClick={() => setShowImagePanel(false)} 
              className="text-gray-400 hover:text-white text-xl leading-none p-1"
              aria-label="Close panel"
            >
              ×
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your vision... (e.g., a modern beachfront house at sunset)"
            className="w-full bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 resize-none text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerateImage}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold p-3 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed flex justify-center items-center min-h-[44px]"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Generate with AI'}
          </button>
          <div className="flex items-center gap-2">
            <hr className="flex-grow border-gray-600" />
            <span className="text-gray-400 text-sm">OR</span>
            <hr className="flex-grow border-gray-600" />
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-full bg-gray-600 text-white font-semibold p-3 rounded-md hover:bg-gray-700 active:bg-gray-800 transition-colors min-h-[44px]"
          >
            Upload from Device
          </button>
        </div>
      )}
      
      {showStickerPanel && (
        <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-1rem)] max-w-sm sm:w-80 p-4 bg-gray-800/95 backdrop-blur-md rounded-xl border border-gray-700 shadow-lg max-h-[calc(100vh-8rem)] overflow-y-auto mobile-panel safe-area-bottom">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-semibold">Add Sticker</h3>
            <button 
              onClick={() => setShowStickerPanel(false)} 
              className="text-gray-400 hover:text-white text-xl leading-none p-1"
              aria-label="Close panel"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Object.keys(STICKERS).map(key => {
                const Sticker = STICKERS[key];
                return (
                    <button 
                      key={key} 
                      onClick={() => {
                        onAddSticker(key);
                        setShowStickerPanel(false);
                      }} 
                      className="p-3 bg-gray-700 rounded-lg text-yellow-400 hover:bg-gray-600 active:bg-gray-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={`Add ${key} sticker`}
                    >
                        <Sticker className="w-8 h-8" />
                    </button>
                )
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Toolbar;
