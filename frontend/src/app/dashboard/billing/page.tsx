"use client";

import { CreditCard, Download, ExternalLink, CalendarDays, FileText, CheckCircle2, ShieldAlert, Zap, ArrowRight, ArrowUpRight } from "lucide-react";

export default function BillingPage() {
    return (
        <div className="p-4 md:p-8 pb-32 w-full h-full overflow-y-auto">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 mb-8 self-start">
                <CreditCard className="w-8 h-8 text-primary" /> Quản lý Gói & Hóa đơn
            </h1>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">

                {/* Left Column: Current Plan & Payment Method */}
                <div className="flex flex-col gap-8 xl:col-span-1">
                    {/* Current Plan Card */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                        {/* Decorative BG */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30">
                                    <Zap className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Gói hiện tại</h3>
                            </div>

                            <div className="mb-6">
                                <div className="text-3xl font-extrabold text-foreground mb-1">
                                    FileFlow Pro
                                </div>
                                <div className="flex items-end gap-1 text-primary">
                                    <span className="text-4xl font-black">$9.99</span>
                                    <span className="text-sm font-bold opacity-80 mb-1">/tháng</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dung lượng lưu trữ 500GB
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Upload tệp lớn đến 10GB
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Băng thông tải xuống tốc độ cao
                                </div>
                            </div>

                            <div className="border-t border-border/50 pt-5 mb-5 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Chu kỳ kế tiếp</span>
                                <span className="font-bold">24 Tháng 05, 2024</span>
                            </div>

                            <button className="w-full py-3.5 bg-background border border-primary/50 text-primary font-bold rounded-xl hover:bg-primary/10 transition-colors cursor-pointer group flex items-center justify-center gap-2">
                                Nâng cấp gói Doanh nghiệp <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Phương thức thanh toán</h3>
                            <button className="text-sm font-bold text-primary hover:underline cursor-pointer">Thêm mới</button>
                        </div>

                        <div className="p-4 border border-border/50 bg-secondary/30 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-background border border-border rounded flex items-center justify-center shadow-sm shrink-0 font-bold italic text-blue-600 text-xs">
                                    VISA
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Visa kết thúc bằng •••• 4242</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">Hết hạn: 12/26</div>
                                </div>
                            </div>
                            <div className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-md">
                                Mặc định
                            </div>
                        </div>

                        <div className="mt-4 flex items-start gap-3 p-4 bg-amber-500/10 text-amber-600 rounded-xl text-xs font-medium border border-amber-500/20">
                            <ShieldAlert className="w-5 h-5 shrink-0" />
                            <p>Chúng tôi sử dụng cổng thanh toán Stripe. Dữ liệu thẻ của bạn được mã hóa an toàn ở mức độ cao nhất và không được lưu trữ trên máy chủ của FileFlow.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Invoices & History */}
                <div className="xl:col-span-2">
                    <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm h-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="w-6 h-6 text-foreground/70" /> Lịch sử thanh toán
                            </h3>
                            <button className="flex items-center gap-2 text-sm font-bold bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-xl transition-colors cursor-pointer border border-border">
                                <Download className="w-4 h-4" /> Tải tất cả PDF
                            </button>
                        </div>

                        <div className="overflow-x-auto pb-4">
                            <table className="w-full min-w-[600px] text-left">
                                <thead>
                                    <tr className="border-b border-border/50 text-muted-foreground text-sm">
                                        <th className="font-semibold pb-4 pl-4">Hóa đơn</th>
                                        <th className="font-semibold pb-4">Ngày giao dịch</th>
                                        <th className="font-semibold pb-4">Số tiền</th>
                                        <th className="font-semibold pb-4">Trạng thái</th>
                                        <th className="font-semibold pb-4 text-right pr-4">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {[
                                        { id: "INV-2024-04", date: "24 Th04, 2024", amount: "$9.99", status: "Thành công", statusColor: "text-emerald-500", statusBg: "bg-emerald-500/10", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                                        { id: "INV-2024-03", date: "24 Th03, 2024", amount: "$9.99", status: "Thành công", statusColor: "text-emerald-500", statusBg: "bg-emerald-500/10", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                                        { id: "INV-2024-02", date: "24 Th02, 2024", amount: "$9.99", status: "Thành công", statusColor: "text-emerald-500", statusBg: "bg-emerald-500/10", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                                        { id: "INV-2023-12-UP", date: "15 Th12, 2023", amount: "$49.99", status: "Nâng cấp Gói", statusColor: "text-zinc-900 dark:text-zinc-100", statusBg: "bg-zinc-500/10", icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
                                    ].map((invoice) => (
                                        <tr key={invoice.id} className="group hover:bg-muted/30 transition-colors">
                                            <td className="py-5 pl-4">
                                                <div className="font-bold text-foreground flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-muted-foreground" /> {invoice.id}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1 font-mono">FileFlow Pro - Hàng tháng</div>
                                            </td>
                                            <td className="py-5">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                                    <CalendarDays className="w-4 h-4" /> {invoice.date}
                                                </div>
                                            </td>
                                            <td className="py-5 font-bold font-mono">
                                                {invoice.amount}
                                            </td>
                                            <td className="py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${invoice.statusBg} ${invoice.statusColor} rounded-md text-xs font-bold border border-current/10`}>
                                                    {invoice.icon} {invoice.status}
                                                </span>
                                            </td>
                                            <td className="py-5 pr-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 text-muted-foreground hover:text-primary bg-background border border-border shadow-sm rounded-lg transition-colors cursor-pointer tooltip-trigger" title="Chi tiết">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-muted-foreground hover:text-emerald-500 bg-background border border-border shadow-sm rounded-lg transition-colors cursor-pointer tooltip-trigger" title="Tải PDF">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
                            <p>Đang hiển thị <span className="font-bold text-foreground">4</span> hóa đơn gần nhất.</p>
                            <button className="font-bold text-primary hover:underline cursor-pointer">Tải thêm lịch sử cũ hơn</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
