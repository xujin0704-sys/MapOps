
import React, { useState, useRef, useMemo } from 'react';
import { MOCK_TASK_PACKAGES } from '../../constants';
import { TaskPackage } from '../../types';
import { useDictionary } from '../../contexts/DictionaryContext';
import { 
    ListTodo, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Eye, 
    Search, 
    LayoutDashboard,
    AlertCircle,
    PlayCircle,
    MoreHorizontal,
    Filter,
    ArrowUpDown,
    RotateCw,
    PauseCircle,
    Calendar,
    Zap,
    ChevronDown,
    Settings2
} from 'lucide-react';

// --- Sub-Components ---

const SmartPreviewPopover = ({ pkg, position }: { pkg: TaskPackage | null; position: { top: number, left: number } | null }) => {
    if (!pkg || !position) return null;

    return (
        <div 
            className="absolute z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200 pointer-events-none ring-1 ring-black/5"
            style={{ top: position.top, left: position.left }}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{pkg.id}</h4>
                    <p className="text-base font-bold text-slate-800">{pkg.region}</p>
                </div>
                <span className="text-xs font-mono bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded">{pkg.gridCells}</span>
            </div>
            
            <div className="h-36 bg-slate-100 rounded-xl relative overflow-hidden border border-slate-200 shadow-inner">
                <div className="absolute inset-0 bg-[url('https://www.google.com/maps/vt/data=RfCSdfNZ-v1-2up_31zN2nZ4-G-f51E-P_vWhYx4s_g_R5d-PmMmbSRvFCbQ_Gfa-Ptzm8A')] bg-cover opacity-60 grayscale"></div>
                <div className="absolute top-8 left-10 w-16 h-10 border-2 border-primary-500 bg-primary-500/20 rounded shadow-sm animate-pulse"></div>
                <div className="absolute bottom-6 right-8 w-12 h-12 border-2 border-primary-500 bg-primary-500/20 rounded-full shadow-sm animate-pulse" style={{ animationDelay: '500ms' }}></div>
            </div>
            
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping"></div>
                <span>AI 预处理已高亮 <span className="font-bold text-primary-600">12</span> 个潜在变更区域。</span>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, sub, icon: Icon, color }: { title: string, value: string, sub: string, icon: any, color: string }) => (
    <div className="glass-panel p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <div className="flex items-center gap-2 mb-1 text-slate-500">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{value}</div>
            <div className="text-[10px] text-slate-400 font-medium">{sub}</div>
        </div>
    </div>
);

const PipelineTasks = () => {
  const { dictionary } = useDictionary();
  const pipelines = dictionary['pipeline'] || [];

  const [hoveredPackage, setHoveredPackage] = useState<TaskPackage | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number, left: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Processing' | 'Completed' | 'AtRisk'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const tableRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  // Helper to get pipeline styling from dictionary
  const getPipelineStyle = (val: string) => {
      const item = pipelines.find(p => p.value === val);
      const color = item?.color || 'slate';
      return {
          className: `bg-${color}-50 text-${color}-700 border-${color}-100`,
          label: item?.label || val
      };
  };

  // Filter Logic
  const filteredPackages = useMemo(() => {
      return MOCK_TASK_PACKAGES.filter(pkg => {
          const matchesSearch = pkg.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                pkg.region.toLowerCase().includes(searchQuery.toLowerCase());
          
          let matchesTab = true;
          if (activeTab === 'Processing') matchesTab = pkg.aiStatus === 'Processing';
          if (activeTab === 'Completed') matchesTab = pkg.aiStatus === 'Completed';
          if (activeTab === 'AtRisk') matchesTab = pkg.slaRemainingHours <= 5 && pkg.aiStatus !== 'Completed';

          return matchesSearch && matchesTab;
      });
  }, [searchQuery, activeTab]);

  // Statistics Calculation
  const stats = useMemo(() => {
      const total = MOCK_TASK_PACKAGES.length;
      const processing = MOCK_TASK_PACKAGES.filter(p => p.aiStatus === 'Processing').length;
      const completed = MOCK_TASK_PACKAGES.filter(p => p.aiStatus === 'Completed').length;
      const atRisk = MOCK_TASK_PACKAGES.filter(p => p.slaRemainingHours <= 5 && p.aiStatus !== 'Completed').length;
      const avgProgress = Math.round(MOCK_TASK_PACKAGES.reduce((acc, p) => acc + (p.progressCurrent / p.progressTotal), 0) / total * 100);

      return { total, processing, completed, atRisk, avgProgress };
  }, []);

  const handleMouseEnter = (pkg: TaskPackage) => {
    setHoveredPackage(pkg);
    const rowElement = tableRowRefs.current[pkg.id];
    if (rowElement) {
        const rect = rowElement.getBoundingClientRect();
        setPopoverPosition({ top: rect.top - 20, left: rect.right + 20 });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPackage(null);
    setPopoverPosition(null);
  };
    
  return (
    <div className="h-full flex flex-col relative bg-slate-50">
       <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                    <ListTodo className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">流水线任务</h2>
                    <p className="text-xs text-slate-500">任务包的调度与监控大厅</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Connection Status Mock */}
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">线索池实时同步中</span>
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm">
                    <Settings2 className="w-4 h-4" /> 调度配置
                </button>
            </div>
       </header>

       <SmartPreviewPopover pkg={hoveredPackage} position={popoverPosition} />

       <div className="flex-1 overflow-hidden px-6 pb-6 pt-4 flex flex-col gap-6">
           {/* 1. Statistics Dashboard */}
           <div className="grid grid-cols-4 gap-4 shrink-0">
               <KPICard title="活跃任务包" value={stats.processing.toString()} sub={`${stats.avgProgress}% 平均进度`} icon={RotateCw} color="text-blue-500" />
               <KPICard title="本周已完成" value={stats.completed.toString()} sub="+12% 环比增长" icon={CheckCircle} color="text-emerald-500" />
               <KPICard title="SLA 风险" value={stats.atRisk.toString()} sub="需立即介入" icon={AlertCircle} color="text-rose-500" />
               <KPICard title="平均耗时" value="4.2h" sub="AI 辅助提效 30%" icon={Zap} color="text-amber-500" />
           </div>

           {/* 2. Control Bar */}
           <div className="flex justify-between items-center shrink-0">
               <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                   {['All', 'Processing', 'Completed', 'AtRisk'].map(tab => (
                       <button 
                           key={tab} 
                           onClick={() => setActiveTab(tab as any)}
                           className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                               activeTab === tab 
                               ? 'bg-white text-primary-700 shadow-sm' 
                               : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                           }`}
                       >
                           {tab === 'All' ? '全部' : tab === 'Processing' ? '进行中' : tab === 'Completed' ? '已完成' : '风险预警'}
                       </button>
                   ))}
               </div>
               
               <div className="flex gap-3">
                   <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                           type="text" 
                           placeholder="搜索区域或任务包 ID..." 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 w-64 shadow-sm" 
                       />
                   </div>
                   <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 shadow-sm">
                       <Filter className="w-4 h-4" />
                   </button>
               </div>
           </div>

           {/* 3. Task Package Table */}
           <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col border border-slate-200 shadow-sm">
               <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10">
                       <tr>
                           <th className="p-4 pl-6">任务包 ID / 区域</th>
                           <th className="p-4">产线归属</th>
                           <th className="p-4 cursor-pointer hover:bg-slate-100 group transition-colors">
                               <div className="flex items-center gap-1">
                                   进度 <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                               </div>
                           </th>
                           <th className="p-4">AI 状态</th>
                           <th className="p-4">SLA 剩余</th>
                           <th className="p-4 text-right pr-6">操作</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 bg-white">
                       {filteredPackages.map(pkg => {
                           const { className: pipelineClass, label: pipelineLabel } = getPipelineStyle(pkg.pipeline);
                           return (
                               <tr 
                                   key={pkg.id} 
                                   ref={el => { tableRowRefs.current[pkg.id] = el; }}
                                   onMouseEnter={() => handleMouseEnter(pkg)} 
                                   onMouseLeave={handleMouseLeave}
                                   className="hover:bg-slate-50 transition-colors group cursor-pointer"
                               >
                                   <td className="p-4 pl-6">
                                       <div className="font-bold text-slate-900">{pkg.region}</div>
                                       <div className="text-xs text-slate-500 font-mono mt-0.5">{pkg.id}</div>
                                   </td>
                                   <td className="p-4">
                                       <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pipelineClass} border`}>
                                           {pipelineLabel}
                                       </span>
                                   </td>
                                   <td className="p-4 w-48">
                                       <div className="flex items-center gap-3">
                                           <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                               <div 
                                                   className={`h-full rounded-full ${pkg.progressCurrent === pkg.progressTotal ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                                   style={{ width: `${(pkg.progressCurrent / pkg.progressTotal) * 100}%` }}
                                               ></div>
                                           </div>
                                           <span className="text-xs font-bold text-slate-600">{Math.round((pkg.progressCurrent / pkg.progressTotal) * 100)}%</span>
                                       </div>
                                       <div className="text-[10px] text-slate-400 mt-1">{pkg.progressCurrent} / {pkg.progressTotal} tiles</div>
                                   </td>
                                   <td className="p-4">
                                       {pkg.aiStatus === 'Processing' ? (
                                           <span className="flex items-center gap-1.5 text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                               <RotateCw className="w-3 h-3 animate-spin" /> Processing
                                           </span>
                                       ) : pkg.aiStatus === 'Completed' ? (
                                           <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                               <CheckCircle className="w-3 h-3" /> Ready
                                           </span>
                                       ) : (
                                           <span className="flex items-center gap-1.5 text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded border border-rose-100">
                                               <XCircle className="w-3 h-3" /> Failed
                                           </span>
                                       )}
                                   </td>
                                   <td className="p-4">
                                       <div className={`flex items-center gap-1.5 font-mono font-bold ${pkg.slaRemainingHours <= 5 ? 'text-rose-600' : 'text-slate-600'}`}>
                                           <Clock className="w-3 h-3" /> {pkg.slaRemainingHours}h
                                       </div>
                                   </td>
                                   <td className="p-4 pr-6 text-right">
                                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-500" title="暂停"><PauseCircle className="w-4 h-4"/></button>
                                           <button className="p-1.5 bg-primary-600 border border-primary-600 rounded text-white shadow-sm hover:bg-primary-700 font-bold text-xs px-3">
                                               调度
                                           </button>
                                       </div>
                                   </td>
                               </tr>
                           );
                       })}
                   </tbody>
               </table>
           </div>
       </div>
    </div>
  );
};

export default PipelineTasks;
