
import React, { useState, useCallback } from 'react';
import { BoardItem, CanvasTransform, ItemType } from './types';
import VisionBoard from './components/VisionBoard';
import Toolbar from './components/Toolbar';
import EditPanel from './components/EditPanel';

const App: React.FC = () => {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [transform, setTransform] = useState<CanvasTransform>({ scale: 1, x: 0, y: 0 });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [zIndexCounter, setZIndexCounter] = useState(1);
  
  const selectedItem = items.find(item => item.id === selectedItemId);

  const addItem = (item: Omit<BoardItem, 'id' | 'zIndex'>) => {
    const newZIndex = zIndexCounter + 1;
    setItems(prev => [...prev, { ...item, id: Date.now().toString(), zIndex: newZIndex }]);
    setZIndexCounter(newZIndex);
  };

  const handleAddImage = (base64: string) => {
    const img = new Image();
    img.onload = () => {
        const aspectRatio = img.width / img.height;
        const width = 300;
        const height = width / aspectRatio;
        addItem({
            type: ItemType.IMAGE,
            content: base64,
            x: (window.innerWidth / 2 - transform.x) / transform.scale - width / 2,
            y: (window.innerHeight / 2 - transform.y) / transform.scale - height / 2,
            width,
            height,
            rotation: 0
        });
    }
    img.src = base64;
  };

  const handleAddText = () => {
    const width = 250;
    const height = 50;
    addItem({
      type: ItemType.TEXT,
      content: 'Your Goal Here',
      x: (window.innerWidth / 2 - transform.x) / transform.scale - width / 2,
      y: (window.innerHeight / 2 - transform.y) / transform.scale - height / 2,
      width,
      height,
      rotation: 0
    });
  };

  const handleAddSticker = (sticker: string) => {
    const width = 100;
    const height = 100;
    addItem({
        type: ItemType.STICKER,
        content: sticker,
        x: (window.innerWidth / 2 - transform.x) / transform.scale - width / 2,
        y: (window.innerHeight / 2 - transform.y) / transform.scale - height / 2,
        width,
        height,
        rotation: 0,
    });
  };

  const handleUpdateItem = useCallback((updatedItem: BoardItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  }, [selectedItemId]);

  const handleSelectItem = useCallback((id: string | null) => {
    setSelectedItemId(id);
  }, []);

  const handleBringToFront = useCallback((id: string) => {
    const newZIndex = zIndexCounter + 1;
    setItems(prev => prev.map(item => item.id === id ? { ...item, zIndex: newZIndex } : item));
    setZIndexCounter(newZIndex);
  }, [zIndexCounter]);
  
  const handleShuffle = () => {
      setItems(prev => prev.map(item => ({
          ...item,
          x: Math.random() * 3000,
          y: Math.random() * 2000,
          rotation: Math.random() * 40 - 20
      })));
  };
  
  const handleExport = () => {
      const boardContent = document.getElementById('vision-board-content');
      if (boardContent && window.html2canvas) {
          const originalScale = transform.scale;
          // Temporarily reset transform for capture
          const originalTransform = boardContent.style.transform;
          boardContent.style.transform = '';
          
          window.html2canvas(boardContent, {
              width: 5000,
              height: 5000,
              x: 0,
              y: 0,
              backgroundColor: '#1f2937'
          }).then((canvas: any) => {
              const link = document.createElement('a');
              link.download = 'vision-board.png';
              link.href = canvas.toDataURL('image/png');
              link.click();

              // Restore transform
              boardContent.style.transform = originalTransform;
          });
      }
  };

  return (
    <main className="w-screen h-screen bg-gray-900 text-white relative">
      <div className="absolute top-5 left-5 z-20 bg-black/30 p-2 rounded-lg">
        <h1 className="text-xl font-bold">Vision Board Maker</h1>
        <p className="text-sm text-gray-300">Manifest your goals visually</p>
      </div>

      <VisionBoard
        items={items}
        transform={transform}
        selectedItemId={selectedItemId}
        onTransformChange={setTransform}
        onSelectItem={handleSelectItem}
        onUpdateItem={handleUpdateItem}
        onBringToFront={handleBringToFront}
        onDeleteItem={handleDeleteItem}
      />

      <Toolbar 
        onAddImage={handleAddImage} 
        onAddText={handleAddText} 
        onAddSticker={handleAddSticker}
        onShuffle={handleShuffle}
        onExport={handleExport}
        />
      
      {selectedItem && selectedItem.type === ItemType.IMAGE && (
        <EditPanel 
          selectedItem={selectedItem}
          onUpdateItem={handleUpdateItem}
          onClose={() => setSelectedItemId(null)}
        />
      )}
    </main>
  );
};

export default App;
