import React from 'react';
import { Plus, Download } from 'lucide-react';
import { useModelingStore } from '../store/modelingStore';
import { useThemeStore } from '../store/themeStore';

export function Toolbar() {
  const generateSQL = useModelingStore((state) => state.generateSQL);
  const addEntity = useModelingStore((state) => state.addEntity);
  const isDark = useThemeStore((state) => state.isDark);

  const handleAddEntity = () => {
    addEntity({
      id: `entity-${Date.now()}`,
      name: 'New Entity',
      attributes: [
        {
          id: `attr-${Date.now()}`,
          name: 'id',
          type: 'SERIAL',
          isPrimary: true,
          isNullable: false,
        },
      ],
      position: { x: 50 + Math.random() * 300, y: 50 + Math.random() * 300 },
    });
  };

  const handleExportSQL = () => {
    const sql = generateSQL();
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed top-4 left-4 flex flex-row gap-2 z-50">
      <button
        onClick={handleAddEntity}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 cursor-pointer select-none
        ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
        text-white`}
      >
        <Plus size={16} />
        <span>Add Entity</span>
      </button>
      
      <button
        onClick={handleExportSQL}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 cursor-pointer select-none
        ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}
        text-white`}
      >
        <Download size={16} />
        <span>Export SQL</span>
      </button>
    </div>
  );
}