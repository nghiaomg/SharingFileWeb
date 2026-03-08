import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const metadata = {
    title: "Liên Hệ | FileFlow",
    description: "Đội ngũ FileFlow luôn sẵn sàng hỗ trợ bạn 24/7.",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <section className="flex-1 pt-32 pb-20 hero-gradient relative">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />

                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Kết nối với <span className="text-primary">FileFlow</span></h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Bạn có câu hỏi hoặc cần tư vấn về gói doanh nghiệp? Đừng ngần ngại liên hệ để nhận sự hỗ trợ tận tình từ các chuyên gia của chúng tôi.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-5 gap-12 bg-card border border-border rounded-3xl overflow-hidden glass shadow-2xl">
                        {/* Contact Info (Left) */}
                        <div className="md:col-span-2 bg-primary text-white p-10 flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Thông tin liên hệ</h3>
                                <p className="text-primary-foreground/80 mb-12">Chúng tôi sẽ tiếp nhận và phản hồi bạn trong thời gian sớm nhất.</p>

                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                            <Phone className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Điện thoại</p>
                                            <p className="text-white/80 mt-1">1900 1234 (Tổng đài 24/7)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                            <Mail className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Email & Hỗ trợ</p>
                                            <p className="text-white/80 mt-1">support@fileflow.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Trụ sở chính</p>
                                            <p className="text-white/80 mt-1">Tòa nhà FileFlow Tower, Quận 1, Tp. Hồ Chí Minh</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative graphic */}
                            <div className="mt-16 relative h-32 opacity-20 hidden md:block">
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/30 rounded-full blur-2xl"></div>
                            </div>
                        </div>

                        {/* Contact Form (Right) */}
                        <div className="md:col-span-3 p-10">
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Tên của bạn</label>
                                        <input type="text" placeholder="Nguyễn Văn A" className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Công ty / Tổ chức</label>
                                        <input type="text" placeholder="Tên doanh nghiệp" className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Địa chỉ Email</label>
                                    <input type="email" placeholder="email@congty.com" className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Mục đích liên hệ</label>
                                    <select className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none">
                                        <option>Đăng ký gói Doanh nghiệp (Enterprise)</option>
                                        <option>Hỗ trợ kỹ thuật / Báo lỗi</option>
                                        <option>Tích hợp API và Hệ thống</option>
                                        <option>Yêu cầu khác</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Nội dung chi tiết</label>
                                    <textarea rows={4} placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ về vấn đề gì..." className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"></textarea>
                                </div>

                                <button type="button" className="w-full py-4 bg-foreground text-background font-bold rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 group">
                                    Gửi yêu cầu
                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    )
}
