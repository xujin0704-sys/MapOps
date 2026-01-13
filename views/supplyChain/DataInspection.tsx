
import React, { useState, useMemo } from 'react';
import { 
    Microscope, 
    Search, 
    Filter, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    ArrowRight, 
    Clock, 
    Database, 
    ChevronRight, 
    ShieldCheck, 
    FileJson, 
    Video, 
    ImageIcon, 
    FileText,
    RefreshCw,
    X,
    Check,
    MoreHorizontal,
    FileSearch,
    Zap,
    Upload,
    FolderOpen,
    Settings,
    Plus,
    Trash2,
    Code,
    Settings2,
    Play,
    Truck,
    HardDrive,
    ExternalLink
} from 'lucide-react';

// --- Types ---

type InspectionStatus = 'Pending' | 'Analyzing' | 'Passed' | 'Failed' | 'Promoted';

interface InspectionRule {
    id: string;
    name: string;
    type: 'Format' | 'Geometry' | 'Business' | 'Logic';
    description: string;
    isEnabled: boolean;
    configJson?: string;
}

interface DataBatch {
    id: string;
    name: string;
    source: string;
    type: 'Satellite' | 'StreetView' | 'POI_JSON' | 'GovDoc';
    status: InspectionStatus;
    score: number | null;
    itemsCount: number;
    size: string;
    receivedAt: string;
    appliedRules: string[];
    metrics?: {
        integrity: number;
        accuracy: number;
        consistency: number;
    };
}

// --- Mock Data ---

const INITIAL_RULES: InspectionRule[] = [
    { id: 'rule-001', name: 'Schema 协议校验', type: 'Format', description: '验证字段名称、类型及嵌套结构是否符合标准定义。', isEnabled: true },
    { id: 'rule-002', name: '地理范围 (BBox) 检查', type: 'Geometry', description: '检测坐标是否在合法的行政区划地理边界内。', isEnabled: true },
    { id: 'rule-003', name: '必填字段空值率', type: 'Business', description: '统计关键字段（如 ID, Name）的缺失率，阈值 5%。', isEnabled: true },
    { id: 'rule-004', name: '坐标系偏移检测', type: 'Geometry', description: '通过基准点比对，检测数据是否存在系统性坐标偏移。', isEnabled: true },
];

const INITIAL_MOCK_BATCHES: DataBatch[] = [
    { 
        id: 'RAW-20231026-01', 
        name: 'BJ_HD_Sat_Batch_Q4', 
        source: 'Sentinel-2 API', 
        type: 'Satellite', 
        status: 'Analyzing', 
        score: null, 
        itemsCount: 145, 
        size: '1.2 TB', 
        receivedAt: '10 mins ago',
        appliedRules: ['rule-001', 'rule-002', 'rule-004'],
        metrics: { integrity: 85, accuracy: 90, consistency: 70 }
    },
    { 
        id: 'RAW-20231025-05', 
        name: 'StreetView_Crawl_0921', 
        source: 'Auto-Spider-V3', 
        type: 'StreetView', 
        status: 'Passed', 
        score: 98, 
        itemsCount: 1240, 
        size: '450 GB', 
        receivedAt: '2h ago',
        appliedRules: ['rule-001', 'rule-003'],
        metrics: { integrity: 100, accuracy: 98, consistency: 97 }
    },
    { 
        id: 'RAW-20231025-02', 
        name: 'Gov_Doc_Transfer_A', 
        source: 'Internal Portal', 
        type: 'GovDoc', 
        status: 'Failed', 
        score: 42, 
        itemsCount: 12, 
        size: '24 MB', 
        receivedAt: '5h ago',
        appliedRules: ['rule-001', 'rule-004'],
        metrics: { integrity: 60, accuracy: 40, consistency: 30 }
    },
];

// --- Modals ---

const RuleLibraryModal = ({ isOpen, onClose, rules, setRules }: { isOpen: boolean, onClose: () => void, rules: InspectionRule[], setRules: any }) => {
    const [editingRule, setEditingRule] = useState<Partial<InspectionRule> | null>(null);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[80] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-[800px] h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary-600"/> 探查规则库管理
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">定义和配置可重用的数据探查逻辑与阈值</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5"/></button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/30">
                        <div className="p-4">
                            <button 
                                onClick={() => setEditingRule({ id: `rule-${Date.now()}`, name: '新规则', type: 'Format', isEnabled: true })}
                                className="w-full py-2 bg-white border border-slate-200 hover:border-primary-400 text-slate-600 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                            >
                                <Plus className="w-3.5 h-3.5" /> 新增规则
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {rules.map(rule => (
                                <div 
                                    key={rule.id}
                                    onClick={() => setEditingRule(rule)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                        editingRule?.id === rule.id ? 'bg-white border-primary-500 shadow-md ring-1 ring-primary-500' : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-xs text-slate-800">{rule.name}</span>
                                        <span className={`text-[10px] px-1.5 rounded-full font-bold ${
                                            rule.type === 'Geometry' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 bg-slate-100'
                                        }`}>{rule.type}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 line-clamp-1">{rule.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto">
                        {editingRule ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">规则名称</label>
                                        <input type="text" value={editingRule.name} onChange={e => setEditingRule({...editingRule, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">类型</label>
                                        <select value={editingRule.type} onChange={e => setEditingRule({...editingRule, type: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none">
                                            <option>Format</option>
                                            <option>Geometry</option>
                                            <option>Business</option>
                                            <option>Logic</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">状态</label>
                                        <button onClick={() => setEditingRule({...editingRule, isEnabled: !editingRule.isEnabled})} className={`w-full py-2 text-xs font-bold rounded-lg border transition-all ${editingRule.isEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                            {editingRule.isEnabled ? '启用 (Enabled)' : '禁用 (Disabled)'}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">规则逻辑定义 (JSON)</label>
                                    <div className="relative group">
                                        <textarea rows={6} className="w-full bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl p-4 outline-none resize-none shadow-inner" placeholder={`{\n  "operator": "check",\n  "threshold": 0.05\n}`}></textarea>
                                        <div className="absolute top-2 right-2 text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 rounded flex items-center gap-1 opacity-60"><Code className="w-3 h-3"/> DSL</div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button onClick={() => setEditingRule(null)} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold shadow-md">保存更改</button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-60">
                                <Settings className="w-16 h-16" />
                                <p className="text-sm font-medium">请从左侧选择规则进行编辑</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const BatchRuleEditorModal = ({ isOpen, onClose, batch, ruleLibrary, onSave }: { isOpen: boolean, onClose: () => void, batch: DataBatch, ruleLibrary: InspectionRule[], onSave: (rules: string[]) => void }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(batch.appliedRules));

    const toggleRule = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[80] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-[540px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-primary-600"/> 批次探查规则配置
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">调整批次 [{batch.id}] 的个性化探查项</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/20">
                    {ruleLibrary.map(rule => (
                        <div 
                            key={rule.id}
                            onClick={() => toggleRule(rule.id)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                                selectedIds.has(rule.id) ? 'bg-primary-50 border-primary-500 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                selectedIds.has(rule.id) ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-300'
                            }`}>
                                {selectedIds.has(rule.id) && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1">
                                <span className="font-bold text-sm text-slate-800">{rule.name}</span>
                                <p className="text-xs text-slate-500 line-clamp-1">{rule.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-sm">取消</button>
                    <button onClick={() => onSave(Array.from(selectedIds))} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 active:scale-95 text-sm">
                        <Play className="w-4 h-4" /> 更新并重跑探查
                    </button>
                </div>
            </div>
        </div>
    );
};

const PromoteToHubModal = ({ batch, isOpen, onClose, onConfirm }: { batch: DataBatch, isOpen: boolean, onClose: () => void, onConfirm: (data: any) => void }) => {
    const [targetType, setTargetType] = useState(batch.type);

    if (!isOpen) return null;

    const handlePromote = () => {
        const newAsset = {
            id: `A-${Date.now().toString().slice(-4)}`,
            name: batch.name,
            thumbnailColor: batch.type === 'Satellite' ? 'bg-blue-200' : 'bg-slate-200',
            type: [targetType],
            status: 'cataloged',
            source: batch.source,
            initialTime: new Date().toLocaleString(),
            date: new Date().toISOString().split('T')[0],
            lastUpdated: 'Just Promoted',
            size: batch.size,
            sizeBytes: parseFloat(batch.size), 
            tags: ['Auto-Promoted'],
            isRecent: true,
            history: [{ id: 'h1', type: 'import', timestamp: new Date().toLocaleString(), operator: 'System', description: `从探查队列 [${batch.id}] 并入库`, versionTag: 'V1' }]
        };
        onConfirm(newAsset);
    };

    return (
        <div className="absolute inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-[480px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 bg-emerald-50 shrink-0 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Truck className="w-5 h-5 text-emerald-600"/> 确认并入库</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                         <div className="flex justify-between text-xs text-slate-500 font-bold uppercase"><span>批次 ID</span><span className="font-mono text-slate-900">{batch.id}</span></div>
                         <div className="flex justify-between text-xs text-slate-500 font-bold uppercase"><span>质量评分</span><span className="text-emerald-600 font-bold">{batch.score}%</span></div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">入库分类</label>
                        <select value={targetType} onChange={(e) => setTargetType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 outline-none">
                            <option value="Satellite">卫星影像</option>
                            <option value="StreetView">街景资料</option>
                            <option value="POI_JSON">POI 结构化</option>
                            <option value="GovDoc">政府公文</option>
                        </select>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-sm">取消</button>
                    <button onClick={handlePromote} className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg text-sm flex items-center gap-2">确认入库 <ArrowRight className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};

// --- Main Components ---

const StatusChip = ({ status }: { status: InspectionStatus }) => {
    const styles = {
        Pending: 'bg-slate-100 text-slate-500 border-slate-200',
        Analyzing: 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse',
        Passed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        Failed: 'bg-rose-50 text-rose-600 border-rose-200',
        Promoted: 'bg-purple-50 text-purple-600 border-purple-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1 w-fit ${styles[status]}`}>
            {status === 'Analyzing' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
            {status === 'Promoted' && <Check className="w-2.5 h-2.5" />}
            {status}
        </span>
    );
};

const QualityBadge = ({ score }: { score: number | null }) => {
    if (score === null) return <span className="text-slate-400 font-mono italic opacity-50">Analyzing...</span>;
    const color = score >= 90 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-rose-600';
    return <span className={`font-mono font-bold ${color}`}>{score}%</span>;
};

const DataInspection = ({ onPromoted }: { onPromoted: (asset: any) => void }) => {
    const [batches, setBatches] = useState<DataBatch[]>(INITIAL_MOCK_BATCHES);
    const [selectedBatch, setSelectedBatch] = useState<DataBatch | null>(null);
    const [ruleLibrary, setRuleLibrary] = useState<InspectionRule[]>(INITIAL_RULES);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRuleManagerOpen, setIsRuleManagerOpen] = useState(false);
    const [batchToEditRules, setBatchToEditRules] = useState<DataBatch | null>(null);
    const [batchToPromote, setBatchToPromote] = useState<DataBatch | null>(null);

    const filteredBatches = batches.filter(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = useMemo(() => ({
        total: batches.filter(b => b.status !== 'Promoted').length,
        passed: batches.filter(b => b.status === 'Passed').length,
        analyzing: batches.filter(b => b.status === 'Analyzing').length,
        promotedCount: batches.filter(b => b.status === 'Promoted').length,
    }), [batches]);

    const handleSaveBatchRules = (newRules: string[]) => {
        if (!batchToEditRules) return;
        setBatches(prev => prev.map(b => b.id === batchToEditRules.id ? { 
            ...b, 
            appliedRules: newRules, 
            status: 'Analyzing', 
            score: null 
        } : b));
        setBatchToEditRules(null);
        setTimeout(() => {
            setBatches(prev => prev.map(b => b.id === batchToEditRules.id ? { 
                ...b, 
                status: 'Passed', 
                score: 95 
            } : b));
        }, 1500);
    };

    const handleConfirmPromotion = (asset: any) => {
        if (!batchToPromote) return;
        setBatches(prev => prev.map(b => b.id === batchToPromote.id ? { ...b, status: 'Promoted' } : b));
        onPromoted(asset);
        setBatchToPromote(null);
        if (selectedBatch?.id === batchToPromote.id) setSelectedBatch({ ...selectedBatch, status: 'Promoted' });
    };

    return (
        <div className="h-full flex flex-col gap-6 relative">
            <RuleLibraryModal 
                isOpen={isRuleManagerOpen} 
                onClose={() => setIsRuleManagerOpen(false)} 
                rules={ruleLibrary} 
                setRules={setRuleLibrary} 
            />
            {batchToEditRules && (
                <BatchRuleEditorModal 
                    isOpen={!!batchToEditRules} 
                    onClose={() => setBatchToEditRules(null)} 
                    batch={batchToEditRules} 
                    ruleLibrary={ruleLibrary} 
                    onSave={handleSaveBatchRules} 
                />
            )}
            {batchToPromote && (
                <PromoteToHubModal 
                    batch={batchToPromote} 
                    isOpen={!!batchToPromote} 
                    onClose={() => setBatchToPromote(null)} 
                    onConfirm={handleConfirmPromotion} 
                />
            )}

            {/* Top Stats Bar */}
            <div className="grid grid-cols-4 gap-4 shrink-0">
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between group transition-colors">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">接入待查批次</div>
                        <div className="text-2xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{stats.total}</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100"><Database className="w-5 h-5"/></div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">正在自动化探查</div>
                        <div className="text-2xl font-black text-blue-600">{stats.analyzing}</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 animate-pulse"><RefreshCw className="w-5 h-5"/></div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">已成功入库</div>
                        <div className="text-2xl font-black text-purple-600">{stats.promotedCount}</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600 border border-purple-100"><Truck className="w-5 h-5"/></div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-amber-500">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">探查通过待库</div>
                        <div className="text-2xl font-black text-amber-600">{stats.passed}</div>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><CheckCircle2 className="w-5 h-5"/></div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex gap-6 min-h-0">
                <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col bg-white border border-slate-200 shadow-sm">
                    <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0 bg-slate-50/30">
                        <div className="flex items-center gap-3">
                             <h3 className="font-bold text-slate-900">接入批次列表</h3>
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="搜索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-100 w-48 shadow-sm"/>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsRuleManagerOpen(true)} className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors active:scale-95">
                                <Settings className="w-3.5 h-3.5 text-slate-400" /> 规则库管理
                            </button>
                             <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-2 active:scale-95">
                                <Plus className="w-3.5 h-3.5" /> 上传接入
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4">批次名称 & ID</th>
                                    <th className="px-6 py-4">数据类型</th>
                                    <th className="px-6 py-4">探查质量</th>
                                    <th className="px-6 py-4">当前状态</th>
                                    <th className="px-6 py-4 text-right pr-8">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBatches.map(batch => (
                                    <tr 
                                        key={batch.id} 
                                        onClick={() => setSelectedBatch(batch)}
                                        className={`group cursor-pointer transition-colors ${selectedBatch?.id === batch.id ? 'bg-primary-50/50' : 'hover:bg-slate-50/50'}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">{batch.name}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{batch.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-500 bg-slate-50 uppercase">{batch.type}</span>
                                        </td>
                                        <td className="px-6 py-4"><QualityBadge score={batch.score} /></td>
                                        <td className="px-6 py-4"><StatusChip status={batch.status} /></td>
                                        <td className="px-6 py-4 text-right pr-8">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); setBatchToEditRules(batch); }} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded border border-transparent transition-all" title="配置规则">
                                                    <Settings2 className="w-4 h-4" />
                                                </button>
                                                {batch.status === 'Passed' && (
                                                    <button onClick={(e) => { e.stopPropagation(); setBatchToPromote(batch); }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5 active:scale-95">
                                                        <Truck className="w-3.5 h-3.5" /> 并入仓库
                                                    </button>
                                                )}
                                                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all"><MoreHorizontal className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <aside className={`w-[420px] glass-panel rounded-2xl flex flex-col bg-white border border-slate-200 transition-all duration-300 ${selectedBatch ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                    {selectedBatch && (
                        <>
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm"><Microscope className="w-5 h-5 text-primary-500" /></div>
                                    <div><h3 className="font-bold text-slate-900 leading-tight">探查执行报告</h3><p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">{selectedBatch.id}</p></div>
                                </div>
                                <button onClick={() => setSelectedBatch(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                <section className="animate-in fade-in slide-in-from-top-4 duration-500 text-center py-4">
                                    <div className="inline-flex flex-col items-center justify-center w-28 h-28 rounded-full border-8 border-slate-50 shadow-inner bg-white relative">
                                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                                            <circle cx="56" cy="56" r="48" fill="none" stroke="#eff6ff" strokeWidth="8" />
                                            <circle cx="56" cy="56" r="48" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="301" strokeDashoffset={301 - (301 * (selectedBatch.score || 0)) / 100} strokeLinecap="round" />
                                        </svg>
                                        <div className="text-3xl font-black text-slate-900 leading-none">{selectedBatch.score || '--'}</div>
                                    </div>
                                    <div className="mt-4">
                                        {selectedBatch.status === 'Promoted' ? (
                                            <div className="p-3 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl flex items-center justify-center gap-2 text-sm font-bold animate-in zoom-in duration-300">
                                                <ExternalLink className="w-4 h-4" /> 资料已在库中
                                            </div>
                                        ) : selectedBatch.status === 'Passed' ? (
                                            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">探查通过，符合接入标准</div>
                                        ) : (
                                            <div className="text-xs font-bold text-slate-400">探查结论生成中...</div>
                                        )}
                                    </div>
                                </section>
                                <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">已执行规则结果</h4>
                                    <div className="space-y-2">
                                        {(selectedBatch.appliedRules || []).map((ruleId, i) => {
                                            const rule = ruleLibrary.find(r => r.id === ruleId);
                                            const isFail = selectedBatch.status === 'Failed' && i === 1;
                                            return (
                                                <div key={ruleId} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        {isFail ? <XCircle className="w-4 h-4 text-rose-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                                        <div className="min-w-0">
                                                            <span className="text-xs font-bold text-slate-700 block truncate">{rule?.name || ruleId}</span>
                                                            <span className="text-[9px] text-slate-400 font-mono uppercase">{rule?.type || 'CUSTOM'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                                {selectedBatch.status === 'Failed' && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in shake duration-500">
                                        <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                                        <div>
                                            <h5 className="text-xs font-bold text-rose-700 uppercase mb-1">校验阻断</h5>
                                            <p className="text-[10px] text-rose-600 leading-relaxed">违反 [坐标系偏移检测]: 检测到 12% 的要素坐标与基准库偏移超过 5.0m。请核实转换参数。</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex gap-3 shrink-0">
                                {selectedBatch.status === 'Promoted' ? (
                                    <button className="w-full py-3 bg-white border border-slate-200 text-primary-600 text-xs font-bold rounded-xl hover:bg-primary-50 transition-all flex items-center justify-center gap-2">在集市中查看此资料 <ArrowRight className="w-4 h-4" /></button>
                                ) : (
                                    <>
                                        <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 shadow-sm active:scale-95">驳回修改</button>
                                        <button disabled={selectedBatch.status !== 'Passed'} onClick={() => setBatchToPromote(selectedBatch)} className={`flex-1 py-3 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${selectedBatch.status === 'Passed' ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-200' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}><Truck className="w-4 h-4" /> 审核通过并入库</button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default DataInspection;
