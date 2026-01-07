import React from 'react';
import { Zap } from 'lucide-react';

const HotfixExpress = () => {
  return (
    <div className="h-full flex flex-col relative bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                    <Zap className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">热修通道</h2>
                    <p className="text-xs text-slate-500">紧急问题快速修复流程</p>
                </div>
             </div>
        </header>

        <div className="flex-1 overflow-hidden px-6 pb-6 pt-4 space-y-6">
            <div className="glass-panel p-8 rounded-xl flex items-center justify-between relative shadow-sm bg-white">
                {/* Steps */}
                {[
                    { n: 1, label: '分诊工单' },
                    { n: 2, label: '微观仿真' },
                    { n: 3, label: '补丁生成' },
                    { n: 4, label: '用户回调' }
                ].map((step, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-primary-500 text-primary-600 flex items-center justify-center font-bold shadow-sm z-20">
                            {step.n}
                        </div>
                        <span className="text-sm text-slate-600 font-medium bg-white px-2 z-20">{step.label}</span>
                    </div>
                ))}
                
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-200 -translate-y-4 z-0"></div>
            </div>

            <div className="glass-panel p-6 rounded-xl bg-white">
                <h3 className="text-lg font-bold text-slate-900 mb-4">活跃热修</h3>
                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500 border-t border-r border-b border-amber-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-slate-800">补丁 #HF-20231024-01</h4>
                            <p className="text-sm text-slate-500 mt-1">修复：第五大道转向限制</p>
                        </div>
                        <span className="text-amber-600 text-sm font-bold animate-pulse flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            仿真中...
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default HotfixExpress;