import React from 'react';
import { ShieldAlert, Lock } from 'lucide-react';

const Security = () => {
  return (
    <div className="h-full flex flex-col relative bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600 border border-rose-100">
                    <Lock className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">安全合规</h2>
                    <p className="text-xs text-slate-500">敏感数据保护与合规审计</p>
                </div>
             </div>
        </header>

        <div className="flex-1 overflow-hidden px-6 pb-6 pt-4 space-y-6">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-rose-500 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-rose-700">敏感区域红线策略</h3>
                    <p className="text-sm text-rose-600/80 mt-1">
                        已启用针对军事区和政府设施的自动模糊处理。任何包含限制边界框内坐标的导出都需要 3 级管理员批准。
                    </p>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-xl bg-white">
                <h3 className="font-bold text-slate-900 mb-4">加密插件</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-700 font-medium">GCJ-02 坐标偏移</span>
                        <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">已启用</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-700 font-medium">AES-256 静态存储加密</span>
                        <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">已启用</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Security;