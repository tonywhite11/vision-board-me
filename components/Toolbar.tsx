
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
      className="p-3 bg-gray-700/50 backdrop-blur-sm rounded-lg text-white hover:bg-blue-600 transition-colors duration-200"
    >
      {children}
    </button>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 p-2 bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700 shadow-lg">
        <ToolButton onClick={() => { setShowImagePanel(!showImagePanel); setShowStickerPanel(false); }} tooltip="Add Image">
          <AddImageIcon className="w-6 h-6" />
        </ToolButton>
        <ToolButton onClick={onAddText} tooltip="Add Text">
          <AddTextIcon className="w-6 h-6" />
        </ToolButton>
        <ToolButton onClick={() => { setShowStickerPanel(!showStickerPanel); setShowImagePanel(false); }} tooltip="Add Sticker">
          <AddStickerIcon className="w-6 h-6" />
        </ToolButton>
        <div className="w-px h-8 bg-gray-600 mx-2"></div>
        <ToolButton onClick={onShuffle} tooltip="Shuffle Items">
          <ShuffleIcon className="w-6 h-6" />
        </ToolButton>
        <ToolButton onClick={onExport} tooltip="Export as PNG">
          <ExportIcon className="w-6 h-6" />
        </ToolButton>
      </div>

      {showImagePanel && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-2.5rem)] max-w-sm sm:w-80 p-4 bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-700 shadow-lg flex flex-col gap-3">
          <h3 className="text-white font-semibold text-center">Add an Image</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your vision... (e.g., a modern beachfront house at sunset)"
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 resize-none"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerateImage}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold p-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Generate with AI'}
          </button>
          <div className="flex items-center gap-2">
            <hr className="flex-grow border-gray-600" />
            <span className="text-gray-400 text-sm">OR</span>
            <hr className="flex-grow border-gray-600" />
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-600 text-white font-semibold p-2 rounded-md hover:bg-gray-700 transition-colors">
            Upload from Device
          </button>
        </div>
      )}
      
      {showStickerPanel && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-2.5rem)] max-w-sm sm:w-80 p-4 bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-700 shadow-lg grid grid-cols-4 gap-4">
            {Object.keys(STICKERS).map(key => {
                const Sticker = STICKERS[key];
                return (
                    <button key={key} onClick={() => onAddSticker(key)} className="p-2 bg-gray-700 rounded-lg text-yellow-400 hover:bg-gray-600 transition-colors">
                        <Sticker className="w-10 h-10 mx-auto" />
                    </button>
                )
            })}
        </div>
      )}
    </>
  );
};

export default Toolbar;
