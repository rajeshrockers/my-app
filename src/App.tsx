import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import './App.css';
import { Item } from './types';
import { initialData } from './data/initialData'

function DraggableItem({ item, onDrop, activeId }: { item: Item; onDrop: (event: DragEndEvent) => void; activeId: string | null }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: item.id });
  const { setNodeRef: setDroppableRef } = useDroppable({ id: item.id });

  const isActive = activeId === item.id;
  const isParent = item.wbs.split('.').length === 1;
  return (
    <>
      <tr
        ref={setDroppableRef}
        className={`droppable-row ${isActive ? 'dragging-row' : ''} ${isParent ? 'parent-row' : ''}`}
      >
        <td>{item.wbs}</td>
        <td>
          <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="draggable-label"
          >
            {item.label}
          </div>
        </td>
        <td className="actions">
          <button className="add-btn">＋</button>
        </td>
      </tr>
      {item.children.map((child) => (
        <DraggableItem key={child.id} item={child} onDrop={onDrop} activeId={activeId} />
      ))}
    </>
  );
}

function removeItem(tree: Item[], id: string): [Item | null, Item[]] {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    if (item.id === id) {
      tree.splice(i, 1);
      return [item, tree];
    }
    const [found, children] = removeItem(item.children, id);
    if (found) {
      item.children = children;
      return [found, tree];
    }
  }
  return [null, tree];
}

function isDescendant(parent: Item, childId: string): boolean {
  for (const child of parent.children) {
    if (child.id === childId || isDescendant(child, childId)) {
      return true;
    }
  }
  return false;
}

function App() {
  const [data, setData] = useState<Item[]>(initialData);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeItem = (function findItem(items: Item[]): Item | null {
    for (const item of items) {
      if (item.id === activeId) return item;
      const found = findItem(item.children);
      if (found) return found;
    }
    return null;
  })(data);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const newData = [...data];
    const [draggedItem, reducedTree] = removeItem(newData, String(active.id));

    if (!draggedItem) return;

    const insertItem = (tree: Item[]): boolean => {
      for (let item of tree) {
        if (item.id === over.id) {
          if (isDescendant(draggedItem, item.id)) return false;
          item.children.push(draggedItem);
          return true;
        }
        if (insertItem(item.children)) return true;
      }
      return false;
    };

    const success = insertItem(reducedTree);
    if (!success) reducedTree.push(draggedItem);
    setData([...reducedTree]);
  };
  return (
    <div className="app-table">
      <h2>WBS Activity Table</h2>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <table>
          <thead>
            <tr>
              <th>WBS</th>
              <th>Activity Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <DraggableItem key={item.id} item={item} onDrop={handleDragEnd} activeId={activeId} />
            ))}
          </tbody>
        </table>
        <DragOverlay>
          {activeItem ? (
            <table className="drag-overlay-table">
              <tbody>
                <tr className="drag-overlay-row">
                  <td>{activeItem.wbs}</td>
                  <td>{activeItem.label}</td>
                  <td className="actions">
                    <button className="add-btn">＋</button>
                    <button className="comment-btn">💬</button>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default App;
