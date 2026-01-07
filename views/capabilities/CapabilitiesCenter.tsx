import React, { useState } from 'react';
import ModelRegistry from './ModelRegistry';
import PromptLab from './PromptLab';
import { Box, Terminal, Cpu } from 'lucide-react';

const CapabilitiesCenter = () => {
  const [activeTab, setActiveTab] = useState<'registry' | 'lab'>('registry');

  return (
    <div className="h-full flex flex-col relative bg-slate-50">
      {/* Compact Header: Single row for Title and Navigation to save vertical space */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
             <Cpu className="w-5 h-5" />
           </div>
           <div>
             <h2 className="text-base font-bold text-slate-900 leading-tight">模型仓库</h2>
             <p className="text-xs text-slate-500">AI 资产全生命周期管理与提示词工程</p>
           </div>
        </div>
        
        {/* Segmented Tab Control */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
           <button 
             onClick={() => setActiveTab('registry')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${
               activeTab === 'registry' 
               ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5' 
               : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
             }`}
           >
             <Box className="w-4 h-4" /> 模型能力
           </button>
           <button 
             onClick={() => setActiveTab('lab')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${
               activeTab === 'lab' 
               ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5' 
               : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
             }`}
           >
             <Terminal className="w-4 h-4" /> 提示词实验室
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
         {activeTab === 'registry' && <ModelRegistry />}
         {activeTab === 'lab' && <PromptLab />}
      </div>
    </div>
  );
};

export default CapabilitiesCenter;