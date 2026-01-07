
import React, { useState, useEffect, useMemo } from 'react';
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
    DoorOpen, 
    Search, 
    Filter, 
    Clock, 
    ScanLine, 
    Image as ImageIcon, 
    Layout, 
    LayoutGrid, 
    List as ListIcon, 
    Package, 
    ArrowLeft, 
    MoreVertical, 
    CheckCircle2, 
    CircleDashed, 
    PlayCircle, 
    Bot, 
    RefreshCw, 
    XCircle, 
    ShieldCheck, 
    LayoutList, 
    ArrowDownUp, 
    BarChart2, 
    Calendar, 
    SlidersHorizontal
} from 'lucide-react';
import { MOCK_TASK_PACKAGES, SCENARIO_DATA, MOCK_OPERATOR_TASKS } from '../../constants';
import { OperatorTask, OperatorTaskType, TaskPackage } from '../../types';
import { useDictionary } from '../../contexts/DictionaryContext';

// --- Types ---

type WorkbenchMode = 'Foundation' | 'Location' | 'LastMile';

// --- Helper Functions ---

const getTaskIcon = (type: OperatorTaskType) => {
    switch (type) {
        case 'Road': return Route;
        case 'Admin': return Landmark;
        case 'POI': return Store;
        case 'LastMile': return DoorOpen;
        default: return List;
    }
};

const getModeForTask = (type: OperatorTaskType): WorkbenchMode => {
    if (type === 'POI') return 'Location';
    if (type === 'LastMile') return 'LastMile';
    return 'Foundation'; // Road, Admin
};

const generateSubTasksForPackage = (pkg: TaskPackage): OperatorTask[] => {
    const typeMap: Record<string, OperatorTaskType> = {
        'Road': 'Road',
        'POI': 'POI',
        'Admin': 'Admin',
        'Building': 'LastMile',
        'Address': 'LastMile'
    };
    const type = typeMap[pkg.pipeline] || 'Road';
    
    return Array.from({ length: 5 }).map((_, i) => ({
        id: `${pkg.id}-T${i + 1}`,
        type: type,
        region: pkg.region,
        aiConfidence: 0.85 + (Math.random() * 0.14),
        slaHours: pkg.slaRemainingHours,
        status: i === 0 ? 'in-progress' : i === 1 ? 'review' : 'pending'
    }));
};

// --- Sub-Components: Dashboard & Lists ---

const StatCard = ({ label, value, trend, icon: Icon, color }: { label: string, value: string, trend?: string, icon: any, color: string }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-900">{value}</h3>
                {trend && <span className="text-xs font-medium text-emerald-600">{trend}</span>}
            </div>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
    </div>
);

const TaskItem: React.FC<{ task: OperatorTask, onStart: () => void, getPipelineColor: (val: string) => string }> = ({ task, onStart, getPipelineColor }) => {
    const Icon = getTaskIcon(task.type);
    const confidenceColor = task.aiConfidence > 0.9 ? 'text-emerald-600' : task.aiConfidence > 0.7 ? 'text-amber-600' : 'text-rose-600';
    const slaColor = task.slaHours <= 2 ? 'text-rose-600' : task.slaHours <= 8 ? 'text-amber-600' : 'text-slate-500';
    
    const color = getPipelineColor(task.type); // assuming type maps to pipeline value

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 hover:shadow-md hover:border-primary-300 transition-all duration-200 group">
            <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 truncate pr-2">{task.id}</h3>
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full whitespace-nowrap">{task.region}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        置信度: <span className={`font-bold ${confidenceColor}`}>{ (task.aiConfidence * 100).toFixed(0) }%</span>
                    </div>
                    <div className="w-px h-3 bg-slate-200"></div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        SLA: <span className={`font-bold ${slaColor}`}>{task.slaHours}h</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={onStart}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-primary-200 opacity-0 group-hover:opacity-100 whitespace-nowrap"
            >
                开始作业
            </button>
        </div>
    );
};

const PackageItem: React.FC<{ pkg: TaskPackage, onSelect: () => void, getPipelineStyle: (val: string) => { className: string, label: string } }> = ({ pkg, onSelect, getPipelineStyle }) => {
    const percent = Math.round((pkg.progressCurrent / pkg.progressTotal) * 100);
    const { className, label } = getPipelineStyle(pkg.pipeline);

    return (
        <div 
            onClick={onSelect}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-primary-400 cursor-pointer transition-all group relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${className}`}>
                        {label}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{pkg.region}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{pkg.id}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">总体进度</span>
                        <span className="font-bold text-slate-700">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${percent}%`}}></div>
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-50">
                    <span className="flex items-center gap-1.5 text-slate-500">
                        <Layout className="w-3 h-3" /> {pkg.gridCells}
                    </span>
                    <span className={`flex items-center gap-1.5 font-bold ${pkg.slaRemainingHours < 5 ? 'text-rose-600' : 'text-slate-600'}`}>
                        <Clock className="w-3 h-3" /> {pkg.slaRemainingHours}h Left
                    </span>
                </div>
            </div>
        </div>
    );
};

const WorkbenchDashboard = ({ onStartTask, onSelectPackage }: { onStartTask: (t: OperatorTask) => void, onSelectPackage: (p: TaskPackage) => void }) => {
    const { dictionary } = useDictionary();
    const pipelines = dictionary['pipeline'] || [];

    const [activeTab, setActiveTab] = useState<'tasks' | 'packages'>('tasks');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Helper
    const getPipelineStyle = (val: string) => {
        const item = pipelines.find(p => p.value === val);
        const color = item?.color || 'slate';
        return {
            className: `bg-${color}-50 text-${color}-700`,
            label: item?.label || val,
            color: color
        };
    };

    // Filter Logic
    const filteredTasks = MOCK_OPERATOR_TASKS.filter(t => 
        (filterStatus === 'All' || t.status === filterStatus) &&
        (t.id.toLowerCase().includes(searchQuery.toLowerCase()) || t.region.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredPackages = MOCK_TASK_PACKAGES.filter(p => 
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.region.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* 1. Statistics Header */}
            <div className="p-6 pb-2 grid grid-cols-4 gap-4 shrink-0">
                <StatCard label="我的待办" value="12" icon={ListIcon} color="bg-blue-500" />
                <StatCard label="SLA 预警" value="3" trend="-1" icon={AlertTriangle} color="bg-rose-500" />
                <StatCard label="本周完成" value="145" trend="+12%" icon={CheckCircle2} color="bg-emerald-500" />
                <StatCard label="作业效能" value="94.2" icon={BarChart2} color="bg-purple-500" />
            </div>

            {/* 2. Control Bar */}
            <div className="px-6 py-4 flex justify-between items-center shrink-0">
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('tasks')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'tasks' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <ListIcon className="w-4 h-4" /> 任务视图
                    </button>
                    <button 
                        onClick={() => setActiveTab('packages')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'packages' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <Package className="w-4 h-4" /> 包视图
                    </button>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="搜索 ID 或区域..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 w-64 shadow-sm" 
                        />
                    </div>
                    {activeTab === 'tasks' && (
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 shadow-sm">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-transparent text-sm text-slate-600 outline-none py-2 cursor-pointer font-medium"
                            >
                                <option value="All">全部状态</option>
                                <option value="pending">待领取</option>
                                <option value="in-progress">进行中</option>
                                <option value="review">质检驳回</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. List Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                {activeTab === 'tasks' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <TaskItem 
                                    key={task.id} 
                                    task={task} 
                                    onStart={() => onStartTask(task)} 
                                    getPipelineColor={(val) => getPipelineStyle(val).color}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>未找到匹配任务</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredPackages.length > 0 ? (
                            filteredPackages.map(pkg => (
                                <PackageItem 
                                    key={pkg.id} 
                                    pkg={pkg} 
                                    onSelect={() => onSelectPackage(pkg)} 
                                    getPipelineStyle={getPipelineStyle}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>未找到匹配任务包</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-Components: Workbench Editor ---

const WorkbenchHeader = ({ pkg, currentTask, onExit }: { pkg?: TaskPackage, currentTask: OperatorTask, onExit: () => void }) => (
    <header className="absolute top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 z-30 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={onExit} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium p-1 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-4 h-4" />
                返回看板
            </button>
            <div className="h-4 w-px bg-slate-200"></div>
            <div>
                <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {pkg ? <Package className="w-4 h-4 text-primary-600" /> : <List className="w-4 h-4 text-primary-600" />}
                    {pkg ? pkg.region : 'My Task List'} 
                    <span className="font-mono text-slate-400 font-normal text-xs bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {pkg ? pkg.id : 'Aggregated'}
                    </span>
                </h1>
            </div>
        </div>
        
        <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-blue-700">
                <LayoutList className="w-4 h-4" />
                <span className="opacity-70">正在作业:</span>
                <span className="font-bold font-mono">{currentTask.id}</span>
            </div>
             {pkg && (
                 <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 font-medium text-xs uppercase">Progress</span>
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(pkg.progressCurrent / pkg.progressTotal) * 100}%` }}></div>
                    </div>
                    <span className="font-bold text-slate-700 text-xs">{Math.round((pkg.progressCurrent / pkg.progressTotal) * 100)}%</span>
                </div>
             )}
             <div className="h-6 w-px bg-slate-200"></div>
             <div className="flex items-center gap-2">
                 <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" title="挂起任务"><UserCheck className="w-4 h-4" /></button>
                 <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" title="快捷键帮助"><HelpCircle className="w-4 h-4" /></button>
             </div>
        </div>
    </header>
);

const LeftTaskList = ({ tasks, currentId, onSwitch, title }: { tasks: OperatorTask[], currentId: string, onSwitch: (t: OperatorTask) => void, title?: string }) => (
    <aside className="absolute top-16 left-4 bottom-4 w-72 bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-xl flex flex-col z-20">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
                <List className="w-4 h-4 text-primary-500" /> {title || '任务清单'} 
                <span className="bg-slate-200 text-slate-600 px-1.5 rounded-full text-[10px]">{tasks.length}</span>
            </h3>
            <button className="text-slate-400 hover:text-slate-600"><SlidersHorizontal className="w-3.5 h-3.5"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {tasks.map((task, index) => {
                const isActive = task.id === currentId;
                let statusIcon = <CircleDashed className="w-3.5 h-3.5 text-slate-400" />;
                if (task.status === 'completed') statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
                if (task.status === 'in-progress') statusIcon = <PlayCircle className="w-3.5 h-3.5 text-blue-500" />;
                if (task.status === 'review') statusIcon = <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;

                return (
                    <div 
                        key={task.id}
                        onClick={() => onSwitch(task)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 group relative overflow-hidden ${
                            isActive 
                            ? 'bg-primary-50 border-primary-200 shadow-sm' 
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                        }`}
                    >
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>}
                        <div className={`font-mono text-xs font-bold ${isActive ? 'text-primary-700' : 'text-slate-400'}`}>
                            {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${isActive ? 'text-primary-900' : 'text-slate-700'}`}>
                                {task.type === 'Road' ? `Road Seg #${task.id.slice(-4)}` : 
                                 task.type === 'POI' ? `POI Group #${task.id.slice(-4)}` :
                                 task.type === 'Admin' ? `Boundary Adj #${task.id.slice(-4)}` : `Entrance #${task.id.slice(-4)}`}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                {statusIcon}
                                <span className="text-[10px] text-slate-400">AI: {(task.aiConfidence * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
             <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="accent-primary-600 rounded w-3.5 h-3.5" /> 
                <span className="text-xs font-medium text-slate-600">提交后自动跳转下一条</span>
            </label>
        </div>
    </aside>
);

const Toolbar = ({ mode }: { mode: string }) => (
    <div className="absolute top-16 left-[320px] z-20 flex flex-col gap-2 animate-in slide-in-from-left-4 fade-in duration-500">
        <div className="bg-white/95 backdrop-blur p-1.5 rounded-xl flex flex-col gap-1 shadow-lg border border-slate-200/60 ring-1 ring-black/5">
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="选择"><MousePointer2 className="w-5 h-5" /></button>
            
            <div className="w-full h-px bg-slate-100 my-0.5"></div>

            {mode === 'Foundation' && (
                <>
                    <button className="p-2.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors shadow-sm" title="SAM 魔棒"><Wand2 className="w-5 h-5" /></button>
                    <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="提取中线"><Spline className="w-5 h-5" /></button>
                    <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="拓扑吸附"><Magnet className="w-5 h-5" /></button>
                </>
            )}

            {mode === 'LastMile' && (
                <>
                    <button className="p-2.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors shadow-sm" title="轨迹描摹"><Footprints className="w-5 h-5" /></button>
                    <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="门址标记"><Navigation2 className="w-5 h-5" /></button>
                    <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="单元连线"><ArrowLeftRight className="w-5 h-5" /></button>
                </>
            )}

             {mode === 'Location' && (
                <>
                     <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="落点纠偏"><MapPin className="w-5 h-5" /></button>
                     <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="父子挂接"><Building2 className="w-5 h-5" /></button>
                </>
            )}
        </div>
        <div className="bg-white/95 backdrop-blur p-1.5 rounded-xl flex flex-col gap-1 shadow-lg border border-slate-200/60 ring-1 ring-black/5">
             <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg"><Undo2 className="w-5 h-5" /></button>
             <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg"><Redo2 className="w-5 h-5" /></button>
        </div>
    </div>
);

const ContextPanel = ({ mode }: { mode: string }) => {
    const [activeTab, setActiveTab] = useState('evidence');
    const [isQaChecking, setIsQaChecking] = useState(false);
    const [qaResults, setQaResults] = useState<any[]>([]);
    
    // Simulate QA Check
    const runQaCheck = () => {
        setIsQaChecking(true);
        setQaResults([]); // Clear previous
        setTimeout(() => {
            setIsQaChecking(false);
            // Mock results based on mode
            if (mode === 'Foundation') {
                setQaResults([
                    { id: 1, type: 'error', title: '悬挂节点 (Dangling Node)', desc: 'Node #9921 未闭合', action: 'auto-fix' },
                    { id: 2, type: 'warning', title: '锐角转弯 (Sharp Turn)', desc: 'Angle < 15 deg', action: 'locate' }
                ]);
            } else {
                setQaResults([
                    { id: 1, type: 'success', title: '属性完整性', desc: '所有必填字段已填写', action: null }
                ]);
            }
        }, 1500);
    };

    return (
        <aside className="absolute top-16 right-4 bottom-4 w-80 bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-xl flex flex-col z-20 animate-in slide-in-from-right duration-300">
            {/* Tab Header */}
            <div className="flex border-b border-slate-100 p-1 shrink-0 bg-slate-50/50 rounded-t-xl">
                <button onClick={() => setActiveTab('props')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab==='props' ? 'bg-white shadow-sm text-slate-800 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>属性</button>
                <button onClick={() => setActiveTab('evidence')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab==='evidence' ? 'bg-white shadow-sm text-slate-800 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>依据</button>
                <button onClick={() => setActiveTab('qa')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab==='qa' ? 'bg-white shadow-sm text-slate-800 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>质检</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
                
                {/* EVIDENCE TAB */}
                {activeTab === 'evidence' && (
                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-slate-700 font-semibold text-sm">
                            <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary-500" /> 原文依据 (Source)</div>
                            <span className="text-[10px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded border border-primary-100">AI Highlighted</span>
                        </div>
                        
                        {mode === 'LastMile' ? (
                            // Visual Mode
                            <div className="space-y-3">
                                <div className="relative rounded-lg overflow-hidden border border-slate-200 group shadow-sm">
                                    <img src="https://images.unsplash.com/photo-1618038483079-bfe64dcb17f1?auto=format&fit=crop&q=80&w=400" className="w-full object-cover" alt="Entrance" />
                                    {/* Bounding Box Overlay */}
                                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-emerald-400 bg-emerald-400/10 rounded flex items-start justify-center animate-in zoom-in duration-500">
                                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 rounded-b shadow-sm">Entrance</span>
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur">
                                        Confidence: 98%
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                                    <span className="font-bold text-slate-700">AI Analysis:</span> Detected residential entrance with 98% confidence. Matches "Unit 3" pattern.
                                </div>
                            </div>
                        ) : (
                            // Document Mode
                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative text-xs leading-relaxed font-serif text-slate-600">
                                {/* Paper texture effect */}
                                <div className="absolute inset-0 bg-amber-50/30 pointer-events-none"></div>
                                <h4 className="font-bold text-center mb-2 text-slate-800 border-b border-slate-100 pb-2">关于调整 A 区行政界线的通知</h4>
                                <p>
                                    根据市政府令 #2023-10，即日起，
                                    <span className="bg-yellow-200/60 px-0.5 rounded border-b border-yellow-400 cursor-help" title="Entity: District Name">A 区</span> 
                                    北部边界应沿 
                                    <span className="bg-blue-100 px-0.5 rounded border-b border-blue-400 cursor-help" title="Entity: Geographic Feature">长江支流中心线</span> 
                                    重新划分。原属 B 区的 
                                    <span className="bg-yellow-200/60 px-0.5 rounded border-b border-yellow-400">红星村</span> 
                                    现划入 A 区管辖范围。
                                </p>
                                <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                                    <span>Page 1 of 4</span>
                                    <span>Match Score: 95%</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* QA TAB */}
                {activeTab === 'qa' && (
                     <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" /> 实时质检 (Live QA)
                            </div>
                            <button 
                                onClick={runQaCheck}
                                disabled={isQaChecking} 
                                className="p-1.5 bg-slate-50 hover:bg-primary-50 text-slate-500 hover:text-primary-600 rounded-lg transition-colors border border-slate-200" 
                                title="Run Check"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isQaChecking ? 'animate-spin text-primary-600' : ''}`} />
                            </button>
                        </div>

                        {/* Loading State */}
                        {isQaChecking && (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-400 space-y-2 animate-in fade-in">
                                <RefreshCw className="w-8 h-8 animate-spin text-primary-300" />
                                <span className="text-xs font-medium">Running topological analysis...</span>
                            </div>
                        )}

                        {/* Empty State (Initial) */}
                        {!isQaChecking && qaResults.length === 0 && (
                            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                                <p className="text-xs">点击刷新按钮开始检查</p>
                            </div>
                        )}

                        {/* Results List */}
                        {!isQaChecking && qaResults.length > 0 && (
                            <ul className="space-y-3">
                                {qaResults.map(res => (
                                    <li key={res.id} className={`p-3 rounded-lg border flex flex-col gap-2 animate-in slide-in-from-bottom-2 ${
                                        res.type === 'error' ? 'bg-rose-50 border-rose-200' :
                                        res.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
                                    }`}>
                                        <div className="flex items-start gap-3">
                                            {res.type === 'error' ? <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" /> : 
                                             res.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> :
                                             <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                                            
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-bold ${
                                                    res.type === 'error' ? 'text-rose-800' :
                                                    res.type === 'warning' ? 'text-amber-800' : 'text-emerald-800'
                                                }`}>{res.title}</h4>
                                                <p className={`text-xs mt-0.5 ${
                                                    res.type === 'error' ? 'text-rose-600' :
                                                    res.type === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                                                }`}>{res.desc}</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {res.action && (
                                            <div className="flex gap-2 pl-7 mt-1">
                                                <button className="flex-1 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm">
                                                    定位 (Locate)
                                                </button>
                                                {res.action === 'auto-fix' && (
                                                    <button className="flex-1 py-1.5 bg-primary-600 text-white rounded text-xs font-bold hover:bg-primary-700 shadow-sm flex items-center justify-center gap-1">
                                                        <Wand2 className="w-3 h-3" /> 自动修复
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                 {/* PROPERTIES TAB */}
                 {activeTab === 'props' && (
                     <div>
                        <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold text-sm">
                            <List className="w-4 h-4 text-slate-400" /> 属性编辑
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">名称 (Name)</label>
                                <input type="text" defaultValue={mode === 'Location' ? '长远天地大厦' : 'B 区'} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-primary-500 outline-none transition-colors focus:ring-2 focus:ring-primary-100"/>
                            </div>
                             <div>
                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Feature ID</label>
                                <div className="flex gap-2">
                                    <input type="text" defaultValue="110108" readOnly className="flex-1 p-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono"/>
                                    <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500"><Bot className="w-4 h-4"/></button>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100">
                                <label className="text-xs text-slate-500 font-bold uppercase block mb-2">标签 (Tags)</label>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 border border-slate-200">Residential</span>
                                    <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 border border-slate-200">High Density</span>
                                    <button className="px-2 py-1 bg-white border border-dashed border-slate-300 rounded text-xs text-slate-400 hover:text-primary-500 hover:border-primary-400">+ Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Context Actions Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex justify-between items-center shrink-0">
                 <span className="text-[10px] text-slate-400 font-mono">v2.1.0</span>
                 <button className="text-xs font-bold text-primary-600 hover:text-primary-700">View History</button>
            </div>
        </aside>
    );
};

const PromptBar = () => (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[500px] z-30">
        <div className="relative group">
             <input 
                type="text" 
                placeholder="输入自然语言指令, e.g., “提取屏幕内所有水体”"
                className="w-full pl-4 pr-10 py-3 bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-2xl text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-primary-300 outline-none transition-all group-hover:scale-[1.01]"
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

// --- Main Component ---

const SmartWorkbench = ({ defaultView = 'packages' }: { defaultView?: 'packages' | 'tasks' }) => {
  const [activePackage, setActivePackage] = useState<TaskPackage | null>(null);
  const [activeTask, setActiveTask] = useState<OperatorTask | null>(null);
  const [packageTasks, setPackageTasks] = useState<OperatorTask[]>([]);

  // Editor View
  if (activeTask) {
        // Determine mode based on CURRENT task
        let mode = 'Foundation';
        if (activeTask.type === 'POI') mode = 'Location';
        if (activeTask.type === 'LastMile') mode = 'LastMile';

        return (
            <div className="h-full flex flex-col relative bg-slate-100 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                <WorkbenchHeader 
                    pkg={activePackage || undefined} 
                    currentTask={activeTask}
                    onExit={() => { 
                        setActiveTask(null); 
                    }} 
                />
                
                {/* Dynamic Left Panel */}
                <LeftTaskList 
                    tasks={packageTasks} 
                    currentId={activeTask.id} 
                    onSwitch={setActiveTask} 
                    title={activePackage ? '任务包要素' : '我的任务清单'}
                />

                <Toolbar mode={mode} />
                <ContextPanel mode={mode} />
                <PromptBar />

                {/* Map Area */}
                <main className={`flex-1 bg-slate-200 relative group overflow-hidden pt-14 ml-[288px]`}>
                    {/* Base Map Grid Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ 
                        backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)', 
                        backgroundSize: '40px 40px' 
                    }}></div>
                    
                    {/* Mode Specific Visuals */}
                    {mode === 'Foundation' && (
                        <div key={activeTask.id} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[320px] bg-white border-2 border-slate-300 rounded-lg overflow-hidden shadow-lg animate-in zoom-in duration-300">
                            <div className="absolute top-0 left-0 w-1/2 h-full bg-blue-50/50 flex items-center justify-center text-blue-600 font-bold border-r border-slate-200">A 区</div>
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/50 flex items-center justify-center text-emerald-600 font-bold">B 区</div>
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                <path d="M 250,0 L 250,320" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                                <rect x="218" y="140" width="64" height="24" rx="4" fill="white" stroke="#f43f5e" />
                                <text x="250" y="156" fill="#f43f5e" fontSize="10" fontWeight="bold" textAnchor="middle">AI 建议</text>
                            </svg>
                        </div>
                    )}

                    {mode === 'LastMile' && (
                        <>
                            <LastMileOverlay />
                            <div key={activeTask.id} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-in zoom-in duration-300">
                                <div className="relative">
                                    <div className="w-64 h-64 border-4 border-slate-300 rounded-lg bg-slate-100/50"></div>
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

                    {mode === 'Location' && (
                        <div key={activeTask.id} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-in zoom-in duration-300">
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
  }

  // Dashboard View (Entry)
  return (
      <WorkbenchDashboard 
          onStartTask={(task) => {
              setActivePackage(null); // Working on individual task
              setPackageTasks(MOCK_OPERATOR_TASKS.filter(t => t.status !== 'completed')); 
              setActiveTask(task);
          }}
          onSelectPackage={(pkg) => {
              setActivePackage(pkg);
              const tasks = generateSubTasksForPackage(pkg);
              setPackageTasks(tasks);
              setActiveTask(tasks[0]);
          }}
      />
  );
};

export default SmartWorkbench;
