export interface CocoClassInfo {
  id: number;
  name: string;
  category: string;
  color: string;
}

export const COCO_CLASSES: CocoClassInfo[] = [
  { id: 0, name: 'person', category: 'person', color: '#ef4444' },
  { id: 1, name: 'bicycle', category: 'vehicle', color: '#f97316' },
  { id: 2, name: 'car', category: 'vehicle', color: '#f59e0b' },
  { id: 3, name: 'motorcycle', category: 'vehicle', color: '#eab308' },
  { id: 4, name: 'airplane', category: 'vehicle', color: '#84cc16' },
  { id: 5, name: 'bus', category: 'vehicle', color: '#22c55e' },
  { id: 6, name: 'train', category: 'vehicle', color: '#10b981' },
  { id: 7, name: 'truck', category: 'vehicle', color: '#14b8a6' },
  { id: 8, name: 'boat', category: 'vehicle', color: '#06b6d4' },
  { id: 9, name: 'traffic light', category: 'outdoor', color: '#0ea5e9' },
  { id: 10, name: 'fire hydrant', category: 'outdoor', color: '#3b82f6' },
  { id: 11, name: 'stop sign', category: 'outdoor', color: '#6366f1' },
  { id: 12, name: 'parking meter', category: 'outdoor', color: '#8b5cf6' },
  { id: 13, name: 'bench', category: 'outdoor', color: '#a855f7' },
  { id: 14, name: 'bird', category: 'animal', color: '#d946ef' },
  { id: 15, name: 'cat', category: 'animal', color: '#ec4899' },
  { id: 16, name: 'dog', category: 'animal', color: '#f43f5e' },
  { id: 17, name: 'horse', category: 'animal', color: '#fb7185' },
  { id: 18, name: 'sheep', category: 'animal', color: '#fda4af' },
  { id: 19, name: 'cow', category: 'animal', color: '#fca5a5' },
  { id: 20, name: 'elephant', category: 'animal', color: '#fdba74' },
  { id: 21, name: 'bear', category: 'animal', color: '#fde047' },
  { id: 22, name: 'zebra', category: 'animal', color: '#a3e635' },
  { id: 23, name: 'giraffe', category: 'animal', color: '#86efac' },
  { id: 24, name: 'backpack', category: 'accessory', color: '#6ee7b7' },
  { id: 25, name: 'umbrella', category: 'accessory', color: '#5eead4' },
  { id: 26, name: 'handbag', category: 'accessory', color: '#67e8f9' },
  { id: 27, name: 'tie', category: 'accessory', color: '#7dd3fc' },
  { id: 28, name: 'suitcase', category: 'accessory', color: '#93c5fd' },
  { id: 29, name: 'frisbee', category: 'sports', color: '#a5b4fc' },
  { id: 30, name: 'skis', category: 'sports', color: '#c4b5fd' },
  { id: 31, name: 'snowboard', category: 'sports', color: '#d8b4fe' },
  { id: 32, name: 'sports ball', category: 'sports', color: '#f0abfc' },
  { id: 33, name: 'kite', category: 'sports', color: '#f472b6' },
  { id: 34, name: 'baseball bat', category: 'sports', color: '#fb7185' },
  { id: 35, name: 'baseball glove', category: 'sports', color: '#38bdf8' },
  { id: 36, name: 'skateboard', category: 'sports', color: '#34d399' },
  { id: 37, name: 'surfboard', category: 'sports', color: '#4ade80' },
  { id: 38, name: 'tennis racket', category: 'sports', color: '#a3e635' },
  { id: 39, name: 'bottle', category: 'kitchen', color: '#facc15' },
  { id: 40, name: 'wine glass', category: 'kitchen', color: '#fb923c' },
  { id: 41, name: 'cup', category: 'kitchen', color: '#f87171' },
  { id: 42, name: 'fork', category: 'kitchen', color: '#e879f9' },
  { id: 43, name: 'knife', category: 'kitchen', color: '#c084fc' },
  { id: 44, name: 'spoon', category: 'kitchen', color: '#818cf8' },
  { id: 45, name: 'bowl', category: 'kitchen', color: '#60a5fa' },
  { id: 46, name: 'banana', category: 'food', color: '#eab308' },
  { id: 47, name: 'apple', category: 'food', color: '#ef4444' },
  { id: 48, name: 'sandwich', category: 'food', color: '#f97316' },
  { id: 49, name: 'orange', category: 'food', color: '#fb923c' },
  { id: 50, name: 'broccoli', category: 'food', color: '#22c55e' },
  { id: 51, name: 'carrot', category: 'food', color: '#f97316' },
  { id: 52, name: 'hot dog', category: 'food', color: '#dc2626' },
  { id: 53, name: 'pizza', category: 'food', color: '#b91c1c' },
  { id: 54, name: 'donut', category: 'food', color: '#ec4899' },
  { id: 55, name: 'cake', category: 'food', color: '#d946ef' },
  { id: 56, name: 'chair', category: 'furniture', color: '#64748b' },
  { id: 57, name: 'couch', category: 'furniture', color: '#475569' },
  { id: 58, name: 'potted plant', category: 'furniture', color: '#16a34a' },
  { id: 59, name: 'bed', category: 'furniture', color: '#334155' },
  { id: 60, name: 'dining table', category: 'furniture', color: '#1e293b' },
  { id: 61, name: 'toilet', category: 'furniture', color: '#0f172a' },
  { id: 62, name: 'tv', category: 'electronic', color: '#3b82f6' },
  { id: 63, name: 'laptop', category: 'electronic', color: '#2563eb' },
  { id: 64, name: 'mouse', category: 'electronic', color: '#1d4ed8' },
  { id: 65, name: 'remote', category: 'electronic', color: '#1e40af' },
  { id: 66, name: 'keyboard', category: 'electronic', color: '#1e3a8a' },
  { id: 67, name: 'cell phone', category: 'electronic', color: '#6366f1' },
  { id: 68, name: 'microwave', category: 'appliance', color: '#7c3aed' },
  { id: 69, name: 'oven', category: 'appliance', color: '#6d28d9' },
  { id: 70, name: 'toaster', category: 'appliance', color: '#5b21b6' },
  { id: 71, name: 'sink', category: 'appliance', color: '#4c1d95' },
  { id: 72, name: 'refrigerator', category: 'appliance', color: '#0891b2' },
  { id: 73, name: 'book', category: 'indoor', color: '#059669' },
  { id: 74, name: 'clock', category: 'indoor', color: '#d97706' },
  { id: 75, name: 'vase', category: 'indoor', color: '#ca8a04' },
  { id: 76, name: 'scissors', category: 'indoor', color: '#ea580c' },
  { id: 77, name: 'teddy bear', category: 'indoor', color: '#f59e0b' },
  { id: 78, name: 'hair drier', category: 'indoor', color: '#e11d48' },
  { id: 79, name: 'toothbrush', category: 'indoor', color: '#be123c' },
];

export const getCocoClass = (idOrName?: number | string | null): CocoClassInfo => {
  if (idOrName === undefined || idOrName === null || idOrName === '') {
    return { id: 999, name: 'object', category: 'custom', color: '#6366f1' };
  }
  if (typeof idOrName === 'number') {
    return COCO_CLASSES[idOrName] || { id: idOrName, name: `class_${idOrName}`, category: 'custom', color: '#6366f1' };
  }
  const str = String(idOrName).toLowerCase().trim();
  return (
    COCO_CLASSES.find((c) => c.name.toLowerCase() === str) || {
      id: 999,
      name: String(idOrName),
      category: 'custom',
      color: '#6366f1',
    }
  );
};
