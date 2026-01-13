
import React, { useState } from 'react';
import SourceHub from './SourceHub';
import DataTriage from './DataTriage';
import DataInspection from './DataInspection';
import { Archive, Split, Database, Microscope } from 'lucide-react';
import { INITIAL_MOCK_ASSETS } from './SourceHub'; // Exporting mock data for initial state

const ResourceMarket = () => {
  const [activeTab, setActiveTab] = useState<'inspection' | 'hub' | 'triage'>('inspection');
  
  // Shared state for the assets in Source Hub
  const [hubAssets, setHubAssets] = useState(INITIAL_MOCK_ASSETS);

  // Handler to promote a batch from DataInspection to SourceHub
  const handlePromoteToHub = (assetData: any) => {
    setHubAssets(prev => [assetData, ...prev]);
    // Optional: Switch tab to hub to see the result
    // setActiveTab('hub'); 
  };

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
             <p className="text-xs text-slate-500">全源数据统一接入、质量探查与分诊中心</p>
           </div>
        </div>
        
        {/* Segmented Tab Control */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
           <button 
             onClick={() => setActiveTab('inspection')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${
               activeTab === 'inspection' 
               ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5' 
               : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
             }`}
           >
             <Microscope className="w-4 h-4" /> 资料探查
           </button>
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
         {activeTab === 'inspection' && (
            <DataInspection onPromoted={handlePromoteToHub} />
         )}
         {activeTab === 'hub' && (
            <SourceHub assets={hubAssets} setAssets={setHubAssets} />
         )}
         {activeTab === 'triage' && (
            <DataTriage />
         )}
      </div>
    </div>
  );
};

export default ResourceMarket;
