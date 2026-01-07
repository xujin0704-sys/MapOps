import React, { useState, useMemo } from 'react';
import { 
    Box, 
    Layers, 
    Cpu, 
    FunctionSquare, 
    PlusCircle, 
    CheckCircle, 
    Power, 
    GitBranch, 
    Link as LinkIcon, 
    Users, 
    ToggleRight, 
    ToggleLeft, 
    Server, 
    Wand2,
    X,
    Save,
    Activity,
    Clock,
    BarChart,
    TrendingUp,
    ChevronRight,
    Info,
    ArrowRight,
    Video,
    TerminalSquare,
    LayoutList,
    LayoutGrid,
    Search,
    Filter,
    PlayCircle,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';

// --- Types & Mock Data ---

type CapabilityCategory = 'Foundation' | 'Adapter' | 'Specific' | 'Algorithm';

interface Capability {
  id: string;
  name: string;
  category: CapabilityCategory;
  description?: string;
  // Generic
  status: 'Online' | 'Training' | 'Disabled';
  version?: string;
  // Foundation specific
  nodes?: number;
  vramUsage?: number;
  vramTotal?: number;
  // Adapter specific
  baseModel?: string;
  trigger?: string;
  pipelinesUsed?: number;
  enabled?: boolean;
  // Metrics for Detail View
  accuracy?: number;
  latency?: string;
  throughput?: string;
  lastUpdated?: string;
}

const MOCK_CAPABILITIES: Capability[] = [
    { id: 'F01', name: 'SAM 2 (ViT-Huge)', category: 'Foundation', status: 'Online', nodes: 4, vramUsage: 22, vramTotal: 24, description: 'Segment Anything Model v2, optimized for spatiotemporal features.', accuracy: 98.5, latency: '200ms', throughput: '150 req/s', lastUpdated: '2 days ago' },
    { id: 'F02', name: 'Grounding DINO', category: 'Foundation', status: 'Online', nodes: 2, vramUsage: 10, vramTotal: 16, description: 'Open-set object detection baseline.', accuracy: 94.2, latency: '150ms', throughput: '80 req/s', lastUpdated: '1 week ago' },
    { id: 'A01', name: '光伏板提取器 (Solar Panel)', category: 'Adapter', status: 'Online', baseModel: 'SAM 2', trigger: 'Point: 5-shot', pipelinesUsed: 3, enabled: true, version: 'v1.2.1', description: 'Fine-tuned adapter for roof-top solar panel segmentation in urban environments.', accuracy: 92.1, latency: '50ms', throughput: '300 req/s', lastUpdated: '5 hours ago' },
    { id: 'A02', name: '道路中线提取 (Road Centerline)', category: 'Adapter', status: 'Online', baseModel: 'SAM 2', trigger: 'Box Prompt', pipelinesUsed: 2, enabled: true, version: 'v2.0.0', description: 'Extracts drivable road centerlines from satellite imagery.', accuracy: 89.5, latency: '80ms', throughput: '200 req/s', lastUpdated: '3 days ago' },
    { id: 'A03', name: '交通标志识别 (Traffic Sign)', category: 'Adapter', status: 'Disabled', baseModel: 'Grounding DINO', trigger: 'Text: "Traffic Light"', pipelinesUsed: 1, enabled: false, version: 'v0.9.0', description: 'Detects and classifies standard traffic signs.', accuracy: 78.0, latency: '120ms', throughput: '100 req/s', lastUpdated: '1 month ago' },
    { id: 'S01', name: 'ResNet-50 建筑检测', category: 'Specific', status: 'Online', version: 'v3.4.0', description: 'Legacy classification model for building attributes.', accuracy: 85.4, latency: '15ms', throughput: '800 req/s', lastUpdated: '2 weeks ago' },
    { id: 'S02', name: 'YOLOv8-Small POI', category: 'Specific', status: 'Training', version: 'v1.1.0-beta', description: 'Lightweight object detection for street-level POI signage.', accuracy: 0, latency: '-', throughput: '-', lastUpdated: 'Just now' },
    { id: 'L01', name: '拓扑接边 (Topo-Snapping)', category: 'Algorithm', status: 'Online', version: 'v2.3.1', description: 'Geometric algorithm to ensure connectivity between adjacent map tiles.', accuracy: 100, latency: '5ms', throughput: '5k req/s', lastUpdated: '1 year ago' },
    { id: 'L02', name: 'Douglas-Peucker (抽稀)', category: 'Algorithm', status: 'Online', version: 'v1.0.2', description: 'Standard line simplification algorithm.', accuracy: 100, latency: '1ms', throughput: '10k req/s', lastUpdated: '2 years ago' },
];

const CATEGORIES: { id: CapabilityCategory; label: string; icon: React.ElementType }[] = [
    { id: 'Foundation', label: '基座大模型', icon: Box },
    { id: 'Adapter', label: '适配器/技能', icon: Layers },
    { id: 'Specific', label: '专用小模型', icon: Cpu },
    { id: 'Algorithm', label: '几何算法', icon: FunctionSquare },
];

// --- Sub-Components ---

const ModelStats = ({ models }: { models: Capability[] }) => {
    const total = models.length;
    const online = models.filter(m => m.status === 'Online').length;
    const training = models.filter(m => m.status === 'Training').length;
    const avgAccuracy = models.filter(m => m.accuracy).reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / (models.filter(m => m.accuracy).length || 1);

    return (
        <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">能力总数</div>
                    <div className="text-2xl font-black text-slate-900">{total}</div>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Server className="w-5 h-5"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">在线服务</div>
                    <div className="text-2xl font-black text-emerald-600">{online}</div>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle className="w-5 h-5"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">训练任务</div>
                    <div className="text-2xl font-black text-amber-600">{training}</div>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Activity className="w-5 h-5"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">平均准确率</div>
                    <div className="text-2xl font-black text-blue-600">{avgAccuracy.toFixed(1)}%</div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><TrendingUp className="w-5 h-5"/></div>
            </div>
        </div>
    );
};

const VideoModal = ({ model, onClose }: { model: Capability, onClose: () => void }) => {
    return (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
            <div className="w-[800px] bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
                <div className="aspect-video bg-slate-800 relative group flex items-center justify-center">
                    {/* Mock Video Placeholder */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
                    <div className="z-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border-2 border-white flex items-center justify-center mb-4 mx-auto cursor-pointer hover:scale-110 transition-transform">
                            <PlayCircle className="w-8 h-8 text-white fill-white" />
                        </div>
                        <h3 className="text-white font-bold text-xl">{model.name} Demo</h3>
                        <p className="text-slate-300 text-sm mt-2">Introduction & Capabilities Showcase</p>
                    </div>
                    {/* Controls Mock */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-center px-4 gap-4">
                        <div className="w-full h-1 bg-slate-600 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-primary-500"></div>
                        </div>
                        <span className="text-xs text-white font-mono">00:45 / 02:30</span>
                    </div>
                </div>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

interface CapabilityCardProps {
  model: Capability;
  onClick: (model: Capability) => void;
  onVideoClick: (model: Capability) => void;
  onTryClick: (model: Capability) => void;
}

const CapabilityCard: React.FC<CapabilityCardProps> = ({ model, onClick, onVideoClick, onTryClick }) => {
    const [isEnabled, setIsEnabled] = useState(model.enabled);

    const iconMap: Record<CapabilityCategory, React.ReactElement<{ className?: string }>> = {
        Foundation: <Box className="w-6 h-6 text-purple-600" />,
        Adapter: <Layers className="w-6 h-6 text-blue-600" />,
        Specific: <Cpu className="w-6 h-6 text-amber-600" />,
        Algorithm: <FunctionSquare className="w-6 h-6 text-emerald-600" />
    };

    const statusLabel = {
        'Online': '在线',
        'Training': '训练中',
        'Disabled': '停用'
    };

    const vramPercent = model.vramUsage && model.vramTotal ? (model.vramUsage / model.vramTotal) * 100 : 0;
    
    // Foundation Model Card
    if (model.category === 'Foundation') {
        return (
            <div 
                className="md:col-span-2 glass-panel p-5 rounded-xl flex gap-6 items-center hover:shadow-lg transition-all border border-slate-200 hover:border-primary-300 cursor-pointer group"
                onClick={() => onClick(model)}
            >
                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">{iconMap[model.category]}</div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 text-lg">{model.name}</h3>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                <CheckCircle className="w-3 h-3"/> 在线 ({model.nodes} 节点)
                            </span>
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-bold text-slate-500 flex items-center gap-1"><Power className="w-3 h-3"/> 显存负载</span>
                            <span className="font-mono text-slate-600 font-medium">{model.vramUsage}GB / {model.vramTotal}GB</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                            <div className="h-full bg-purple-400 rounded-full" style={{ width: `${vramPercent}%` }}></div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onVideoClick(model)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="模型图例">
                        <Video className="w-5 h-5" />
                    </button>
                    <button onClick={() => onTryClick(model)} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg border border-slate-200 transition-colors group-hover:bg-white flex items-center gap-2">
                        <TerminalSquare className="w-4 h-4"/> 示例
                    </button>
                </div>
            </div>
        );
    }

    // Adapter, Specific, Algorithm Cards
    return (
         <div 
            className="glass-panel p-5 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all border border-slate-200 hover:border-primary-300 relative overflow-hidden cursor-pointer group"
            onClick={() => onClick(model)}
        >
            {model.baseModel && (
                <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <LinkIcon className="w-2.5 h-2.5"/> {model.baseModel}
                </div>
            )}
            <div>
                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${
                        model.category === 'Adapter' ? 'bg-blue-50 group-hover:bg-blue-100' :
                        model.category === 'Specific' ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-emerald-50 group-hover:bg-emerald-100'
                    }`}>
                        {React.cloneElement(iconMap[model.category], {className: "w-5 h-5"})}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 leading-tight">{model.name}</h4>
                         <span className={`text-xs font-bold ${
                            model.status === 'Online' ? 'text-emerald-600' :
                            model.status === 'Training' ? 'text-amber-600 animate-pulse' : 'text-slate-400'
                         }`}>{statusLabel[model.status]}</span>
                    </div>
                </div>
                 <div className="mt-4 space-y-2 text-xs text-slate-500">
                     {model.version && <div className="flex items-center gap-1.5"><GitBranch className="w-3 h-3"/> 版本: <span className="font-mono text-slate-700">{model.version}</span></div>}
                     {model.trigger && <div className="flex items-center gap-1.5"><Wand2 className="w-3 h-3"/> 触发: <span className="font-mono text-slate-700">{model.trigger}</span></div>}
                     {model.pipelinesUsed !== undefined && <div className="flex items-center gap-1.5"><Users className="w-3 h-3"/> 引用: <span className="font-mono text-slate-700">{model.pipelinesUsed} 产线</span></div>}
                 </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center" onClick={e => e.stopPropagation()}>
                <div className="flex gap-1">
                    <button onClick={() => onVideoClick(model)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="图例视频">
                        <Video className="w-4 h-4" />
                    </button>
                    <button onClick={() => onTryClick(model)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="模型示例">
                        <TerminalSquare className="w-4 h-4" />
                    </button>
                </div>
                {model.category === 'Adapter' && (
                    <button onClick={() => setIsEnabled(!isEnabled)} className="flex items-center gap-2 cursor-pointer">
                        <span className={`text-xs font-bold ${isEnabled ? 'text-primary-600' : 'text-slate-400'}`}>{isEnabled ? '已启用' : '已停用'}</span>
                        {isEnabled ? <ToggleRight className="w-6 h-6 text-primary-500"/> : <ToggleLeft className="w-6 h-6 text-slate-300"/>}
                    </button>
                )}
            </div>
        </div>
    );
}

// --- Modals & Drawers ---

const RegisterModal = ({ onClose }: { onClose: () => void }) => {
    const [category, setCategory] = useState<CapabilityCategory>('Adapter');

    return (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">注册新能力</h3>
                        <p className="text-sm text-slate-500">将新的模型或算法接入能力中心。</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">能力类型</label>
                        <div className="grid grid-cols-4 gap-2">
                            {CATEGORIES.map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                                        category === cat.id 
                                        ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <cat.icon className="w-5 h-5"/>
                                    <span className="text-[10px] font-bold">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">名称 (Name)</label>
                            <input type="text" placeholder="e.g. Urban Road Extractor" className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">版本 (Version)</label>
                            <input type="text" placeholder="v1.0.0" className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-100 outline-none" />
                        </div>
                    </div>

                    {category === 'Adapter' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">基座模型 (Base Model)</label>
                            <select className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-100 outline-none">
                                <option>SAM 2 (ViT-Huge)</option>
                                <option>Grounding DINO</option>
                                <option>Stable Diffusion XL</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">描述</label>
                        <textarea rows={3} placeholder="简要描述该模型的功能与适用场景..." className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-100 outline-none resize-none"></textarea>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">取消</button>
                    <button onClick={onClose} className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-md shadow-primary-200 transition-colors flex items-center gap-2">
                        <Save className="w-4 h-4" /> 注册能力
                    </button>
                </div>
            </div>
        </div>
    );
};

const ModelDetailDrawer = ({ model, onClose, initialTab = 'overview' }: { model: Capability, onClose: () => void, initialTab?: 'overview' | 'metrics' | 'lineage' | 'playground' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    
    // Playground State
    const [prompt, setPrompt] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleRunPlayground = () => {
        setIsRunning(true);
        setResult(null);
        setTimeout(() => {
            setIsRunning(false);
            setResult('Success');
        }, 1500);
    };

    const statusLabel = {
        'Online': '在线',
        'Training': '训练中',
        'Disabled': '停用'
    };

    return (
        <div className="absolute inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] flex justify-end">
            <div className="w-[600px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
                {/* Header */}
                <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                            model.category === 'Foundation' ? 'bg-purple-50 text-purple-600' : 
                            model.category === 'Adapter' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {model.category === 'Foundation' ? <Box className="w-6 h-6"/> : <Layers className="w-6 h-6"/>}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">{model.name}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="font-mono text-xs text-slate-400 bg-slate-100 px-1.5 rounded">{model.id}</span>
                                <span className={`text-xs font-bold flex items-center gap-1 ${model.status === 'Online' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${model.status === 'Online' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                    {statusLabel[model.status]}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X className="w-6 h-6"/></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-6">
                    {['overview', 'metrics', 'lineage', 'playground'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)} 
                            className={`py-3 text-sm font-bold border-b-2 transition-colors capitalize ${
                                activeTab === tab ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {tab === 'playground' ? '示例 Playground' : tab === 'lineage' ? '血缘' : tab === 'metrics' ? '指标' : '概览'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-slate-400"/> 描述
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{model.description}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase mb-1">准确率</span>
                                    <span className="text-2xl font-black text-emerald-600">{model.accuracy}%</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase mb-1">延迟</span>
                                    <span className="text-2xl font-bold text-slate-800">{model.latency}</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase mb-1">吞吐量</span>
                                    <span className="text-sm font-bold text-slate-800">{model.throughput}</span>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Wand2 className="w-4 h-4 text-slate-400"/> 配置信息
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                        <span className="text-slate-500">当前版本</span>
                                        <span className="font-mono font-bold text-slate-800">{model.version}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                        <span className="text-slate-500">最近更新</span>
                                        <span className="text-slate-800">{model.lastUpdated}</span>
                                    </div>
                                    {model.baseModel && (
                                        <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                            <span className="text-slate-500">基座模型</span>
                                            <span className="text-primary-600 font-medium cursor-pointer hover:underline">{model.baseModel}</span>
                                        </div>
                                    )}
                                    {model.trigger && (
                                        <div className="flex justify-between text-sm py-2">
                                            <span className="text-slate-500">触发模式</span>
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">{model.trigger}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'metrics' && (
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500"/> 准确率趋势 (Accuracy Trend)
                                </h3>
                                <div className="h-48 w-full bg-slate-50 rounded flex items-end justify-between px-4 pb-4 pt-10 relative overflow-hidden">
                                    {/* Mock Chart */}
                                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                        <path d="M0,150 Q100,140 200,100 T400,50 T600,20" fill="none" stroke="#10b981" strokeWidth="3" />
                                        <path d="M0,150 Q100,140 200,100 T400,50 T600,20 V200 H0 Z" fill="url(#grad1)" opacity="0.2" />
                                        <defs>
                                            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="white" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute top-2 left-4 text-xs font-bold text-slate-400">99%</div>
                                    <div className="absolute bottom-2 left-4 text-xs font-bold text-slate-400">80%</div>
                                    <div className="absolute bottom-2 right-4 text-xs font-bold text-slate-400">v2.0</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-blue-500"/> 实时调用量 (RPS)
                                </h3>
                                <div className="h-32 flex items-end gap-1">
                                    {Array.from({length: 30}).map((_, i) => (
                                        <div key={i} className="flex-1 bg-blue-100 rounded-t hover:bg-blue-300 transition-colors" style={{height: `${Math.random() * 80 + 20}%`}}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'lineage' && (
                        <div className="h-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center relative">
                            {/* Simple Visual Tree */}
                            <div className="flex flex-col items-center gap-8 w-full">
                                {model.baseModel && (
                                    <>
                                        <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl w-64 text-center">
                                            <div className="text-xs font-bold text-purple-400 uppercase mb-1">基座模型</div>
                                            <div className="font-bold text-slate-800">{model.baseModel}</div>
                                        </div>
                                        <div className="h-8 w-0.5 bg-slate-300"></div>
                                    </>
                                )}
                                
                                <div className="p-4 bg-white border-2 border-primary-500 ring-4 ring-primary-50 rounded-xl w-64 text-center shadow-lg relative z-10">
                                    <div className="text-xs font-bold text-primary-500 uppercase mb-1">当前能力</div>
                                    <div className="font-bold text-slate-900 text-lg">{model.name}</div>
                                    <div className="mt-2 text-xs bg-slate-100 inline-block px-2 py-1 rounded font-mono">{model.version}</div>
                                </div>

                                <div className="h-8 w-0.5 bg-slate-300"></div>

                                {/* Downstream */}
                                <div className="w-full">
                                    <div className="text-center text-xs font-bold text-slate-400 uppercase mb-4">被以下产线使用</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['路网产线', 'POI 更新产线'].map((pipe, i) => (
                                            <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-sm font-medium text-slate-700 flex items-center justify-center gap-2">
                                                <GitBranch className="w-4 h-4 text-slate-400"/> {pipe}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'playground' && (
                        <div className="h-full flex flex-col gap-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
                                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <TerminalSquare className="w-4 h-4 text-slate-500"/> 模型试用 (Model Trial)
                                </h3>
                                <div className="space-y-4 flex-1 flex flex-col">
                                    {/* Inputs */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Input Image / Data</label>
                                        <div className="h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-primary-400 hover:bg-primary-50/20 transition-colors cursor-pointer">
                                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-xs">Drag & Drop or Click to Upload</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Text Prompt / Params</label>
                                        <input 
                                            type="text" 
                                            value={prompt}
                                            onChange={e => setPrompt(e.target.value)}
                                            placeholder="Enter prompt e.g. 'Extract all solar panels'" 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100" 
                                        />
                                    </div>
                                    
                                    {/* Action */}
                                    <div className="flex justify-end pt-2">
                                        <button 
                                            onClick={handleRunPlayground}
                                            disabled={isRunning}
                                            className={`px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold shadow-md shadow-primary-200 transition-all flex items-center gap-2 ${isRunning ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {isRunning ? <Loader2 className="w-4 h-4 animate-spin"/> : <PlayCircle className="w-4 h-4"/>}
                                            {isRunning ? 'Running Inference...' : 'Run Model'}
                                        </button>
                                    </div>

                                    {/* Output */}
                                    <div className="flex-1 bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-y-auto mt-4 border border-slate-800">
                                        {result ? (
                                            <div className="animate-in fade-in">
                                                <div className="mb-2 text-slate-500">// Inference Result</div>
                                                <div>{`{`}</div>
                                                <div className="pl-4">"status": "success",</div>
                                                <div className="pl-4">"latency": "145ms",</div>
                                                <div className="pl-4">"objects_detected": 12,</div>
                                                <div className="pl-4">"confidence_score": 0.94</div>
                                                <div>{`}`}</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-600">Waiting for input...</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center">
                    <button className="text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors">停用能力</button>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md shadow-primary-200 transition-colors">编辑配置</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Container ---

const ModelRegistry = () => {
  const [activeCategory, setActiveCategory] = useState<CapabilityCategory | 'All'>('All');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Capability | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'playground'>('overview');
  
  // New States
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVideoModel, setShowVideoModel] = useState<Capability | null>(null);

  const filteredCapabilities = MOCK_CAPABILITIES.filter(c => {
      const matchCat = activeCategory === 'All' || c.category === activeCategory;
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchStatus && matchSearch;
  });

  return (
    <div className="h-full flex flex-col relative">
        {/* Modals & Drawers */}
        {isRegisterOpen && <RegisterModal onClose={() => setIsRegisterOpen(false)} />}
        {selectedModel && (
            <ModelDetailDrawer 
                model={selectedModel} 
                onClose={() => setSelectedModel(null)} 
                initialTab={detailTab}
            />
        )}
        {showVideoModel && <VideoModal model={showVideoModel} onClose={() => setShowVideoModel(null)} />}

        {/* 1. Statistics Dashboard (New) */}
        <ModelStats models={filteredCapabilities} />

        {/* 2. Toolbar & Filters (New) */}
        <div className="flex justify-between items-center mb-4 shrink-0 px-1">
             <div className="flex gap-3 items-center">
                 <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                        type="text" 
                        placeholder="搜索模型..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 w-64 shadow-sm"
                     />
                 </div>
                 <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                     <Filter className="w-4 h-4 text-slate-400" />
                     <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent text-sm text-slate-600 outline-none cursor-pointer font-medium"
                     >
                         <option value="All">所有状态</option>
                         <option value="Online">在线 (Online)</option>
                         <option value="Training">训练中 (Training)</option>
                         <option value="Disabled">停用 (Disabled)</option>
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
                    onClick={() => setIsRegisterOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md shadow-primary-200"
                >
                    <PlusCircle className="w-4 h-4" /> 注册能力
                </button>
             </div>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
            {/* Sidebar */}
            <aside className="w-56 glass-panel rounded-xl p-4 flex flex-col shrink-0 bg-white">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">能力分类</h3>
                 <div className="space-y-1.5">
                    <button 
                        onClick={() => setActiveCategory('All')}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-bold transition-colors ${
                            activeCategory === 'All' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                    >
                        <Server className="w-4 h-4"/> 全部
                    </button>
                     {CATEGORIES.map(({ id, label, icon: Icon }) => (
                         <button 
                            key={id} 
                            onClick={() => setActiveCategory(id)}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-colors ${
                                activeCategory === id ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            <Icon className="w-4 h-4"/> {label}
                        </button>
                     ))}
                 </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pr-2">
                 {viewMode === 'card' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {filteredCapabilities.map(model => (
                             <CapabilityCard 
                                key={model.id} 
                                model={model} 
                                onClick={(m) => { setSelectedModel(m); setDetailTab('overview'); }}
                                onVideoClick={(m) => setShowVideoModel(m)}
                                onTryClick={(m) => { setSelectedModel(m); setDetailTab('playground'); }}
                            />
                         ))}
                     </div>
                 ) : (
                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                         <table className="w-full text-left text-sm">
                             <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold">
                                 <tr>
                                     <th className="px-6 py-4">模型名称</th>
                                     <th className="px-6 py-4">分类</th>
                                     <th className="px-6 py-4">状态</th>
                                     <th className="px-6 py-4">准确率</th>
                                     <th className="px-6 py-4">最后更新</th>
                                     <th className="px-6 py-4 text-right">操作</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                 {filteredCapabilities.map(model => (
                                     <tr key={model.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedModel(model); setDetailTab('overview'); }}>
                                         <td className="px-6 py-4">
                                             <div className="font-bold text-slate-900">{model.name}</div>
                                             <div className="text-xs text-slate-500 font-mono">{model.id}</div>
                                         </td>
                                         <td className="px-6 py-4">
                                             <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 border border-slate-200">{model.category}</span>
                                         </td>
                                         <td className="px-6 py-4">
                                             <span className={`flex items-center gap-1.5 text-xs font-bold ${model.status === 'Online' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                 <div className={`w-1.5 h-1.5 rounded-full ${model.status === 'Online' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                 {model.status}
                                             </span>
                                         </td>
                                         <td className="px-6 py-4 font-bold text-slate-700">{model.accuracy ? `${model.accuracy}%` : '-'}</td>
                                         <td className="px-6 py-4 text-slate-500 text-xs">{model.lastUpdated}</td>
                                         <td className="px-6 py-4 text-right">
                                             <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                 <button onClick={() => setShowVideoModel(model)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Video"><Video className="w-4 h-4"/></button>
                                                 <button onClick={() => { setSelectedModel(model); setDetailTab('playground'); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Try"><TerminalSquare className="w-4 h-4"/></button>
                                             </div>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 )}
            </main>
        </div>
    </div>
  );
};

export default ModelRegistry;