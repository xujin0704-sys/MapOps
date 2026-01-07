import React, { useState } from 'react';
import { 
    Package, 
    Plus, 
    CheckCircle, 
    AlertTriangle, 
    Settings, 
    Bot,
    ChevronRight,
    ArrowLeft,
    Search,
    Filter,
    RefreshCw,
    ShieldCheck,
    AlertOctagon,
    Rocket
} from 'lucide-react';

// --- Types ---

type ReleaseStatus = 'Draft' | 'Testing' | 'Published' | 'RolledBack';

interface ProductRelease {
    id: string;
    version: string;
    productType: 'Standard Map' | 'Nav SDK' | 'ADAS Map';
    status: ReleaseStatus;
    score: number | null;
    createTime: string;
    publisher: string;
}

// --- Mock Data ---

const MOCK_RELEASES: ProductRelease[] = [
    { id: 'R-001', version: 'v2025.01.0', productType: 'Standard Map', status: 'Published', score: 98.5, createTime: '2023-10-20', publisher: 'System' },
    { id: 'R-002', version: 'v2025.02.0-RC1', productType: 'Nav SDK', status: 'Testing', score: null, createTime: '2023-10-24', publisher: 'Tom' },
    { id: 'R-003', version: 'v2025.02.1-Beta', productType: 'Standard Map', status: 'Draft', score: null, createTime: '2023-10-25', publisher: 'Jerry' },
];

// --- Sub-Components ---

const StatusBadge = ({ status }: { status: ReleaseStatus }) => {
    const styles = {
        Draft: 'bg-slate-100 text-slate-600 border-slate-200',
        Testing: 'bg-blue-50 text-blue-600 border-blue-200',
        Published: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        RolledBack: 'bg-rose-50 text-rose-600 border-rose-200',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status]}`}>
            {status}
        </span>
    );
};

const ReleaseList = ({ onNew }: { onNew: () => void }) => {
    return (
        <div className="h-full flex flex-col relative bg-slate-50">
            <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600 border border-orange-100">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">产品发布</h2>
                        <p className="text-xs text-slate-500">将零部件组装成成品的总装车间</p>
                    </div>
                </div>
                <button 
                    onClick={onNew}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm shadow-primary-200 transition-colors"
                >
                    <Plus className="w-4 h-4" /> 新建发版计划
                </button>
            </header>

            <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
                <div className="h-full glass-panel rounded-xl overflow-hidden flex flex-col shadow-sm border border-slate-200">
                     <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                        <div className="flex gap-2">
                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"><Filter className="w-4 h-4"/></button>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="搜索版本号..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-primary-500" />
                            </div>
                        </div>
                     </div>
                     <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-4 pl-6">版本号</th>
                                    <th className="p-4">产品类型</th>
                                    <th className="p-4">发布人</th>
                                    <th className="p-4">创建时间</th>
                                    <th className="p-4">状态</th>
                                    <th className="p-4">集成评测分</th>
                                    <th className="p-4 text-right pr-6">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {MOCK_RELEASES.map(rel => (
                                    <tr key={rel.id} className="hover:bg-slate-50 group">
                                        <td className="p-4 pl-6 font-bold text-slate-900 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-slate-400" />
                                            {rel.version}
                                        </td>
                                        <td className="p-4 text-slate-600">{rel.productType}</td>
                                        <td className="p-4 text-slate-600">{rel.publisher}</td>
                                        <td className="p-4 text-slate-500 font-mono text-xs">{rel.createTime}</td>
                                        <td className="p-4"><StatusBadge status={rel.status} /></td>
                                        <td className="p-4">
                                            {rel.score ? (
                                                <span className={`font-bold ${rel.score >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {rel.score}
                                                </span>
                                            ) : <span className="text-slate-400">-</span>}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button className="text-primary-600 hover:text-primary-700 font-bold text-xs">详情</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            </div>
        </div>
    );
};

const AssemblyWorkbench = ({ onBack }: { onBack: () => void }) => {
    const [config, setConfig] = useState({
        version: 'v2025.03.0-alpha',
        strategy: 'canary',
        changelog: '',
    });
    
    const [manifest, setManifest] = useState<{
        BaseMap: string;
        Road: string;
        POI: string;
    }>({
        BaseMap: 'S-Base-01',
        Road: 'S-Road-01',
        POI: 'S-POI-01',
    });

    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState<'none' | 'success' | 'fail'>('none');

    const handleSimulate = () => {
        setIsSimulating(true);
        setSimulationResult('none');
        setTimeout(() => {
            setIsSimulating(false);
            setSimulationResult('success');
        }, 2000);
    };

    const generateChangelog = () => {
        setConfig(prev => ({...prev, changelog: '1. 更新了朝阳区最新的路网数据 (Road-v12)\n2. 修复了 POI 关联错误 120 处\n3. 行政区划同步了 10 月份政府公文变更'}));
    };

    return (
        <div className="h-full flex flex-col relative bg-slate-50">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">发版组装台 (Assembly)</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>新建版本</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="font-mono">{config.version}</span>
                        </div>
                    </div>
                </div>
                <div>
                     <StatusBadge status="Draft" />
                </div>
            </header>

            <div className="flex-1 flex gap-6 px-6 pb-6 pt-4 min-h-0 overflow-hidden">
                {/* Left: Configuration & Manifest */}
                <div className="w-2/3 flex flex-col gap-6 overflow-y-auto pr-2">
                    {/* Meta Info */}
                    <section className="glass-panel p-6 rounded-xl space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-slate-500"/> 版本定义 (Meta Info)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">版本号</label>
                                <input 
                                    type="text" 
                                    value={config.version}
                                    onChange={e => setConfig({...config, version: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-mono focus:border-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">发布策略</label>
                                <select 
                                    value={config.strategy}
                                    onChange={e => setConfig({...config, strategy: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none"
                                >
                                    <option value="canary">灰度发布 (Canary 10%)</option>
                                    <option value="full">全量发布 (Full Rollout)</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex justify-between mb-1">
                                    <span>发布日志 (Changelog)</span>
                                    <button onClick={generateChangelog} className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-[10px] font-bold">
                                        <Bot className="w-3 h-3" /> AI 自动生成
                                    </button>
                                </label>
                                <textarea 
                                    value={config.changelog}
                                    onChange={e => setConfig({...config, changelog: e.target.value})}
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm focus:border-primary-500 outline-none resize-none"
                                    placeholder="描述本次版本的核心变更..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Manifest Selector */}
                    <section className="glass-panel p-6 rounded-xl space-y-4 flex-1">
                        <div className="flex justify-between items-center">
                             <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Package className="w-4 h-4 text-slate-500"/> 组件清单 (Manifest)
                            </h3>
                            <span className="text-xs text-slate-400">选择要打包的组件快照</span>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Base Map */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-700">基础底图 (Base Map)</span>
                                    <span className="text-xs font-mono text-slate-400">Required</span>
                                </div>
                                <select 
                                    value={manifest.BaseMap}
                                    onChange={e => setManifest({...manifest, BaseMap: e.target.value})}
                                    className="w-full bg-white border border-slate-300 rounded p-2 text-sm outline-none"
                                >
                                    <option value="S-Base-01">Global-Base-v5.0 [Stable]</option>
                                </select>
                            </div>

                             {/* Road */}
                             <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-700">路网组件 (Road)</span>
                                </div>
                                <select 
                                    value={manifest.Road}
                                    onChange={e => setManifest({...manifest, Road: e.target.value})}
                                    className="w-full bg-white border border-slate-300 rounded p-2 text-sm outline-none"
                                >
                                    <option value="S-Road-01">Road-v12 [Stable] (Score: 99.2)</option>
                                    <option value="S-Road-02">Road-v13-beta [Nightly] (Score: 85.0)</option>
                                </select>
                                {manifest.Road === 'S-Road-02' && (
                                    <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> 警告: Beta 版本可能不稳定
                                    </div>
                                )}
                            </div>

                            {/* POI */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-700">POI 组件</span>
                                </div>
                                <select 
                                    value={manifest.POI}
                                    onChange={e => setManifest({...manifest, POI: e.target.value})}
                                    className="w-full bg-white border border-slate-300 rounded p-2 text-sm outline-none"
                                >
                                    <option value="S-POI-01">POI-20231209 [Stable] (Score: 97.8)</option>
                                </select>
                            </div>

                            {/* Compatibility Check Result */}
                             <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded flex items-center gap-2 text-xs text-emerald-800 font-medium">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                兼容性检查通过: 无孤立行政区代码冲突。
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: Quality Radar & Actions */}
                <div className="w-1/3 flex flex-col gap-6">
                    <section className="glass-panel p-6 rounded-xl flex-1 flex flex-col">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6">
                            <ShieldCheck className="w-4 h-4 text-slate-500"/> 集成质量雷达
                        </h3>
                        
                        <div className="flex-1 flex flex-col items-center justify-center relative">
                            {isSimulating ? (
                                <div className="text-center space-y-4">
                                    <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                                    <p className="text-sm font-bold text-slate-600">正在运行集成仿真...</p>
                                    <p className="text-xs text-slate-400">Check: Topology, Navigation, Rendering</p>
                                </div>
                            ) : simulationResult === 'success' ? (
                                <div className="text-center space-y-4 animate-in zoom-in">
                                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                        <CheckCircle className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-slate-900">98.5 分</h4>
                                        <p className="text-sm text-emerald-600 font-bold mt-1">Ready for Release</p>
                                    </div>
                                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded text-left w-full space-y-1">
                                        <div className="flex justify-between"><span>算路成功率:</span> <span className="font-mono font-bold">99.99%</span></div>
                                        <div className="flex justify-between"><span>渲染帧率:</span> <span className="font-mono font-bold">60fps</span></div>
                                        <div className="flex justify-between"><span>数据完整性:</span> <span className="font-mono font-bold">100%</span></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400">
                                    <AlertOctagon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="text-sm">尚未执行集成测试</p>
                                    <p className="text-xs mt-2 opacity-60">请配置清单后点击构建</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 space-y-3">
                            <button 
                                onClick={handleSimulate}
                                disabled={isSimulating}
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                                    isSimulating 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                    : 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
                                }`}
                            >
                                {isSimulating ? '构建中...' : '构建与集成评测 (Build & Test)'}
                            </button>
                            
                            <button 
                                disabled={simulationResult !== 'success'}
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                                    simulationResult === 'success'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                <Rocket className="w-4 h-4" /> 发布上线 (Publish)
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const ProductReleases = () => {
  const [viewMode, setViewMode] = useState<'list' | 'assembly'>('list');

  return (
    <div className="h-full">
        {viewMode === 'list' ? (
            <ReleaseList onNew={() => setViewMode('assembly')} />
        ) : (
            <AssemblyWorkbench onBack={() => setViewMode('list')} />
        )}
    </div>
  );
};

export default ProductReleases;