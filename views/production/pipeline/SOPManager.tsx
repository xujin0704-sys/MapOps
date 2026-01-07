
import React, { useState, useMemo, useEffect } from 'react';
import { 
    BookOpen, 
    Search, 
    Plus, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Edit3, 
    ListChecks, 
    ChevronDown, 
    LayoutDashboard, 
    Filter, 
    ArrowUp, 
    ArrowDown, 
    MoreHorizontal, 
    X,
    Globe,
    MapPin,
    Footprints,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    GitBranch,
    FileText,
    Trash2,
    Calendar,
    Layers,
    LayoutList,
    Save,
    History
} from 'lucide-react';
import { useDictionary } from '../../../contexts/DictionaryContext';

// --- Types ---

export interface SOPStep {
    id: string;
    title: string;
    description: string;
    type: 'action' | 'check' | 'input';
    required: boolean;
}

interface DictionaryItem {
    label: string;
    value: string;
    color?: string;
    code?: string;
}

export interface SOP {
    id: string; 
    seriesId: string;
    pipeline: string;
    subPipeline: string; 
    title: string;
    version: string;
    updatedAt: string;
    author: string;
    status: 'Published' | 'Draft' | 'Archived';
    steps: SOPStep[];
    sortOrder?: number;
}

// --- Mock Data ---

const PIPELINE_GROUPS = [
    { id: 'Foundation', label: '基础地理', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'Location', label: '地点与地址', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'LastMile', label: '末端场景', icon: Footprints, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export const MOCK_SOPS: SOP[] = [
    {
        id: 'SOP-001-v3.0',
        seriesId: 'SOP-001',
        pipeline: 'Road',
        subPipeline: 'road-new',
        title: '道路矢量化标准作业流程',
        version: 'v3.0',
        updatedAt: '2023-10-25',
        author: 'Methodology Team',
        status: 'Published',
        sortOrder: 1,
        steps: [
            { id: 'st-1', title: '加载底图数据', description: '加载指定区域的卫星影像与点云数据。', type: 'action', required: true },
            { id: 'st-2', title: '检查自动提取结果', description: '核对 AI 预提取的道路中心线是否连续。', type: 'check', required: true },
            { id: 'st-3', title: '属性录入', description: '填写道路等级、车道数及材质信息。', type: 'input', required: true },
        ]
    },
    {
        id: 'SOP-001-v2.0',
        seriesId: 'SOP-001',
        pipeline: 'Road',
        subPipeline: 'road-new',
        title: '道路矢量化标准作业流程',
        version: 'v2.0',
        updatedAt: '2023-08-10',
        author: 'Methodology Team',
        status: 'Archived',
        sortOrder: 1,
        steps: []
    },
    {
        id: 'SOP-004-v1.0',
        seriesId: 'SOP-004',
        pipeline: 'Road',
        subPipeline: 'road-change',
        title: '道路属性录入规范',
        version: 'v1.0',
        updatedAt: '2023-11-01',
        author: 'Data Team',
        status: 'Published',
        sortOrder: 2,
        steps: [
            { id: 'st-1', title: '等级确认', description: '根据国标确认道路功能等级', type: 'check', required: true }
        ]
    },
    {
        id: 'SOP-005-v1.2',
        seriesId: 'SOP-005',
        pipeline: 'Road',
        subPipeline: 'road-fix',
        title: '路网拓扑检查规范',
        version: 'v1.2',
        updatedAt: '2023-10-29',
        author: 'QA Team',
        status: 'Draft',
        sortOrder: 3,
        steps: [
            { id: 'st-1', title: '运行自动检查', description: '执行 Topology Checker 插件', type: 'action', required: true }
        ]
    },
    {
        id: 'SOP-002-v1.2',
        seriesId: 'SOP-002',
        pipeline: 'POI',
        subPipeline: 'poi-new',
        title: 'POI 信息采集规范',
        version: 'v1.2',
        updatedAt: '2023-10-20',
        author: 'Data Ops',
        status: 'Published',
        sortOrder: 1,
        steps: [
            { id: 'st-1', title: '名称核对', description: '对比招牌名称与工商注册名称。', type: 'check', required: true },
            { id: 'st-2', title: '分类确认', description: '依据国标分类表选择正确的行业分类。', type: 'input', required: true },
        ]
    },
    {
        id: 'SOP-003-v0.9',
        seriesId: 'SOP-003',
        pipeline: 'Admin',
        subPipeline: 'admin-adjust',
        title: '行政区划边界调整指引',
        version: 'v0.9 (Draft)',
        updatedAt: '2023-10-28',
        author: 'Policy Dept',
        status: 'Draft',
        sortOrder: 1,
        steps: [
            { id: 'st-1', title: '公文解读', description: '阅读并高亮政府公文中的关键界线描述。', type: 'action', required: true },
        ]
    }
];

// --- Sub-Components ---

const SOPStats = ({ sops }: { sops: SOP[] }) => {
    // Unique series count
    const uniqueSeries = new Set(sops.map(s => s.seriesId)).size;
    const published = sops.filter(s => s.status === 'Published').length;
    const drafts = sops.filter(s => s.status === 'Draft').length;
    // Calculate average steps (mock complexity metric)
    const avgSteps = sops.length > 0 
        ? (sops.reduce((acc, s) => acc + s.steps.length, 0) / sops.length).toFixed(1)
        : '0';

    return (
        <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">SOP 总数</div>
                    <div className="text-2xl font-black text-slate-900">{uniqueSeries} <span className="text-sm font-medium text-slate-400">Series</span></div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><BookOpen className="w-5 h-5"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">已发布</div>
                    <div className="text-2xl font-black text-emerald-600">{published}</div>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle2 className="w-5 h-5"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">草稿中</div>
                    <div className="text-2xl font-black text-amber-600">{drafts}</div>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Edit3 className="w-5 h-5"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">平均复杂度</div>
                    <div className="text-2xl font-black text-purple-600">{avgSteps} <span className="text-sm font-medium text-slate-400">Steps</span></div>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><ListChecks className="w-5 h-5"/></div>
            </div>
        </div>
    );
};

const SOPCard = ({ sop, onClick, getPipelineLabel }: { sop: SOP, onClick: () => void, getPipelineLabel: (v:string)=>string }) => {
    const statusColor = sop.status === 'Published' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                        sop.status === 'Draft' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-500 bg-slate-100 border-slate-200';

    return (
        <div 
            onClick={onClick}
            className="glass-panel p-5 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all border border-slate-200 hover:border-primary-300 cursor-pointer group h-full"
        >
            <div>
                <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusColor}`}>
                        {sop.status}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"><Edit3 className="w-3.5 h-3.5"/></button>
                        <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                </div>
                
                <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2 leading-tight">{sop.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{getPipelineLabel(sop.pipeline)}</span>
                    <span>•</span>
                    <span className="font-mono">{sop.version}</span>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {sop.updatedAt}</span>
                <span className="flex items-center gap-1"><GitBranch className="w-3 h-3"/> {sop.steps.length} Steps</span>
            </div>
        </div>
    );
};

const SOPListTable = ({ sops, onSelect, getPipelineLabel }: { sops: SOP[], onSelect: (sop: SOP) => void, getPipelineLabel: (v:string)=>string }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="overflow-auto flex-1">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4">SOP 标题</th>
                            <th className="px-6 py-4">产线</th>
                            <th className="px-6 py-4">版本</th>
                            <th className="px-6 py-4">状态</th>
                            <th className="px-6 py-4">步骤数</th>
                            <th className="px-6 py-4">更新时间</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sops.map(sop => (
                            <tr key={sop.id} className="hover:bg-slate-50 cursor-pointer group transition-colors" onClick={() => onSelect(sop)}>
                                <td className="px-6 py-4 font-bold text-slate-900">
                                    {sop.title}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
                                        {getPipelineLabel(sop.pipeline)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs text-slate-600">{sop.version}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-1 rounded font-bold border ${
                                        sop.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        sop.status === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}>
                                        {sop.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-xs">
                                    {sop.steps.length}
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                                    {sop.updatedAt}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary-600 hover:text-primary-700 text-xs font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                        编辑
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Detailed Editor (Refactored) ---

const SOPEditor = ({ sop, relatedVersions, onBack, onSelectVersion }: { sop: SOP, relatedVersions: SOP[], onBack: () => void, onSelectVersion: (sop: SOP) => void }) => {
    const [showHistory, setShowHistory] = useState(false);

    return (
        <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
            {/* Header */}
            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-none mb-1">
                            {sop.title}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono bg-slate-100 px-1 rounded text-slate-600 border border-slate-200">{sop.seriesId}</span>
                            <span>•</span>
                            <span className="font-bold">{sop.version}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-2 ${showHistory ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <History className="w-3.5 h-3.5" /> 历史版本
                    </button>
                    <div className="h-4 w-px bg-slate-300 mx-1"></div>
                    <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                        预览
                    </button>
                    <button className="px-4 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 flex items-center gap-2 shadow-sm transition-colors">
                        <Save className="w-3.5 h-3.5" /> 保存
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Metadata Card */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-bold ${
                                sop.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                                sop.status === 'Draft' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {sop.status.toUpperCase()}
                            </div>
                            
                            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400"/> 版本信息
                            </h3>
                            <div className="grid grid-cols-3 gap-8">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">最后更新</label>
                                    <div className="text-sm font-medium text-slate-900">{sop.updatedAt}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">维护人</label>
                                    <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                            {sop.author.charAt(0)}
                                        </div>
                                        {sop.author}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">变更摘要</label>
                                    <div className="text-sm font-medium text-slate-900 truncate">Routine maintenance update.</div>
                                </div>
                            </div>
                        </div>

                        {/* Steps List */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <ListChecks className="w-4 h-4 text-slate-500" />
                                作业步骤 ({sop.steps.length})
                            </h3>
                            <div className="space-y-4">
                                {sop.steps.map((step, index) => (
                                    <div key={step.id} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-500 font-bold text-xs flex items-center justify-center group-hover:border-primary-500 group-hover:text-primary-600 transition-colors shadow-sm z-10">
                                                {index + 1}
                                            </div>
                                            {index !== sop.steps.length - 1 && <div className="w-0.5 bg-slate-200 flex-1 my-1"></div>}
                                        </div>
                                        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-primary-200 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-800 text-base">{step.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                                        step.type === 'action' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        step.type === 'check' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-purple-50 text-purple-700 border-purple-100'
                                                    }`}>{step.type}</span>
                                                    {step.required && (
                                                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3"/> Mandatory
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                                            <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-xs font-bold text-primary-600 hover:underline">配置动作 &rarr;</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {sop.steps.length === 0 && (
                                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                                        <p className="text-slate-400 text-sm">暂无步骤</p>
                                    </div>
                                )}
                            </div>
                            <button className="mt-6 w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold text-sm hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> 添加步骤
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Sidebar */}
                {showHistory && (
                    <div className="w-80 border-l border-slate-200 bg-white flex flex-col animate-in slide-in-from-right duration-200 shadow-xl z-10">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                <History className="w-4 h-4 text-slate-500" /> 版本记录
                            </h3>
                            <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {relatedVersions.map(ver => (
                                <div 
                                    key={ver.id}
                                    onClick={() => onSelectVersion(ver)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                        ver.id === sop.id 
                                        ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-200' 
                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-mono font-bold text-sm ${ver.id === sop.id ? 'text-primary-700' : 'text-slate-700'}`}>{ver.version}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                                            ver.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            ver.status === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                            'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            {ver.status}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> {ver.updatedAt}
                                    </div>
                                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {ver.author.charAt(0)}
                                        </div>
                                        {ver.author}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SOPFormModal = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (data: Partial<SOP>) => void }) => {
    const { dictionary } = useDictionary();
    const pipelines = (dictionary['pipeline'] || []) as DictionaryItem[];
    
    const [formData, setFormData] = useState<Partial<SOP>>({
        title: '',
        version: 'v1.0',
        pipeline: pipelines[0]?.value || 'Road',
        subPipeline: ''
    });

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: '',
                version: 'v1.0',
                pipeline: pipelines[0]?.value || 'Road',
                subPipeline: ''
            });
        }
    }, [isOpen, pipelines]);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-[500px] overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">新建标准作业程序 (SOP)</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SOP 标题</label>
                        <input 
                            autoFocus
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100"
                            placeholder="e.g. 道路数据采集规范"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">所属产线</label>
                            <select 
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100"
                                value={formData.pipeline}
                                onChange={e => setFormData({...formData, pipeline: e.target.value})}
                            >
                                {pipelines.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">版本号</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100"
                                placeholder="v1.0"
                                value={formData.version}
                                onChange={e => setFormData({...formData, version: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">取消</button>
                    <button 
                        onClick={() => onSave(formData)} 
                        disabled={!formData.title}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        创建 SOP
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SOPManager = () => {
    const { dictionary } = useDictionary();
    const pipelines: DictionaryItem[] = (dictionary['pipeline'] || []) as unknown as DictionaryItem[];

    // --- State ---
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [sops, setSops] = useState<SOP[]>(MOCK_SOPS);
    const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft'>('All');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // --- Helpers ---
    const getPipelineLabel = (val: string) => pipelines.find((p) => p.value === val)?.label || val;

    // --- Filter Logic ---
    const filteredSOPs = useMemo(() => {
        return sops.filter(s => {
            // Category Filter
            let matchCategory = true;
            if (activeCategory !== 'All') {
                const pipeline = pipelines.find(p => p.value === s.pipeline);
                // Check if activeCategory matches the Pipeline Group Code (Foundation, etc.) or specific Pipeline Value
                if (pipeline?.code === activeCategory) {
                    matchCategory = true;
                } else if (s.pipeline === activeCategory) {
                    matchCategory = true;
                } else {
                    matchCategory = false;
                }
            }

            // Status Filter
            const matchStatus = statusFilter === 'All' || s.status === statusFilter;

            // Search
            const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.pipeline.toLowerCase().includes(searchQuery.toLowerCase());

            return matchCategory && matchStatus && matchSearch;
        });
    }, [sops, activeCategory, statusFilter, searchQuery, pipelines]);

    // Handle Create
    const handleSaveSOP = (formData: Partial<SOP>) => {
        const newSOP: SOP = {
            id: `SOP-${Date.now()}-v1.0`,
            seriesId: `SOP-${Date.now()}`,
            pipeline: formData.pipeline || 'Road',
            subPipeline: formData.subPipeline || '',
            title: formData.title || 'New SOP',
            version: formData.version || 'v1.0',
            status: 'Draft',
            updatedAt: new Date().toISOString().split('T')[0],
            author: 'CurrentUser',
            steps: [],
            sortOrder: 999
        };
        setSops([...sops, newSOP]);
        setIsCreateModalOpen(false);
        setSelectedSOP(newSOP); // Open editor immediately
    };

    // Calculate related versions for selected SOP
    const relatedVersions = useMemo(() => {
        if (!selectedSOP) return [];
        return sops
            .filter(s => s.seriesId === selectedSOP.seriesId)
            .sort((a, b) => b.version.localeCompare(a.version));
    }, [sops, selectedSOP]);

    // --- Render ---

    if (selectedSOP) {
        return <SOPEditor 
            sop={selectedSOP} 
            relatedVersions={relatedVersions}
            onBack={() => setSelectedSOP(null)} 
            onSelectVersion={setSelectedSOP}
        />;
    }

    return (
        <div className="h-full flex flex-col relative">
            <SOPFormModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSave={handleSaveSOP} 
            />

            {/* 1. Statistics Dashboard */}
            <SOPStats sops={filteredSOPs} />

            {/* 2. Toolbar */}
            <div className="flex justify-between items-center mb-4 shrink-0 px-1">
                <div className="flex gap-3 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="搜索 SOP..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 w-64 shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-transparent text-sm text-slate-600 outline-none cursor-pointer font-medium"
                        >
                            <option value="All">所有状态</option>
                            <option value="Published">已发布</option>
                            <option value="Draft">草稿</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex bg-slate-200 p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('card')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md shadow-primary-200"
                    >
                        <Plus className="w-4 h-4" /> 新建 SOP
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* 3. Sidebar (Filters) */}
                <aside className="w-56 glass-panel rounded-xl p-4 flex flex-col shrink-0 bg-white">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">分类筛选</h3>
                    <div className="space-y-1.5 overflow-y-auto flex-1">
                        <button 
                            onClick={() => setActiveCategory('All')}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-bold transition-colors ${
                                activeCategory === 'All' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            <Layers className="w-4 h-4"/> 全部 (All)
                        </button>
                        
                        {PIPELINE_GROUPS.map((group) => (
                            <div key={group.id} className="pt-2">
                                <button 
                                    onClick={() => setActiveCategory(group.id)}
                                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        activeCategory === group.id ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                    }`}
                                >
                                    <group.icon className={`w-4 h-4 ${group.color}`}/> {group.label}
                                </button>
                                {/* Sub-items (Pipelines in this group) */}
                                <div className="ml-4 mt-1 space-y-1 border-l border-slate-100 pl-2">
                                    {pipelines.filter(p => p.code === group.id).map(p => (
                                        <button
                                            key={p.value}
                                            onClick={() => setActiveCategory(p.value)}
                                            className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                                                activeCategory === p.value ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* 4. Main Content (Grid/List) */}
                <main className="flex-1 overflow-hidden">
                    {viewMode === 'card' ? (
                        <div className="h-full overflow-y-auto pr-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 pb-6">
                                {filteredSOPs.map(sop => (
                                    <div key={sop.id} className="h-48">
                                        <SOPCard 
                                            sop={sop} 
                                            onClick={() => setSelectedSOP(sop)} 
                                            getPipelineLabel={getPipelineLabel}
                                        />
                                    </div>
                                ))}
                                {filteredSOPs.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>暂无符合条件的 SOP</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <SOPListTable 
                            sops={filteredSOPs} 
                            onSelect={(sop) => setSelectedSOP(sop)} 
                            getPipelineLabel={getPipelineLabel}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};
