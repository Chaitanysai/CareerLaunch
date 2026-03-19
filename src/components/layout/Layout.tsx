import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  user?: { name: string; email: string; avatar?: string } | null;
  onSignOut?: () => void;
  hideFooter?: boolean;
}

const Layout = ({ children, user, onSignOut, hideFooter = false }: LayoutProps) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar user={user} onSignOut={onSignOut} />
    <main className="flex-1">
      {children}
    </main>
    {!hideFooter && <Footer />}
  </div>
);

export default Layout;
