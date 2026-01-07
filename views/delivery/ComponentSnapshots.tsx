import React, { useState, useRef } from 'react';
import { 
    Layers, 
    GitCommit, 
    CheckCircle, 
    Clock, 
    ArrowRightLeft, 
    MoreHorizontal, 
    Filter, 
    Search,
    BarChart3,
    ArrowLeft,
    GitCompare,
    FileDiff,
    ChevronRight,
    Tag,
    Download,
    Camera
} from 'lucide-react';

// --- Types & Mock Data ---

type SnapshotType = 'Road' | 'POI' | 'Admin' | 'Address';
type SnapshotTag = 'Nightly' | 'Stable' | 'LTS';

interface Snapshot {
    id: string;
    type: SnapshotType;
    tag: SnapshotTag;
    createdAt: string;
    hash: string;
    metrics: {
        added: string;
        deleted: string;
        modified: string;
        qaScore: number;
    };
    author: string;
}

const MOCK_SNAPSHOTS: Snapshot[] = [
    { id: 'Road-20231209-0200', type: 'Road', tag: 'Nightly', createdAt: 'Today 02:00', hash: 'a1b2c3d', metrics: { added: '+150km', deleted: '-20km', modified: '12 segments', qaScore: 99.2 }, author: 'Auto-Build' },
    { id: 'Road-20231208-1800', type: 'Road', tag: 'Stable', createdAt: 'Yesterday 18:00', hash: 'e5f6g7h', metrics: { added: '+45km', deleted: '-5km', modified: '8 segments', qaScore: 100 }, author: 'Operator_A' },
    { id: 'POI-20231209-0800', type: 'POI', tag: 'Nightly', createdAt: 'Today 08:00', hash: 'i9j0k1l', metrics: { added: '+500', deleted: '-120', modified: '50 attrs', qaScore: 97.5 }, author: 'Auto-Build' },
    { id: 'Admin-20231207-0000', type: 'Admin', tag: 'LTS', createdAt: 'Dec 07', hash: 'm2n3o4p', metrics: { added: '+1', deleted: '0', modified: 'Border Adj', qaScore: 100 }, author: 'Admin_Lead' },
    { id: 'Road-20231207-0200', type: 'Road', tag: 'Nightly', createdAt: 'Dec 07 02:00', hash: 'q5r6s7t', metrics: { added: '+12km', deleted: '-0km', modified: '2 segments', qaScore: 98.8 }, author: 'Auto-Build' },
];

// --- Sub-Components ---

const TagBadge = ({ tag }: { tag: SnapshotTag }) => {
    const styles = {
        Nightly: 'bg-slate-100 text-slate-500 border-slate-200',
        Stable: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        LTS: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[tag]}`}>
            {tag}
        </span>
    );
};

// --- View A: Snapshot Repository ---

const SnapshotRepository = ({ onCompare }: { onCompare: (s: Snapshot) => void }) => {
    const [filterType, setFilterType] = useState<string>('All');
    
    const filteredSnapshots = MOCK_SNAPSHOTS.filter(s => filterType === 'All' || s.type === filterType);

    return (
        <div className="h-full flex gap-6">
            {/* Left Sidebar: Filter */}
            <aside className="w-64 flex flex-col gap-6 shrink-0">
                <div className="glass-panel p-4 rounded-xl">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <Filter className="w-3 h-3" /> 产线筛选
                    </h3>
                    <div className="space-y-1">
                        {['All', 'Road', 'POI', 'Admin', 'Address'].map(type => (
                            <button 
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filterType === type 
                                    ? 'bg-primary-50 text-primary-700' 
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {type === 'All' ? '全部产线' : `${type} 产线`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-4 rounded-xl">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <BarChart3 className="w-3 h-3" /> 库统计
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>本周构建次数</span>
                                <span className="font-bold text-slate-800">142</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[70%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Stable 占比</span>
                                <span className="font-bold text-slate-800">15%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[15%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Right: Timeline List */}
            <main className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col">
                <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">快照列表</h2>
                        <p className="text-xs text-slate-500">最近 30 天构建记录</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search hash or ID..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100" />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-slate-200"></div>

                    <div className="space-y-6">
                        {filteredSnapshots.map((snapshot, idx) => (
                            <div key={snapshot.id} className="relative pl-10 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                {/* Timeline Dot */}
                                <div className={`absolute left-[30px] top-6 w-4 h-4 rounded-full border-4 border-slate-50 ${
                                    snapshot.tag === 'Stable' ? 'bg-emerald-500' : 
                                    snapshot.tag === 'LTS' ? 'bg-purple-500' : 'bg-slate-400'
                                } z-10`}></div>

                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${
                                                snapshot.type === 'Road' ? 'bg-blue-50 text-blue-600' :
                                                snapshot.type === 'POI' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-900 text-lg">{snapshot.id}</h3>
                                                    <TagBadge tag={snapshot.tag} />
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1"><GitCommit className="w-3 h-3"/> {snapshot.hash}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {snapshot.createdAt}</span>
                                                    <span>by {snapshot.author}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"><Download className="w-4 h-4" /></button>
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"><MoreHorizontal className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-1">新增 (Added)</div>
                                            <div className="font-bold text-emerald-600">{snapshot.metrics.added}</div>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-1">删除 (Deleted)</div>
                                            <div className="font-bold text-rose-600">{snapshot.metrics.deleted}</div>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-1">变更 (Modified)</div>
                                            <div className="font-bold text-amber-600">{snapshot.metrics.modified}</div>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-1">单元质检分</div>
                                            <div className={`font-bold ${snapshot.metrics.qaScore >= 99 ? 'text-emerald-600' : 'text-blue-600'}`}>{snapshot.metrics.qaScore}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-3 border-t border-slate-100">
                                        <button className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold transition-colors border border-emerald-100 flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> 标记为 Stable
                                        </button>
                                        <button 
                                            onClick={() => onCompare(snapshot)}
                                            className="flex-1 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors border border-slate-200 flex items-center justify-center gap-2"
                                        >
                                            <GitCompare className="w-4 h-4" /> 差异对比 (Diff)
                                        </button>
                                        <button className="flex items-center gap-1 px-4 text-primary-600 text-sm font-bold hover:underline">
                                            查看任务 <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- View B: Snapshot Diff ---

const SplitMap = () => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (e.buttons !== 1 || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        setSliderPosition((x / rect.width) * 100);
    };

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full bg-slate-200 overflow-hidden cursor-col-resize group select-none"
            onMouseMove={handleMouseMove}
        >
            {/* Right Layer (New Version - Base) */}
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center grayscale opacity-50"></div>
            
            {/* Left Layer (Old Version - Clipped) */}
            <div 
                className="absolute inset-0 bg-white z-10 overflow-hidden border-r-2 border-primary-500 shadow-2xl"
                style={{ width: `${sliderPosition}%` }}
            >
                 <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center opacity-30 grayscale invert filter"></div>
                 <div className="absolute top-4 left-4 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-80">v1 (Previous)</div>
            </div>

            {/* Right Layer Label */}
            <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded opacity-80 z-0">v2 (Current)</div>

            {/* Diff Overlays (Simulated) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 mix-blend-multiply">
                {/* Added (Green) - Only visible on Right side ideally, but for simplified demo we show global overlay */}
                <path d="M 600,200 Q 650,250 700,200" fill="none" stroke="#10b981" strokeWidth="3" />
                <circle cx="650" cy="250" r="4" fill="#10b981" />

                {/* Deleted (Red) */}
                <path d="M 300,400 L 350,450" fill="none" stroke="#f43f5e" strokeWidth="3" strokeDasharray="4 4" />
                <circle cx="325" cy="425" r="4" fill="#f43f5e" />

                {/* Modified (Yellow) */}
                <rect x="450" y="300" width="40" height="40" fill="none" stroke="#f59e0b" strokeWidth="2" />
            </svg>

            {/* Slider Handle */}
            <div 
                className="absolute top-0 bottom-0 w-8 -ml-4 z-30 flex items-center justify-center pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="w-8 h-8 bg-white rounded-full shadow-lg border-2 border-primary-500 flex items-center justify-center text-primary-600">
                    <ArrowRightLeft className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
};

const SnapshotDiff = ({ snapshot, onBack }: { snapshot: Snapshot, onBack: () => void }) => {
    return (
        <div className="h-full flex flex-col">
            <header className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            快照差异对比 <TagBadge tag={snapshot.tag} />
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                            <span>{snapshot.id}</span>
                            <span className="text-slate-300">vs</span>
                            <span>Previous</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-4 text-xs font-bold mr-4">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> 新增 (Added)</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> 删除 (Deleted)</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> 变更 (Modified)</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex gap-6 p-6 min-h-0 bg-slate-50">
                {/* Left: Split Map */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex-1 relative">
                        <SplitMap />
                    </div>
                </div>

                {/* Right: Diff Stats */}
                <aside className="w-80 flex flex-col gap-6 shrink-0">
                    {/* Summary Card */}
                    <div className="glass-panel p-5 rounded-xl">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FileDiff className="w-4 h-4 text-slate-500"/> 变更统计
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
                                    <div className="text-lg font-bold text-emerald-600">+150</div>
                                    <div className="text-[10px] text-emerald-700/70 uppercase font-bold">New</div>
                                </div>
                                <div className="p-2 bg-rose-50 rounded border border-rose-100">
                                    <div className="text-lg font-bold text-rose-600">-20</div>
                                    <div className="text-[10px] text-rose-700/70 uppercase font-bold">Del</div>
                                </div>
                                <div className="p-2 bg-amber-50 rounded border border-amber-100">
                                    <div className="text-lg font-bold text-amber-600">~85</div>
                                    <div className="text-[10px] text-amber-700/70 uppercase font-bold">Mod</div>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100">
                                <div className="text-xs font-bold text-slate-500 mb-2 uppercase">变更热度 (按行政区)</div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-slate-700">海淀区</span>
                                        <span className="text-slate-500">40%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[40%]"></div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-xs pt-1">
                                        <span className="font-medium text-slate-700">朝阳区</span>
                                        <span className="text-slate-500">25%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[25%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attribute Diff Details (Mock) */}
                    <div className="glass-panel p-5 rounded-xl flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-slate-500"/> 属性变更示例
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3">
                             <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs cursor-pointer hover:border-amber-300 transition-colors">
                                 <div className="font-bold text-amber-800 mb-1 flex justify-between">
                                     <span>Road: G6-Expressway</span>
                                     <span className="text-[10px] bg-white px-1 rounded border border-amber-200">#99201</span>
                                 </div>
                                 <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center text-slate-600">
                                     <span className="truncate line-through opacity-60">Speed: 80</span>
                                     <ArrowRightLeft className="w-3 h-3 text-amber-500" />
                                     <span className="font-bold">Speed: 100</span>
                                 </div>
                             </div>

                             <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs cursor-pointer hover:border-amber-300 transition-colors">
                                 <div className="font-bold text-amber-800 mb-1 flex justify-between">
                                     <span>POI: KFC (Suzhou St)</span>
                                     <span className="text-[10px] bg-white px-1 rounded border border-amber-200">#10023</span>
                                 </div>
                                 <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center text-slate-600">
                                     <span className="truncate line-through opacity-60">Status: Open</span>
                                     <ArrowRightLeft className="w-3 h-3 text-amber-500" />
                                     <span className="font-bold">Status: Closed</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

// --- Main Container ---

const ComponentSnapshots = () => {
  const [viewMode, setViewMode] = useState<'repo' | 'diff'>('repo');
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);

  const handleCompare = (snapshot: Snapshot) => {
      setSelectedSnapshot(snapshot);
      setViewMode('diff');
  };

  const handleBack = () => {
      setSelectedSnapshot(null);
      setViewMode('repo');
  };

  if (viewMode === 'diff' && selectedSnapshot) {
      return <SnapshotDiff snapshot={selectedSnapshot} onBack={handleBack} />;
  }

  return (
    <div className="h-full flex flex-col relative bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
                    <Camera className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">组件快照</h2>
                    <p className="text-xs text-slate-500">零部件仓库，管理高频迭代产出物</p>
                </div>
             </div>
        </header>

        <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
            <SnapshotRepository onCompare={handleCompare} />
        </div>
    </div>
  );
};

export default ComponentSnapshots;