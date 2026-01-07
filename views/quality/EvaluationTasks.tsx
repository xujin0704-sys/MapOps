import React, { useState } from 'react';
import { 
    CheckCircle, 
    XCircle, 
    Play, 
    FileText, 
    BarChart3, 
    ChevronRight, 
    ArrowLeft, 
    Search, 
    Clock, 
    Cpu, 
    Bug, 
    Activity, 
    AlertTriangle, 
    Target, 
    List, 
    Share2, 
    PlayCircle, 
    LayoutDashboard,
    ClipboardCheck,
    Plus
} from 'lucide-react';

// --- Types & Mock Data ---

type ViewMode = 'monitor' | 'wizard' | 'report';
type EvalStatus = 'Running' | 'Passed' | 'Failed' | 'Pending';

interface EvaluationTask {
    id: string;
    object: string;
    type: string;
    status: EvalStatus;
    progress: number;
    score: number | null;
    owner: string;
    time: string;
}

const MOCK_TASKS: EvaluationTask[] = [
    { id: 'E-20231025-01', object: 'Map-2025-Q1 [Bundle]', type: 'Integrated Simulation', status: 'Running', progress: 45, score: null, owner: 'System', time: '10 min ago' },
    { id: 'E-20231024-05', object: 'Road-v12 [Snapshot]', type: 'Static QA', status: 'Passed', progress: 100, score: 98, owner: 'Operator_A', time: '2h ago' },
    { id: 'E-20231024-03', object: 'POI-Daily-Build', type: 'Static QA', status: 'Failed', progress: 100, score: 85, owner: 'System', time: '5h ago' },
    { id: 'E-20231023-09', object: 'Map-2025-Q1-RC1', type: 'Adversarial', status: 'Passed', progress: 100, score: 92, owner: 'QA_Lead', time: '1d ago' },
    { id: 'E-20231022-11', object: 'Admin-Release-v2', type: 'Logic Check', status: 'Passed', progress: 100, score: 100, owner: 'System', time: '2d ago' },
];

const MOCK_REPORT = {
    id: 'E-20231024-03',
    object: 'POI-Daily-Build',
    score: 85,
    result: 'REJECTED',
    duration: '45m 12s',
    blockers: [
        { id: 'B-01', title: '严重拓扑断裂', code: 'Edge-9921', desc: '主干道节点度数为 1，导致连通性中断' },
        { id: 'B-02', title: '导航成功率下降', code: 'Nav-002', desc: '核心回归测试集成功率 99.1% < 阈值 99.5%' }
    ],
    staticErrors: [
        { id: 'E-01', type: '自相交 (Self-Intersection)', count: 5, severity: 'High' },
        { id: 'E-02', type: '名称包含非法字符', count: 12, severity: 'Medium' },
        { id: 'E-03', type: '孤立节点 (Islands)', count: 3, severity: 'Low' },
        { id: 'E-04', type: '属性缺失: 邮编', count: 156, severity: 'Low' },
    ],
    simStats: {
        successRate: 99.1,
        avgLatency: '120ms',
        etaDeviation: [5, 15, 45, 20, 10, 3, 2] // Mock histogram distribution
    }
};

// --- Sub-Components ---

const StatusBadge = ({ status }: { status: EvalStatus }) => {
    switch (status) {
        case 'Passed': return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100"><CheckCircle className="w-3 h-3"/> Passed</span>;
        case 'Failed': return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100"><XCircle className="w-3 h-3"/> Failed</span>;
        case 'Running': return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 animate-pulse"><Activity className="w-3 h-3"/> Running</span>;
        default: return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">Pending</span>;
    }
};

// --- View A: Monitor ---

const TaskMonitor = ({ onNew, onViewReport }: { onNew: () => void, onViewReport: (task: EvaluationTask) => void }) => {
    return (
        <div className="h-full flex flex-col gap-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">综合通过率 (7d)</div>
                        <div className="text-2xl font-bold text-slate-900">92.5%</div>
                        <div className="text-xs text-emerald-600 font-medium mt-1">↑ 1.2% vs last week</div>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                </div>
                <div className="glass-panel p-5 rounded-xl flex items-center justify-between border-l-4 border-l-rose-500">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">活跃阻断 Bug</div>
                        <div className="text-2xl font-bold text-slate-900">3</div>
                        <div className="text-xs text-rose-600 font-medium mt-1">需立即修复</div>
                    </div>
                    <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                        <Bug className="w-6 h-6" />
                    </div>
                </div>
                <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">仿真算力负载</div>
                        <div className="text-2xl font-bold text-slate-900">45%</div>
                        <div className="text-xs text-slate-400 font-medium mt-1">Sandboxes Active: 128</div>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <Cpu className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <List className="w-5 h-5 text-slate-500" /> 任务列表
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="p-4">任务 ID</th>
                                <th className="p-4">评测对象</th>
                                <th className="p-4">评测类型</th>
                                <th className="p-4">状态</th>
                                <th className="p-4">核心指标</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {MOCK_TASKS.map(task => (
                                <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4 font-mono text-slate-500">{task.id}</td>
                                    <td className="p-4 font-bold text-slate-800">{task.object}</td>
                                    <td className="p-4 text-slate-600">{task.type}</td>
                                    <td className="p-4"><StatusBadge status={task.status} /></td>
                                    <td className="p-4">
                                        {task.status === 'Running' ? (
                                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 animate-pulse" style={{width: `${task.progress}%`}}></div>
                                            </div>
                                        ) : (
                                            <span className={`font-bold font-mono ${task.score && task.score >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {task.score !== null ? `${task.score} 分` : '-'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => onViewReport(task)}
                                            className="text-primary-600 hover:text-primary-700 font-medium hover:underline flex items-center justify-end gap-1 ml-auto"
                                        >
                                            {task.status === 'Running' ? '查看进度' : '查看报告'} <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- View B: Wizard ---

const NewEvaluationWizard = ({ onCancel, onSubmit }: { onCancel: () => void, onSubmit: () => void }) => {
    return (
        <div className="max-w-3xl mx-auto py-10">
            <div className="mb-8 flex items-center gap-4">
                <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">发起新评测</h2>
                    <p className="text-slate-500">配置新的自动化测试任务。</p>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-xl space-y-8">
                {/* Step 1 */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                        选择对象
                    </h3>
                    <div className="pl-8 grid grid-cols-2 gap-6">
                        <div className="col-span-2 flex gap-4">
                             <label className="flex items-center gap-3 p-4 border border-primary-500 bg-primary-50 rounded-lg cursor-pointer flex-1">
                                <input type="radio" name="scope" defaultChecked className="accent-primary-600 w-5 h-5"/>
                                <div>
                                    <div className="font-bold text-slate-900">单产线快照 (Snapshot)</div>
                                    <div className="text-xs text-slate-500">针对特定组件（如路网、POI）的快速验证</div>
                                </div>
                             </label>
                             <label className="flex items-center gap-3 p-4 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg cursor-pointer flex-1">
                                <input type="radio" name="scope" className="accent-primary-600 w-5 h-5"/>
                                <div>
                                    <div className="font-bold text-slate-900">全要素集成包 (Bundle)</div>
                                    <div className="text-xs text-slate-500">发布前的全量回归测试</div>
                                </div>
                             </label>
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-bold text-slate-700 block mb-1.5">目标版本</label>
                            <select className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100">
                                <option>POI-Daily-Build (Latest)</option>
                                <option>Road-v12-RC3</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Step 2 */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">2</div>
                        测试套件 (Test Suite)
                    </h3>
                    <div className="pl-8 space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary-300 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-600 rounded" />
                            <div className="flex-1">
                                <div className="font-bold text-slate-800 text-sm">静态质检 (Static QA)</div>
                                <div className="text-xs text-slate-500">拓扑规范, 属性完整性, 值域检查</div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary-300 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 accent-primary-600 rounded" />
                            <div className="flex-1">
                                <div className="font-bold text-slate-800 text-sm">逻辑检查 (Logical)</div>
                                <div className="text-xs text-slate-500">跨图层一致性 (如: POI必须在陆地上)</div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary-300 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 accent-primary-600 rounded" />
                            <div className="flex-1">
                                <div className="font-bold text-slate-800 text-sm">服务仿真 (Simulation)</div>
                                <div className="text-xs text-slate-500">Golden Set 回归 (1万条核心路径规划)</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Step 3 */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">3</div>
                        资源配置
                    </h3>
                    <div className="pl-8">
                        <div className="mb-2 flex justify-between">
                            <label className="text-sm font-bold text-slate-700">并发容器数</label>
                            <span className="text-sm font-mono text-primary-600 font-bold">32 Containers</span>
                        </div>
                        <input type="range" className="w-full accent-primary-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" min="1" max="128" defaultValue="32" />
                        <p className="text-xs text-slate-500 mt-2">预计消耗 120 GPU/时，耗时约 45 分钟。</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                    <button onClick={onCancel} className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors">取消</button>
                    <button onClick={onSubmit} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-lg shadow-primary-200 transition-colors flex items-center gap-2">
                        <PlayCircle className="w-5 h-5" /> 开始评测
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- View C: Report Detail ---

const ReportDetail = ({ task, onBack }: { task: EvaluationTask, onBack: () => void }) => {
    const [activeTab, setActiveTab] = useState<'static' | 'sim'>('static');
    const [selectedError, setSelectedError] = useState<string | null>(null);

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <header className="flex items-center justify-between shrink-0 bg-white p-6 border-b border-slate-200 -mx-6 -mt-4 mb-2">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-slate-900">评测报告: {MOCK_REPORT.object}</h2>
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-500">{MOCK_REPORT.id}</span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> 耗时: {MOCK_REPORT.duration}</span>
                            <span className="flex items-center gap-1"><Target className="w-3 h-3"/> 覆盖率: 100%</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-sm flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> 分享报告
                    </button>
                    <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-sm shadow-sm">
                        下载 PDF
                    </button>
                </div>
            </header>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Left Sidebar: Scorecard */}
                <aside className="w-80 glass-panel p-6 rounded-xl flex flex-col shrink-0 overflow-y-auto">
                    {/* Big Score */}
                    <div className="flex flex-col items-center justify-center py-6 border-b border-slate-100">
                        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                             <svg className="w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="58" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                <circle cx="64" cy="64" r="58" fill="none" stroke="#f43f5e" strokeWidth="8" strokeDasharray="365" strokeDashoffset={365 - (365 * MOCK_REPORT.score) / 100} strokeLinecap="round" />
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <span className="text-4xl font-black text-slate-900">{MOCK_REPORT.score}</span>
                                 <span className="text-xs font-bold text-slate-400 uppercase">Total Score</span>
                             </div>
                        </div>
                        <div className="bg-rose-50 text-rose-700 border border-rose-200 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> {MOCK_REPORT.result}
                        </div>
                    </div>

                    {/* Blockers List */}
                    <div className="mt-6 flex-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> 阻断项 (Blockers)
                        </h3>
                        <div className="space-y-3">
                            {MOCK_REPORT.blockers.map(blocker => (
                                <div key={blocker.id} className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-rose-800 text-sm">{blocker.title}</span>
                                        <span className="text-[10px] font-mono text-rose-600 bg-white px-1 rounded border border-rose-200">{blocker.code}</span>
                                    </div>
                                    <p className="text-xs text-rose-700/80 leading-relaxed">{blocker.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content: Tabs */}
                <main className="flex-1 flex flex-col min-h-0 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                    {/* Tab Header */}
                    <div className="flex border-b border-slate-200 bg-white">
                        <button 
                            onClick={() => setActiveTab('static')}
                            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'static' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                        >
                            <FileText className="w-4 h-4" /> 静态质检 (Static QA)
                        </button>
                        <button 
                            onClick={() => setActiveTab('sim')}
                            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'sim' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                        >
                            <LayoutDashboard className="w-4 h-4" /> 仿真回归 (Simulation)
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-hidden p-6">
                        {activeTab === 'static' ? (
                            <div className="h-full flex gap-6">
                                {/* Error List */}
                                <div className="w-1/2 overflow-y-auto pr-2 space-y-3">
                                    {MOCK_REPORT.staticErrors.map(err => (
                                        <div 
                                            key={err.id} 
                                            onClick={() => setSelectedError(err.id)}
                                            className={`p-4 bg-white border rounded-xl cursor-pointer transition-all hover:shadow-md ${selectedError === err.id ? 'border-primary-500 ring-1 ring-primary-500' : 'border-slate-200'}`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-slate-800">{err.type}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    err.severity === 'High' ? 'bg-rose-100 text-rose-700' : 
                                                    err.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                }`}>{err.severity}</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="text-2xl font-bold text-slate-900">{err.count} <span className="text-sm text-slate-400 font-normal">errors</span></div>
                                                <button className="text-xs font-bold text-primary-600 hover:underline">指派修复 &rarr;</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Map Preview */}
                                <div className="w-1/2 bg-slate-200 rounded-xl relative overflow-hidden border border-slate-300">
                                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center opacity-30 grayscale"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {selectedError ? (
                                            <div className="relative animate-in zoom-in duration-300">
                                                <div className="w-32 h-32 border-2 border-rose-500 rounded-lg bg-white/50 backdrop-blur flex items-center justify-center">
                                                    <div className="text-rose-600 font-bold text-xs absolute -top-3 left-2 bg-white px-1">Error Location</div>
                                                    <svg className="w-full h-full p-4" viewBox="0 0 100 100">
                                                        <path d="M 20,20 L 80,80 M 20,80 L 80,20" stroke="#f43f5e" strokeWidth="4" />
                                                    </svg>
                                                </div>
                                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-3 py-1.5 rounded shadow-lg">
                                                    ID: Edge-9921 (Self-intersect)
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 font-medium">Select an error to view location</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col gap-6">
                                {/* Sim Stats */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Success Rate</div>
                                        <div className="text-2xl font-bold text-emerald-600">99.1%</div>
                                    </div>
                                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Avg Latency</div>
                                        <div className="text-2xl font-bold text-blue-600">120ms</div>
                                    </div>
                                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Failed Paths</div>
                                        <div className="text-2xl font-bold text-rose-600">90</div>
                                    </div>
                                </div>
                                
                                {/* Charts & Map */}
                                <div className="flex-1 flex gap-6 min-h-0">
                                     <div className="w-1/2 bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
                                         <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4"/> ETA Deviation Distribution</h4>
                                         <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-2">
                                             {MOCK_REPORT.simStats.etaDeviation.map((h, i) => (
                                                 <div key={i} className="flex-1 bg-blue-100 hover:bg-blue-200 rounded-t-sm relative group" style={{height: `${h * 2}%`}}>
                                                     <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                         {h}%
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                         <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
                                             <span>-1min</span>
                                             <span>0</span>
                                             <span>+1min</span>
                                             <span>+5min</span>
                                         </div>
                                     </div>
                                     <div className="w-1/2 bg-slate-200 rounded-xl relative overflow-hidden border border-slate-300">
                                         <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded shadow-sm text-xs font-bold text-rose-600 border border-rose-100">
                                             Failed Path Visualization
                                         </div>
                                         <svg className="absolute inset-0 w-full h-full">
                                             <path d="M 50,300 Q 150,100 300,50" fill="none" stroke="#f43f5e" strokeWidth="3" strokeDasharray="4 4" />
                                             <circle cx="300" cy="50" r="4" fill="#f43f5e" />
                                             <circle cx="50" cy="300" r="4" fill="#3b82f6" />
                                         </svg>
                                     </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

// --- Main Container ---

const EvaluationTasks = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('monitor');
  const [selectedTask, setSelectedTask] = useState<EvaluationTask | null>(null);

  const handleStartNew = () => setViewMode('wizard');
  const handleCancelNew = () => setViewMode('monitor');
  const handleSubmitNew = () => {
      // Logic to submit new task would go here
      setViewMode('monitor');
  };

  const handleViewReport = (task: EvaluationTask) => {
      setSelectedTask(task);
      setViewMode('report');
  };

  const handleBackToMonitor = () => {
      setSelectedTask(null);
      setViewMode('monitor');
  };

  if (viewMode === 'wizard') return <NewEvaluationWizard onCancel={handleCancelNew} onSubmit={handleSubmitNew} />;
  if (viewMode === 'report' && selectedTask) return <ReportDetail task={selectedTask} onBack={handleBackToMonitor} />;

  return (
    <div className="h-full flex flex-col relative bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
                    <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">评测任务</h2>
                    <p className="text-xs text-slate-500">自动化质量评估与回归测试</p>
                </div>
             </div>
             <div className="flex gap-3">
                <div className="relative w-64">
                    <input 
                        type="text" 
                        placeholder="Search tasks..." 
                        className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" 
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <button onClick={handleStartNew} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors">
                    <Plus className="w-4 h-4" /> 发起评测
                </button>
             </div>
        </header>

        <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
            <TaskMonitor onNew={handleStartNew} onViewReport={handleViewReport} />
        </div>
    </div>
  );
};

export default EvaluationTasks;