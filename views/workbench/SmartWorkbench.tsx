import React, { useState } from 'react';
import { 
    Wand2, 
    MousePointer2, 
    Undo2, 
    Redo2, 
    FileText, 
    AlertTriangle, 
    Magnet, 
    Save,
    ChevronRight,
    HelpCircle,
    UserCheck,
    List,
    CheckSquare,
    Spline,
    ArrowLeftRight,
    MapPin,
    Footprints,
    Navigation2,
    Building2,
    Route,
    Landmark,
    Store,
    DoorOpen
} from 'lucide-react';
import { SCENARIO_DATA, MOCK_OPERATOR_TASKS } from '../../constants';
import { OperatorTask, OperatorTaskType } from '../../types';

// --- Sub-Components ---

const WorkbenchHeader = ({ task, onExit }: { task?: OperatorTask, onExit: () => void }) => (
    <header className="absolute top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2 text-sm">
            <button onClick={onExit} className="text-slate-500 hover:text-slate-800 transition-colors">我的任务</button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-semibold">{task ? `${task.id} (${task.type})` : '任务列表'}</span>
        </div>
        {task && (
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 font-medium">AI 置信度:</span>
                    <span className="font-bold text-emerald-600">{(task.aiConfidence * 100).toFixed(0)}%</span>
                </div>
                 <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 font-medium">SLA 剩余:</span>
                    <span className="font-bold text-amber-600">{task.slaHours}h</span>
                </div>
                 <div className="h-6 w-px bg-slate-200"></div>
                 <div className="flex items-center gap-2">
                     <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" title="挂起任务"><UserCheck className="w-4 h-4" /></button>
                     <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" title="快捷键帮助"><HelpCircle className="w-4 h-4" /></button>
                 </div>
            </div>
        )}
    </header>
);

const LeftTaskList = ({ mode }: { mode: string }) => (
    <aside className="absolute top-16 left-4 bottom-4 w-64 bg-white/95 backdrop-blur rounded-lg border border-slate-200 shadow-lg flex flex-col z-20">
        <div className="p-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase">任务包要素</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="p-2 bg-primary-50 border border-primary-200 rounded text-sm text-primary-700 font-medium cursor-pointer">
                {mode === 'LastMile' ? '小区南门入口' : '合并 A 区与 B 区'}
            </div>
            <div className="p-2 hover:bg-slate-50 rounded text-sm text-slate-600 cursor-pointer">
                {mode === 'LastMile' ? '3号楼单元通道' : '修正京哈高速边界'}
            </div>
        </div>
        <div className="p-2 border-t border-slate-100">
             <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50">
                <input type="checkbox" defaultChecked className="accent-primary-600 rounded" /> 
                <span className="text-xs font-medium text-slate-600">自动跳转下一条</span>
            </label>
        </div>
    </aside>
);

const LeftAddressPanel = () => (
    <aside className="absolute top-16 left-4 bottom-4 w-[340px] bg-white/95 backdrop-blur rounded-lg border border-slate-200 shadow-lg flex flex-col z-20">
        <div className="p-3 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-xs font-bold text-slate-500 uppercase">地址清洗台 (Address Parser)</h3>
             <button className="text-primary-600 text-xs font-bold hover:underline">批量标准化</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
             <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-primary-300 transition-colors cursor-pointer group">
                  <div className="text-xs text-slate-400 mb-1">原始: 北京市海淀区苏州街长远天地</div>
                  <div className="flex flex-wrap gap-1">
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">省:北京</span>
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">市:北京</span>
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">区:海淀</span>
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">POI:长远天地</span>
                  </div>
             </div>
             <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg shadow-sm cursor-pointer">
                  <div className="text-xs text-slate-400 mb-1">原始: 朝阳区三里屯SOHO A座</div>
                  <div className="flex flex-wrap gap-1">
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">区:朝阳</span>
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">POI:三里屯SOHO</span>
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium">楼:A座</span>
                  </div>
             </div>
        </div>
    </aside>
);

const Toolbar = ({ mode }: { mode: string }) => (
    <div className="absolute top-16 left-[280px] z-20 flex flex-col gap-2">
        <div className="bg-white p-1.5 rounded-lg flex flex-col gap-1 shadow-md border border-slate-200">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" title="选择"><MousePointer2 className="w-5 h-5" /></button>
            
            {mode === 'Foundation' && (
                <>
                    <button className="p-2 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 transition-colors" title="SAM 魔棒"><Wand2 className="w-5 h-5" /></button>
                    <div className="w-full h-px bg-slate-200 my-1"></div>
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" title="提取中线"><Spline className="w-5 h-5" /></button>
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" title="拓扑吸附"><Magnet className="w-5 h-5" /></button>
                </>
            )}

            {mode === 'LastMile' && (
                <>
                    <button className="p-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors" title="轨迹描摹"><Footprints className="w-5 h-5" /></button>
                    <div className="w-full h-px bg-slate-200 my-1"></div>
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" title="门址标记"><Navigation2 className="w-5 h-5" /></button>
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" title="单元连线"><ArrowLeftRight className="w-5 h-5" /></button>
                </>
            )}

             {mode === 'Location' && (
                <>
                     <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" title="落点纠偏"><MapPin className="w-5 h-5" /></button>
                     <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" title="父子挂接"><Building2 className="w-5 h-5" /></button>
                </>
            )}
        </div>
        <div className="bg-white p-1.5 rounded-lg flex flex-col gap-1 shadow-md border border-slate-200">
             <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"><Undo2 className="w-5 h-5" /></button>
             <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"><Redo2 className="w-5 h-5" /></button>
        </div>
    </div>
);

const ContextPanel = ({ mode }: { mode: string }) => {
    const [activeTab, setActiveTab] = useState('evidence');

    return (
        <aside className="absolute top-16 right-4 bottom-4 w-80 bg-white/95 backdrop-blur rounded-lg border border-slate-200 shadow-lg flex flex-col z-20">
            <div className="flex border-b border-slate-100 p-1">
                <button onClick={() => setActiveTab('props')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${activeTab==='props' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>属性</button>
                <button onClick={() => setActiveTab('evidence')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${activeTab==='evidence' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>依据</button>
                <button onClick={() => setActiveTab('qa')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${activeTab==='qa' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>质检</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {activeTab === 'evidence' && (
                     <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold text-sm">
                            <FileText className="w-4 h-4 text-slate-400" /> 依据 (O1)
                        </div>
                        {mode === 'LastMile' ? (
                            <div className="grid grid-cols-2 gap-2">
                                <img src="https://images.unsplash.com/photo-1618038483079-bfe64dcb17f1?auto=format&fit=crop&q=80&w=200&h=200" className="rounded-lg border border-slate-200 shadow-sm" alt="Entrance" />
                                <img src="https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=200&h=200" className="rounded-lg border border-slate-200 shadow-sm" alt="Building" />
                                <div className="col-span-2 text-xs text-slate-500 mt-1">骑手上传的 POV 实景照片 (自动识别单元号)</div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-3 rounded border border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-colors">
                                <div className="absolute top-0 right-0 p-1 bg-primary-100 text-primary-700 text-[10px] font-bold rounded-bl">OCR</div>
                                <p className="text-xs text-slate-600 leading-relaxed font-mono">
                                    {SCENARIO_DATA.evidenceText}
                                </p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'qa' && (
                     <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold text-sm">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> 实时拓扑检查 (S3)
                        </div>
                        <ul className="space-y-2">
                            {mode === 'Foundation' && (
                                <li className="flex justify-between items-center text-xs p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 cursor-pointer hover:bg-rose-100 transition-colors">
                                    <span className="flex items-center gap-2 font-medium"><Magnet className="w-3 h-3 text-rose-600" /> 悬挂点: 2</span>
                                    <button className="px-2 py-1 bg-white border border-rose-200 rounded text-rose-600 hover:text-rose-700 hover:border-rose-300 shadow-sm">修复</button>
                                </li>
                            )}
                            <li className="flex justify-between items-center text-xs p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800">
                                <span className="flex items-center gap-2 font-medium"><CheckSquare className="w-3 h-3 text-emerald-600" /> {mode === 'Location' ? '属性完整: 100%' : '自相交: 0'}</span>
                            </li>
                        </ul>
                    </div>
                )}
                 {activeTab === 'props' && (
                     <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold text-sm">
                            <List className="w-4 h-4 text-slate-400" /> 属性
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-500 font-medium">名称</label>
                                <input type="text" defaultValue={mode === 'Location' ? '长远天地大厦' : 'B 区'} className="w-full mt-1 p-2 bg-white border border-slate-200 rounded text-sm"/>
                            </div>
                             <div>
                                <label className="text-xs text-slate-500 font-medium">ID</label>
                                <input type="text" defaultValue="110108" className="w-full mt-1 p-2 bg-white border border-slate-200 rounded text-sm"/>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

const PromptBar = () => (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[500px] z-30">
        <div className="relative">
             <input 
                type="text" 
                placeholder="输入自然语言指令, e.g., “提取屏幕内所有水体”"
                className="w-full pl-4 pr-10 py-3 bg-white/95 backdrop-blur rounded-lg border border-slate-200 shadow-lg text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-primary-300 outline-none"
             />
             <Wand2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
        </div>
    </div>
);

const LastMileOverlay = () => (
    <div className="absolute inset-0 pointer-events-none opacity-60 mix-blend-multiply" style={{
        background: 'radial-gradient(circle at 40% 60%, rgba(251, 146, 60, 0.4) 0%, transparent 20%), radial-gradient(circle at 45% 65%, rgba(251, 146, 60, 0.6) 0%, transparent 15%), radial-gradient(circle at 35% 55%, rgba(251, 146, 60, 0.3) 0%, transparent 25%)'
    }}></div>
);

const TaskList = ({ onSelect }: { onSelect: (task: OperatorTask) => void }) => {
    const TASK_ICONS: Record<OperatorTaskType, React.ElementType> = {
        Road: Route,
        Admin: Landmark,
        POI: Store,
        LastMile: DoorOpen
    };

    return (
        <div className="p-8 max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">我的任务 (My Tasks)</h2>
            <div className="grid gap-4">
                {MOCK_OPERATOR_TASKS.map(task => {
                    const Icon = TASK_ICONS[task.type];
                    return (
                        <div key={task.id} onClick={() => onSelect(task)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer flex items-center gap-4 group">
                            <div className={`p-3 rounded-lg ${
                                task.type === 'Road' ? 'bg-blue-50 text-blue-600' :
                                task.type === 'Admin' ? 'bg-purple-50 text-purple-600' :
                                task.type === 'POI' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h3 className="font-bold text-slate-900">{task.id}</h3>
                                    <span className="text-xs font-bold text-slate-500 uppercase">{task.status}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                    <span>{task.region}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span className="flex items-center gap-1">AI: <span className="font-bold text-emerald-600">{(task.aiConfidence * 100).toFixed(0)}%</span></span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SmartWorkbench = () => {
  const [activeTask, setActiveTask] = useState<OperatorTask | null>(null);

  if (!activeTask) {
      return (
          <div className="h-full bg-slate-50 overflow-y-auto">
              <TaskList onSelect={setActiveTask} />
          </div>
      );
  }

  // Determine mode
  let mode = 'Foundation';
  if (activeTask.type === 'POI') mode = 'Location';
  if (activeTask.type === 'LastMile') mode = 'LastMile';

  return (
    <div className="h-full flex flex-col relative bg-slate-100 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <WorkbenchHeader task={activeTask} onExit={() => setActiveTask(null)} />
        
        {/* Dynamic Left Panel */}
        {mode === 'Location' ? <LeftAddressPanel /> : <LeftTaskList mode={mode} />}

        <Toolbar mode={mode} />
        <ContextPanel mode={mode} />
        <PromptBar />

        {/* Map Area */}
        <main className={`flex-1 bg-slate-200 relative group overflow-hidden pt-14 ${mode === 'Location' ? 'ml-[340px]' : ''}`}>
            {/* Base Map Grid Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ 
                backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }}></div>
            
            {/* Mode Specific Visuals */}
            
            {/* 1. Foundation Mode Visuals (Default) */}
            {mode === 'Foundation' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[320px] bg-white border-2 border-slate-300 rounded-lg overflow-hidden shadow-lg">
                    <div className="absolute top-0 left-0 w-1/2 h-full bg-blue-50/50 flex items-center justify-center text-blue-600 font-bold border-r border-slate-200">A 区</div>
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/50 flex items-center justify-center text-emerald-600 font-bold">B 区</div>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <path d="M 250,0 L 250,320" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                        <rect x="218" y="140" width="64" height="24" rx="4" fill="white" stroke="#f43f5e" />
                        <text x="250" y="156" fill="#f43f5e" fontSize="10" fontWeight="bold" textAnchor="middle">AI 建议</text>
                    </svg>
                </div>
            )}

            {/* 2. Last Mile Mode Visuals */}
            {mode === 'LastMile' && (
                <>
                    <LastMileOverlay />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                         <div className="relative">
                            <div className="w-64 h-64 border-4 border-slate-300 rounded-lg bg-slate-100/50"></div>
                            {/* Path Trace */}
                            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                                <path d="M -20,120 Q 30,120 40,80 T 100,50" fill="none" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" className="opacity-80" />
                                <circle cx="100" cy="50" r="4" fill="#a855f7" />
                            </svg>
                            <div className="absolute top-10 right-10 flex flex-col items-center">
                                <MapPin className="w-8 h-8 text-rose-600 drop-shadow-md -mb-1" />
                                <span className="bg-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">3号楼入口</span>
                            </div>
                         </div>
                    </div>
                </>
            )}

            {/* 3. Location Mode Visuals */}
            {mode === 'Location' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <MapPin className="w-8 h-8 text-slate-400 drop-shadow-sm" />
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 whitespace-nowrap bg-white px-1 rounded shadow-sm opacity-60">原始落点</div>
                        </div>
                        <ArrowLeftRight className="w-5 h-5 text-slate-300" />
                        <div className="relative group cursor-pointer">
                            <MapPin className="w-8 h-8 text-primary-600 drop-shadow-lg animate-bounce" />
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-primary-600 whitespace-nowrap bg-white px-1 rounded shadow-sm font-bold">AI 建议落点</div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Final Action Button */}
            <div className="absolute bottom-4 right-4 z-20">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                    <Save className="w-4 h-4" /> 提交
                </button>
            </div>
        </main>
    </div>
  );
};

export default SmartWorkbench;
