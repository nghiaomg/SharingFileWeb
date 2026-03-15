import React from "react";
import { CheckCircle2, Zap } from "lucide-react";
import { upgradePlan } from "@/features/auth/api";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/features/auth/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/queries";

export default function UpgradePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  const isPro = user?.subscriptionPlan === "PRO";

  const upgradeMutation = useMutation({
    mutationFn: upgradePlan,
    onSuccess: () => {
      alert("Nâng cấp thành công! Chào mừng bạn đến với FileFlow Pro.");
      // Force reload để cập nhật user claims từ cookies via getMe()
      queryClient.invalidateQueries({ queryKey: authKeys.all() });
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      alert("Có lỗi xảy ra khi nâng cấp: " + error.message);
    }
  });

  const handleUpgrade = () => {
    if (confirm("Chấp nhận thanh toán 99.000đ/tháng để nâng cấp lên PRO?")) {
      upgradeMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      <div className="container mx-auto px-4 max-w-5xl flex-1 flex flex-col justify-center py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900">Chọn Gói Lưu Trữ Phù Hợp Với Bạn</h1>
          <p className="text-xl text-gray-600">Nâng cấp không gian lưu trữ và mở khoá nhiều tính năng cao cấp.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gói Cơ Bản */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col transition-all hover:shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Gói Cơ Bản</h2>
            <p className="text-gray-500 mb-6 font-medium">Bắt đầu miễn phí mãi mãi</p>
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-extrabold text-gray-900">0đ</span>
              <span className="text-gray-500 ml-2">/tháng</span>
            </div>
            
            <ul className="mb-8 space-y-4 flex-1 text-gray-700">
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3" />
                Dung lượng lưu trữ 5.0 GB
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3" />
                Tải lên tối đa 100MB / tệp
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3" />
                Sử dụng tính năng cơ bản
              </li>
            </ul>

            <button 
              className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${!isPro ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white border-2 border-primary text-primary hover:bg-primary/5"}`}
              disabled={!isPro}
              onClick={() => router.push("/dashboard")}
            >
              {!isPro ? "Gói hiện tại" : "Chuyển về gói này"}
            </button>
          </div>

          {/* Gói Pro */}
          <div className="bg-primary relative rounded-3xl p-8 shadow-xl text-white flex flex-col transform md:-translate-y-4 transition-transform hover:scale-[1.02]">
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center">
              <Zap className="w-3 h-3 mr-1" /> PHỔ BIẾN NHẤT
            </div>
            <h2 className="text-2xl font-bold mb-2">FileFlow Pro</h2>
            <p className="text-primary-foreground/80 mb-6 font-medium">Lưu trữ không giới hạn cho mọi nhu cầu</p>
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-extrabold">99.000đ</span>
              <span className="text-primary-foreground/80 ml-2">/tháng</span>
            </div>
            
            <ul className="mb-8 space-y-4 flex-1 text-primary-foreground/90">
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-amber-400 mr-3" />
                <span className="font-semibold">Lưu trữ 2.0 TB (2,000 GB)</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-amber-400 mr-3" />
                Không giới hạn kích thước tệp tải lên
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-amber-400 mr-3" />
                Băng thông tải không giới hạn
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-amber-400 mr-3" />
                Mã hóa bảo vệ tệp cao cấp (AES-256)
              </li>
            </ul>

            <button 
               className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-colors ${isPro ? "bg-white/20 cursor-not-allowed" : "bg-white text-primary hover:bg-gray-50"}`}
               disabled={isPro || upgradeMutation.isPending}
               onClick={handleUpgrade}
            >
              {upgradeMutation.isPending ? "Đang xử lý..." : isPro ? "Đang sử dụng" : "Nâng cấp ngay"}
            </button>
            <p className="text-center text-xs mt-4 opacity-75">Hủy bỏ bất cứ lúc nào. Không ràng buộc.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
