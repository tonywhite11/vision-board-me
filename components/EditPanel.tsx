import React, { useState } from 'react';
import { BoardItem } from '../types';
import { editImage } from '../services/geminiService';

interface EditPanelProps {
  selectedItem: BoardItem;
  onUpdateItem: (item: BoardItem) => void;
  onClose: () => void;
}

const EditPanel: React.FC<EditPanelProps> = ({ selectedItem, onUpdateItem, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const newImageBase64 = await editImage(selectedItem.content, prompt);
      onUpdateItem({ ...selectedItem, content: newImageBase64 });
      setPrompt('');
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to edit image. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:top-5 md:left-auto md:right-5 md:translate-x-0 md:translate-y-0 z-20 w-[calc(100%-2.5rem)] max-w-sm md:w-80 bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-700 shadow-lg p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
             <h2 className="text-white font-bold text-lg">Magic Edit</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
      
        <img src={selectedItem.content} alt="Selected item" className="w-full h-40 object-contain rounded-md bg-gray-700" />
      
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your edit... (e.g., change the background to a beach, make it night time)"
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 resize-none"
            disabled={isLoading}
        />
        <button
            onClick={handleEdit}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white font-semibold p-2 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed flex justify-center items-center"
        >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Apply Edit'}
        </button>
    </div>
  );
};

export default EditPanel;