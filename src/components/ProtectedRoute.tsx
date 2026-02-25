import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canViewModule, type Module } from "@/lib/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredModule?: Module;
}

const ProtectedRoute = ({ children, requiredRole, requiredModule }: ProtectedRouteProps) => {
  const { user, loading, hasRole, isAdmin, isSuperAdmin, roles } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Check module-level access
  if (requiredModule && !canViewModule(roles, requiredModule)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">অ্যাক্সেস অস্বীকৃত</h1>
          <p className="text-muted-foreground">এই মডিউলে প্রবেশের অনুমতি নেই।</p>
          <a href="/admin" className="text-primary hover:underline">ড্যাশবোর্ডে ফিরুন</a>
        </div>
      </div>
    );
  }

  // Legacy role check
  if (requiredRole) {
    const allowed =
      requiredRole === "super_admin" ? isSuperAdmin :
      requiredRole === "admin" ? isAdmin :
      hasRole(requiredRole);
    if (!allowed) return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">অ্যাক্সেস অস্বীকৃত</h1>
          <p className="text-muted-foreground">এই পৃষ্ঠায় প্রবেশের অনুমতি নেই।</p>
          <a href="/" className="text-primary hover:underline">হোমপেজে ফিরুন</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
