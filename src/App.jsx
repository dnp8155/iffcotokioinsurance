import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
// Add page imports here
import Invoices from '@/pages/Invoices';
import InvoiceForm from '@/pages/InvoiceForm';
import InvoiceView from '@/pages/InvoiceView';
import PublicInvoice from '@/pages/PublicInvoice';

const AuthenticatedApp = () => {
  const { isLoadingAuth, authChecked } = useAuth();
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith("/public/");

  // Public invoice route — accessible without login (for QR scanning)
  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/public/invoice/:id" element={<PublicInvoice />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    );
  }

  // Show loading spinner while checking auth
  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/new" element={<InvoiceForm />} />
        <Route path="/invoices/:id" element={<InvoiceView />} />
        <Route path="/invoices/:id/edit" element={<InvoiceForm />} />
        <Route path="/" element={<Invoices />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App