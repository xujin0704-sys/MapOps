import React, { useState } from 'react';
import { 
    Workflow,
    BookOpen,
    GitBranch,
    Rocket,
    CheckCircle,
    RotateCcw
} from 'lucide-react';
import { PipelineFlowEditor } from './pipeline/PipelineFlowEditor';
import { SOPManager } from './pipeline/SOPManager';

type Tab = 'flow' | 'sop';

const PipelineOrchestrator = () => {
  const [activeTab, setActiveTab] = useState<Tab>('flow');

  return (
    <div className="h-full flex flex-col relative bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600 border border-purple-100">
                    <Workflow className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">产线编排</h2>
                    <p className="text-xs text-slate-500">定义作业流程与标准化操作规范 (SOP)</p>
                </div>
             </div>
             
             <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                    onClick={() => setActiveTab('flow')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${
                        activeTab === 'flow' 
                        ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    <GitBranch className="w-4 h-4" /> 流程编排
                </button>
                <button 
                    onClick={() => setActiveTab('sop')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${
                        activeTab === 'sop' 
                        ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    <BookOpen className="w-4 h-4" /> 作业 SOP
                </button>
             </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-hidden px-6 pt-4 pb-0 relative">
                {activeTab === 'flow' ? <PipelineFlowEditor /> : <SOPManager />}
            </div>
            
            {/* Bottom Action Bar */}
            <div className="h-16 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 mt-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                 <div className="flex items-center gap-4 text-xs text-slate-500">
                    {activeTab === 'flow' ? (
                        <>
                            <span>当前产线版本: <span className="font-mono font-bold text-slate-700">v2.1.0</span></span>
                            <span className="w-px h-3 bg-slate-300"></span>
                            <span>上次部署: 2小时前</span>
                        </>
                    ) : (
                        <>
                            <span>SOP 库版本: <span className="font-mono font-bold text-slate-700">v1.5</span></span>
                            <span className="w-px h-3 bg-slate-300"></span>
                            <span>已发布规程: 12</span>
                        </>
                    )}
                 </div>
                 
                 <div className="flex items-center gap-3">
                     <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                        <RotateCcw className="w-3.5 h-3.5" /> 重置更改
                     </button>
                     <button className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-lg text-white text-sm font-bold shadow-md shadow-primary-200 transition-all active:scale-95 flex items-center gap-2">
                         {activeTab === 'flow' ? <Rocket className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                         {activeTab === 'flow' ? '部署产线' : '发布规范'}
                     </button>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default PipelineOrchestrator;