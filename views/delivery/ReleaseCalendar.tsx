import React, { useState } from 'react';
import { 
    Calendar as CalendarIcon, 
    Filter, 
    AlertTriangle, 
    Layers, 
    GitCommit, 
    X, 
    ChevronRight,
    Milestone
} from 'lucide-react';

// --- Types & Mock Data ---

type LaneType = 'product' | 'component';

interface TimelineItem {
    id: string;
    name: string;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    type: 'release' | 'snapshot';
    status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
    progress: number;
    dependencies?: string[]; // IDs of items this depends on
}

interface Lane {
    id: string;
    title: string;
    type: LaneType;
    items: TimelineItem[];
}

const START_DATE = new Date('2023-11-01');
const TOTAL_DAYS = 30;

const MOCK_LANES: Lane[] = [
    {
        id: 'L1',
        title: 'Map Bundle (产品)',
        type: 'product',
        items: [
            { id: 'R1', name: 'Map 2025 Q1', startDate: '2023-11-15', endDate: '2023-11-28', type: 'release', status: 'at-risk', progress: 65, dependencies: ['S1', 'S2'] }
        ]
    },
    {
        id: 'L2',
        title: 'Nav SDK (产品)',
        type: 'product',
        items: [
            { id: 'R2', name: 'SDK v4.2.0', startDate: '2023-11-20', endDate: '2023-11-29', type: 'release', status: 'on-track', progress: 30, dependencies: ['S3'] }
        ]
    },
    {
        id: 'L3',
        title: 'Road Network (组件)',
        type: 'component',
        items: [
            { id: 'S1', name: 'Road_Stable_v12', startDate: '2023-11-10', endDate: '2023-11-10', type: 'snapshot', status: 'completed', progress: 100 },
            { id: 'S4', name: 'Road_Daily_1120', startDate: '2023-11-20', endDate: '2023-11-20', type: 'snapshot', status: 'on-track', progress: 0 }
        ]
    },
    {
        id: 'L4',
        title: 'POI Data (组件)',
        type: 'component',
        items: [
            { id: 'S2', name: 'POI_Stable_Q4', startDate: '2023-11-12', endDate: '2023-11-12', type: 'snapshot', status: 'delayed', progress: 80 },
            { id: 'S3', name: 'POI_Hotfix_001', startDate: '2023-11-18', endDate: '2023-11-18', type: 'snapshot', status: 'on-track', progress: 50 }
        ]
    }
];

// --- Helpers ---

const getDayOffset = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffTime = Math.abs(date.getTime() - START_DATE.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getPositionStyle = (item: TimelineItem) => {
    const startOffset = getDayOffset(item.startDate);
    let duration = 1;
    if (item.type === 'release') {
        duration = getDayOffset(item.endDate) - startOffset;
        duration = Math.max(duration, 1);
    }
    
    return {
        left: `${(startOffset / TOTAL_DAYS) * 100}%`,
        width: item.type === 'release' ? `${(duration / TOTAL_DAYS) * 100}%` : 'auto'
    };
};

const getStatusColor = (status: TimelineItem['status']) => {
    switch (status) {
        case 'on-track': return 'bg-emerald-500 border-emerald-600';
        case 'completed': return 'bg-blue-500 border-blue-600';
        case 'at-risk': return 'bg-amber-500 border-amber-600';
        case 'delayed': return 'bg-rose-500 border-rose-600';
        default: return 'bg-slate-400 border-slate-500';
    }
};

// --- Sub-Components ---

const DetailDrawer = ({ item, onClose }: { item: TimelineItem | null, onClose: () => void }) => {
    if (!item) return null;

    return (
        <div className="absolute top-0 right-0 bottom-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status).split(' ')[0]}`} />
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Risk Alert */}
                {item.status === 'at-risk' && (
                    <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                        <h4 className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
                            <AlertTriangle className="w-4 h-4" /> 风险预警
                        </h4>
                        <p className="text-xs text-amber-700">
                            路网产线 (Road Network) 当前进度滞后 2 天，可能影响封板时间。建议介入协调。
                        </p>
                    </div>
                )}

                {/* Progress */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">当前进度</h4>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${getStatusColor(item.status).split(' ')[0]}`} style={{ width: `${item.progress}%` }}></div>
                        </div>
                        <span className="font-mono font-bold text-slate-700">{item.progress}%</span>
                    </div>
                </div>

                {/* Dependencies */}
                {item.dependencies && item.dependencies.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <GitCommit className="w-4 h-4" /> 依赖清单
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">Road_Stable_v12</div>
                                        <div className="text-xs text-slate-500">截止: 11月10日</div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">已就绪</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">POI_Stable_Q4</div>
                                        <div className="text-xs text-slate-500">截止: 11月12日</div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">延期</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                        <span className="text-xs text-slate-400 font-bold uppercase block mb-1">开始时间</span>
                        <div className="font-mono text-sm text-slate-700">{item.startDate}</div>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400 font-bold uppercase block mb-1">预计发布</span>
                        <div className="font-mono text-sm text-slate-700">{item.endDate}</div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50">调整排期</button>
                <button className="px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 shadow-sm">查看看板</button>
            </div>
        </div>
    );
};

// --- Main Component ---

const ReleaseCalendar = () => {
    const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
    const [showDependencies, setShowDependencies] = useState(true);
    const [viewRange, setViewRange] = useState<'month' | 'quarter'>('month');

    // Generating timeline header days
    const days = Array.from({ length: TOTAL_DAYS }, (_, i) => {
        const d = new Date(START_DATE);
        d.setDate(d.getDate() + i);
        return {
            date: d.getDate(),
            day: d.toLocaleDateString('zh-CN', { weekday: 'short' }),
            isWeekend: d.getDay() === 0 || d.getDay() === 6
        };
    });

    const freezeLineLeft = (getDayOffset('2023-11-25') / TOTAL_DAYS) * 100;
    const todayLeft = (getDayOffset('2023-11-14') / TOTAL_DAYS) * 100;

    return (
        <div className="h-full flex flex-col relative overflow-hidden bg-slate-50">
            {/* Drawer */}
            {selectedItem && (
                <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] z-40 transition-opacity" onClick={() => setSelectedItem(null)}></div>
            )}
            <DetailDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />

            {/* Header / Control Bar */}
            <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">发布日历</h2>
                        <p className="text-xs text-slate-500">全局进度指挥塔，管理依赖与排期</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button 
                            onClick={() => setViewRange('month')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewRange === 'month' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            本月
                        </button>
                        <button 
                             onClick={() => setViewRange('quarter')}
                             className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewRange === 'quarter' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            本季度
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-200"></div>

                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            checked={showDependencies} 
                            onChange={(e) => setShowDependencies(e.target.checked)}
                            className="accent-primary-600 rounded w-4 h-4" 
                        />
                        显示依赖连线
                    </label>

                    <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Gantt Chart Container */}
            <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
                <div className="h-full glass-panel rounded-xl flex flex-col overflow-hidden relative border border-slate-200 shadow-sm">
                    {/* 1. Timeline Header */}
                    <div className="flex border-b border-slate-200 bg-slate-50/80 backdrop-blur z-20">
                        <div className="w-48 shrink-0 p-3 border-r border-slate-200 font-bold text-xs text-slate-500 uppercase tracking-wider flex items-end">
                            泳道 (Swimlanes)
                        </div>
                        <div className="flex-1 flex relative">
                            {days.map((d, i) => (
                                <div key={i} className={`flex-1 border-r border-slate-100 flex flex-col items-center justify-end pb-2 ${d.isWeekend ? 'bg-slate-100/50' : ''}`}>
                                    <span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
                                    <span className="text-xs font-bold text-slate-600">{d.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Swimlanes */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                        {/* Vertical Guidelines (Background) */}
                        <div className="absolute inset-0 flex pl-48 pointer-events-none z-0">
                             {days.map((d, i) => (
                                <div key={i} className={`flex-1 border-r border-slate-100 ${d.isWeekend ? 'bg-slate-50/50' : ''}`}></div>
                            ))}
                        </div>

                        {/* Freeze Line */}
                        <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-rose-400 z-10 pointer-events-none" style={{ left: `calc(12rem + ${freezeLineLeft * (1 - 192/window.innerWidth)}%)` }}> 
                            <div className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm absolute -top-0 -translate-x-1/2 whitespace-nowrap font-bold z-20">
                                封板 (Freeze)
                            </div>
                        </div>
                        
                        {/* Today Line */}
                        <div className="absolute top-0 bottom-0 border-l-2 border-primary-400 z-10 pointer-events-none" style={{ left: `calc(12rem + ${todayLeft * (1 - 192/window.innerWidth)}%)` }}>
                             <div className="bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm absolute top-6 -translate-x-1/2 whitespace-nowrap font-bold z-20">
                                今日 (Today)
                            </div>
                        </div>
                        
                        {/* SVG Dependency Layer */}
                        {showDependencies && (
                             <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                                 {/* Connection S1 -> R1 */}
                                 <path d="M 450,140 C 500,140 500,40 550,40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
                                 {/* Connection S2 -> R1 */}
                                 <path d="M 480,200 C 520,200 520,50 550,50" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow-red)" />

                                 <defs>
                                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                                        <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
                                    </marker>
                                    <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                                        <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
                                    </marker>
                                </defs>
                             </svg>
                        )}

                        {/* Lanes Content */}
                        <div className="relative z-10">
                            {MOCK_LANES.map(lane => (
                                <div key={lane.id} className="flex border-b border-slate-100 h-16 hover:bg-slate-50 transition-colors group">
                                    {/* Lane Header */}
                                    <div className="w-48 shrink-0 border-r border-slate-200 p-3 flex flex-col justify-center bg-white group-hover:bg-slate-50 transition-colors z-20 relative">
                                        <div className="text-sm font-bold text-slate-800 truncate" title={lane.title}>{lane.title}</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">{lane.type === 'product' ? '产品' : '组件'}</div>
                                    </div>
                                    
                                    {/* Timeline Track */}
                                    <div className="flex-1 relative">
                                        {lane.items.map(item => {
                                            const style = getPositionStyle(item);
                                            return (
                                                <div 
                                                    key={item.id} 
                                                    className="absolute top-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-105"
                                                    style={style}
                                                    onClick={() => setSelectedItem(item)}
                                                >
                                                    {item.type === 'release' ? (
                                                        /* Release Bar */
                                                        <div className={`h-8 rounded-md shadow-sm border flex items-center px-3 relative overflow-hidden group/item ${getStatusColor(item.status)}`}>
                                                            <span className="text-white text-xs font-bold whitespace-nowrap z-10 drop-shadow-md">{item.name}</span>
                                                            {/* Progress Fill */}
                                                            <div className="absolute left-0 top-0 bottom-0 bg-white/20" style={{ width: `${item.progress}%` }}></div>
                                                            {/* Drag Handles (Visual) */}
                                                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-black/10 cursor-col-resize opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/10 cursor-col-resize opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                                        </div>
                                                    ) : (
                                                        /* Snapshot Diamond */
                                                        <div className="flex flex-col items-center group/node">
                                                            <div className={`w-4 h-4 rotate-45 border-2 shadow-sm z-10 ${item.status === 'completed' ? 'bg-emerald-500 border-white' : item.status === 'delayed' ? 'bg-rose-500 border-white' : 'bg-slate-300 border-white'}`}></div>
                                                            <div className="absolute top-6 bg-white/90 backdrop-blur px-2 py-0.5 rounded border border-slate-200 shadow-sm text-[10px] font-bold text-slate-600 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity z-20">
                                                                {item.name}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReleaseCalendar;