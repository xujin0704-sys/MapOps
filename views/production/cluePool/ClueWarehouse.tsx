
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Layers, 
  ChevronRight, 
  ChevronDown,
  Map as MapIcon, 
  Filter, 
  ZoomOut, 
  ZoomIn, 
  AlertCircle, 
  PackagePlus, 
  Trash2, 
  Check, 
  Calendar,
  LayoutGrid,
  List as ListIcon,
  Database,
  BarChart3,
  Clock,
  ArrowUpDown,
  X,
  MapPin,
  ImageIcon,
  ArrowLeft,
  Search,
  MoreHorizontal,
  Globe,
  Footprints
} from 'lucide-react';
import { MOCK_GRID_CELLS } from '../../../constants';
import { GridCellData } from '../../../types';
import { useDictionary } from '../../../contexts/DictionaryContext';

// --- Types ---

interface EnrichedGridCellData extends GridCellData {
    _isMatch?: boolean;
}

interface SelectionStats {
    total: number;
    urgent: number;
    road: number;
}

interface ClueDetail {
    id: string;
    type: 'Road' | 'POI' | 'Admin';
    title: string;
    desc: string;
    status: 'Pending' | 'Processed' | 'Ignored';
    severity: 'High' | 'Medium' | 'Low';
    time: string;
    coordinates: string;
}

const PIPELINE_GROUP_LABELS: Record<string, string> = {
    'Foundation': '基础地理 (Foundation)',
    'Location': '地点与地址 (Location)',
    'LastMile': '末端场景 (Last Mile)'
};

const PIPELINE_GROUP_ICONS: Record<string, React.ElementType> = {
    'Foundation': Globe,
    'Location': MapPin,
    'LastMile': Footprints
};

// --- Mock Data Generator for Clues ---
const generateCluesForGrid = (gridId: string, count: number): ClueDetail[] => {
    return Array.from({ length: Math.min(count, 20) }).map((_, i) => {
        const type = Math.random() > 0.6 ? 'Road' : Math.random() > 0.3 ? 'POI' : 'Admin';
        return {
            id: `C-${gridId.split('-')[1]}-${i + 100}`,
            type,
            title: type === 'Road' ? '新增道路几何发现' : type === 'POI' ? 'POI 名称变更' : '行政区划边界调整',
            desc: type === 'Road' ? '卫星影像识别到未入库道路特征' : '用户上报名称与库中不一致',
            status: i % 5 === 0 ? 'Processed' : 'Pending',
            severity: i % 3 === 0 ? 'High' : 'Medium',
            time: '2023-10-26 14:30',
            coordinates: '116.397, 39.908'
        };
    });
};

// --- Sub-Components ---

const CreatePackageModal = ({ stats, onSave, onCancel }: { stats: SelectionStats; onSave: (p: string, d: string) => void; onCancel: () => void; }) => {
    const { dictionary } = useDictionary();
    const pipelines: any[] = dictionary['pipeline'] || [];

    const groupedPipelines = useMemo(() => {
        const groups: Record<string, any[]> = { 'Foundation': [], 'Location': [], 'LastMile': [], 'Other': [] };
        pipelines.forEach(p => {
            const code = p.code && groups[p.code] ? p.code : 'Other';
            groups[code].push(p);
        });
        return groups;
    }, [pipelines]);

    return (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-[480px] overflow-hidden animate-in zoom-in-95 border border-slate-100">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600 border border-primary-100"><PackagePlus className="w-5 h-5"/></div>
                        手动打包分发
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 ml-11">将选中的 {stats.total} 条线索聚合为一个任务包并下发。</p>
                </div>
                
                <div className="p-6 space-y-6">
                     {/* Stats Summary */}
                     <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center">
                        <div className="text-center px-2">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">线索总数</div>
                            <div className="text-xl font-black text-slate-800">{stats.total}</div>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-center px-2">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">紧急线索</div>
                            <div className="text-xl font-black text-rose-600">{stats.urgent}</div>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-center px-2">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">路网相关</div>
                            <div className="text-xl font-black text-blue-600">{stats.road}</div>
                        </div>
                     </div>

                     <div className="space-y-4">
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">优先级策略</label>
                             <select className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all">
                                <option>P0 - 阻断级 (立即处理)</option>
                                <option>P1 - 高优 (24h 内)</option>
                                <option>P2 - 标准 (周常迭代)</option>
                             </select>
                         </div>

                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">分发目标 (Dispatch To)</label>
                             <select className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all">
                                <option>智能路由 (Auto Dispatch)</option>
                                {Object.entries(groupedPipelines).map(([code, group]) => (
                                    (group as any[]).length > 0 && (
                                        <optgroup key={code} label={PIPELINE_GROUP_LABELS[code] || '其他'}>
                                            {(group as any[]).map((p: any) => (
                                                <option key={p.value} value={p.value}>{p.label}</option>
                                            ))}
                                        </optgroup>
                                    )
                                ))}
                                <option>作业员 A 组 (Operators Group A)</option>
                             </select>
                         </div>

                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">期望交付时间 (SLA)</label>
                             <div className="relative">
                                 <input type="date" className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-3 py-3 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"/>
                                 <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                             </div>
                         </div>
                     </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button onClick={onCancel} className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-200 transition-colors shadow-sm">取消</button>
                    <button onClick={() => onSave('P0', '2023-11-01')} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-200 transition-all active:scale-95 flex items-center gap-2">
                        <Check className="w-4 h-4" /> 确认分发
                    </button>
                </div>
            </div>
        </div>
    );
};

const GridDetailDrawer = ({ grid, onClose }: { grid: GridCellData, onClose: () => void }) => {
    const [selectedClue, setSelectedClue] = useState<ClueDetail | null>(null);
    const clues = useMemo(() => generateCluesForGrid(grid.id, grid.clueCount), [grid.id]);

    return (
        <div className="absolute top-2 right-2 bottom-2 w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
            {selectedClue ? (
                // Level 2: Single Clue Detail
                <div className="flex-1 flex flex-col bg-slate-50">
                    <div className="h-14 px-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedClue(null)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h3 className="font-bold text-slate-900">{selectedClue.id}</h3>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-200 hover:bg-emerald-100 transition-colors">采纳</button>
                            <button className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded border border-slate-200 hover:bg-slate-200 transition-colors">忽略</button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Clue Header */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-lg font-bold text-slate-900">{selectedClue.title}</h2>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    selectedClue.severity === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                                }`}>{selectedClue.severity} Priority</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">{selectedClue.desc}</p>
                            <div className="mt-3 flex gap-4 text-xs text-slate-400 font-mono">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {selectedClue.time}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {selectedClue.coordinates}</span>
                            </div>
                        </div>

                        {/* Visual Evidence */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <ImageIcon className="w-3 h-3"/> 影像证据
                            </h4>
                            <div className="aspect-video bg-slate-100 rounded-lg relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2050&auto=format&fit=crop')] bg-cover bg-center"></div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <button className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all transform scale-95 group-hover:scale-100">查看大图</button>
                                </div>
                            </div>
                        </div>

                        {/* Attribute Diff (Mock) */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                <h4 className="text-xs font-bold text-slate-500 uppercase">属性变更预览</h4>
                            </div>
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400">
                                        <th className="px-4 py-2 font-medium">Field</th>
                                        <th className="px-4 py-2 font-medium">Original</th>
                                        <th className="px-4 py-2 font-medium">New Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-slate-500">name</td>
                                        <td className="px-4 py-2 text-rose-600 line-through">Old Road Name</td>
                                        <td className="px-4 py-2 text-emerald-600 font-bold">New Road Name</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-slate-500">width</td>
                                        <td className="px-4 py-2 text-slate-600">5.0</td>
                                        <td className="px-4 py-2 text-slate-600">5.0</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                // Level 1: Clue List in Grid
                <div className="flex-1 flex flex-col bg-white">
                    <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/30">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-slate-900">网格详情</h3>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-mono rounded border border-slate-200">{grid.id}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">共 {grid.clueCount} 条线索，{grid.urgentCount} 条需优先处理</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="px-4 py-3 border-b border-slate-100 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input type="text" placeholder="搜索线索 ID 或类型..." className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-100 outline-none" />
                        </div>
                        <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500"><Filter className="w-3.5 h-3.5"/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {clues.map(clue => (
                            <div 
                                key={clue.id} 
                                onClick={() => setSelectedClue(clue)}
                                className="px-6 py-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer group transition-colors"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${
                                            clue.type === 'Road' ? 'bg-blue-500' : clue.type === 'POI' ? 'bg-amber-500' : 'bg-purple-500'
                                        }`}></span>
                                        <span className="font-bold text-sm text-slate-800 group-hover:text-primary-600 transition-colors">{clue.title}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-400 transition-colors" />
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1 mb-2 pl-4">{clue.desc}</p>
                                <div className="flex items-center gap-3 pl-4">
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 rounded">{clue.id}</span>
                                    {clue.severity === 'High' && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 rounded border border-rose-100">High</span>}
                                    <span className="text-[10px] text-slate-400 ml-auto">{clue.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const GridCell: React.FC<{ 
    data: GridCellData, 
    isSelected: boolean, 
    isDimmed?: boolean, 
    onSelect: () => void,
    onClick: () => void 
}> = ({ data, isSelected, isDimmed, onSelect, onClick }) => {
    // Heatmap Logic
    let bgClass = 'bg-slate-100 hover:bg-slate-200 border-slate-200';
    let textClass = 'text-slate-400';
    
    if (data.clueCount > 0) {
        if (data.clueCount > 50) {
            bgClass = 'bg-rose-500 hover:bg-rose-600 border-rose-600 shadow-md shadow-rose-200';
            textClass = 'text-white';
        } else if (data.clueCount > 20) {
            bgClass = 'bg-amber-400 hover:bg-amber-500 border-amber-500';
            textClass = 'text-amber-900';
        } else if (data.clueCount > 5) {
            bgClass = 'bg-blue-300 hover:bg-blue-400 border-blue-400';
            textClass = 'text-white';
        } else {
            bgClass = 'bg-blue-100 hover:bg-blue-200 border-blue-200';
            textClass = 'text-blue-700';
        }
    }

    if (isSelected) {
        // Selection style overlays the heatmap style slightly but keeps the base color hint
        bgClass = 'bg-primary-600 border-primary-700 shadow-inner ring-2 ring-primary-300 z-10 scale-105';
        textClass = 'text-white';
    } else if (isDimmed) {
        bgClass = 'bg-slate-50 border-slate-100 opacity-40 grayscale';
        textClass = 'text-slate-300';
    }
    
    return (
        <div 
            onClick={onClick} // Main click opens detail
            className={`aspect-square rounded-md border transition-all duration-200 cursor-pointer group relative flex items-center justify-center ${bgClass}`}
            style={{ gridColumn: data.x + 1, gridRow: data.y + 1 }}
        >
            {/* Selection Checkbox (Top Left) */}
            <div 
                className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shadow-sm ${isSelected ? 'bg-white border-white text-primary-600' : 'bg-white/80 border-slate-300 hover:border-primary-400'}`}>
                    {isSelected && <Check className="w-2.5 h-2.5" />}
                </div>
            </div>

            {/* Selection Overlay (Always visible if selected) */}
            {isSelected && (
                <div className="absolute top-1 left-1 z-20 pointer-events-none">
                     <div className="w-3.5 h-3.5 rounded bg-white flex items-center justify-center shadow-sm">
                        <Check className="w-2.5 h-2.5 text-primary-600" />
                    </div>
                </div>
            )}

            {data.clueCount > 0 && !isDimmed && (
                <span className={`text-[10px] font-bold ${textClass} select-none`}>{data.clueCount}</span>
            )}
            
            {/* Hover Tooltip */}
            {data.clueCount > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white p-3 rounded-lg shadow-xl text-xs w-36 pointer-events-none z-30 backdrop-blur-sm translate-y-2 group-hover:translate-y-0 duration-200">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-1">
                        <span className="font-bold text-slate-200">Grid-{data.x}-{data.y}</span>
                        {data.urgentCount > 0 && <AlertCircle className="w-3 h-3 text-rose-500 fill-rose-500/20" />}
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between"><span>总线索:</span> <span className="font-mono font-bold">{data.clueCount}</span></div>
                        <div className="flex justify-between text-slate-400"><span>路网:</span> <span className="font-mono">{data.roadClues}</span></div>
                        {data.urgentCount > 0 && <div className="flex justify-between text-rose-400 font-bold"><span>紧急:</span> <span>{data.urgentCount}</span></div>}
                    </div>
                    <div className="mt-2 pt-1 border-t border-slate-700 text-[10px] text-slate-400 text-center">
                        Click to inspect
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/90"></div>
                </div>
            )}
        </div>
    );
};

const ClueKpiCard = ({ icon: Icon, title, value, sub, color }: { icon: any, title: string, value: string, sub: string, color: string }) => (
    <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{value}</div>
            <div className="text-[10px] text-slate-400 font-medium">{sub}</div>
        </div>
    </div>
);

export const ClueWarehouse = () => {
    const { dictionary } = useDictionary();
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [inspectingGrid, setInspectingGrid] = useState<GridCellData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [activePipelineId, setActivePipelineId] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Foundation', 'Location', 'LastMile', 'Other']));
    const [expandedPipelines, setExpandedPipelines] = useState<Set<string>>(new Set());
    
    // --- Derived Data ---

    const pipelineGroups = useMemo(() => {
        const pipelines: any[] = dictionary['pipeline'] || [];
        const subPipelines: any[] = dictionary['sub_pipeline'] || [];
        
        const groups: Record<string, any[]> = { 'Foundation': [], 'Location': [], 'LastMile': [], 'Other': [] };

        pipelines.forEach(p => {
            const groupCode = p.code && groups[p.code] ? p.code : 'Other';
            
            const children = subPipelines
                .filter(sp => sp.code === p.value)
                .map(sp => ({
                    id: sp.value,
                    name: sp.label,
                    backlog: Math.floor(Math.random() * 5000)
                }));

            groups[groupCode].push({
                id: p.value,
                name: p.label,
                backlog: Math.floor(Math.random() * 15000), // Mock
                children
            });
        });

        return groups;
    }, [dictionary]);

    // Initialize all pipelines as expanded by default
    useEffect(() => {
        const allIds = new Set<string>();
        Object.values(pipelineGroups).forEach(group => (group as any[]).forEach((p: any) => allIds.add(p.id)));
        setExpandedPipelines(allIds);
    }, [pipelineGroups]);

    // Flatten tree for searching name by ID
    const allPipelineItems = useMemo(() => {
        const flat: any[] = [];
        Object.values(pipelineGroups).forEach(group => {
            (group as any[]).forEach(p => {
                flat.push(p);
                if (p.children) flat.push(...p.children);
            });
        });
        return flat;
    }, [pipelineGroups]);

    const filteredCells: EnrichedGridCellData[] = useMemo(() => {
        if (!activePipelineId) return MOCK_GRID_CELLS;

        return MOCK_GRID_CELLS.map(cell => {
            let match = false;
            // Simple logic for demo, mapping ID to mock characteristics
            // In reality this would filter by actual clue content types
            if (activePipelineId === 'Road') {
                match = cell.roadClues > 0;
            } else if (activePipelineId === 'POI') {
                match = (cell.clueCount - cell.roadClues) > 0;
            } else if (activePipelineId === 'Admin') {
                match = cell.urgentCount > 0;
            } else {
                match = true;
            }
            return { ...cell, _isMatch: match };
        });
    }, [activePipelineId]);

    const activeListCells = useMemo(() => {
        return filteredCells.filter(c => c.clueCount > 0 && (activePipelineId ? c._isMatch : true));
    }, [filteredCells, activePipelineId]);

    const totalClues = filteredCells.reduce((acc, c) => acc + (c._isMatch !== false ? c.clueCount : 0), 0);
    const urgentClues = filteredCells.reduce((acc, c) => acc + (c._isMatch !== false ? c.urgentCount : 0), 0);
    const activeGridsCount = activeListCells.length;

    const toggleCellSelection = (id: string) => {
        const newSet = new Set(selectedCells);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedCells(newSet);
    };

    const toggleGroup = (groupCode: string) => {
        const next = new Set(expandedGroups);
        if (next.has(groupCode)) next.delete(groupCode);
        else next.add(groupCode);
        setExpandedGroups(next);
    };

    const togglePipeline = (id: string) => {
        setExpandedPipelines(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const clearSelection = () => setSelectedCells(new Set());

    const selectionStats = Array.from(selectedCells).reduce<SelectionStats>((acc, id) => {
        const cell = MOCK_GRID_CELLS.find(c => c.id === id);
        if (cell) {
            acc.total += cell.clueCount;
            acc.urgent += cell.urgentCount;
            acc.road += cell.roadClues;
        }
        return acc;
    }, { total: 0, urgent: 0, road: 0 });

    const handleSavePackage = () => {
        setIsModalOpen(false);
        setSelectedCells(new Set());
    }

    const getPipelineName = (id: string | null) => {
        if (!id) return null;
        const item = allPipelineItems.find(i => i.id === id);
        return item ? item.name : id;
    };

    const activePipelineName = getPipelineName(activePipelineId);

    return (
        <div className="flex-1 flex flex-col gap-6 min-h-0 relative">
            {isModalOpen && <CreatePackageModal stats={selectionStats} onSave={handleSavePackage} onCancel={() => setIsModalOpen(false)} />}
            
            {/* Grid Detail Drawer */}
            {inspectingGrid && (
                <GridDetailDrawer grid={inspectingGrid} onClose={() => setInspectingGrid(null)} />
            )}

            {/* KPI Dashboard */}
            <div className="grid grid-cols-4 gap-4 shrink-0">
                <ClueKpiCard icon={Database} title={activePipelineId ? `${activePipelineName}库存` : "线索总库存"} value={totalClues.toLocaleString()} sub="+1,240 本周新增" color="text-blue-500" />
                <ClueKpiCard icon={AlertCircle} title="紧急积压" value={urgentClues.toLocaleString()} sub="需优先处理" color="text-rose-500" />
                <ClueKpiCard icon={MapIcon} title="有效覆盖网格" value={activeGridsCount.toString()} sub={`视图覆盖率 ${Math.round(activeGridsCount / MOCK_GRID_CELLS.length * 100)}%`} color="text-emerald-500" />
                <ClueKpiCard icon={Clock} title="平均积压时长" value="2.4 天" sub="SLA 告警阈值: 5天" color="text-amber-500" />
            </div>

            <div className="flex-1 flex gap-6 min-h-0 relative">
                {/* Left: Pipeline Tree */}
                <aside className="w-72 glass-panel p-0 rounded-2xl flex flex-col shrink-0 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-slate-500" /> 产线积压概览
                        </h3>
                        {activePipelineId && (
                            <button onClick={() => setActivePipelineId(null)} className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-0.5 shadow-sm transition-colors">
                                清除筛选 <X className="w-3 h-3"/>
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                        {Object.entries(pipelineGroups).map(([groupCode, pipelines]) => (
                            (pipelines as any[]).length > 0 && (
                                <div key={groupCode} className="space-y-1">
                                    <button 
                                        onClick={() => toggleGroup(groupCode)}
                                        className="flex w-full items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-50 rounded-lg transition-colors group"
                                    >
                                        {expandedGroups.has(groupCode) ? 
                                            <ChevronDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500" /> : 
                                            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500" />
                                        }
                                        {PIPELINE_GROUP_ICONS[groupCode] && React.createElement(PIPELINE_GROUP_ICONS[groupCode], { className: "w-3 h-3" })}
                                        {PIPELINE_GROUP_LABELS[groupCode] || '其他'}
                                    </button>
                                    
                                    {expandedGroups.has(groupCode) && (
                                        <div className="space-y-0.5 pl-2 border-l border-slate-100 ml-3.5 mt-1 animate-in slide-in-from-top-2 fade-in duration-200">
                                            {(pipelines as any[]).map(item => (
                                                <div key={item.id} className="space-y-0.5">
                                                    <div 
                                                        className={`flex items-center justify-between pr-2 py-1.5 rounded-lg transition-all group/item ${
                                                            activePipelineId === item.id ? 'bg-slate-100' : 'hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-0.5 flex-1 min-w-0">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); togglePipeline(item.id); }}
                                                                className="p-1.5 rounded-md hover:bg-slate-200/50 text-slate-400 transition-colors shrink-0"
                                                            >
                                                                {expandedPipelines.has(item.id) ? <ChevronDown className="w-3 h-3"/> : <ChevronRight className="w-3 h-3"/>}
                                                            </button>
                                                            <div 
                                                                className="flex-1 cursor-pointer py-1"
                                                                onClick={() => setActivePipelineId(activePipelineId === item.id ? null : item.id)}
                                                            >
                                                                <span className={`text-xs font-bold truncate block ${activePipelineId === item.id ? 'text-slate-900' : 'text-slate-600'}`}>{item.name}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-mono font-medium shadow-sm shrink-0">
                                                            {item.backlog > 1000 ? (item.backlog/1000).toFixed(1) + 'k' : item.backlog}
                                                        </span>
                                                    </div>
                                                    
                                                    {expandedPipelines.has(item.id) && (
                                                        <div className="space-y-0.5 pl-2 relative">
                                                            {/* Visual guide line */}
                                                            <div className="absolute left-3.5 top-0 bottom-2 w-px bg-slate-200"></div>
                                                            
                                                            {item.children?.map((child: any) => {
                                                                const isActive = activePipelineId === child.id;
                                                                return (
                                                                    <div 
                                                                        key={child.id} 
                                                                        onClick={() => setActivePipelineId(isActive ? null : child.id)}
                                                                        className={`flex justify-between items-center pl-6 pr-2 py-1.5 rounded-lg border transition-all cursor-pointer group/child ml-1 ${
                                                                            isActive 
                                                                            ? 'bg-primary-50 border-primary-200 shadow-sm' 
                                                                            : 'bg-transparent border-transparent hover:bg-slate-50'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-2 min-w-0">
                                                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                                                                                isActive ? 'bg-primary-500' : 
                                                                                child.backlog > 5000 ? 'bg-rose-400' : 'bg-slate-300'
                                                                            }`}></div>
                                                                            <div className={`text-xs truncate ${isActive ? 'font-bold text-primary-900' : 'font-medium text-slate-600 group-hover/child:text-slate-900'}`}>{child.name}</div>
                                                                        </div>
                                                                        {isActive && <ChevronRight className="w-3 h-3 text-primary-400" />}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        ))}
                    </div>
                </aside>

                {/* Right: Content Area (Map or List) */}
                <main className="flex-1 flex flex-col gap-4 min-w-0">
                    <div className="glass-panel p-2 rounded-xl flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-colors">
                                <Filter className="w-3 h-3" /> 筛选
                            </button>
                            {activePipelineId && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold border border-primary-100 animate-in fade-in slide-in-from-left-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                                    Filtering: {activePipelineName}
                                </div>
                            )}
                            {viewMode === 'map' && (
                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                            )}
                            {viewMode === 'map' && (
                                <div className="flex items-center gap-1.5 px-2">
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-slate-100 border border-slate-200"></div><span className="text-[10px] text-slate-500">无</span></div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-300 border border-blue-400"></div><span className="text-[10px] text-slate-500">少</span></div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-amber-400 border border-amber-500"></div><span className="text-[10px] text-slate-500">中</span></div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-rose-500 border border-rose-600"></div><span className="text-[10px] text-slate-500">多</span></div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <ListIcon className="w-4 h-4" />
                                </button>
                            </div>
                            {viewMode === 'map' && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ZoomOut className="w-4 h-4"/></button>
                                    <span className="text-xs font-mono text-slate-400 w-8 text-center">{(zoomLevel * 100).toFixed(0)}%</span>
                                    <button onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ZoomIn className="w-4 h-4"/></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 glass-panel rounded-2xl overflow-hidden relative shadow-inner bg-slate-50/50 flex flex-col">
                        {viewMode === 'map' ? (
                            <div className="flex-1 flex items-center justify-center overflow-hidden p-6 relative">
                                <div 
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-transform duration-200 ease-out"
                                    style={{ transform: `scale(${zoomLevel})` }}
                                >
                                    <div className="grid grid-cols-14 gap-1.5" style={{gridTemplateColumns: 'repeat(14, minmax(32px, 1fr))'}}>
                                        {filteredCells.map(cell => (
                                            <GridCell 
                                                key={cell.id} 
                                                data={cell} 
                                                isSelected={selectedCells.has(cell.id)} 
                                                isDimmed={activePipelineId ? !cell._isMatch : false}
                                                onSelect={() => toggleCellSelection(cell.id)}
                                                onClick={() => { if(cell.clueCount > 0) setInspectingGrid(cell); }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs text-slate-500 flex flex-col gap-1 pointer-events-none">
                                    <div className="font-bold text-slate-800 flex items-center gap-2"><MapIcon className="w-3 h-3"/> Grid Map V2</div>
                                    <div>Region: Beijing (BJ)</div>
                                    <div>Resolution: 1km x 1km</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-auto bg-white">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 w-10">
                                                {/* Global Select Checkbox can go here */}
                                            </th>
                                            <th className="px-6 py-3">Grid ID</th>
                                            <th className="px-6 py-3">坐标区域 (X, Y)</th>
                                            <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors group">
                                                <div className="flex items-center gap-1">
                                                    {activePipelineId ? '匹配线索数' : '线索总数'} <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-primary-500" />
                                                </div>
                                            </th>
                                            <th className="px-6 py-3">分类详情</th>
                                            <th className="px-6 py-3">紧急程度</th>
                                            <th className="px-6 py-3 text-right">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {activeListCells.map(cell => (
                                            <tr key={cell.id} className="hover:bg-slate-50 transition-colors animate-in fade-in">
                                                <td className="px-6 py-3">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedCells.has(cell.id)}
                                                        onChange={() => toggleCellSelection(cell.id)}
                                                        className="rounded border-slate-300 accent-primary-600 cursor-pointer" 
                                                    />
                                                </td>
                                                <td className="px-6 py-3 font-mono font-medium text-slate-700">{cell.id}</td>
                                                <td className="px-6 py-3 text-slate-500">Tile [{cell.x}, {cell.y}]</td>
                                                <td className="px-6 py-3 font-bold text-slate-900">{cell.clueCount}</td>
                                                <td className="px-6 py-3">
                                                    <div className="flex gap-2 text-xs">
                                                        <span className={`px-2 py-0.5 rounded border ${
                                                            activePipelineId && activePipelineId.includes('road') ? 'bg-blue-100 text-blue-800 border-blue-200 font-bold' : 'bg-blue-50 text-blue-700 border-blue-100'
                                                        }`}>路网: {cell.roadClues}</span>
                                                        <span className={`px-2 py-0.5 rounded border ${
                                                            activePipelineId && activePipelineId.includes('poi') ? 'bg-amber-100 text-amber-800 border-amber-200 font-bold' : 'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}>其他: {cell.clueCount - cell.roadClues}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    {cell.urgentCount > 0 ? (
                                                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-xs bg-rose-50 px-2 py-1 rounded border border-rose-100">
                                                            <AlertCircle className="w-3 h-3" /> {cell.urgentCount} High Priority
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">Normal</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button onClick={() => setInspectingGrid(cell)} className="text-slate-600 hover:text-primary-600 font-bold text-xs bg-slate-100 hover:bg-primary-50 px-3 py-1.5 rounded transition-colors">
                                                        查看详情
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>

                {/* Floating Action Bar */}
                {selectedCells.size > 0 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-1.5 pr-2 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 z-40 border border-slate-700/50">
                        <div className="flex items-center gap-3 px-4">
                            <span className="font-bold text-sm">{selectionStats.total} 线索</span>
                            <span className="text-xs text-slate-400 border-l border-slate-700 pl-3">{selectedCells.size} 网格</span>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg active:scale-95">
                            <PackagePlus className="w-4 h-4" /> 手动打包分发
                        </button>
                        <button onClick={clearSelection} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors" title="Clear">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
