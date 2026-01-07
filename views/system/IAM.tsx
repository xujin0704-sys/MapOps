import React from 'react';
import { Users, Lock } from 'lucide-react';

const IAM = () => {
  return (
    <div className="h-full flex flex-col relative bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
                    <Users className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">组织与权限</h2>
                    <p className="text-xs text-slate-500">IAM 访问控制与角色管理</p>
                </div>
             </div>
        </header>

        <div className="flex-1 overflow-hidden px-6 pb-6 pt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl bg-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-slate-900">网格级权限</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">基于地理网格单元管理访问控制。</p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                            <span className="text-slate-700 font-medium">作业员组 A</span>
                            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded font-medium">区域 1, 2, 5</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                            <span className="text-slate-700 font-medium">外部供应商</span>
                            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded font-medium">区域 7 (只读)</span>
                        </div>
                    </div>
                </div>

                 <div className="glass-panel p-6 rounded-xl bg-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-50 rounded-lg">
                            <Lock className="w-5 h-5 text-rose-600" />
                        </div>
                        <h3 className="font-bold text-slate-900">安全策略</h3>
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600 p-2 hover:bg-slate-50 rounded transition-colors">
                            <input type="checkbox" defaultChecked className="accent-primary-600 w-4 h-4" />
                            生产环境发布需要 MFA
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 p-2 hover:bg-slate-50 rounded transition-colors">
                            <input type="checkbox" defaultChecked className="accent-primary-600 w-4 h-4" />
                            审计日志保留（6个月）
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default IAM;