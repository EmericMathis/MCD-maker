import React, { useEffect } from 'react';
import { ModelingCanvas } from './components/ModelingCanvas';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { useThemeStore } from './store/themeStore';

function App() {
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div className={`w-full h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Toolbar />
      <Sidebar />
      <ModelingCanvas />
    </div>
  );
}

export default App;