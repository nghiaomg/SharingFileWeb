import { Clock, FileText, ImageIcon, MoreVertical, Calendar, Download } from "lucide-react";

export default function RecentFilesPage() {
    const recentEvents = [
        {
            label: "Hôm nay", items: [
                { name: "Ban_ke_hoach_kinh_doanh_2024.pdf", time: "14:30", icon: FileText, color: "text-blue-500", action: "Đã tải lên" },
                { name: "Meeting_Notes.docx", time: "09:15", icon: FileText, color: "text-blue-500", action: "Xem" }
            ]
        },
        {
            label: "Hôm qua", items: [
                { name: "Logo_FileFlow_Final.png", time: "16:42", icon: ImageIcon, color: "text-emerald-500", action: "Đã tải lên" },
            ]
        },
        {
            label: "Tuần trước", items: [
                { name: "Project_Proposal.pdf", time: "T3 10:00", icon: FileText, color: "text-blue-500", action: "Chỉnh sửa" },
                { name: "UI_Mocks_v2.zip", time: "T2 14:20", icon: Clock, color: "text-amber-500", action: "Đã tải xuống" }
            ]
        }
    ];

    return (
        <div className="p-8 pb-32">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary" /> Gần đây
            </h1>

            <div className="space-y-12">
                {recentEvents.map((group, i) => (
                    <div key={i} className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-sm font-bold bg-secondary px-4 py-1.5 rounded-full border border-border">{group.label}</span>
                            <div className="h-px flex-1 bg-border/50"></div>
                        </div>

                        <div className="grid gap-4">
                            {group.items.map((item, j) => (
                                <div key={j} className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-2xl hover:bg-muted/30 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center ${item.color}`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base truncate max-w-sm sm:max-w-md">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                                                <span>{item.time}</span> • {item.action === "Đã tải xuống" ? <Download className="w-3 h-3 text-emerald-500" /> : null}  {item.action}
                                            </p>
                                        </div>
                                    </div>

                                    <button className="p-2 text-muted-foreground hover:bg-background rounded-lg hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
