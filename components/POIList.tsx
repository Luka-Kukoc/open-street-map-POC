'use client';

import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';
import { POI } from '@/app/page';

interface POIListProps {
  pois: POI[];
  onRemovePOI: (id: string) => void;
  onReorderPOIs: (startIndex: number, endIndex: number) => void;
}

export function POIList({ pois, onRemovePOI, onReorderPOIs }: POIListProps) {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      onReorderPOIs(dragIndex, dropIndex);
    }
  };

  return (
    <div className="space-y-2">
      {pois.map((poi, index) => (
        <div
          key={poi.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-move group"
        >
          <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-semibold rounded-full">
                {index + 1}
              </span>
              <span className="font-medium text-gray-900 truncate">
                {poi.name}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {poi.lat.toFixed(6)}, {poi.lng.toFixed(6)}
            </div>
          </div>
          
          <Button
            onClick={() => onRemovePOI(poi.id)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}