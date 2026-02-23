import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "super_admin" | "editor";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, hasRole, isAdmin, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

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
