import React, { useState } from 'react';
import SourceHub from './SourceHub';
import DataTriage from './DataTriage';
import { Archive, Split, Database } from 'lucide-react';

const ResourceMarket = () => {
  const [activeTab, setActiveTab] = useState<'hub' | 'triage'>('hub');

  return (
    <div className="h-full flex flex-col relative bg-slate-50">
      {/* Compact Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
             <Database className="w-5 h-5" />
           </div>
           <div>
             <h2 className="text-base font-bold text-slate-900 leading-tight">资料集市</h2>
             <p className="text-xs text-slate-500">全源数据统一存储与智能分诊中心</p>
           </div>
        </div>
        
        {/* Segmented Tab Control */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
           <button 
             onClick={() => setActiveTab('hub')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${
               activeTab === 'hub' 
               ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5' 
               : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
             }`}
           >
             <Archive className="w-4 h-4" /> 源资集市
           </button>
           <button 
             onClick={() => setActiveTab('triage')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${
               activeTab === 'triage' 
               ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5' 
               : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
             }`}
           >
             <Split className="w-4 h-4" /> 资料分诊台
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
         {activeTab === 'hub' && <SourceHub />}
         {activeTab === 'triage' && <DataTriage />}
      </div>
    </div>
  );
};

export default ResourceMarket;