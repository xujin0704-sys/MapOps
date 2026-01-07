import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Workflow, 
  Users, 
  Activity, 
  Settings, 
  X, 
  TrendingUp, 
  MoreHorizontal, 
  AlertTriangle, 
  Server, 
  Database, 
  ArrowRight, 
  Zap, 
  Cpu,
  HardDrive,
  Network,
  ShieldCheck,
  Package,
  Globe,
  Radio,
  CheckCircle2,
  XCircle,
  BarChart3
} from 'lucide-react';

// --- Types & Mock Data ---

type NodeStatus = 'normal' | 'busy' | 'congested';

interface MatrixNodeData {
  id: string;
  stage: string;
  version: string;
  status: NodeStatus;
  queue: number;
  velocity: number; // Items per minute
  staff: number;
  trend: number[]; // Simple array for sparkline
}

const STAGES = ['接入 (Ingest)', 'AI 处理', '人工审核', '质量门禁', '发布 (Release)'];
const VERSIONS = ['Map Bundle v2.1.0 (Q1)', 'Hotfix-Dec-09', 'Experimental-Roads'];

// Mock Generator
const generateNode = (ver: string, stage: string, i: number): MatrixNodeData => {
  const isBusy = Math.random() > 0.7;
  const isCongested = Math.random() > 0.9;
  return {
    id: `${ver}-${stage}`,
    stage,
    version: ver,
    status: isCongested ? 'congested' : isBusy ? 'busy' : 'normal',
    queue: Math.floor(Math.random() * 5000),
    velocity: Math.floor(Math.random() * 200) + 50,
    staff: Math.floor(Math.random() * 10),
    trend: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100))
  };
};

// --- Components ---

const StatusDot = ({ status }: { status: NodeStatus }) => {
  const colors = {
    normal: 'bg-emerald-500 shadow-emerald-200',
    busy: 'bg-amber-500 shadow-amber-200',
    congested: 'bg-rose-500 shadow-rose-200 animate-pulse'
  };
  return <div className={`w-2.5 h-2.5 rounded-full shadow-md ${colors[status]}`} />;
};

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d / max) * 100}`).join(' ');
  return (
    <svg className="w-full h-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
      <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

// --- Stage Specific Details Components ---

const IngestDetails = ({ node }: { node: MatrixNodeData }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-blue-600 text-xs font-bold uppercase mb-1 flex items-center gap-1"><HardDrive className="w-3 h-3"/> 实时入库量</div>
                <div className="text-2xl font-bold text-slate-900">{(node.velocity * 0.5).toFixed(1)} GB/m</div>
                <div className="text-xs text-blue-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> BW Usage 78%</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Network className="w-3 h-3"/> 活跃连接数</div>
                <div className="text-2xl font-bold text-slate-900">128</div>
                <div className="text-xs text-slate-400 mt-1">Sources Online</div>
            </div>
        </div>

        <div>
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" /> 网络吞吐趋势
            </h4>
            <div className="h-32 w-full bg-slate-50 rounded-lg border border-slate-100 p-2 relative">
                <Sparkline data={node.trend} color="#3b82f6" />
            </div>
        </div>

        <div>
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-500" /> 数据源状态
            </h4>
            <div className="space-y-3">
                {[
                    { name: 'Sentinel-2 Satellite', status: 'Syncing', speed: '450 MB/s', type: 'bg-emerald-50 text-emerald-600' },
                    { name: 'City_Drone_Fleet_A', status: 'Idle', speed: '0 KB/s', type: 'bg-slate-100 text-slate-500' },
                    { name: 'Gov_Portal_API', status: 'Error', speed: 'Timeout', type: 'bg-rose-50 text-rose-600' },
                ].map((src, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                            <span className="text-sm font-bold text-slate-700">{src.name}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded font-mono font-bold ${src.type}`}>
                            {src.speed}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const AIDetails = ({ node }: { node: MatrixNodeData }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-purple-600 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Cpu className="w-3 h-3"/> GPU 负载</div>
                <div className="text-2xl font-bold text-slate-900">82%</div>
                <div className="text-xs text-purple-500 mt-1">Cluster: 16 Nodes</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Zap className="w-3 h-3"/> 识别吞吐 (IPS)</div>
                <div className="text-2xl font-bold text-slate-900">{node.velocity * 10}</div>
                <div className="text-xs text-slate-400 mt-1">Images / Second</div>
            </div>
        </div>

        <div>
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" /> 算力效能趋势
            </h4>
            <div className="h-32 w-full bg-slate-50 rounded-lg border border-slate-100 p-2 relative">
                <Sparkline data={node.trend.map(x => x * 1.5)} color="#a855f7" />
            </div>
        </div>

        <div>
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-slate-500" /> 活跃模型实例
            </h4>
            <div className="space-y-3">
                {[
                    { name: 'SAM-Road-Adapter v1.2', load: 90, tasks: 1240 },
                    { name: 'POI-OCR-ResNet50', load: 45, tasks: 320 },
                    { name: 'MaskRCNN-Building', load: 60, tasks: 550 },
                ].map((model, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-slate-700">{model.name}</span>
                            <span className="text-xs text-slate-400">{model.tasks} tasks</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${model.load > 80 ? 'bg-amber-500' : 'bg-purple-500'}`} style={{width: `${model.load}%`}}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ReviewDetails = ({ node }: { node: MatrixNodeData }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-amber-600 text-xs font-bold uppercase mb-1">待审积压</div>
                <div className="text-2xl font-bold text-slate-900">{node.queue.toLocaleString()}</div>
                <div className="text-xs text-amber-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> +12% vs 1h ago</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-500 text-xs font-bold uppercase mb-1">平均处理耗时</div>
                <div className="text-2xl font-bold text-slate-900">45s</div>
                <div className="text-xs text-emerald-500 mt-1">Efficiency High</div>
            </div>
        </div>

        <div>
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" /> 积压消耗趋势
            </h4>
            <div className="h-32 w-full bg-slate-50 rounded-lg border border-slate-100 p-2 relative">
                <Sparkline data={node.trend} color="#f59e0b" />
            </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" /> 在线作业员
                </h4>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-bold">{node.staff} 在线</span>
            </div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                U{i}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-700">Operator_{String.fromCharCode(64+i)}</div>
                                <div className="text-[10px] text-emerald-600">效率: {(100 - i*5)}/h</div>
                            </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const QualityDetails = ({ node }: { node: MatrixNodeData }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="text-emerald-700 text-xs font-bold uppercase mb-1">测试通过率</div>
                <div className="text-2xl font-bold text-slate-900">98.5%</div>
                <div className="text-xs text-emerald-600 mt-1">Ready for Release</div>
            </div>
            <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                <div className="text-rose-700 text-xs font-bold uppercase mb-1">阻断缺陷 (Blocker)</div>
                <div className="text-2xl font-bold text-rose-600">0</div>
                <div className="text-xs text-rose-400 mt-1">2 Major Issues</div>
            </div>
        </div>

        <div>
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 自动化测试套件
            </h4>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm border-l-4 border-l-emerald-500">
                    <div>
                        <div className="text-sm font-bold text-slate-700">拓扑完整性检查</div>
                        <div className="text-xs text-slate-400">Coverage: 100%</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm border-l-4 border-l-emerald-500">
                    <div>
                        <div className="text-sm font-bold text-slate-700">属性值域校验</div>
                        <div className="text-xs text-slate-400">Coverage: 99.8%</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm border-l-4 border-l-amber-500">
                    <div>
                        <div className="text-sm font-bold text-slate-700">仿真回归测试</div>
                        <div className="text-xs text-slate-400">Coverage: 85% (Running)</div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
                </div>
            </div>
        </div>
    </div>
);

const ReleaseDetails = ({ node }: { node: MatrixNodeData }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-500 text-xs font-bold uppercase mb-1">发布包大小</div>
                <div className="text-2xl font-bold text-slate-900">45.2 GB</div>
                <div className="text-xs text-slate-400 mt-1">Compressed (v2.1)</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-blue-600 text-xs font-bold uppercase mb-1">分发进度</div>
                <div className="text-2xl font-bold text-slate-900">85%</div>
                <div className="text-xs text-blue-500 mt-1">12/14 Nodes Synced</div>
            </div>
        </div>

        <div>
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" /> 全球节点同步状态
            </h4>
            <div className="space-y-2">
                {[
                    { region: 'Beijing HQ', status: 'Synced', progress: 100 },
                    { region: 'Shanghai IDC', status: 'Synced', progress: 100 },
                    { region: 'Singapore AWS', status: 'Syncing', progress: 85 },
                    { region: 'Frankfurt AWS', status: 'Pending', progress: 0 },
                ].map((node, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm">
                        <div className="w-24 text-slate-600 font-medium">{node.region}</div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${node.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width: `${node.progress}%`}}></div>
                        </div>
                        <div className="w-12 text-right text-xs font-mono text-slate-400">{node.progress}%</div>
                    </div>
                ))}
            </div>
        </div>
        
        <div>
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Radio className="w-4 h-4 text-slate-500" /> 灰度发布策略
            </h4>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                当前策略: <span className="font-bold text-slate-800">Canary (10%)</span>. 仅向部分测试用户和内部车队推送更新。
            </div>
        </div>
    </div>
);

// Drawer Component
const NodeDetailDrawer = ({ node, onClose }: { node: MatrixNodeData, onClose: () => void }) => {
  if (!node) return null;
  
  // Determine which detail component to render based on stage name
  const renderDetails = () => {
      if (node.stage.includes('接入')) return <IngestDetails node={node} />;
      if (node.stage.includes('AI')) return <AIDetails node={node} />;
      if (node.stage.includes('人工')) return <ReviewDetails node={node} />;
      if (node.stage.includes('质量')) return <QualityDetails node={node} />;
      if (node.stage.includes('发布')) return <ReleaseDetails node={node} />;
      return <ReviewDetails node={node} />; // Default fallback
  };

  return (
    <div className="absolute top-4 right-4 bottom-4 w-96 bg-white/95 backdrop-blur shadow-2xl rounded-xl border border-slate-200 z-50 flex flex-col animate-in slide-in-from-right-10 duration-200">
      <div className="p-5 border-b border-slate-100 flex justify-between items-start">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{node.version}</div>
          <h3 className="text-xl font-bold text-slate-900">{node.stage}</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {renderDetails()}

        {/* Actions */}
        <div className="pt-8 border-t border-slate-100 mt-8 space-y-3">
          <button className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-sm shadow-md shadow-primary-200 transition-all active:scale-95">
             查看详细日志 (View Logs)
          </button>
          <button className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
             <Settings className="w-4 h-4" /> 调整配置 (Config)
          </button>
        </div>
      </div>
    </div>
  );
};

const Panorama = () => {
  const [viewMode, setViewMode] = useState<'matrix' | 'sankey'>('matrix');
  const [showDimensions, setShowDimensions] = useState({ queue: true, velocity: true, staff: false });
  const [selectedNode, setSelectedNode] = useState<MatrixNodeData | null>(null);

  return (
    <div className="h-full flex flex-col gap-6 p-6 relative overflow-hidden">
      
      {/* Drawer Overlay */}
      {selectedNode && (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-40" onClick={() => setSelectedNode(null)}></div>
      )}
      <NodeDetailDrawer node={selectedNode!} onClose={() => setSelectedNode(null)} />

      {/* A. Control Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
                <button 
                    onClick={() => setViewMode('matrix')}
                    className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'matrix' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <LayoutGrid className="w-4 h-4" /> 矩阵视图
                </button>
                <button 
                    onClick={() => setViewMode('sankey')}
                    className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'sankey' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Workflow className="w-4 h-4" /> 桑基图
                </button>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                    <input type="checkbox" checked={showDimensions.queue} onChange={e => setShowDimensions({...showDimensions, queue: e.target.checked})} className="accent-primary-600 rounded" /> 
                    积压 (Queue)
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                    <input type="checkbox" checked={showDimensions.velocity} onChange={e => setShowDimensions({...showDimensions, velocity: e.target.checked})} className="accent-primary-600 rounded" /> 
                    流速 (Velocity)
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                    <input type="checkbox" checked={showDimensions.staff} onChange={e => setShowDimensions({...showDimensions, staff: e.target.checked})} className="accent-primary-600 rounded" /> 
                    在线 (Staff)
                </label>
            </div>
        </div>
        <div className="flex items-center gap-2 px-3">
             <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> 正常
             </span>
             <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div> 繁忙
             </span>
             <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div> 拥堵
             </span>
        </div>
      </div>

      {/* B. The Pipeline Matrix (Core) */}
      <div className="flex-1 glass-panel rounded-xl p-6 overflow-hidden relative flex flex-col">
         {/* Headers */}
         <div className="flex mb-4 pl-40"> {/* pl-40 to account for row headers */}
            {STAGES.map((stage, i) => (
                <div key={i} className="flex-1 text-center font-bold text-slate-400 text-xs uppercase tracking-wider">
                    {stage}
                </div>
            ))}
         </div>

         {/* Grid Content with SVG Background Layer */}
         <div className="flex-1 relative overflow-y-auto">
             {/* Background Flow Lines */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                 <defs>
                     <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                         <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.2" />
                         <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                         <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.2" />
                     </linearGradient>
                 </defs>
                 {VERSIONS.map((_, rIndex) => (
                     <g key={rIndex}>
                        {/* Horizontal guide lines connecting stages for each version */}
                        <line 
                            x1="160" y1={rIndex * 140 + 60} 
                            x2="100%" y2={rIndex * 140 + 60} 
                            stroke="url(#flowGradient)" 
                            strokeWidth="2" 
                            strokeDasharray="6 6"
                            className="animate-[dash_1s_linear_infinite]" // Tailwind arbitrary value for dash animation needs custom config or style
                            style={{ animation: 'dash 30s linear infinite' }}
                        />
                     </g>
                 ))}
                 <style>{`
                    @keyframes dash {
                      to {
                        stroke-dashoffset: -1000;
                      }
                    }
                 `}</style>
             </svg>

             {/* Rows */}
             {VERSIONS.map((version, rIndex) => (
                 <div key={rIndex} className="flex items-center mb-8 relative z-10 h-[120px]">
                     {/* Row Header */}
                     <div className="w-40 shrink-0 pr-6 flex flex-col justify-center">
                         <div className="font-bold text-slate-800 text-sm truncate" title={version}>{version}</div>
                         <div className="text-xs text-slate-400 font-mono mt-1">ID: {8092 + rIndex}</div>
                         <div className="mt-2 flex gap-1">
                             <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                             <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                             <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                         </div>
                     </div>

                     {/* Stage Cells */}
                     <div className="flex-1 flex gap-4">
                         {STAGES.map((stage, cIndex) => {
                             const node = generateNode(version, stage, rIndex * 10 + cIndex);
                             const isHovered = selectedNode?.id === node.id;
                             
                             return (
                                 <div 
                                    key={cIndex} 
                                    className={`flex-1 relative group cursor-pointer transition-all duration-300 ${isHovered ? 'scale-105' : 'hover:-translate-y-1'}`}
                                    onClick={() => setSelectedNode(node)}
                                 >
                                     {/* Connector Line Logic is in SVG, this is the Node Card */}
                                     <div className={`h-full bg-white rounded-xl border-2 p-3 shadow-sm flex flex-col justify-between transition-colors ${
                                         node.status === 'congested' ? 'border-rose-200 hover:border-rose-400' :
                                         node.status === 'busy' ? 'border-amber-200 hover:border-amber-400' :
                                         'border-slate-100 hover:border-primary-300'
                                     }`}>
                                         <div className="flex justify-between items-start">
                                             <StatusDot status={node.status} />
                                             <MoreHorizontal className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                                         </div>
                                         
                                         <div className="space-y-2 mt-2">
                                             {showDimensions.queue && (
                                                 <div>
                                                     <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Queue</div>
                                                     <div className={`text-lg font-bold font-mono ${
                                                         node.queue > 4000 ? 'text-rose-600' : 'text-slate-700'
                                                     }`}>
                                                         {node.queue > 1000 ? `${(node.queue/1000).toFixed(1)}k` : node.queue}
                                                     </div>
                                                 </div>
                                             )}
                                             
                                             <div className="flex gap-4">
                                                 {showDimensions.velocity && (
                                                     <div>
                                                         <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Vel</div>
                                                         <div className="text-sm font-medium text-slate-600">{node.velocity}/m</div>
                                                     </div>
                                                 )}
                                                 {showDimensions.staff && (
                                                     <div>
                                                         <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Staff</div>
                                                         <div className="text-sm font-medium text-slate-600">{node.staff}</div>
                                                     </div>
                                                 )}
                                             </div>
                                         </div>
                                     </div>
                                     
                                     {/* Flow Particle Effect (Local) */}
                                     {node.status === 'normal' && (
                                         <div className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                             <div className="w-1 h-1 bg-primary-400 rounded-full animate-ping"></div>
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

      {/* D. Bottom Resource Monitor */}
      <div className="h-48 grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
          
          {/* Supply Chain Monitor */}
          <div className="glass-panel p-5 rounded-xl flex flex-col">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-500" /> 资源供需监控 (Supply Chain)
                  </h3>
                  <span className="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">丢弃率: 15%</span>
              </div>
              <div className="flex-1 flex gap-8 items-end px-4 pb-2">
                  <div className="flex-1 flex flex-col gap-2 group cursor-pointer">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>今日入库 (Ingest)</span>
                          <span>12.4TB</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[75%] rounded-full group-hover:bg-blue-600 transition-colors"></div>
                      </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2 group cursor-pointer">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                           <span>今日分发 (Dispatch)</span>
                           <span>8.1TB</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[60%] rounded-full group-hover:bg-emerald-600 transition-colors"></div>
                      </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2 group cursor-pointer">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                           <span>待处理积压</span>
                           <span className="text-amber-600">4.3TB</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 w-[35%] rounded-full group-hover:bg-amber-500 transition-colors"></div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Compute Load Monitor */}
          <div className="glass-panel p-5 rounded-xl flex flex-col">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-500" /> 算力负载 (Compute Load)
                  </h3>
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">预测: 2h后峰值</span>
              </div>
              
              <div className="flex-1 flex items-center justify-center gap-10">
                  {/* Circular Gauge Simulation */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="85, 100" className="animate-[spin_1s_ease-out_reverse]" />
                      </svg>
                      <div className="absolute text-center">
                          <div className="text-2xl font-bold text-slate-800">85%</div>
                          <div className="text-[10px] text-slate-400 uppercase">GPU Load</div>
                      </div>
                  </div>

                  {/* Stats List */}
                  <div className="space-y-2 flex-1">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium">活跃节点</span>
                          <span className="font-mono font-bold text-slate-800">128 / 150</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium">显存占用</span>
                          <span className="font-mono font-bold text-slate-800">14.2 TB</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium">实时能耗</span>
                          <span className="font-mono font-bold text-slate-800">42.5 kW</span>
                      </div>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default Panorama;