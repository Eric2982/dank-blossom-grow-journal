import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { LayoutDashboard, ShoppingBag, BookOpen, Leaf, BarChart3, MessageSquare, Crown, ArrowLeft, Settings, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const rootPages = ["Dashboard", "Summary", "Chat", "Store", "Learn", "Premium", "Challenges"];

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Summary", icon: BarChart3, page: "Summary" },
  { name: "Challenges", icon: Trophy, page: "Challenges" },
  { name: "Chat", icon: MessageSquare, page: "Chat" },
  { name: "Shop", icon: ShoppingBag, page: "Store" },
  { name: "Learn", icon: BookOpen, page: "Learn" },
  { name: "Premium", icon: Crown, page: "Premium" },
];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRootPage = rootPages.includes(currentPageName);
  const [pageCache, setPageCache] = React.useState({});
  const [renderedPages, setRenderedPages] = React.useState(new Set());

  // Cache page content and track rendered pages
  React.useEffect(() => {
    if (isRootPage && children) {
      setPageCache(prev => ({ ...prev, [currentPageName]: children }));
      setRenderedPages(prev => new Set([...prev, currentPageName]));
    }
  }, [currentPageName, children, isRootPage]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 md:pb-0 relative overflow-hidden">
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
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 25%, #d1fae5 50%, #a7f3d0 100%);
          overscroll-behavior-y: none;
          -webkit-overflow-scrolling: touch;
        }

        .app-background {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 25%, #d1fae5 50%, #a7f3d0 100%);
          opacity: 0.95;
        }

        .app-background::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.06) 0%, transparent 50%);
        }

        .cannabis-plant-bg {
          position: absolute;
          bottom: -10%;
          right: -5%;
          width: 50%;
          height: 60%;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Cpath d='M100 280 L100 100 M100 120 Q80 130 70 140 Q60 150 60 165 Q60 180 70 185 Q80 190 90 185 M100 120 Q120 130 130 140 Q140 150 140 165 Q140 180 130 185 Q120 190 110 185 M100 140 Q85 145 75 155 Q65 165 65 180 Q65 195 75 200 Q85 205 95 200 M100 140 Q115 145 125 155 Q135 165 135 180 Q135 195 125 200 Q115 205 105 200 M100 160 Q90 163 82 170 Q74 177 74 188 Q74 199 82 204 Q90 209 98 206 M100 160 Q110 163 118 170 Q126 177 126 188 Q126 199 118 204 Q110 209 102 206 M100 180 Q93 182 88 187 Q83 192 83 200 Q83 208 88 212 Q93 216 99 214 M100 180 Q107 182 112 187 Q117 192 117 200 Q117 208 112 212 Q107 216 101 214' fill='none' stroke='%2310b981' stroke-width='2' stroke-linecap='round'/%3E%3Cellipse cx='100' cy='100' rx='25' ry='15' fill='%2310b981' opacity='0.3'/%3E%3Cellipse cx='100' cy='105' rx='20' ry='12' fill='%2310b981' opacity='0.4'/%3E%3Cellipse cx='100' cy='110' rx='15' ry='10' fill='%2310b981' opacity='0.5'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-size: contain;
          background-position: bottom right;
          pointer-events: none;
        }

        .content-wrapper {
          position: relative;
          z-index: 1;
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

      {/* Background layers */}
      <div className="app-background">
        <div className="cannabis-plant-bg" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-100/20 bg-white/70 backdrop-blur-xl content-wrapper" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {!isRootPage ? (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-emerald-700/70 hover:text-emerald-900 transition-colors select-none min-w-[44px] min-h-[44px] -ml-2 justify-center md:justify-start"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden md:inline">Back</span>
              </button>
            ) : (
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2.5 select-none">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="text-emerald-900 font-semibold tracking-tight text-lg hidden sm:block">Dank Blossom</span>
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
                        ? "bg-emerald-600 text-white"
                        : "text-emerald-700/60 hover:text-emerald-900 hover:bg-emerald-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Link
                to={createPageUrl("Settings")}
                className="nav-item flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-w-[44px] min-h-[44px] text-emerald-700/60 hover:text-emerald-900 hover:bg-emerald-50"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Content with state preservation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8 content-wrapper">
        {isRootPage ? (
          <>
            {/* Render all cached root pages, show only the active one */}
            {rootPages.map(pageName => (
              <motion.div
                key={pageName}
                className={currentPageName === pageName ? '' : 'hidden'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {renderedPages.has(pageName) && (pageName === currentPageName ? children : pageCache[pageName])}
              </motion.div>
            ))}
          </>
        ) : (
          <motion.div
            key={currentPageName}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-emerald-100/20 bg-white/70 backdrop-blur-xl content-wrapper"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 gap-1 px-2 pt-2">
          {[navItems[0], navItems[1], navItems[2], navItems[3], navItems[5]].map((item) => {
            const isActive = currentPageName === item.page;
            const Icon = item.icon;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`nav-item flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors min-h-[56px] ${
                  isActive ? "text-emerald-600" : "text-emerald-700/50"
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