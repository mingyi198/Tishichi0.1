import React, { useState } from 'react';
import ReversePromptGenerator from './pages/ReversePromptGenerator';
import PromptModifier from './pages/PromptModifier';
import { AppView } from './types';
import Button from './components/Button';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.ReversePrompt);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 shadow-md py-4 px-6 md:px-8 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-blue-400">Gemini 提示词助手</h1>
        <nav className="space-x-4">
          <Button
            onClick={() => setCurrentView(AppView.ReversePrompt)}
            variant={currentView === AppView.ReversePrompt ? 'primary' : 'secondary'}
            size="sm"
          >
            反推图片提示词
          </Button>
          <Button
            onClick={() => setCurrentView(AppView.ModifyPrompt)}
            variant={currentView === AppView.ModifyPrompt ? 'primary' : 'secondary'}
            size="sm"
          >
            修改提示词
          </Button>
        </nav>
      </header>

      <main className="flex-grow py-8">
        <div className={currentView === AppView.ReversePrompt ? '' : 'hidden'}>
          <ReversePromptGenerator />
        </div>
        <div className={currentView === AppView.ModifyPrompt ? '' : 'hidden'}>
          <PromptModifier />
        </div>
      </main>

      <footer className="bg-gray-800 text-gray-400 text-center py-4 text-sm mt-8">
        © {new Date().getFullYear()} Gemini 提示词助手. 由 Google Gemini 提供支持.
      </footer>
    </div>
  );
}

export default App;