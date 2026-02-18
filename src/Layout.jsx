import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { LayoutDashboard, ShoppingBag, BookOpen, Leaf, BarChart3, MessageSquare, Crown, ArrowLeft, Settings } from "lucide-react";

const rootPages = ["Dashboard", "Summary", "Chat", "Store", "Learn", "Premium"];

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Summary", icon: BarChart3, page: "Summary" },
  { name: "Chat", icon: MessageSquare, page: "Chat" },
  { name: "Shop", icon: ShoppingBag, page: "Store" },
  { name: "Learn", icon: BookOpen, page: "Learn" },
  { name: "Premium", icon: Crown, page: "Premium" },
];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRootPage = rootPages.includes(currentPageName);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 md:pb-0">
      <style>{`
        :root {
          --background: 0 0% 4%;
          --foreground: 0 0% 95%;
        }
        
        @media (prefers-color-scheme: dark) {
          :root {
            --background: 0 0% 4%;
            --foreground: 0 0% 95%;
          }
        }
        
        @media (prefers-color-scheme: light) {
          :root {
            --background: 0 0% 98%;
            --foreground: 0 0% 10%;
          }
          body { background: #fafafa !important; }
        }
        
        body { 
          background: #09090b;
          overscroll-behavior-y: none;
          -webkit-overflow-scrolling: touch;
        }
        
        button, .nav-item, svg, [role="button"] {
          user-select: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {!isRootPage ? (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors select-none min-w-[44px] min-h-[44px] -ml-2 justify-center md:justify-start"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden md:inline">Back</span>
              </button>
            ) : (
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2.5 select-none">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold tracking-tight text-lg hidden sm:block">Dank Blossom</span>
              </Link>
            )}
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`nav-item flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-w-[44px] min-h-[44px] ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Link
                to={createPageUrl("Settings")}
                className="nav-item flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-w-[44px] min-h-[44px] text-white/40 hover:text-white/70 hover:bg-white/5"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 gap-1 px-2 pt-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = currentPageName === item.page;
            const Icon = item.icon;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`nav-item flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors min-h-[56px] ${
                  isActive ? "text-emerald-500" : "text-white/40"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}