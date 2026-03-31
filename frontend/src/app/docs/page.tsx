import { Navbar } from "@/components/layout/Navbar";
import {
  Book,
  Code,
  Terminal,
  Zap,
  Shield,
  Search,
  ArrowRight,
  Server,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Tài liệu | FileFlow",
  description: "Hướng dẫn tích hợp và sử dụng API của FileFlow.",
};

const guideCategories = [
  {
    title: "Bắt đầu nhanh",
    icon: Zap,
    desc: "Cài đặt SDK và hoàn thành lệnh tải lên đầu tiên.",
  },
  {
    title: "Xác thực & Bảo mật",
    icon: Shield,
    desc: "Quản lý API Key, JWT và giới hạn băng thông.",
  },
  {
    title: "Quản lý File",
    icon: Book,
    desc: "Upload, download, stream và quản lý version history.",
  },
  {
    title: "API Reference",
    icon: Code,
    desc: "Tra cứu toàn bộ REST API endpoint và thông số.",
  },
  {
    title: "Tích hợp Server",
    icon: Server,
    desc: "Hướng dẫn cho Node.js, Python, Go và PHP.",
  },
  {
    title: "CLI & Tools",
    icon: Terminal,
    desc: "Sử dụng FileFlow CLI từ terminal của bạn.",
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col pt-16">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:flex w-72 bg-muted/20 border-r border-border flex-col overflow-y-auto">
          <div className="p-6 pb-2">
            <div className="relative text-sm text-foreground">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                className="w-full bg-background border border-border pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="p-4 flex-1">
            <nav className="space-y-6 text-sm">
              <div>
                <h4 className="font-semibold text-foreground px-2 mb-2">
                  Getting Started
                </h4>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="#"
                      className="block px-2 py-1.5 text-primary bg-primary/10 rounded-md font-medium"
                    >
                      Giới thiệu FileFlow
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block px-2 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      Cài đặt SDK
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block px-2 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      Hello, World!
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground px-2 mb-2">
                  Core Concepts
                </h4>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="#"
                      className="block px-2 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      Buckets & Folders
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block px-2 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      Mã hóa đầu cuối (E2EE)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block px-2 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      Quản lý Version
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block px-2 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      Chia sẻ bằng File Link
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground px-2 mb-2">
                  API Reference
                </h4>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="#"
                      className="block px-2 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      Authentication
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block px-2 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      Upload API
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block px-2 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      Download API
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block px-2 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      Webhooks
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 overflow-y-auto w-full relative">
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-primary/5 rounded-full blur-[100px] -z-10" />
          <div className="max-w-4xl mx-auto p-8 lg:p-16">
            <div className="mb-12">
              <h1 className="text-4xl font-extrabold mb-4">
                Giới thiệu FileFlow
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Tài liệu toàn tập dành cho lập trình viên. Hướng dẫn tích hợp hệ
                thống lưu trữ FileFlow vào ứng dụng của bạn một cách nhanh
                chóng, an toàn và tối ưu tài nguyên mạng.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {guideCategories.map((cat, i) => (
                <Link
                  key={i}
                  href="#"
                  className="p-6 rounded-2xl glass border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary transition-all">
                    <cat.icon className="w-5 h-5 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{cat.desc}</p>
                </Link>
              ))}
            </div>

            {/* Code snippet example */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                Tải lên tệp một cách siêu tốc
              </h2>
              <p className="mb-6 text-foreground/80">
                Cài đặt SDK môi trường Node.js và thực hiện lệnh tải truyền dữ
                liệu lên FileFlow Bucket chỉ trong 3 dòng lệnh.
              </p>

              <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 glass bg-[#0d1117] relative">
                <div className="flex items-center px-4 py-3 border-b border-white/10 bg-black/40">
                  <div className="flex gap-2 mr-4 text-muted-foreground">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    upload.js
                  </span>
                </div>
                <div className="p-6 overflow-x-auto text-sm font-mono leading-loose">
                  <span className="text-pink-400">import</span> {"{"}{" "}
                  <span className="text-sky-300">FileFlow</span> {"}"}{" "}
                  <span className="text-pink-400">from</span>{" "}
                  <span className="text-amber-300">
                    &apos;@fileflow/sdk&apos;
                  </span>
                  ;<br />
                  <br />
                  <span className="text-pink-400">const</span> client ={" "}
                  <span className="text-pink-400">new</span>{" "}
                  <span className="text-sky-300">FileFlow</span>({"{"} API_KEY:
                  process.env.FILEFLOW_KEY {"}"});
                  <br />
                  <br />
                  <span className="text-slate-400">
                    {"// Automatically encrypts locally before uploading"}
                  </span>
                  <br />
                  <span className="text-pink-400">const</span> result ={" "}
                  <span className="text-pink-400">await</span> client.upload(
                  <span className="text-amber-300">
                    &apos;./financial_report.pdf&apos;
                  </span>
                  , {"{"}
                  <br />
                  &nbsp;&nbsp;bucket:{" "}
                  <span className="text-amber-300">&apos;Q3_2024&apos;</span>,
                  <br />
                  &nbsp;&nbsp;options: {"{"} versioning:{" "}
                  <span className="text-zinc-900 dark:text-zinc-100">true</span>{" "}
                  {"}"}
                  <br />
                  {"}"});
                  <br />
                  <br />
                  console.<span className="text-sky-200">log</span>(
                  <span className="text-amber-300">
                    `Secure URI: <span className="text-sky-200">{"${"}</span>
                    result.secureUrl<span className="text-sky-200">{"}"}</span>`
                  </span>
                  );
                </div>
                <button className="absolute right-4 bottom-4 p-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors">
                  Copy
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-8 border-t border-border mt-16">
              <span className="text-muted-foreground">
                Cập nhật lần cuối: Hôm nay
              </span>
              <Link
                href="#"
                className="flex items-center gap-2 text-primary font-bold group"
              >
                Bài tiếp theo: Cài đặt SDK
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </div>
      {/* The Docs layout isn't using Footer to act like an App shell, we can let it breathe or put it at the very bottom */}
    </main>
  );
}
