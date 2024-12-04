import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Undo, Redo, Moon, Sun } from 'lucide-react';
import { useModelingStore } from '../store/modelingStore';
import { useThemeStore } from '../store/themeStore';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { sql, history, currentHistoryIndex, undo, redo } = useModelingStore((state) => ({
    sql: state.generateSQL(),
    history: state.history,
    currentHistoryIndex: state.currentHistoryIndex,
    undo: state.undo,
    redo: state.redo,
  }));

  const { isDark, toggleTheme } = useThemeStore();

  return (
    <div
      className={`fixed right-0 top-0 h-screen transition-all duration-300 z-40 
      ${isOpen ? 'w-96' : 'w-12'}
      ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute -left-3 top-1/2 transform -translate-y-1/2 rounded-full p-1 shadow-md
        ${isDark ? 'bg-gray-700' : 'bg-white'}`}
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {isOpen && (
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Project Details</h2>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={undo}
                disabled={currentHistoryIndex <= 0}
                className={`p-2 rounded ${
                  currentHistoryIndex <= 0 ? 'opacity-40' : `hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'}`
                }`}
              >
                <Undo size={16} />
              </button>
              <button
                onClick={redo}
                disabled={currentHistoryIndex >= history.length - 1}
                className={`p-2 rounded ${
                  currentHistoryIndex >= history.length - 1
                    ? 'opacity-40'
                    : `hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'}`
                }`}
              >
                <Redo size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="h-1/3 mb-4 overflow-hidden">
              <h3 className="font-semibold mb-2">History</h3>
              <div className="overflow-y-auto h-[calc(100%-2rem)] space-y-1">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${
                      index === currentHistoryIndex
                        ? isDark ? 'bg-blue-900' : 'bg-blue-100'
                        : `hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'}`
                    }`}
                  >
                    {entry.action}
                  </div>
                ))}
              </div>
            </div>

            <div className="h-2/3 overflow-hidden">
              <h3 className="font-semibold mb-2">Generated SQL</h3>
              <pre className={`p-4 rounded text-sm h-[calc(100%-2rem)] overflow-auto
                ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {sql}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}