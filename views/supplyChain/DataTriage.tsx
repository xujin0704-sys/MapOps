
import React, { useState, useMemo, useEffect } from 'react';
import { 
    ArrowRight, 
    Settings, 
    Activity, 
    Filter, 
    Database, 
    CheckCircle, 
    XCircle, 
    RefreshCw, 
    List, 
    Play, 
    Save, 
    Trash2, 
    PlusCircle, 
    Search, 
    ChevronRight, 
    LayoutGrid, 
    MoreHorizontal, 
    GitBranch, 
    Clock, 
    AlertOctagon, 
    FileText, 
    X, 
    BarChart3,
    ChevronLeft,
    Tag,
    Edit3,
    Layers,
    Check,
    Route,
    Landmark,
    Store,
    User,
    Globe
} from 'lucide-react';

// --- MOCK DATA ---

const MOCK_LOGS = [
    { id: 'L01', file: 'File_A.pdf', tags: ['Admin', 'Change'], action: 'Trigger Admin Pipeline', status: 'success', time: '10:23:45' },
    { id: 'L02', file: 'HD_Sat_Img_01.tiff', tags: ['Road', 'Cloud<5%'], action: 'Route to Road Pipeline (High)', status: 'success', time: '10:24:12' },
    { id: 'L03', file: 'User_Report_Img.jpg', tags: ['User Report', 'Blurry'], action: 'Route to Manual Review', status: 'success', time: '10:25:05' },
    { id: 'L04', file: 'Corrupted_Data.zip', tags: [], action: 'Validation Failed', status: 'error', time: '10:26:30' },
    { id: 'L05', file: 'Web_Crawl_Batch_12.json', tags: ['POI', 'New Venue'], action: 'Route to POI Pipeline', status: 'success', time: '10:28:11' },
    { id: 'L06', file: 'Sat_Img_2023_RegionB.tiff', tags: ['Satellite'], action: 'Route to Road Pipeline', status: 'success', time: '10:29:00' },
    { id: 'L07', file: 'Invalid_Format_88.dat', tags: ['Unknown'], action: 'Dropped', status: 'error', time: '10:30:15' },
    { id: 'L08', file: 'Gov_Doc_2023_105.pdf', tags: ['Admin'], action: 'Trigger Admin Pipeline', status: 'success', time: '10:31:22' },
];

interface RuleCondition {
    field: string;
    operator: string;
    value: string;
}

interface RuleAction {
    pipeline: string;
    priority: string;
    params: string;
}

interface DispatchRule {
    id: string;
    category: string;
    name: string;
    desc: string;
    status: 'active' | 'paused';
    conditions: RuleCondition[];
    action: RuleAction;
}

const INITIAL_RULES: DispatchRule[] = [
    { 
        id: 'R01', 
        category: '路网产线 (Road)',
        name: '高清道路影像自动分发',
        desc: '基于分辨率与云量自动路由至路网产线',
        status: 'active',
        conditions: [
            { field: 'AI_Tag', operator: 'contains', value: 'Road' },
            { field: 'Cloud_Cover', operator: '<', value: '10%' },
            { field: 'Resolution', operator: '<', value: '0.8m' },
        ],
        action: { pipeline: 'Road Pipeline', priority: 'High', params: '{ "mode": "auto-sam" }' }
    },
    { 
        id: 'R02', 
        category: '行政区划 (Admin)',
        name: '行政区划变更公文处理', 
        desc: '识别政府公文并高优处理',
        status: 'active',
        conditions: [
            { field: 'Data_Type', operator: '==', value: 'Gov_Doc' },
            { field: 'Keywords', operator: 'contains', value: 'Boundary' },
        ], 
        action: { pipeline: 'Admin Pipeline', priority: 'High', params: '{}' } 
    },
    { 
        id: 'R03', 
        category: '人工审核 (Review)',
        name: '低质量用户上报分发', 
        desc: '模糊图片转人工审核队列',
        status: 'paused',
        conditions: [
            { field: 'Source', operator: '==', value: 'User_Report' },
            { field: 'Quality_Score', operator: '<', value: '0.5' },
        ], 
        action: { pipeline: 'Manual Review', priority: 'Low', params: '{}' } 
    },
    { 
        id: 'R04', 
        category: 'POI 产线 (POI)',
        name: 'POI 商户信息处理', 
        desc: '来自爬虫的 POI 数据清洗',
        status: 'active',
        conditions: [
            { field: 'Source', operator: '==', value: 'Web_Crawl' },
            { field: 'Data_Type', operator: '==', value: 'JSON' },
        ], 
        action: { pipeline: 'POI Pipeline', priority: 'Medium', params: '{}' } 
    },
    { 
        id: 'R05', 
        category: '路网产线 (Road)',
        name: '轨迹数据路网更新', 
        desc: '高频轨迹点用于路网更新',
        status: 'active',
        conditions: [
            { field: 'Data_Type', operator: '==', value: 'GPS_Trace' },
            { field: 'Density', operator: '>', value: 'High' },
        ], 
        action: { pipeline: 'Road Pipeline', priority: 'Medium', params: '{}' } 
    },
];

// --- Helper ---

const getCategoryIcon = (category: string) => {
    if (category.includes('Road')) return Route;
    if (category.includes('Admin')) return Landmark;
    if (category.includes('POI')) return Store;
    if (category.includes('Review')) return User;
    return Globe;
};

const getDataSourceSummary = (rules: DispatchRule[]) => {
    const sources = new Set<string>();
    rules.forEach(r => {
        r.conditions.forEach(c => {
            // Heuristic to extract "Data Sources" from conditions
            if (['Data_Type', 'Source', 'AI_Tag'].includes(c.field)) {
                sources.add(c.value);
            }
        });
    });
    return Array.from(sources);
};

// --- Sub-Components ---

const MonitorDrawer = ({ onClose }: { onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');

    return (
        <div className="absolute inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
            <div className="w-[800px] h-full bg-slate-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
                <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-tight">分发监控详情</h2>
                            <p className="text-xs text-slate-500">Dispatch Monitor & Logs</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 pt-4 shrink-0">
                    <div className="flex bg-slate-200 p-1 rounded-lg w-fit">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            监控概览
                        </button>
                        <button 
                            onClick={() => setActiveTab('logs')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            分发日志
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">今日总请求</div>
                                    <div className="text-2xl font-black text-slate-900">45,200</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">成功路由</div>
                                    <div className="text-2xl font-black text-emerald-600">45,108</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">平均耗时</div>
                                    <div className="text-2xl font-black text-blue-600">45ms</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">规则命中率</div>
                                    <div className="text-2xl font-black text-purple-600">92%</div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-slate-500"/> 吞吐量趋势 (TPS)
                                </h3>
                                <div className="h-64 flex items-end gap-2 px-4">
                                    {Array.from({length: 24}).map((_, i) => (
                                        <div key={i} className="flex-1 bg-blue-100 hover:bg-blue-200 rounded-t relative group" style={{ height: `${Math.random() * 80 + 20}%` }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {Math.floor(Math.random() * 1000)} reqs
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
                                    <span>00:00</span>
                                    <span>06:00</span>
                                    <span>12:00</span>
                                    <span>18:00</span>
                                    <span>23:59</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">时间</th>
                                        <th className="px-4 py-3">文件名</th>
                                        <th className="px-4 py-3">标签</th>
                                        <th className="px-4 py-3">执行动作</th>
                                        <th className="px-4 py-3">状态</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {MOCK_LOGS.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-slate-500 text-xs">{log.time}</td>
                                            <td className="px-4 py-3 font-medium text-slate-800">{log.file}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1 flex-wrap">
                                                    {log.tags.map(t => (
                                                        <span key={t} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] border border-slate-200">{t}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{log.action}</td>
                                            <td className="px-4 py-3">
                                                {log.status === 'success' ? (
                                                    <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle className="w-3 h-3"/> Success</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-rose-600 font-bold text-xs"><XCircle className="w-3 h-3"/> Error</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TopStatsBoard = ({ onOpenMonitor }: { onOpenMonitor: () => void }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4 shrink-0 lg:h-[200px] h-auto">
            {/* Visual Funnel (2 Columns) */}
            <div className="lg:col-span-2 glass-panel p-4 rounded-xl flex flex-col bg-white shadow-sm border border-slate-200 h-full min-h-[180px]">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary-600"/> 实时漏斗 (Live Funnel)
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-medium">Total Ingest: 45,200</span>
                        <div className="h-3 w-px bg-slate-200"></div>
                        <span className="text-xs text-slate-400">Last 24h</span>
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center relative">
                    <div className="flex items-center text-white font-bold text-xs h-8 w-full rounded-lg overflow-hidden shadow-sm">
                        <div className="flex-1 h-full bg-blue-600 flex flex-col items-center justify-center relative group cursor-help">
                            <span className="text-xs">Ingest</span>
                        </div>
                        <div className="w-0.5 h-full bg-white/20"></div>
                        <div className="flex-1 h-full bg-blue-500 flex flex-col items-center justify-center relative group cursor-help">
                            <span className="text-xs">Valid (85%)</span>
                        </div>
                        <div className="w-0.5 h-full bg-white/20"></div>
                        <div className="flex-1 h-full bg-indigo-500 flex flex-col items-center justify-center relative group cursor-help">
                            <span className="text-xs">Routed (70%)</span>
                        </div>
                        <div className="w-0.5 h-full bg-white/20"></div>
                        <div className="flex-1 h-full bg-emerald-500 flex flex-col items-center justify-center relative group cursor-help">
                            <span className="text-xs">Done (68%)</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between px-8 mt-2 text-xs text-slate-500 font-medium">
                        <div className="text-center">
                            <div className="font-bold text-slate-800 text-base">45.2k</div>
                            <div className="text-[10px] uppercase">Items</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-slate-800 text-base">38.4k</div>
                            <div className="text-[10px] uppercase">Valid</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-slate-800 text-base">31.6k</div>
                            <div className="text-[10px] uppercase">Routed</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-slate-800 text-base">30.7k</div>
                            <div className="text-[10px] uppercase">Done</div>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-6 mt-auto justify-end pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> 15% 自动丢弃
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-rose-500 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> 2% 路由失败
                    </div>
                </div>
            </div>

            {/* Monitor Card (1 Column) */}
            <div 
                onClick={onOpenMonitor}
                className="lg:col-span-1 glass-panel p-4 rounded-xl bg-white shadow-sm border border-slate-200 flex flex-col justify-between cursor-pointer hover:border-primary-300 hover:shadow-md transition-all group relative h-full min-h-[180px]"
            >
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-500"/> 分发监控
                    </h3>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2 content-center">
                    <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100 flex flex-col justify-center text-center">
                        <div className="text-emerald-600 text-[10px] mb-0.5 font-bold uppercase">成功率</div>
                        <div className="text-lg font-black text-slate-800">99.8%</div>
                    </div>
                    <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100 flex flex-col justify-center text-center">
                        <div className="text-blue-600 text-[10px] mb-0.5 font-bold uppercase">延迟</div>
                        <div className="text-lg font-black text-slate-800">45ms</div>
                    </div>
                    <div className="p-2 bg-rose-50/50 rounded-lg border border-rose-100 flex flex-col justify-center text-center">
                        <div className="text-rose-600 text-[10px] mb-0.5 font-bold uppercase">失败</div>
                        <div className="text-lg font-black text-slate-800">12</div>
                    </div>
                    <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100 flex flex-col justify-center text-center">
                        <div className="text-slate-500 text-[10px] mb-0.5 font-bold uppercase">命中</div>
                        <div className="text-lg font-black text-slate-800">14.2k</div>
                    </div>
                </div>
                <div className="mt-1 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium text-right">
                    点击查看详情 &rarr;
                </div>
            </div>

            {/* Mini Log Dashboard (1 Column) */}
            <div className="lg:col-span-1 glass-panel p-3 rounded-xl bg-white shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full min-h-[180px]" >
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs">
                        <FileText className="w-3.5 h-3.5 text-blue-500"/> 分发日志
                    </h3>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Latest</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                    {MOCK_LOGS.map(log => (
                        <div key={log.id} className="flex flex-col text-xs p-1.5 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 transition-colors gap-0.5">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] text-slate-400">{log.time}</span>
                                <span className={`text-[10px] px-1 rounded font-bold ${log.status === 'success' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                    {log.status === 'success' ? 'OK' : 'ERR'}
                                </span>
                            </div>
                            <div className="font-medium text-slate-700 truncate" title={log.file}>{log.file}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DataTriage = () => {
    // --- State ---
    const [rules, setRules] = useState<DispatchRule[]>(INITIAL_RULES);
    const [customCategories, setCustomCategories] = useState<string[]>([]);
    
    // UI State
    const [activeCategory, setActiveCategory] = useState<string>('路网产线 (Road)');
    const [viewMode, setViewMode] = useState<'list' | 'edit' | 'create'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMonitorOpen, setIsMonitorOpen] = useState(false);

    // Draft State for Editor
    const [draftRule, setDraftRule] = useState<DispatchRule | null>(null);

    // Category Creation State
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // --- Derived Data ---
    const categories = useMemo(() => {
        const ruleCategories = new Set(rules.map(r => r.category));
        customCategories.forEach(c => ruleCategories.add(c));
        return Array.from(ruleCategories);
    }, [rules, customCategories]);

    const categoryCounts = useMemo(() => rules.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>), [rules]);

    const filteredRules = rules.filter(r => 
        r.category === activeCategory &&
        (r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const activePipelineDataSources = useMemo(() => getDataSourceSummary(filteredRules), [filteredRules]);

    // --- Handlers ---

    const handleCategorySelect = (cat: string) => {
        setActiveCategory(cat);
        setViewMode('list');
        setDraftRule(null);
        setSearchQuery('');
    };

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) {
            setIsAddingCategory(false);
            return;
        }
        setCustomCategories([...customCategories, newCategoryName]);
        setActiveCategory(newCategoryName);
        setNewCategoryName('');
        setIsAddingCategory(false);
    };

    const handleCreateRule = () => {
        setDraftRule({
            id: `R-${Date.now().toString().slice(-4)}`,
            category: activeCategory,
            name: 'New Dispatch Rule',
            desc: 'Description...',
            status: 'active',
            conditions: [{ field: 'Source', operator: '==', value: '' }],
            action: { pipeline: 'Road Pipeline', priority: 'Medium', params: '{}' }
        });
        setViewMode('create');
    };

    const handleEditRule = (rule: DispatchRule) => {
        setDraftRule({ ...rule }); // Deep copy if needed, shallow for now
        setViewMode('edit');
    };

    const handleDeleteRule = (ruleId: string) => {
        if (confirm('Are you sure you want to delete this rule?')) {
            setRules(rules.filter(r => r.id !== ruleId));
            if (viewMode !== 'list') setViewMode('list');
        }
    };

    const handleSaveRule = () => {
        if (!draftRule) return;
        
        if (viewMode === 'create') {
            setRules([...rules, draftRule]);
        } else {
            setRules(rules.map(r => r.id === draftRule.id ? draftRule : r));
        }
        setViewMode('list');
        setDraftRule(null);
    };

    const updateDraft = (field: keyof DispatchRule, value: any) => {
        if (draftRule) setDraftRule({ ...draftRule, [field]: value });
    };

    const updateDraftCondition = (index: number, field: keyof RuleCondition, value: string) => {
        if (!draftRule) return;
        const newConditions = [...draftRule.conditions];
        newConditions[index] = { ...newConditions[index], [field]: value };
        setDraftRule({ ...draftRule, conditions: newConditions });
    };

    const addCondition = () => {
        if (!draftRule) return;
        setDraftRule({
            ...draftRule,
            conditions: [...draftRule.conditions, { field: '', operator: '==', value: '' }]
        });
    };

    const removeCondition = (index: number) => {
        if (!draftRule) return;
        const newConditions = draftRule.conditions.filter((_, i) => i !== index);
        setDraftRule({ ...draftRule, conditions: newConditions });
    };

    return (
        <div className="h-full flex flex-col p-4 overflow-hidden relative">
            {isMonitorOpen && <MonitorDrawer onClose={() => setIsMonitorOpen(false)} />}

            {/* Top: Consolidated Dashboard */}
            <TopStatsBoard onOpenMonitor={() => setIsMonitorOpen(true)} />

            {/* Bottom: Split View */}
            <div className="flex-1 flex gap-4 min-h-0">
                
                {/* Left: Category Sidebar */}
                <aside className="w-64 glass-panel rounded-xl flex flex-col bg-white border border-slate-200 shadow-sm shrink-0">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-slate-500"/> 产线 / 队列
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {categories.map(cat => {
                            const Icon = getCategoryIcon(cat);
                            return (
                                <button
                                    key={cat}
                                    onClick={() => handleCategorySelect(cat)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                                        activeCategory === cat 
                                        ? 'bg-primary-50 text-primary-900 font-bold shadow-sm' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className={`w-4 h-4 ${activeCategory === cat ? 'text-primary-600' : 'text-slate-400'}`} />
                                        <span>{cat}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        activeCategory === cat ? 'bg-white text-primary-600 shadow-sm' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {categoryCounts[cat] || 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="p-3 border-t border-slate-100">
                        {isAddingCategory ? (
                            <div className="flex items-center gap-2 px-1">
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                    className="flex-1 bg-slate-50 border border-primary-300 rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary-500"
                                    placeholder="Enter category..."
                                />
                                <button onClick={handleAddCategory} className="p-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                                    <Check className="w-3 h-3" />
                                </button>
                                <button onClick={() => setIsAddingCategory(false)} className="p-1.5 bg-slate-200 text-slate-500 rounded-md hover:bg-slate-300">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsAddingCategory(true)}
                                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 border-dashed flex items-center justify-center gap-2 transition-colors"
                            >
                                <PlusCircle className="w-3.5 h-3.5" /> 新增队列
                            </button>
                        )}
                    </div>
                </aside>

                {/* Right: Main Content (List or Editor) */}
                <main className="flex-1 glass-panel rounded-xl flex flex-col bg-white border border-slate-200 shadow-sm overflow-hidden">
                    {viewMode === 'list' ? (
                        // View Mode 1: Rule List
                        <div className="flex-1 flex flex-col">
                            {/* List Header */}
                            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0">
                                <h2 className="text-lg font-bold text-slate-900">{activeCategory}</h2>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="搜索规则..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-56 pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-100 transition-all shadow-sm" 
                                        />
                                    </div>
                                    <button 
                                        onClick={handleCreateRule}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" /> 创建规则
                                    </button>
                                </div>
                            </div>

                            {/* List Content */}
                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                                {/* Data Source Summary */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 shrink-0">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <Database className="w-3.5 h-3.5" /> 关联数据源 (Input Sources)
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {activePipelineDataSources.map(ds => (
                                            <span key={ds} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 font-mono shadow-sm flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                {ds}
                                            </span>
                                        ))}
                                        {activePipelineDataSources.length === 0 && <span className="text-xs text-slate-400 italic">No specific data sources defined in rules</span>}
                                    </div>
                                </div>

                                {filteredRules.map(rule => (
                                    <div 
                                        key={rule.id}
                                        onClick={() => handleEditRule(rule)}
                                        className="group p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md bg-white cursor-pointer transition-all relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${rule.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    <GitBranch className="w-4 h-4" />
                                                </div>
                                                <h3 className="font-bold text-slate-800 text-sm">{rule.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                                    rule.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}>
                                                    {rule.status}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 pl-8 mb-3">{rule.desc}</p>
                                        
                                        <div className="pl-8 flex gap-2">
                                            {rule.conditions.slice(0, 2).map((cond, i) => (
                                                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-50 border border-slate-100 text-[10px] text-slate-500 font-mono">
                                                    {cond.field} {cond.operator} {cond.value}
                                                </span>
                                            ))}
                                            {rule.conditions.length > 2 && <span className="text-[10px] text-slate-400 py-1">+{rule.conditions.length - 2} more</span>}
                                        </div>
                                    </div>
                                ))}
                                {filteredRules.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                                        <p>暂无规则</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // View Mode 2 & 3: Rule Editor (Create/Edit)
                        <div className="flex-1 flex flex-col bg-slate-50/30">
                            {/* Editor Header */}
                            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setViewMode('list')}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                        title="Back to List"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                                            {viewMode === 'create' ? '新建规则 (Create Rule)' : draftRule?.name}
                                            <span className="text-xs font-normal text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                                                {draftRule?.id}
                                            </span>
                                        </h2>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {viewMode === 'edit' && (
                                        <button 
                                            onClick={() => handleDeleteRule(draftRule!.id)}
                                            className="text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> 删除
                                        </button>
                                    )}
                                    <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1">
                                        <Play className="w-3.5 h-3.5" /> 试运行
                                    </button>
                                    <button 
                                        onClick={handleSaveRule}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-primary-200 transition-colors flex items-center gap-1"
                                    >
                                        <Save className="w-3.5 h-3.5" /> 保存配置
                                    </button>
                                </div>
                            </div>

                            {/* Editor Content */}
                            {draftRule && (
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* Info Section (Editable) */}
                                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Edit3 className="w-4 h-4 text-slate-500" /> 基本信息
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">规则名称</label>
                                                <input 
                                                    type="text" 
                                                    value={draftRule.name} 
                                                    onChange={(e) => updateDraft('name', e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">规则描述</label>
                                                <input 
                                                    type="text" 
                                                    value={draftRule.desc} 
                                                    onChange={(e) => updateDraft('desc', e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">所属类型</label>
                                                <select 
                                                    value={draftRule.category}
                                                    onChange={(e) => updateDraft('category', e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100"
                                                >
                                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">状态</label>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => updateDraft('status', 'active')}
                                                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${draftRule.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200'}`}
                                                    >
                                                        Active
                                                    </button>
                                                    <button 
                                                        onClick={() => updateDraft('status', 'paused')}
                                                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${draftRule.status === 'paused' ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-white text-slate-500 border-slate-200'}`}
                                                    >
                                                        Paused
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* IF Section */}
                                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative group hover:border-primary-300 transition-colors">
                                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-700 px-1.5 rounded text-[10px] font-black tracking-wider">IF</span>
                                            触发条件 (Conditions)
                                        </h3>
                                        
                                        <div className="space-y-3 pl-2">
                                            {draftRule.conditions.map((cond, i) => (
                                            <div key={i} className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3">
                                                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3 py-2 gap-2 shadow-sm">
                                                            <Database className="w-3.5 h-3.5 text-slate-400"/>
                                                            <input 
                                                                type="text" 
                                                                value={cond.field} 
                                                                onChange={(e) => updateDraftCondition(i, 'field', e.target.value)}
                                                                className="bg-transparent text-sm font-mono font-medium text-slate-700 w-full outline-none" 
                                                                placeholder="Field Name"
                                                            />
                                                        </div>
                                                        <div className="w-24 bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3 py-2 shadow-sm">
                                                            <input 
                                                                type="text" 
                                                                value={cond.operator} 
                                                                onChange={(e) => updateDraftCondition(i, 'operator', e.target.value)}
                                                                className="bg-transparent text-sm font-bold text-primary-600 w-full outline-none text-center" 
                                                                placeholder="Op"
                                                            />
                                                        </div>
                                                        <div className="flex-1 bg-white border border-slate-200 rounded-lg flex items-center px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-100">
                                                            <input 
                                                                type="text" 
                                                                value={cond.value} 
                                                                onChange={(e) => updateDraftCondition(i, 'value', e.target.value)}
                                                                className="bg-transparent text-sm text-slate-800 w-full outline-none" 
                                                                placeholder="Value"
                                                            />
                                                        </div>
                                                        <button 
                                                            onClick={() => removeCondition(i)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                        >
                                                            <XCircle className="w-4 h-4"/>
                                                        </button>
                                                </div>
                                                { i < draftRule.conditions.length - 1 && (
                                                    <div className="flex justify-center my-1 relative">
                                                        <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-slate-100"></div></div>
                                                        <span className="relative bg-slate-50 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">AND</span>
                                                    </div>
                                                )}
                                            </div>
                                            ))}
                                            <button 
                                                onClick={addCondition}
                                                className="mt-2 text-primary-600 text-xs font-bold hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 w-fit"
                                            >
                                                <PlusCircle className="w-3.5 h-3.5" /> 添加条件
                                            </button>
                                        </div>
                                    </div>

                                    {/* Arrow Down */}
                                    <div className="flex justify-center -my-2">
                                        <ArrowRight className="w-5 h-5 text-slate-300 rotate-90" />
                                    </div>

                                    {/* THEN Section */}
                                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative group hover:border-emerald-300 transition-colors">
                                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl"></div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <span className="bg-emerald-100 text-emerald-700 px-1.5 rounded text-[10px] font-black tracking-wider">THEN</span>
                                            执行动作 (Actions)
                                        </h3>

                                        <div className="grid grid-cols-2 gap-6 pl-2">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">目标产线</label>
                                                <select 
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-100" 
                                                    value={draftRule.action.pipeline}
                                                    onChange={(e) => setDraftRule({...draftRule, action: {...draftRule.action, pipeline: e.target.value}})}
                                                >
                                                    <option>Road Pipeline</option>
                                                    <option>POI Pipeline</option>
                                                    <option>Admin Pipeline</option>
                                                    <option>Manual Review</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">任务优先级</label>
                                                <select 
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-100" 
                                                    value={draftRule.action.priority}
                                                    onChange={(e) => setDraftRule({...draftRule, action: {...draftRule.action, priority: e.target.value}})}
                                                >
                                                    <option>High</option>
                                                    <option>Medium</option>
                                                    <option>Low</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">附带参数 (JSON)</label>
                                                <div className="relative">
                                                    <textarea 
                                                        className="w-full h-24 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg p-3 outline-none resize-none shadow-inner"
                                                        value={draftRule.action.params}
                                                        onChange={(e) => setDraftRule({...draftRule, action: {...draftRule.action, params: e.target.value}})}
                                                    />
                                                    <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-bold bg-slate-800 px-1.5 rounded">JSON</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DataTriage;
