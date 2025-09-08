import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BoardItem, ItemType } from '../types';
import { STICKERS } from '../constants';

interface BoardItemProps {
  item: BoardItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  // FIX: Corrected typo 'Board-Item' to 'BoardItem'
  onUpdate: (item: BoardItem) => void;
  onBringToFront: (id: string) => void;
  onDelete: (id: string) => void;
  canvasScale: number;
}

const BoardItemComponent: React.FC<BoardItemProps> = ({ item, isSelected, onSelect, onUpdate, onBringToFront, onDelete, canvasScale }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const aspectRatio = item.width / item.height;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing) return;
    onSelect(item.id);
    onBringToFront(item.id);
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX / canvasScale - item.x,
      y: e.clientY / canvasScale - item.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (isEditing) return;
    onSelect(item.id);
    onBringToFront(item.id);
    setIsDragging(true);
    dragStartPos.current = {
      x: e.touches[0].clientX / canvasScale - item.x,
      y: e.touches[0].clientY / canvasScale - item.y,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX / canvasScale - dragStartPos.current.x;
      const newY = e.clientY / canvasScale - dragStartPos.current.y;
      onUpdate({ ...item, x: newX, y: newY });
    }
  }, [isDragging, canvasScale, item, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartPos.current = {
        x: e.clientX / canvasScale,
        y: e.clientY / canvasScale,
        width: item.width,
        height: item.height,
    };
  };

  const handleResizeTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartPos.current = {
        x: e.touches[0].clientX / canvasScale,
        y: e.touches[0].clientY / canvasScale,
        width: item.width,
        height: item.height,
    };
  };

  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
      if (isResizing) {
          const dx = (e.clientX / canvasScale) - resizeStartPos.current.x;
          const newWidth = Math.max(50, resizeStartPos.current.width + dx);
          const newHeight = newWidth / aspectRatio;
          onUpdate({ ...item, width: newWidth, height: newHeight });
      }
  }, [isResizing, canvasScale, item, onUpdate, aspectRatio]);

  const handleResizeMouseUp = useCallback(() => {
      setIsResizing(false);
  }, []);
  
  const handleTextChange = () => {
    if (textRef.current) {
        onUpdate({ ...item, content: textRef.current.innerText });
    }
  };
  
  const handleDoubleClick = () => {
    if (item.type === ItemType.TEXT) {
        setIsEditing(true);
    }
  }
  
  const handleTextBlur = () => {
    setIsEditing(false);
    handleTextChange();
  }

  useEffect(() => {
    if (isEditing && textRef.current) {
        textRef.current.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(textRef.current);
        sel?.removeAllRanges();
        sel?.addRange(range);
    }
  }, [isEditing]);
  
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
        if (isDragging) {
            const newX = e.touches[0].clientX / canvasScale - dragStartPos.current.x;
            const newY = e.touches[0].clientY / canvasScale - dragStartPos.current.y;
            onUpdate({ ...item, x: newX, y: newY });
        }
    };
    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, canvasScale, item, onUpdate]);

  useEffect(() => {
    const handleResizeTouchMove = (e: TouchEvent) => {
        if (isResizing) {
            const dx = (e.touches[0].clientX / canvasScale) - resizeStartPos.current.x;
            const newWidth = Math.max(50, resizeStartPos.current.width + dx);
            const newHeight = newWidth / aspectRatio;
            onUpdate({ ...item, width: newWidth, height: newHeight });
        }
    };
    const handleResizeTouchEnd = () => {
        setIsResizing(false);
    };

    if (isResizing) {
        window.addEventListener('mousemove', handleResizeMouseMove);
        window.addEventListener('mouseup', handleResizeMouseUp);
        window.addEventListener('touchmove', handleResizeTouchMove);
        window.addEventListener('touchend', handleResizeTouchEnd);
    }
    return () => {
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
        window.removeEventListener('touchmove', handleResizeTouchMove);
        window.removeEventListener('touchend', handleResizeTouchEnd);
    }
  }, [isResizing, handleResizeMouseMove, handleResizeMouseUp, canvasScale, item, onUpdate, aspectRatio]);
  
  const renderContent = () => {
    switch (item.type) {
      case ItemType.IMAGE:
        return <img src={item.content} alt="vision board item" className="w-full h-full object-cover pointer-events-none" draggable="false" />;
      case ItemType.TEXT:
        return (
          <div
            ref={textRef}
            contentEditable={isEditing}
            onBlur={handleTextBlur}
            onInput={handleTextChange}
            className={`w-full h-full p-2 text-2xl font-semibold break-words ${isEditing ? 'focus:outline-none' : ''}`}
            style={{ color: 'white', cursor: isEditing ? 'text' : 'inherit' }}
            suppressContentEditableWarning={true}
          >
            {item.content}
          </div>
        );
      case ItemType.STICKER:
        const StickerComponent = STICKERS[item.content];
        return StickerComponent ? <StickerComponent className="w-full h-full text-yellow-400 pointer-events-none" /> : null;
    }
  };

  return (
    <div
      ref={itemRef}
      className={`absolute select-none transition-shadow duration-200 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: `rotate(${item.rotation}deg)`,
        zIndex: item.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
    >
        <div className={`relative w-full h-full border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}>
            {renderContent()}
            {isSelected && (
                 <>
                    <button onClick={() => onDelete(item.id)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-50 hover:bg-red-600 transition-colors">
                        &times;
                    </button>
                    {item.type === ItemType.IMAGE && (
                        <div
                            onMouseDown={handleResizeMouseDown}
                            onTouchStart={handleResizeTouchStart}
                            className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-sm cursor-nwse-resize z-50"
                            aria-label="Resize image"
                        />
                    )}
                </>
            )}
        </div>
    </div>
  );
};

export default BoardItemComponent;