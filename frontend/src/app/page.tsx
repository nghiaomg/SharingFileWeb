import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero, FeatureSection, Pricing } from "@/features/landing-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FileFlow - Chia sẻ & Cập nhật tệp tin dễ dàng",
  description: "Giải pháp lưu trữ và chia sẻ tệp tin hiện đại với quản lý phiên bản và bảo mật cao.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FeatureSection />
      <div className="py-24 px-4 container mx-auto text-center border-y border-border/50 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Sẵn sàng để bắt đầu chưa?</h3>
        <p className="text-muted-foreground mb-10 max-w-xl mx-auto">Tham gia cùng hàng nghìn người dùng đang tin dùng FileFlow để chia sẻ dữ liệu mỗi ngày.</p>
        <button className="px-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 text-lg transition-transform hover:scale-105 shadow-xl shadow-primary/20">
          Đăng ký miễn phí ngay
        </button>
      </div>
      <Pricing />
      <Footer />
    </main>
  );
}
