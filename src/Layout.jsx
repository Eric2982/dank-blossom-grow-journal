import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { LayoutDashboard, ShoppingBag, BookOpen, Leaf, BarChart3, MessageSquare, Crown, ArrowLeft, Settings, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const rootPages = ["Dashboard", "Summary", "Chat", "Store", "Learn", "Premium", "Challenges", "Community"];

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Challenges", icon: Trophy, page: "Challenges" },
  { name: "Community", icon: Users, page: "Community" },
  { name: "Chat", icon: MessageSquare, page: "Chat" },
  { name: "Shop", icon: ShoppingBag, page: "Store" },
];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRootPage = rootPages.includes(currentPageName);
  const [pageCache, setPageCache] = React.useState({});
  const [renderedPages, setRenderedPages] = React.useState(new Set());
  const [showAgeVerification, setShowAgeVerification] = React.useState(false);

  // Check age verification on mount
  React.useEffect(() => {
    const isVerified = localStorage.getItem('ageVerified');
    if (!isVerified) {
      setShowAgeVerification(true);
    }
  }, []);

  const handleAgeConfirm = () => {
    localStorage.setItem('ageVerified', 'true');
    setShowAgeVerification(false);
  };

  const handleAgeDeny = () => {
    window.location.href = 'https://www.google.com';
  };

  // Cache page content and track rendered pages
  React.useEffect(() => {
    if (isRootPage && children) {
      setPageCache(prev => ({ ...prev, [currentPageName]: children }));
      setRenderedPages(prev => new Set([...prev, currentPageName]));
    }
  }, [currentPageName, children, isRootPage]);

  return (
    <div className="min-h-screen bg-zinc-900 text-white pb-20 md:pb-0">
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
          background: #18181b;
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
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-900/80 backdrop-blur-xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
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
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6994e0c98fb6b9d1d4521dbd/4d3e591fc_IMG_1280.jpeg" alt="Dank Blossom" className="w-8 h-8 rounded-lg object-cover" />
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
                className={`nav-item flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-w-[44px] min-h-[44px] ${currentPageName === "Settings" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}
              >
                <Settings className="w-4 h-4" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Content with state preservation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-zinc-900/95 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 gap-1 px-2 pt-2">
          {[navItems[0], navItems[1], navItems[2], navItems[3], navItems[4]].map((item) => {
            const isActive = currentPageName === item.page;
            const Icon = item.icon;
            const handleNavClick = (e) => {
              if (isActive) {
                e.preventDefault();
                // Reset page state by navigating to root URL of the page
                window.history.pushState({}, "", createPageUrl(item.page));
                window.dispatchEvent(new PopStateEvent("popstate"));
              }
            };
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={handleNavClick}
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

      {/* Age Verification Dialog */}
      <AlertDialog open={showAgeVerification}>
        <AlertDialogContent className="bg-zinc-900 border-white/10 max-w-md">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-white" />
              </div>
            </div>
            <AlertDialogTitle className="text-white text-center text-2xl">Age Verification Required</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70 text-center text-base">
              You must be 21 years or older to access this website. This site contains information about cannabis cultivation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAgeDeny}
              variant="outline"
              className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              I am under 21
            </Button>
            <Button
              onClick={handleAgeConfirm}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              I am 21 or older
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
      );
      }