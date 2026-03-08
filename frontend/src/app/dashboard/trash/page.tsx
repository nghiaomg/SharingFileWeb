import { Trash2, AlertCircle, RotateCcw, XCircle, FileText } from "lucide-react";

export default function TrashPage() {
    return (
        <div className="p-8 pb-32 h-full flex flex-col">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-4">
                <Trash2 className="w-8 h-8 text-rose-500" /> Thùng rác
            </h1>

            <div className="flex bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl mb-8 items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">
                    Các tệp và thư mục trong thùng rác sẽ bị tự động xóa hoàn toàn sau <span className="font-bold">30 ngày</span>.
                </p>
                <button className="ml-auto text-sm font-bold bg-background/50 hover:bg-background px-3 py-1.5 rounded-lg border border-rose-500/30 transition-colors">
                    Dọn sạch ngay
                </button>
            </div>

            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm flex-1 flex flex-col">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-muted/30 text-sm font-bold text-muted-foreground">
                    <div className="col-span-7 pl-4">Tên tệp</div>
                    <div className="col-span-3 text-right">Ngày xóa</div>
                    <div className="col-span-2 text-center">Hành động</div>
                </div>

                <div className="divide-y divide-border/50 flex-1">
                    {/* Example row */}
                    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/20 transition-colors group cursor-pointer opacity-80">
                        <div className="col-span-7 flex items-center gap-4 pl-4">
                            <div className="p-2.5 rounded-xl bg-background border border-border/50 shadow-sm text-muted-foreground grayscale">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className="font-semibold line-through decoration-muted-foreground truncate max-w-sm">Draft_Ghi_chu_cu.docx</span>
                        </div>
                        <div className="col-span-3 text-right text-sm text-muted-foreground">
                            Hôm qua, 11:20
                        </div>
                        <div className="col-span-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                            <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg border border-transparent hover:border-emerald-500/30 transition-colors tooltip-trigger" title="Khôi phục">
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/30 transition-colors tooltip-trigger" title="Xóa vĩnh viễn">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    {/* empty state simulation right below the single item */}
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-50 p-8">
                        <Trash2 className="w-12 h-12 mb-4 stroke-1" />
                        <p>Thùng rác trống</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
