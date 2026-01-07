import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Bot
} from 'lucide-react';
import { ClueWarehouse } from './cluePool/ClueWarehouse';
import { PackagingPolicy } from './cluePool/PackagingPolicy';

const CluePool = () => {
  const [activeTab, setActiveTab] = useState('warehouse');

  return (
    <div className="h-full flex flex-col relative bg-slate-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
             <Sparkles className="w-5 h-5" />
           </div>
           <div>
             <h2 className="text-base font-bold text-slate-900 leading-tight">作业线索池</h2>
             <p className="text-xs text-slate-500">线索的分拣、聚合与打包中心</p>
           </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
           <button 
             onClick={() => setActiveTab('warehouse')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${
               activeTab === 'warehouse' 
               ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5' 
               : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
             }`}
           >
             <Layers className="w-4 h-4" /> 线索分仓
           </button>
           <button 
             onClick={() => setActiveTab('policy')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${
               activeTab === 'policy' 
               ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5' 
               : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
             }`}
           >
             <Bot className="w-4 h-4" /> 自动打包策略
           </button>
        </div>
      </header>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
        {activeTab === 'warehouse' ? <ClueWarehouse /> : <PackagingPolicy />}
      </div>
    </div>
  );
};

export default CluePool;