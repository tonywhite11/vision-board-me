
export enum ItemType {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  STICKER = 'STICKER',
}

export interface BoardItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string; // For IMAGE: base64 src, for TEXT: string content, for STICKER: key/name
  zIndex: number;
}

export interface CanvasTransform {
  scale: number;
  x: number;
  y: number;
}

declare global {
  interface Window {
    html2canvas: any;
  }
}
