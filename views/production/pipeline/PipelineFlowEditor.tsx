
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
    GitCommit, 
    Inbox, 
    Wand2, 
    FilePlus2, 
    ShieldCheck, 
    GitMerge, 
    X, 
    Save, 
    Move, 
    ZoomIn, 
    ZoomOut, 
    ChevronDown, 
    Globe, 
    MapPin, 
    Footprints,
    LayoutGrid,
    List,
    Search,
    Filter,
    Plus,
    Clock, 
    MoreHorizontal,
    PlayCircle,
    ArrowLeft,
    Rocket,
    RotateCcw,
    Layers,
    CheckCircle2,
    AlertCircle,
    GitBranch,
    History
} from 'lucide-react';
import { MOCK_SOPS, SOP } from './SOPManager'; 
import { useDictionary } from '../../../contexts/DictionaryContext';

// --- TYPES ---

type NodeType = 'Listener' | 'AI Pre-process' | 'Task Gen' | 'QA Gate' | 'Merge';

interface PipelineNodeConfig {
  [key: string]: any; 
  listenTo?: string;
  model?: string;
  promptMapping?: string;
  sop?: string; // stores SOP ID
  assignTo?: string;
  checks?: string[];
  branch?: string;
}

interface PipelineNodeData {
  id: string;
  type: NodeType;
  label: string;
  config: PipelineNodeConfig;
}

interface PipelineFlow {
  id: string;
  seriesId: string; // Grouping ID for versions
  name: string;
  pipeline: string; // 'Road', 'POI', 'Admin'
  version: string;
  status: 'Active' | 'Draft' | 'Archived';
  updatedAt: string;
  author: string;
  nodes: PipelineNodeData[];
  edges: { from: string, to: string }[];
  description?: string;
}

// --- MOCK DATA ---

const MOCK_FLOWS_LIST: PipelineFlow[] = [
    {
        id: 'flow-road-001',
        seriesId: 'flow-road-series',
        name: '新增道路发现流程',
        pipeline: 'Road',
        version: 'v2.1.0',
        status: 'Active',
        updatedAt: '2023-10-26',
        author: 'System',
        description: '标准道路要素提取与入库流程，包含 SAM 预处理与人工复核。',
        nodes: [
            { id: 'n1', type: 'Listener', label: '监听线索池', config: { listenTo: '路网线索包' } },
            { id: 'n2', type: 'AI Pre-process', label: 'SAM 预处理', config: { model: 'SAM-Road-Adapter v1.2', promptMapping: 'Location -> Point Prompt' } },
            { id: 'n3', type: 'Task Gen', label: '生成矢量化任务', config: { sop: 'SOP-001-v3.0', assignTo: '高级路网技能组' } },
            { id: 'n4', type: 'QA Gate', label: '质量门禁', config: { checks: ['拓扑检查', '孤立点检查'] } },
            { id: 'n5', type: 'Merge', label: '版本归档', config: { branch: 'feature/road-daily' } },
        ],
        edges: [{from: 'n1', to: 'n2'}, {from: 'n2', to: 'n3'}, {from: 'n3', to: 'n4'}, {from: 'n4', to: 'n5'}]
    },
    {
        id: 'flow-road-001-v2.0',
        seriesId: 'flow-road-series',
        name: '新增道路发现流程',
        pipeline: 'Road',
        version: 'v2.0.0',
        status: 'Archived',
        updatedAt: '2023-09-15',
        author: 'System',
        description: '旧版流程，未集成 SAM v1.2。',
        nodes: [
            { id: 'n1', type: 'Listener', label: '监听线索池', config: { listenTo: '路网线索包' } },
            { id: 'n3', type: 'Task Gen', label: '生成矢量化任务', config: { sop: 'SOP-001-v2.0', assignTo: '普通路网组' } },
            { id: 'n5', type: 'Merge', label: '版本归档', config: { branch: 'feature/road-legacy' } },
        ],
        edges: [{from: 'n1', to: 'n3'}, {from: 'n3', to: 'n5'}]
    },
    {
        id: 'flow-poi-002',
        seriesId: 'flow-poi-series',
        name: 'POI 信息更新流程',
        pipeline: 'POI',
        version: 'v1.5.2',
        status: 'Active',
        updatedAt: '2023-10-25',
        author: 'Ops_Team',
        description: '基于互联网抓取数据的 POI 清洗与更新流水线。',
        nodes: [
            { id: 'n1', type: 'Listener', label: '监听爬虫数据', config: { listenTo: 'Web_Crawl_Topic' } },
            { id: 'n2', type: 'AI Pre-process', label: '大模型清洗', config: { model: 'LLM-POI-Cleaner', promptMapping: 'Json -> Struct' } },
            { id: 'n3', type: 'Task Gen', label: '生成审核任务', config: { sop: 'SOP-002-v1.2', assignTo: 'POI 审核组' } },
            { id: 'n4', type: 'Merge', label: '入库', config: { branch: 'master' } },
        ],
        edges: [{from: 'n1', to: 'n2'}, {from: 'n2', to: 'n3'}, {from: 'n3', to: 'n4'}]
    },
    {
        id: 'flow-admin-003',
        seriesId: 'flow-admin-series',
        name: '行政区划变更流程',
        pipeline: 'Admin',
        version: 'v1.0.0',
        status: 'Draft',
        updatedAt: '2023-10-28',
        author: 'Policy_Dept',
        description: '处理政府公文，更新行政区划边界。',
        nodes: [
            { id: 'n1', type: 'Listener', label: '监听公文源', config: { listenTo: 'Gov_Doc_Stream' } },
            { id: 'n2', type: 'Task Gen', label: '生成边界调整任务', config: { sop: 'SOP-003-v0.9', assignTo: '资深编辑' } },
            { id: 'n3', type: 'QA Gate', label: '拓扑一致性检查', config: { checks: ['重叠检查', '缝隙检查'] } },
            { id: 'n4', type: 'Merge', label: '发布', config: { branch: 'release/admin' } },
        ],
        edges: [{from: 'n1', to: 'n2'}, {from: 'n2', to: 'n3'}, {from: 'n3', to: 'n4'}]
    }
];

const NODE_META: { [key in NodeType]: { icon: React.ElementType, color: string, label: string } } = {
    Listener: { icon: Inbox, color: 'blue', label: '监听器' },
    'AI Pre-process': { icon: Wand2, color: 'purple', label: 'AI 预处理' },
    'Task Gen': { icon: FilePlus2, color: 'emerald', label: '任务生成' },
    'QA Gate': { icon: ShieldCheck, color: 'amber', label: '质量门禁' },
    Merge: { icon: GitMerge, color: 'slate', label: '合并归档' },
};

const PIPELINE_GROUPS = [
    { id: 'Foundation', label: '基础地理', icon: Globe, color: 'text-indigo-600' },
    { id: 'Location', label: '地点与地址', icon: MapPin, color: 'text-emerald-600' },
    { id: 'LastMile', label: '末端场景', icon: Footprints, color: 'text-amber-600' },
];

// --- Sub-Components ---

const FlowStats = ({ flows }: { flows: PipelineFlow[] }) => {
    // Count unique series
    const uniqueSeries = new Set(flows.map(f => f.seriesId)).size;
    const active = flows.filter(f => f.status === 'Active').length;
    const drafts = flows.filter(f => f.status === 'Draft').length;
    const avgNodes = flows.length > 0 ? (flows.reduce((acc, f) => acc + f.nodes.length, 0) / flows.length).toFixed(1) : 0;

    return (
        <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">流程总数</div>
                    <div className="text-2xl font-black text-slate-900">{uniqueSeries}</div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><GitBranch className="w-5 h-5"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">活跃流程</div>
                    <div className="text-2xl font-black text-emerald-600">{active}</div>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle2 className="w-5 h-5"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">草稿中</div>
                    <div className="text-2xl font-black text-amber-600">{drafts}</div>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><FilePlus2 className="w-5 h-5"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">平均节点数</div>
                    <div className="text-2xl font-black text-purple-600">{avgNodes}</div>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Layers className="w-5 h-5"/></div>
            </div>
        </div>
    );
};

const FlowCard = ({ flow, onClick, getPipelineLabel }: { flow: PipelineFlow, onClick: () => void, getPipelineLabel: (v:string)=>string }) => {
    const statusColor = flow.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                        flow.status === 'Draft' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-500 bg-slate-100 border-slate-200';

    return (
        <div 
            onClick={onClick}
            className="glass-panel p-5 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all border border-slate-200 hover:border-primary-300 cursor-pointer group h-full"
        >
            <div>
                <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusColor}`}>
                        {flow.status}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"><PlayCircle className="w-3.5 h-3.5"/></button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-colors"><MoreHorizontal className="w-3.5 h-3.5"/></button>
                    </div>
                </div>
                
                <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2 leading-tight">{flow.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{getPipelineLabel(flow.pipeline)}</span>
                    <span>•</span>
                    <span className="font-mono">{flow.version}</span>
                </div>
                
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{flow.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {flow.updatedAt}</span>
                <span className="flex items-center gap-1"><Layers className="w-3 h-3"/> {flow.nodes.length} Nodes</span>
            </div>
        </div>
    );
};

const FlowListTable = ({ flows, onSelect, getPipelineLabel }: { flows: PipelineFlow[], onSelect: (flow: PipelineFlow) => void, getPipelineLabel: (v:string)=>string }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="overflow-auto flex-1">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4">流程名称</th>
                            <th className="px-6 py-4">产线</th>
                            <th className="px-6 py-4">版本</th>
                            <th className="px-6 py-4">状态</th>
                            <th className="px-6 py-4">节点数</th>
                            <th className="px-6 py-4">更新时间</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {flows.map(flow => (
                            <tr key={flow.id} className="hover:bg-slate-50 cursor-pointer group transition-colors" onClick={() => onSelect(flow)}>
                                <td className="px-6 py-4 font-bold text-slate-900">
                                    {flow.name}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
                                        {getPipelineLabel(flow.pipeline)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs text-slate-600">{flow.version}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-1 rounded font-bold border ${
                                        flow.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        flow.status === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}>
                                        {flow.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-xs">
                                    {flow.nodes.length}
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                                    {flow.updatedAt}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary-600 hover:text-primary-700 text-xs font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                        编排
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

// --- Editor Canvas Components ---

const SOPSelector = ({ value, onChange }: { value: string | undefined, onChange: (id: string) => void }) => {
    // ... same SOPSelector implementation as before ...
    // Simplified for brevity in this response, ideally imported or redefined
    const { dictionary } = useDictionary();
    const pipelines = (dictionary['pipeline'] || []) as any[];
    // ... logic ...
    return (
        <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
             <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">SOP 规范</label>
             <select 
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
             >
                 <option value="">-- Select SOP --</option>
                 {MOCK_SOPS.map(s => <option key={s.id} value={s.id}>{s.title} ({s.version})</option>)}
             </select>
        </div>
    );
};

const ConfigPanel = ({ node, onClose }: { node: PipelineNodeData, onClose: () => void }) => {
    const meta = NODE_META[node.type];
    const Icon = meta.icon;
    const [config, setConfig] = useState(node.config);

    const handleConfigChange = (key: string, val: any) => {
        setConfig(prev => ({ ...prev, [key]: val }));
    };

    return (
        <div className="absolute top-6 right-6 bottom-6 w-80 bg-white/95 backdrop-blur shadow-2xl rounded-2xl border border-slate-100 z-30 flex flex-col animate-in slide-in-from-right-10 duration-200 ring-1 ring-black/5">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${meta.color}-50 text-${meta.color}-600`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{node.label}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{meta.label}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                 {/* SOP Selector for Task Gen */}
                 {node.type === 'Task Gen' && (
                     <SOPSelector value={config.sop} onChange={(id) => handleConfigChange('sop', id)} />
                 )}
                 
                 {/* Generic Fields */}
                 {Object.entries(config).map(([key, value]) => {
                     if (key === 'sop') return null; // handled above
                     return (
                         <div key={key}>
                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                             {Array.isArray(value) ? (
                                 <div className="space-y-1 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                                     {value.map((item: any, i: number) => <div key={i} className="text-xs text-slate-700 font-medium bg-white px-2 py-1.5 rounded border border-slate-100 shadow-sm">{item}</div>)}
                                 </div>
                             ) : (
                                 <input 
                                    type="text" 
                                    value={value as string} 
                                    onChange={(e) => handleConfigChange(key, e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-primary-100" 
                                />
                             )}
                         </div>
                     );
                 })}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50 rounded-b-2xl">
                <button onClick={onClose} className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">取消</button>
                <button className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm">保存</button>
            </div>
        </div>
    );
};

interface PipelineNodeProps {
    node: PipelineNodeData;
    isSelected: boolean;
    onSelect: (e: React.MouseEvent) => void;
}

const PipelineNode: React.FC<PipelineNodeProps> = ({ node, isSelected, onSelect }) => {
    const meta = NODE_META[node.type];
    const Icon = meta.icon;
    
    // Resolve SOP title for display
    let displayConfig = { ...node.config };
    if (node.type === 'Task Gen' && node.config.sop) {
        const sop = MOCK_SOPS.find(s => s.id === node.config.sop);
        if (sop) displayConfig = { ...node.config, sop: `${sop.title}` };
    }

    return (
        <div 
            onClick={onSelect}
            className={`w-64 p-4 bg-white rounded-xl border-2 flex flex-col gap-3 relative z-10 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                isSelected ? `border-${meta.color}-500 shadow-lg shadow-${meta.color}-100 ring-2 ring-${meta.color}-100` : 'border-slate-100 shadow-sm hover:border-slate-300'
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${meta.color}-50 text-${meta.color}-600`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{meta.label}</span>
            </div>
            <div>
                <p className="font-bold text-slate-800 text-sm leading-tight mb-1">{node.label}</p>
                <div className="text-[10px] text-slate-400 font-mono truncate bg-slate-50 px-1.5 py-0.5 rounded w-fit max-w-full">
                    {Object.values(displayConfig)[0]}
                </div>
            </div>
        </div>
    );
};

const FlowCanvas = ({ flow, relatedVersions, onBack, onSelectVersion }: { flow: PipelineFlow, relatedVersions: PipelineFlow[], onBack: () => void, onSelectVersion: (flow: PipelineFlow) => void }) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const [showHistory, setShowHistory] = useState(false);

    const selectedNode = flow.nodes.find(n => n.id === selectedNodeId);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="h-full flex flex-col bg-slate-50 rounded-xl overflow-hidden relative">
            {/* Header */}
            <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">{flow.name}</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono">{flow.id}</span>
                            <span>•</span>
                            <span className="font-bold">{flow.version}</span>
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
                    <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5" /> 重置
                    </button>
                    <button className="px-4 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 flex items-center gap-2 shadow-sm transition-colors">
                        <Rocket className="w-3.5 h-3.5" /> 部署产线
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Canvas */}
                <div 
                    className={`flex-1 relative overflow-hidden flex items-center justify-center cursor-${isDragging ? 'grabbing' : 'grab'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div 
                        className="absolute inset-0 opacity-40 pointer-events-none" 
                        style={{ 
                            backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', 
                            backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
                            backgroundPosition: `${pan.x}px ${pan.y}px`
                        }}
                    ></div>

                    <div 
                        className="flex items-center gap-16 relative px-10 transition-transform duration-75 ease-out origin-center"
                        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                    >
                        {/* Connecting Lines */}
                        <svg className="absolute top-1/2 left-0 w-full h-20 -translate-y-1/2 z-0 pointer-events-none overflow-visible">
                            {flow.edges.map((edge, i) => (
                                <g key={i}>
                                    <path d={`M ${i * 320 + 256},40 L ${(i + 1) * 320 + 20},40`} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                                    <path d={`M ${(i + 1) * 320 + 15},36 L ${(i + 1) * 320 + 20},40 L ${(i + 1) * 320 + 15},44`} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                                </g>
                            ))}
                        </svg>

                        {flow.nodes.map(node => (
                            <PipelineNode 
                                key={node.id} 
                                node={node} 
                                isSelected={selectedNodeId === node.id}
                                onSelect={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
                            />
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                        <div className="flex bg-white border border-slate-200 rounded-lg shadow-sm">
                            <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.1)); }} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-l-lg border-r border-slate-100"><ZoomOut className="w-4 h-4" /></button>
                            <div className="px-2 py-2 text-xs font-mono font-bold text-slate-600 flex items-center min-w-[3rem] justify-center bg-slate-50">{(zoom * 100).toFixed(0)}%</div>
                            <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(2, z + 0.1)); }} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-r-lg border-l border-slate-100"><ZoomIn className="w-4 h-4" /></button>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setPan({x:0, y:0}); setZoom(1); }} className="bg-white border border-slate-200 p-2 rounded-lg shadow-sm text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1"><Move className="w-3 h-3" /> Reset</button>
                    </div>
                    
                    {/* Config Panel */}
                    {selectedNode && <ConfigPanel node={selectedNode} onClose={() => setSelectedNodeId(null)} />}
                </div>

                {/* History Sidebar */}
                {showHistory && (
                    <div className="w-80 border-l border-slate-200 bg-white flex flex-col animate-in slide-in-from-right duration-200 shadow-xl z-10 relative">
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
                                        ver.id === flow.id 
                                        ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-200' 
                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-mono font-bold text-sm ${ver.id === flow.id ? 'text-primary-700' : 'text-slate-700'}`}>{ver.version}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                                            ver.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
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

// --- Main Container ---

export const PipelineFlowEditor = () => {
    const { dictionary } = useDictionary();
    const pipelines = (dictionary['pipeline'] || []) as any[];

    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [selectedFlow, setSelectedFlow] = useState<PipelineFlow | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const getPipelineLabel = (val: string) => pipelines.find(p => p.value === val)?.label || val;

    const filteredFlows = useMemo(() => {
        // Only show the latest version (Active or Draft) in the main list to avoid clutter
        // Simple logic: filter out Archived unless needed, or group by series and pick latest
        // For simplicity, we just filter based on criteria and let user see duplicates if any
        return MOCK_FLOWS_LIST.filter(f => {
            const matchCategory = activeCategory === 'All' || 
                                  pipelines.find(p => p.value === f.pipeline)?.code === activeCategory ||
                                  f.pipeline === activeCategory;
            const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
            // Only show latest versions in the grid (e.g. not Archived)
            const isLatest = f.status !== 'Archived';
            return matchCategory && matchSearch && isLatest;
        });
    }, [activeCategory, searchQuery, pipelines]);

    // Calculate related versions for selected flow
    const relatedVersions = useMemo(() => {
        if (!selectedFlow) return [];
        return MOCK_FLOWS_LIST
            .filter(f => f.seriesId === selectedFlow.seriesId)
            .sort((a, b) => b.version.localeCompare(a.version));
    }, [selectedFlow]);

    if (selectedFlow) {
        return <FlowCanvas 
            flow={selectedFlow} 
            relatedVersions={relatedVersions}
            onBack={() => setSelectedFlow(null)} 
            onSelectVersion={setSelectedFlow}
        />;
    }

    return (
        <div className="h-full flex flex-col relative">
            {/* 1. Stats */}
            <FlowStats flows={filteredFlows} />

            {/* 2. Toolbar */}
            <div className="flex justify-between items-center mb-4 shrink-0 px-1">
                <div className="flex gap-3 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="搜索流程..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 w-64 shadow-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
                        <Filter className="w-4 h-4" /> 筛选
                    </button>
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
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md shadow-primary-200">
                        <Plus className="w-4 h-4" /> 新建流程
                    </button>
                </div>
            </div>

            {/* 3. Split View */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* Sidebar */}
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

                {/* Main Content */}
                <main className="flex-1 overflow-hidden">
                    {viewMode === 'card' ? (
                        <div className="h-full overflow-y-auto pr-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 pb-6">
                                {filteredFlows.map(flow => (
                                    <div key={flow.id} className="h-56">
                                        <FlowCard 
                                            flow={flow} 
                                            onClick={() => setSelectedFlow(flow)} 
                                            getPipelineLabel={getPipelineLabel}
                                        />
                                    </div>
                                ))}
                                {filteredFlows.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                        <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>暂无符合条件的流程</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <FlowListTable 
                            flows={filteredFlows} 
                            onSelect={setSelectedFlow} 
                            getPipelineLabel={getPipelineLabel} 
                        />
                    )}
                </main>
            </div>
        </div>
    );
};
