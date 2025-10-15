import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, User } from "lucide-react";
import logoKotamobagu from "@assets/logo-kotamobagu.png";
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
    <header className="sticky top-0 z-50 border-b bg-gradient-to-r from-card to-warm-50/30 shadow-md backdrop-blur-sm">
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
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent leading-tight">
              PECEL DUKCAPIL
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-tight">
              Pelacakan Cepat Layanan Dukcapil
            </p>
            <p className="text-[10px] md:text-xs text-warm-700 font-semibold leading-tight mt-0.5">
              Kota Kotamobagu
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-warm-200">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{userName}</span>
              <Badge variant="outline" className="ml-1 bg-primary/10 border-primary text-primary" data-testid="badge-user-role">
                {roleLabels[userRole]}
              </Badge>
            </div>
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
              className="rounded-full shadow-md h-11 px-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600"
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
