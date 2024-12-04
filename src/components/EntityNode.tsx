import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Edit2, Plus, X } from 'lucide-react';
import { useModelingStore } from '../store/modelingStore';
import { useThemeStore } from '../store/themeStore';
import { Entity, Attribute } from '../types';

interface EntityNodeProps {
  data: Entity;
}

export function EntityNode({ data }: EntityNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(data.name);
  const [editedAttributes, setEditedAttributes] = useState([...data.attributes]);
  const { updateEntity, removeEntity } = useModelingStore();
  const isDark = useThemeStore((state) => state.isDark);

  const handleSave = () => {
    updateEntity(data.id, {
      name: editedName,
      attributes: editedAttributes,
    });
    setIsEditing(false);
  };

  const addAttribute = () => {
    setEditedAttributes([
      ...editedAttributes,
      {
        id: `attr-${Date.now()}`,
        name: 'newAttribute',
        type: 'VARCHAR(255)',
        isPrimary: false,
        isNullable: true,
      },
    ]);
  };

  const removeAttribute = (attrId: string) => {
    setEditedAttributes(editedAttributes.filter((attr) => attr.id !== attrId));
  };

  const updateAttribute = (attrId: string, updates: Partial<Attribute>) => {
    setEditedAttributes(
      editedAttributes.map((attr) =>
        attr.id === attrId ? { ...attr, ...updates } : attr
      )
    );
  };

  return (
    <div className={`rounded-lg shadow-lg p-4 min-w-[250px] ${
      isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    }`}>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />

      <div className="flex justify-between items-center mb-2">
        {isEditing ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className={`border rounded px-2 py-1 text-lg font-bold w-full ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            }`}
            autoFocus
          />
        ) : (
          <h3 className="font-bold text-lg">{data.name}</h3>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-500 hover:text-blue-700"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => removeEntity(data.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          {editedAttributes.map((attr) => (
            <div key={attr.id} className="flex items-center gap-2">
              <input
                type="text"
                value={attr.name}
                onChange={(e) =>
                  updateAttribute(attr.id, { name: e.target.value })
                }
                className={`border rounded px-2 py-1 text-sm flex-1 ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="text"
                value={attr.type}
                onChange={(e) =>
                  updateAttribute(attr.id, { type: e.target.value })
                }
                className={`border rounded px-2 py-1 text-sm w-24 ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              />
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={attr.isPrimary}
                  onChange={(e) =>
                    updateAttribute(attr.id, { isPrimary: e.target.checked })
                  }
                />
                PK
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={attr.isNullable}
                  onChange={(e) =>
                    updateAttribute(attr.id, { isNullable: e.target.checked })
                  }
                />
                Null
              </label>
              <button
                onClick={() => removeAttribute(attr.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <button
              onClick={addAttribute}
              className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={14} /> Add Attribute
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {data.attributes.map((attr) => (
            <div key={attr.id} className="flex items-center text-sm">
              <span className={attr.isPrimary ? 'font-bold' : ''}>
                {attr.name}
              </span>
              <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                ({attr.type})
                {attr.isPrimary && ' 🔑'}
                {attr.isNullable && ' ⃝'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}