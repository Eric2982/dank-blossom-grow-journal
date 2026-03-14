import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './Layout';

// Page imports
import Dashboard from './pages/Dashboard.jsx?raw';
import Summary from './pages/Summary';
import Chat from './pages/Chat';
import Store from './pages/Store';
import Learn from './pages/Learn';
import Premium from './pages/Premium';
import Challenges from './pages/Challenges';
import Community from './pages/Community';
import Settings from './pages/Settings';
import StrainDetail from './pages/StrainDetail';
import Nutrients from './pages/Nutrients';

const LayoutWrapper = ({ children, currentPageName }) => (
  <Layout currentPageName={currentPageName}>{children}</Layout>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Dashboard" replace />} />
      <Route path="/Dashboard" element={<LayoutWrapper currentPageName="Dashboard"><Dashboard /></LayoutWrapper>} />
      <Route path="/Summary" element={<LayoutWrapper currentPageName="Summary"><Summary /></LayoutWrapper>} />
      <Route path="/Chat" element={<LayoutWrapper currentPageName="Chat"><Chat /></LayoutWrapper>} />
      <Route path="/Store" element={<LayoutWrapper currentPageName="Store"><Store /></LayoutWrapper>} />
      <Route path="/Learn" element={<LayoutWrapper currentPageName="Learn"><Learn /></LayoutWrapper>} />
      <Route path="/Premium" element={<LayoutWrapper currentPageName="Premium"><Premium /></LayoutWrapper>} />
      <Route path="/Challenges" element={<LayoutWrapper currentPageName="Challenges"><Challenges /></LayoutWrapper>} />
      <Route path="/Community" element={<LayoutWrapper currentPageName="Community"><Community /></LayoutWrapper>} />
      <Route path="/Settings" element={<LayoutWrapper currentPageName="Settings"><Settings /></LayoutWrapper>} />
      <Route path="/StrainDetail" element={<LayoutWrapper currentPageName="StrainDetail"><StrainDetail /></LayoutWrapper>} />
      <Route path="/Nutrients" element={<LayoutWrapper currentPageName="Nutrients"><Nutrients /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;