import React, { useState } from 'react';
import { MOCK_OPERATOR_TASKS } from '../../constants';
import { OperatorTask, OperatorTaskType } from '../../types';
import { Route, Landmark, Store, DoorOpen, ListFilter, ArrowDownUp } from 'lucide-react';

interface MyTasksProps {
    onStartTask: (task: OperatorTask) => void;
    taskTypeFilter?: OperatorTaskType;
}

const TASK_ICONS: Record<OperatorTaskType, React.ElementType> = {
    Road: Route,
    Admin: Landmark,
    POI: Store,
    LastMile: DoorOpen
};

// FIX: Define a props interface and use React.FC for the TaskCard component
// to correctly handle React's special `key` prop and avoid TypeScript errors.
interface TaskCardProps {
    task: OperatorTask;
    onStart: (task: OperatorTask) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStart }) => {
    const Icon = TASK_ICONS[task.type];
    const confidenceColor = task.aiConfidence > 0.9 ? 'text-emerald-600' : task.aiConfidence > 0.7 ? 'text-amber-600' : 'text-rose-600';
    const slaColor = task.slaHours <= 2 ? 'text-rose-600' : task.slaHours <= 8 ? 'text-amber-600' : 'text-slate-500';

    return (
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4 hover:shadow-lg hover:border-primary-300 transition-all duration-200">
            <div className={`p-3 rounded-lg ${
                task.type === 'Road' ? 'bg-blue-50 text-blue-600' :
                task.type === 'Admin' ? 'bg-purple-50 text-purple-600' :
                task.type === 'POI' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900">{task.id}</h3>
                    <span className="text-xs font-bold text-slate-500">{task.region}</span>
                </div>
                <div className="flex items-center gap-6 mt-2 text-xs text-slate-500">
                    <div>AI 置信度: <span className={`font-bold ${confidenceColor}`}>{ (task.aiConfidence * 100).toFixed(0) }%</span></div>
                    <div>SLA 倒计时: <span className={`font-bold ${slaColor}`}>{task.slaHours}h</span></div>
                </div>
            </div>
            <button 
                onClick={() => onStart(task)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-primary-200"
            >
                开始作业
            </button>
        </div>
    );
};

const MyTasks: React.FC<MyTasksProps> = ({ onStartTask, taskTypeFilter }) => {
    const [activeTab, setActiveTab] = useState<'in-progress' | 'pending' | 'rejected' | 'completed'>('in-progress');
    const [sortBy, setSortBy] = useState<'sla' | 'confidence'>('sla');
    
    const TABS = [
        { id: 'in-progress', label: '进行中' },
        { id: 'pending', label: '待领取' },
        { id: 'rejected', label: '质检驳回' },
        { id: 'completed', label: '已完成' }
    ];

    const filteredTasks = MOCK_OPERATOR_TASKS
        .filter(task => task.status === activeTab)
        .filter(task => !taskTypeFilter || task.type === taskTypeFilter)
        .sort((a, b) => {
            if (sortBy === 'sla') return a.slaHours - b.slaHours;
            return a.aiConfidence - b.aiConfidence; // Low confidence first
        });

    return (
        <div className="h-full flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">我的任务</h2>
                    <p className="text-sm text-slate-500">聚合所有待办事项，按优先级智能排序。</p>
                </div>
            </header>

            {/* Tabs & Filters */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                    {TABS.map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
                                activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSortBy(prev => prev === 'sla' ? 'confidence' : 'sla')}
                        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm"
                    >
                        <ArrowDownUp className="w-4 h-4" />
                        排序: {sortBy === 'sla' ? '按 SLA 紧急度' : '按 AI 置信度'}
                    </button>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} onStart={onStartTask} />
                    ))
                ) : (
                     <div className="h-full flex items-center justify-center text-center text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <div>
                            <h3 className="text-lg font-bold">任务已清空</h3>
                            <p className="text-sm mt-1">这个列表里没有任务了。</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTasks;