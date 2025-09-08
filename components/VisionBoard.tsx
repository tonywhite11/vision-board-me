import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BoardItem, CanvasTransform } from '../types';
import BoardItemComponent from './BoardItem';

interface VisionBoardProps {
  items: BoardItem[];
  transform: CanvasTransform;
  selectedItemId: string | null;
  onTransformChange: (transform: CanvasTransform) => void;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (item: BoardItem) => void;
  onBringToFront: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

const VisionBoard: React.FC<VisionBoardProps> = ({ items, transform, selectedItemId, onTransformChange, onSelectItem, onUpdateItem, onBringToFront, onDeleteItem }) => {
  const [isPanning, setIsPanning] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const panStartPos = useRef({ x: 0, y: 0 });
  const pinchState = useRef({ initialDistance: 0, lastScale: 1 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || e.target !== boardRef.current?.firstChild) return;
    setIsPanning(true);
    panStartPos.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    };
    onSelectItem(null);
  };

  // FIX: Change `touches` type to handle both native TouchList and React.TouchList
  const getDistance = (touches: TouchList | React.TouchList) => {
    const [touch1, touch2] = [touches[0], touches[1]];
    return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target !== boardRef.current?.firstChild) return;

    if (e.touches.length === 2) {
      setIsPanning(false);
      setIsPinching(true);
      pinchState.current = { initialDistance: getDistance(e.touches), lastScale: transform.scale };
    } else if (e.touches.length === 1) {
      setIsPinching(false);
      setIsPanning(true);
      panStartPos.current = { x: e.touches[0].clientX - transform.x, y: e.touches[0].clientY - transform.y };
    }
    onSelectItem(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.2, transform.scale + scaleAmount), 3);
    
    if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = transform.x + (mouseX - transform.x) * (1 - newScale / transform.scale);
        const newY = transform.y + (mouseY - transform.y) * (1 - newScale / transform.scale);
        
        onTransformChange({ scale: newScale, x: newX, y: newY });
    }
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      const newX = e.clientX - panStartPos.current.x;
      const newY = e.clientY - panStartPos.current.y;
      onTransformChange({ ...transform, x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (isPanning && e.touches.length === 1) {
        const newX = e.touches[0].clientX - panStartPos.current.x;
        const newY = e.touches[0].clientY - panStartPos.current.y;
        onTransformChange({ ...transform, x: newX, y: newY });
      } else if (isPinching && e.touches.length === 2) {
        const currentDistance = getDistance(e.touches);
        const scaleFactor = currentDistance / pinchState.current.initialDistance;
        const newScale = Math.min(Math.max(0.2, pinchState.current.lastScale * scaleFactor), 3);
        
        if (boardRef.current) {
            const rect = boardRef.current.getBoundingClientRect();
            const [t1, t2] = [e.touches[0], e.touches[1]];
            const midpointX = (t1.clientX + t2.clientX) / 2 - rect.left;
            const midpointY = (t1.clientY + t2.clientY) / 2 - rect.top;
    
            const newX = transform.x + (midpointX - transform.x) * (1 - newScale / transform.scale);
            const newY = transform.y + (midpointY - transform.y) * (1 - newScale / transform.scale);
            
            onTransformChange({ scale: newScale, x: newX, y: newY });
        }
      }
    };
    
    const handleInteractionEnd = () => {
      setIsPanning(false);
      setIsPinching(false);
    };

    if (isPanning || isPinching) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('mouseup', handleInteractionEnd);
      window.addEventListener('touchend', handleInteractionEnd);
      window.addEventListener('touchcancel', handleInteractionEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
      window.removeEventListener('touchcancel', handleInteractionEnd);
    }
  }, [isPanning, isPinching, transform, onTransformChange]);


  return (
    <div
      ref={boardRef}
      className="w-full h-full bg-gray-800 overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      style={{ touchAction: 'none' }}
    >
      <div
        id="vision-board-content"
        className="transform-origin-top-left"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          width: '5000px',
          height: '5000px',
          backgroundSize: '40px 40px',
          backgroundImage: 'radial-gradient(circle, #4a5568 1px, rgba(0, 0, 0, 0) 1px)',
        }}
      >
        {items.map(item => (
          <BoardItemComponent
            key={item.id}
            item={item}
            isSelected={selectedItemId === item.id}
            onSelect={onSelectItem}
            onUpdate={onUpdateItem}
            onBringToFront={onBringToFront}
            onDelete={onDeleteItem}
            canvasScale={transform.scale}
          />
        ))}
      </div>
    </div>
  );
};

export default VisionBoard;