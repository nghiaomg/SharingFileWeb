import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen w-full flex bg-background text-foreground overflow-hidden">
            {/* Sidebar Desktop */}
            <div className="hidden lg:block h-full">
                <DashboardSidebar />
            </div>

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
