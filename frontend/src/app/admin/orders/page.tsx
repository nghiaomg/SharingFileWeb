import { OrdersPage } from "@/features/orders";

export const metadata = {
    title: "Admin - Quản lý đơn hàng",
    description: "Duyệt và thống kê đơn hàng trong hệ thống",
};

export default function Page() {
    return <OrdersPage />;
}
