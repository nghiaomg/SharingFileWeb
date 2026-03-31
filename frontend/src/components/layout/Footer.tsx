"use client";

import Link from "next/link";
import { FileUp, Github, Twitter, Linkedin, Facebook } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-background border-t border-border pt-20 pb-10 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12 mb-20 px-4">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                                <FileUp className="text-primary-foreground w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold">FileFlow</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                            Nền tảng chia sẻ và quản lý tệp tin an toàn nhất cho cá nhân và doanh nghiệp.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-colors hover:text-primary"><Github className="w-5 h-5" /></Link>
                            <Link href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-colors hover:text-primary"><Twitter className="w-5 h-5" /></Link>
                            <Link href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-colors hover:text-primary"><Linkedin className="w-5 h-5" /></Link>
                            <Link href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-colors hover:text-primary"><Facebook className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Sản phẩm</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">Tính năng</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Quản lý phiên bản</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Bảo mật</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">API</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Công ty</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">Về chúng tôi</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Tuyển dụng</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Liên hệ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Pháp lý</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Chính sách Cookie</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 px-4">
                    <p className="text-sm text-muted-foreground text-center">
                        © 2024 FileFlow. Bản quyền thuộc về đội ngũ phát triển.
                    </p>
                    <div className="flex gap-8 text-sm text-muted-foreground">
                        <Link href="#" className="hover:text-foreground transition-colors">Vietnam (Tiếng Việt)</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">English (US)</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
