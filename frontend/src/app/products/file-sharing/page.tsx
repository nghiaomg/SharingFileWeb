import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Share2, Lock, FastForward, Globe } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Chia sẻ tệp | FileFlow",
    description: "Giải pháp chia sẻ tệp tin tức tốc và bảo mật mã hóa.",
};

const benefits = [
    { title: "Bảo mật liên kết", desc: "Giữ tệp tin tránh khỏi người lạ bằng mã PIN cá nhân cho mỗi liên kết và tự động mãn hạn chia sẻ." },
    { title: "Dung lượng vô hạn", desc: "Không quan tâm máy chủ, thoải mái kéo và thả bất kỳ khối lượng dữ liệu khổng lồ nào bạn cần." },
    { title: "Phân quyền chi tiết", desc: "Kiểm soát người có thể xem, chỉnh sửa hay tải tệp của bạn thông qua trung tâm quản lý." },
];

export default function FileSharingPage() {
    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <section className="pt-40 pb-24 text-center px-4 relative overflow-hidden hero-gradient">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse" />

                <div className="container mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6 tracking-wide uppercase">
                        <Share2 className="w-3 h-3 fill-primary" />
                        <span>Chia Sẻ Siêu Nhanh</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter max-w-4xl mx-auto leading-tight">
                        Chia sẻ bất kỳ lúc nào, <br /> ở <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">Bất cứ nơi đâu.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                        Từ hình ảnh gia đình cho tới hàng nghìn file dữ liệu của máy chủ, gửi và trao đổi tệp với mọi người chỉ trong vòng một nốt nhạc bằng Link Bảo Mật.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/login" className="px-8 py-4 bg-foreground text-background font-bold rounded-2xl hover:bg-foreground/90 transition-colors border border-foreground">
                            Dùng thử miễn phí
                        </Link>
                        <Link href="#how-it-works" className="px-8 py-4 bg-primary/10 text-primary font-bold rounded-2xl hover:bg-primary/20 transition-all border border-primary/20">
                            Xem cách hoạt động
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-card/30 relative" id="how-it-works">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative h-[500px] w-full bg-muted/50 rounded-3xl border border-border glass flex items-center justify-center p-8 overflow-hidden">
                            {/* Abstract UI representation of generating a share link */}
                            <div className="w-full max-w-sm glass border border-white/20 p-6 rounded-2xl bg-card">
                                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                                    <div className="w-12 h-12 bg-sky-500/10 text-sky-500 rounded-xl flex items-center justify-center">
                                        <FastForward className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Project_Media.zip</h4>
                                        <p className="text-sm text-muted-foreground text-emerald-500 font-medium">Đã tải lên xong (2.4 GB)</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
                                        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <select className="bg-transparent border-none text-sm font-medium w-full focus:outline-none">
                                            <option>Bất kỳ ai có đường liên kết</option>
                                            <option>Chỉ nhóm nội bộ</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
                                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <input type="password" placeholder="Thêm mã PIN bảo vệ..." disabled className="bg-transparent border-none text-sm w-full focus:outline-none placeholder:text-muted-foreground" />
                                    </div>

                                    <div className="flex items-center gap-0 bg-primary/10 border border-primary/30 p-1.5 rounded-xl">
                                        <div className="pl-3 truncate w-full text-sm text-primary font-medium">fileflow.io/share/v9x...</div>
                                        <button className="bg-primary text-white py-2 px-4 rounded-lg font-bold text-sm transition-colors hover:bg-primary/90 flex-shrink-0 border border-transparent">Copy</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold mb-10">Ba bước đơn giản, chia sẻ hoàn hảo.</h2>
                            <div className="space-y-10">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-xl">1</div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Tải tệp tin</h3>
                                        <p className="text-muted-foreground leading-relaxed">Chọn và đẩy bất kỳ tệp dữ liệu hoặc một Folder hoàn chỉnh từ máy tính của bạn vào bảng quản lý.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 font-bold text-xl">2</div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Thiết lập Quyền</h3>
                                        <p className="text-muted-foreground leading-relaxed">Tùy chọn tạo mật mã đặc biệt hay lên lịch tự động hủy liên kết (ví dụ: sau 48 giờ hoặc sau lần tải đầu) để đảm bảo an toàn 100%.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-xl">3</div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Gửi & Chia Sẻ</h3>
                                        <p className="text-muted-foreground leading-relaxed">Nhận liên kết nhanh chỉ với 1 click và sẵn sàng gửi nó qua Slack, Zalo, hay Email công ty ngay tức khắc.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Mọi thứ bạn cần cho công việc</h2>
                        <p className="text-muted-foreground">Các tính năng cao cấp không thỏa hiệp dành riêng cho việc phân phối nội dung của bạn.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {benefits.map((i, idx) => (
                            <div key={idx} className="p-8 border border-border rounded-3xl bg-card hover:bg-card/50 transition-colors">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                    <Lock className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-bold text-xl mb-3">{i.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{i.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
