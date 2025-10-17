import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, User, BarChart3 } from "lucide-react";
import logoKotamobagu from "@assets/logo-kotamobagu_1760671555998.png";
import { Link } from "wouter";

interface HeaderProps {
  userRole?: 'public' | 'cs' | 'operator' | 'superadmin';
  userName?: string;
  onLogin?: () => void;
  onLogout?: () => void;
}

const roleLabels = {
  public: 'Pengunjung',
  cs: 'CS',
  operator: 'Operator',
  superadmin: 'Super Admin',
};

export default function Header({ userRole = 'public', userName, onLogin, onLogout }: HeaderProps) {
  const isLoggedIn = userRole !== 'public';

  return (
    <header className="sticky top-0 z-50 border-b bg-card shadow-md backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 md:gap-4 cursor-pointer hover-elevate transition-all rounded-xl px-2 py-1 -ml-2" data-testid="link-home">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-md"></div>
            <img 
              src={logoKotamobagu} 
              alt="Logo Kotamobagu" 
              className="relative w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-lg"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-2xl font-bold text-primary leading-tight">
              PECEL DUKCAPIL
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-tight">
              Pelacakan Cepat Layanan Dukcapil
            </p>
            <p className="text-[10px] md:text-xs text-primary font-semibold leading-tight mt-0.5">
              Kota Kotamobagu
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{userName}</span>
              <Badge variant="outline" className="ml-1 bg-primary/10 border-primary text-primary" data-testid="badge-user-role">
                {roleLabels[userRole]}
              </Badge>
            </div>
          )}
          
          {isLoggedIn && (
            <Link href="/analytics">
              <Button 
                variant="default" 
                className="rounded-full shadow-md h-11 px-4 md:px-6"
                data-testid="button-analytics"
              >
                <BarChart3 className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Analytics</span>
              </Button>
            </Link>
          )}
          
          {isLoggedIn ? (
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="rounded-full h-11 px-4 bg-white/80 backdrop-blur-sm hover:bg-white"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Keluar</span>
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={onLogin}
              className="rounded-full shadow-md h-11 px-6"
              data-testid="button-login"
            >
              <LogIn className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Masuk</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
