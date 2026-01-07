
import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  ToggleLeft, 
  ToggleRight, 
  PlusCircle, 
  Save, 
  Trash2, 
  Info,
  MoreVertical,
  Clock, 
  Zap, 
  Map, 
  Users, 
  Box, 
  Layers, 
  BarChart3, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Calendar 
} from 'lucide-react';
import { MOCK_PACKAGING_POLICIES } from '../../../constants';
import { useDictionary } from '../../../contexts/DictionaryContext';

const PIPELINE_GROUP_LABELS: Record<string, string> = {
    'Foundation': '基础地理 (Foundation)',
    'Location': '地点与地址 (Location)',
    'LastMile': '末端场景 (Last Mile)'
};

export const PackagingPolicy = () => {
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

    const [policies, setPolicies] = useState(MOCK_PACKAGING_POLICIES);
    const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(MOCK_PACKAGING_POLICIES[0]?.id || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);

    // Helper to safely get active policy
    const activePolicy = policies.find(p => p.id === selectedPolicyId) || null;

    const filteredPolicies = policies.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const togglePolicy = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setPolicies(prev => prev.map(p => p.id === id ? {...p, enabled: !p.enabled} : p));
    };

    const handleAdd = () => {
        const newId = `P-${String(policies.length + 1).padStart(2, '0')}`;
        const newPolicy = {
            id: newId,
            name: 'New Policy Configuration',
            triggerType: 'cron' as const,
            triggerValue: '0 2 * * *',
            spatialStrategy: 'map_tile' as const,
            action: 'draft' as const,
            enabled: false,
        };
        // @ts-ignore
        setPolicies([...policies, newPolicy]);
        setSelectedPolicyId(newId);
    };

    const handleUpdate = (field: string, value: any) => {
        if (!activePolicy) return;
        setPolicies(policies.map(p => p.id === activePolicy.id ? { ...p, [field]: value } : p));
    };

    const handleDelete = () => {
        if (!activePolicy) return;
        const remaining = policies.filter(p => p.id !== activePolicy.id);
        setPolicies(remaining);
        setSelectedPolicyId(remaining.length > 0 ? remaining[0].id : null);
    };

    // Mock Simulation Data based on policy config
    const simulationStats = useMemo(() => {
        if (!activePolicy) return null;
        // Deterministic pseudo-random based on string length
        const base = activePolicy.name.length + activePolicy.triggerValue.length; 
        return {
            matchedClues: base * 150 + 500,
            estimatedPackages: Math.floor(base / 3) + 1,
            coverage: activePolicy.spatialStrategy === 'admin_district' ? '85%' : '92%',
            avgSize: activePolicy.spatialStrategy === 'map_tile' ? '45 items' : '120 items'
        };
    }, [activePolicy]);

    return (
        <div className="flex h-full gap-6 min-h-0 bg-slate-50">
            {/* Left: Policy List (20%) */}
            <aside className="w-72 flex flex-col shrink-0 gap-4">
                <div className="glass-panel p-4 rounded-xl flex flex-col gap-4 bg-white">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">策略库</h3>
                        <button 
                            onClick={handleAdd}
                            className="text-primary-600 hover:bg-primary-50 p-1.5 rounded-lg transition-colors"
                            title="Add New Policy"
                        >
                            <PlusCircle className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="搜索策略..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-100"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                     {filteredPolicies.map(policy => (
                        <div 
                            key={policy.id} 
                            onClick={() => setSelectedPolicyId(policy.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${
                                selectedPolicyId === policy.id 
                                ? 'bg-white border-primary-500 shadow-md ring-1 ring-primary-500' 
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${policy.enabled ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-slate-300'}`}></div>
                                    <span className={`font-bold text-sm truncate max-w-[140px] ${selectedPolicyId === policy.id ? 'text-primary-900' : 'text-slate-800'}`}>{policy.name}</span>
                                </div>
                                <button onClick={(e) => togglePolicy(policy.id, e)} className="text-slate-400 hover:text-primary-600 transition-colors">
                                    {policy.enabled ? <ToggleRight className="w-5 h-5 text-emerald-500"/> : <ToggleLeft className="w-5 h-5"/>}
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 relative z-10 pl-4">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    {policy.triggerType === 'cron' ? <Clock className="w-3 h-3"/> : <Zap className="w-3 h-3"/>}
                                    {policy.triggerType === 'cron' ? '定时' : '阈值'}
                                </span>
                                <span>{policy.spatialStrategy === 'map_tile' ? '网格' : '行政区'}</span>
                            </div>
                            {selectedPolicyId === policy.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>
                            )}
                        </div>
                     ))}
                     {filteredPolicies.length === 0 && (
                         <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                             未找到策略
                         </div>
                     )}
                </div>
            </aside>

            {/* Center: Editor (55%) */}
            <main className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-sm bg-white">
                 {activePolicy ? (
                     <>
                        {/* Editor Header */}
                        <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between bg-slate-50/30">
                            <div className="flex-1 mr-8">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="text" 
                                        value={activePolicy.name}
                                        onChange={(e) => handleUpdate('name', e.target.value)}
                                        className="text-lg font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-500 focus:bg-white outline-none transition-all px-1 -ml-1 rounded w-full max-w-md"
                                    />
                                    <span className="text-xs text-slate-400 border border-slate-200 bg-white px-2 py-0.5 rounded font-mono shrink-0">{activePolicy.id}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded border ${activePolicy.enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    {activePolicy.enabled ? 'ACTIVE' : 'DRAFT'}
                                </span>
                                <div className="h-4 w-px bg-slate-200"></div>
                                <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4"/></button>
                            </div>
                        </div>

                        {/* Editor Form Scroller */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            <div className="space-y-6 max-w-3xl mx-auto">
                                
                                {/* 1. Scope Definition */}
                                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-blue-500" /> 作用域 (Scope)
                                    </h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 block mb-2">目标产线</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100">
                                                {Object.entries(groupedPipelines).map(([code, group]) => (
                                                    (group as any[]).length > 0 && (
                                                        <optgroup key={code} label={PIPELINE_GROUP_LABELS[code] || '其他'}>
                                                            {(group as any[]).map((p: any) => (
                                                                <option key={p.value} value={p.value}>{p.label}</option>
                                                            ))}
                                                        </optgroup>
                                                    )
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 block mb-2">空间覆盖</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100">
                                                <option>全局 (Global)</option>
                                                <option>北京 (Beijing)</option>
                                                <option>上海 (Shanghai)</option>
                                                <option>华北地区 (North CN)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Trigger Rules */}
                                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-500" /> 触发条件 (Trigger)
                                    </h4>
                                    
                                    <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-lg w-fit">
                                        <button 
                                            onClick={() => handleUpdate('triggerType', 'cron')}
                                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${activePolicy.triggerType === 'cron' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            定时调度 (Cron)
                                        </button>
                                        <button 
                                            onClick={() => handleUpdate('triggerType', 'threshold')}
                                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${activePolicy.triggerType === 'threshold' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            阈值触发 (Event)
                                        </button>
                                    </div>

                                    {activePolicy.triggerType === 'cron' ? (
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 block mb-2">Cron 表达式</label>
                                            <div className="flex gap-4 items-center">
                                                <input 
                                                    type="text" 
                                                    value={activePolicy.triggerValue} 
                                                    onChange={(e) => handleUpdate('triggerValue', e.target.value)}
                                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-primary-100 outline-none"
                                                />
                                                <span className="text-xs text-slate-500">Next: 02:00 Tomorrow</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 block mb-2">积压阈值条件</label>
                                            <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                                                <span className="text-sm text-slate-600 pl-2">When Backlog</span>
                                                <select className="bg-white border border-slate-300 rounded px-2 py-1 text-sm"><option>{'>'}</option><option>{'>='}</option></select>
                                                <input 
                                                    type="number" 
                                                    className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                                                    placeholder="1000"
                                                />
                                                <span className="text-sm text-slate-600">items</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Packaging Strategy */}
                                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Box className="w-4 h-4 text-purple-500" /> 打包与分发 (Dispatch)
                                    </h4>
                                    
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 block mb-2">空间聚合</label>
                                                <select 
                                                    value={activePolicy.spatialStrategy} 
                                                    onChange={(e) => handleUpdate('spatialStrategy', e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100"
                                                >
                                                    <option value="map_tile">Map Tile (网格)</option>
                                                    <option value="admin_district">Admin District (行政区)</option>
                                                    <option value="road_network">Topology (拓扑连通)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 block mb-2">后续动作</label>
                                                <select 
                                                    value={activePolicy.action} 
                                                    onChange={(e) => handleUpdate('action', e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100"
                                                >
                                                    <option value="auto_push">Auto Push to Pipeline</option>
                                                    <option value="draft">Generate Draft & Notify</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-700 block mb-2">SLA 设定</label>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400"/>
                                                <input type="number" className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-sm text-center" defaultValue={24} />
                                                <span className="text-sm text-slate-600">Hours</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
                            <button 
                                onClick={handleDelete}
                                className="text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> 删除
                            </button>
                            <div className="flex gap-3">
                                <button className="px-5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors text-sm">取消</button>
                                <button className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-md shadow-primary-200 transition-colors flex items-center gap-2 text-sm">
                                    <Save className="w-4 h-4" /> 保存配置
                                </button>
                            </div>
                        </div>
                     </>
                 ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                         <Bot className="w-16 h-16 mb-4 opacity-20" />
                         <p>请选择或创建一个策略以开始配置</p>
                     </div>
                 )}
            </main>

            {/* Right: Simulation (25%) */}
            <aside className="w-72 glass-panel rounded-xl flex flex-col shrink-0 bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                        <BarChart3 className="w-4 h-4 text-primary-600"/> 影响预估 (Impact)
                    </h3>
                </div>
                
                {activePolicy && simulationStats ? (
                    <div className="flex-1 p-5 space-y-6 overflow-y-auto">
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                                <div className="text-xs font-bold text-blue-500 uppercase mb-1">匹配线索数</div>
                                <div className="text-3xl font-black text-blue-700">{simulationStats.matchedClues.toLocaleString()}</div>
                                <div className="text-[10px] text-blue-400 mt-1">Based on current backlog</div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">预估包数</div>
                                    <div className="text-lg font-bold text-slate-800 mt-1">~{simulationStats.estimatedPackages}</div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">平均包大小</div>
                                    <div className="text-lg font-bold text-slate-800 mt-1">{simulationStats.avgSize}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">区域分布预览</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-600">海淀区 (Grid 5-9)</span>
                                    <span className="font-bold">45%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500 w-[45%]"></div>
                                </div>
                                <div className="flex justify-between items-center text-xs pt-1">
                                    <span className="text-slate-600">朝阳区</span>
                                    <span className="font-bold">30%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-400 w-[30%]"></div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button 
                                onClick={() => setIsSimulating(!isSimulating)}
                                className="w-full py-2.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                                {isSimulating ? '计算中...' : '重新运行模拟'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                        No active policy
                    </div>
                )}
            </aside>
        </div>
    );
};
