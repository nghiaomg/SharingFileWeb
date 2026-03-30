import Link from "next/link";
import { FileUp, ArrowLeft, Lock, Folder, FileText, Image as ImageIcon, ShieldCheck, UploadCloud } from "lucide-react";

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
    return (
        <main className="min-h-screen grid lg:grid-cols-2 bg-background">
            {/* Left Side: Form Container */}
            <div className="flex flex-col items-center justify-center p-8 lg:p-16 relative">
                {/* Back button */}
                <Link href="/" className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Trở về trang chủ
                </Link>

                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center transition-transform duration-300 border border-primary/30">
                                <FileUp className="text-white w-7 h-7" />
                            </div>
                            <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                FileFlow
                            </span>
                        </Link>
                        <h1 className="text-3xl font-extrabold mb-3">{title}</h1>
                        <p className="text-muted-foreground">{subtitle}</p>
                    </div>

                    {children}

                </div>
            </div>

            {/* Right Side: Image/Branding Showcase */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-muted/30 border-l border-border p-12 relative overflow-hidden hero-gradient">
                <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-zinc-500/10 rounded-full blur-[100px] -z-10" />

                <div className="max-w-xl text-center z-10 w-full">
                    <h2 className="text-3xl font-bold mb-6 text-foreground/80">Quản lý tệp tin an toàn chưa bao giờ dễ dàng như thế.</h2>
                    <p className="text-lg text-muted-foreground mb-12">
                        Tham gia ngay hôm nay để nhận 1GB lưu trữ miễn phí, hoặc nâng cấp lên gói cao cấp cho doanh nghiệp. Hỗ trợ đầy đủ các định dạng, chia sẻ nhanh bằng liên kết hoặc mã PIN an toàn.
                    </p>

                    {/* Detailed UI Mockup */}
                    <div className="relative w-full h-[380px] mt-8">
                        {/* Main App Window */}
                        <div className="absolute inset-x-4 bottom-0 top-12 rounded-t-2xl border border-white/10 glass bg-card/60 backdrop-blur-2xl overflow-hidden flex flex-col">
                            {/* Window Header */}
                            <div className="h-10 border-b border-border/50 flex items-center px-4 bg-muted/30 relative">
                                <div className="flex gap-2 absolute left-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-600/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-yellow-600/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600/20" />
                                </div>
                                <div className="mx-auto flex items-center gap-2 bg-background/50 px-3 py-1 rounded-md text-[10px] text-muted-foreground border border-border">
                                    <Lock className="w-3 h-3" /> fileflow-dashboard.app
                                </div>
                            </div>

                            {/* App Body */}
                            <div className="flex flex-1">
                                {/* Sidebar */}
                                <div className="w-1/3 border-r border-border/50 p-4 space-y-3 bg-card/30">
                                    <div className="h-2 w-1/2 bg-muted-foreground/30 rounded-full mb-6" />
                                    <div className="flex items-center gap-2 text-primary bg-primary/10 p-2 rounded-lg">
                                        <Folder className="w-4 h-4" />
                                        <div className="h-2 w-2/3 bg-primary/40 rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground">
                                        <FileText className="w-4 h-4" />
                                        <div className="h-2 w-1/2 bg-muted-foreground/20 rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground">
                                        <UploadCloud className="w-4 h-4" />
                                        <div className="h-2 w-2/3 bg-muted-foreground/20 rounded-full" />
                                    </div>
                                </div>
                                {/* Main Content */}
                                <div className="w-2/3 p-5">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="h-3 w-1/3 bg-foreground/20 rounded-full" />
                                        <div className="h-6 w-16 bg-primary/20 rounded-full" />
                                    </div>
                                    {/* Files */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 border border-border/50 rounded-xl bg-background/50 flex flex-col gap-2 group hover:bg-white/10 transition-colors">
                                            <div className="p-2 bg-sky-500/10 rounded-lg w-fit">
                                                <ImageIcon className="w-5 h-5 text-sky-500" />
                                            </div>
                                            <div className="h-2 w-full bg-foreground/30 rounded-full mt-1" />
                                            <div className="h-1.5 w-1/2 bg-muted-foreground/30 rounded-full" />
                                        </div>
                                        <div className="p-3 border border-border/50 rounded-xl bg-background/50 flex flex-col gap-2">
                                            <div className="p-2 bg-zinc-500/10 rounded-lg w-fit">
                                                <FileText className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                                            </div>
                                            <div className="h-2 w-full bg-foreground/30 rounded-full mt-1" />
                                            <div className="h-1.5 w-1/2 bg-muted-foreground/30 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Cards conveying 'Security' and 'Progress' */}
                        <div className="absolute top-2 right-0 w-48 p-3 rounded-2xl glass border border-white/20 bg-card/80 backdrop-blur-xl animate-float" style={{ animationDelay: '1s' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-foreground">Mã hóa tin cậy</div>
                                    <div className="text-[10px] text-muted-foreground">Bảo vệ mọi dữ liệu</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-16 -left-4 w-56 p-4 rounded-2xl glass border border-white/20 bg-card/80 backdrop-blur-xl animate-float" style={{ animationDelay: '2.5s' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                                    <UploadCloud className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-foreground">Đang tải báo cáo...</div>
                                    <div className="text-[10px] font-mono text-muted-foreground">42.5 MB / 50.0 MB</div>
                                </div>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="w-[85%] h-full bg-gradient-to-r from-primary to-zinc-500 rounded-full relative">
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
