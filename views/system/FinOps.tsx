import React from 'react';
import { Wallet, TrendingDown } from 'lucide-react';

const FinOps = () => {
  return (
    <div className="h-full flex flex-col relative bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                    <Wallet className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">算力成本</h2>
                    <p className="text-xs text-slate-500">FinOps 成本监控与优化</p>
                </div>
             </div>
        </header>

        <div className="flex-1 overflow-hidden px-6 pb-6 pt-4 space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-lg bg-white">
                    <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">月度总成本</span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">$12,450</h3>
                    <span className="text-xs text-emerald-600 flex items-center gap-1 mt-2 font-medium">
                        <TrendingDown className="w-3 h-3" /> 5% 较上月
                    </span>
                </div>
                 <div className="glass-panel p-4 rounded-lg bg-white">
                    <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">GPU 工时 (A100)</span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">450h</h3>
                </div>
                 <div className="glass-panel p-4 rounded-lg bg-white">
                    <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">存储 (S3)</span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">45 TB</h3>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-xl bg-white">
                <h3 className="font-bold text-slate-900 mb-6">产线成本分摊</h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                            <span>路网</span>
                            <span>60%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="w-[60%] h-full bg-blue-500 rounded-full"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                            <span>基座模型训练</span>
                            <span>25%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="w-[25%] h-full bg-purple-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default FinOps;