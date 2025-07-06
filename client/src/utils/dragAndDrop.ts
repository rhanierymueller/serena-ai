export interface DragDropHandlers<T> {
  onDragStart: (e: React.DragEvent, item: T) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetItem: T) => void;
}

export interface DragDropState<T> {
  draggedItem: T | null;
  isDragging: boolean;
}

export const createDragDropHandlers = <T extends { id: number }>(
  items: T[],
  onReorder: (reorderedItems: T[]) => void,
  draggedItem: T | null,
  setDraggedItem: (item: T | null) => void
): DragDropHandlers<T> => {
  const handleDragStart = (e: React.DragEvent, item: T) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', item.id.toString());
    setDraggedItem(item);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItem: T) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetItem.id) {
      return;
    }

    const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
    const targetIndex = items.findIndex(item => item.id === targetItem.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newItems = [...items];
      const [draggedElement] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedElement);
      onReorder(newItems);
    }

    setDraggedItem(null);
  };

  return {
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  };
};

export const getDragItemStyle = (isDragged: boolean): React.CSSProperties => ({
  opacity: isDragged ? 0.5 : 1,
  transform: isDragged ? 'scale(0.95)' : 'scale(1)',
  transition: 'opacity 0.2s ease, transform 0.2s ease',
  cursor: 'move',
});

export const getDragDropZoneStyle = (isDragOver: boolean): React.CSSProperties => ({
  borderColor: isDragOver ? '#6DAEDB' : 'transparent',
  borderWidth: '2px',
  borderStyle: 'dashed',
  transition: 'border-color 0.2s ease',
});