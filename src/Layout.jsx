import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { LayoutDashboard, Droplets, ShoppingBag, BookOpen, Leaf, BarChart3 } from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Summary", icon: BarChart3, page: "Summary" },
  { name: "Nutrients", icon: Droplets, page: "Nutrients" },
  { name: "Shop", icon: ShoppingBag, page: "Store" },
  { name: "Learn", icon: BookOpen, page: "Learn" },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <style>{`
        :root {
          --background: 0 0% 4%;
          --foreground: 0 0% 95%;
        }
        body { background: #09090b; }
      `}</style>

      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold tracking-tight text-lg hidden sm:block">Dank Blossom Grow Journal</span>
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}