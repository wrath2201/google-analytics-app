export default function DashboardSkeleton() {
    return (
        <div className="w-full animate-pulse space-y-6 opacity-60">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white border border-[#E5E0D8] shadow-sm rounded-xl h-[104px] p-5 flex flex-col justify-between">
                        <div className="w-24 h-3 bg-[#EDE8E0] rounded-sm"></div>
                        <div className="w-16 h-6 bg-[#E5E1D8] rounded-sm"></div>
                    </div>
                ))}
            </div>

            {/* Middle Row: Intelligent Insights + Traffic Chart Equivalent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-[#E5E0D8] shadow-sm rounded-2xl h-[420px] p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div className="w-40 h-5 bg-[#E5E1D8] rounded-sm"></div>
                        <div className="flex gap-2">
                            <div className="w-20 h-8 bg-[#EDE8E0] rounded-lg"></div>
                            <div className="w-10 h-8 bg-[#EDE8E0] rounded-lg"></div>
                        </div>
                    </div>
                    {/* Fake Chart Area */}
                    <div className="flex-1 w-full bg-gradient-to-t from-[#F5F2EC]/80 to-[#F9F8F6] rounded-xl flex items-end justify-between px-4 pb-0 overflow-hidden relative border border-[#F0ECE4]">
                        {/* Wavy Fake Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#E5E1D8]/20 rounded-t-[100%] blur-xl transform scale-150 translate-y-10"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-[#EDE8E0]/30 rounded-t-[150%] blur-2xl transform scale-125 translate-x-10"></div>
                    </div>
                </div>
                
                <div className="lg:col-span-1 bg-white border border-[#E5E0D8] shadow-sm rounded-2xl h-[420px] p-6 flex flex-col">
                    <div className="w-32 h-5 bg-[#E5E1D8] rounded-sm mb-6"></div>
                    {/* Fake Pie Chart */}
                    <div className="w-full flex-1 flex flex-col items-center justify-center gap-6">
                        <div className="w-36 h-36 rounded-full border-[12px] border-[#F5F2EC] border-t-[#E5E1D8] border-r-[#EDE8E0]"></div>
                        <div className="w-full space-y-3 mt-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-full flex items-center justify-between">
                                    <div className="w-20 h-2 bg-[#EDE8E0] rounded-sm"></div>
                                    <div className="w-12 h-2 bg-[#E5E1D8] rounded-sm"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white border border-[#E5E0D8] shadow-sm rounded-2xl h-80 p-6 flex flex-col">
                        <div className="w-32 h-5 bg-[#E5E1D8] rounded-sm mb-8"></div>
                        <div className="flex-1 flex items-end gap-3 justify-between">
                            {[30, 70, 45, 90, 60, 20, 80, 50, 65, 40].map((h, j) => (
                                <div key={j} className="flex-1 bg-[#F5F2EC] hover:bg-[#EDE8E0] transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
