import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar } from "lucide-react";
import logoKotamobagu from "@assets/logo-kotamobagu.png";
import AutoScrollTable from "@/components/AutoScrollTable";
import type { Document } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userRole, setUserRole] = useState<string>('public');
  const [dateRange, setDateRange] = useState<string>('today');

  // Fetch documents from API
  const { data: documents = [], isLoading, isError } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Load user role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') || 'public';
    setUserRole(storedRole);
  }, []);

  // Calculate date range based on selection
  const getDateRangeDays = (range: string): number => {
    switch (range) {
      case 'today': return 0;
      case '2days': return 1;
      case '3days': return 2;
      case 'week': return 6;
      case '2weeks': return 13;
      case 'month': return 29;
      case 'all': return 9999;
      default: return 0;
    }
  };

  // Filter documents by date range and status
  const filterDocumentsByDateAndStatus = (docs: Document[], status: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return docs.filter(doc => {
      const docDate = new Date(doc.tanggal);
      docDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
      return doc.status === status && daysDiff <= getDateRangeDays(dateRange);
    });
  };

  // Memoized filtered documents by status
  const filteredSelesai = useMemo(() => 
    filterDocumentsByDateAndStatus(documents, 'SELESAI'), 
    [documents, dateRange]
  );
  
  const filteredDiproses = useMemo(() => 
    filterDocumentsByDateAndStatus(documents, 'DIPROSES'), 
    [documents, dateRange]
  );
  
  const filteredDitunda = useMemo(() => 
    filterDocumentsByDateAndStatus(documents, 'DITUNDA'), 
    [documents, dateRange]
  );

  useEffect(() => {
    if (isPaused) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.5;
    const maxScroll = 2000;

    const scroll = () => {
      if (!isPaused) {
        scrollAmount += scrollSpeed;
        
        if (scrollAmount >= maxScroll) {
          scrollAmount = 0;
        }
        
        setScrollPosition(scrollAmount);
      }
      requestAnimationFrame(scroll);
    };

    const animationFrame = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-background">
      <header className="sticky top-0 z-50 border-b bg-gradient-to-r from-card to-warm-50/30 shadow-md backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-md"></div>
                <img 
                  src={logoKotamobagu} 
                  alt="Logo Kotamobagu" 
                  className="relative w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-lg"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent leading-tight">
                  Dashboard Publik
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground leading-tight">
                  Monitoring Status Dokumen Real-time
                </p>
                <p className="text-[10px] md:text-xs text-warm-700 font-semibold leading-tight mt-0.5">
                  PECEL DUKCAPIL - Kota Kotamobagu
                </p>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="rounded-full"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Kembali</span>
            </Button>
          </div>

          <div className="flex justify-center">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full md:w-[280px] h-11 rounded-2xl border-warm-200 shadow-sm" data-testid="select-date-range-dashboard">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <SelectValue placeholder="Rentang Waktu" />
                </div>
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="2days">2 Hari Terakhir</SelectItem>
                <SelectItem value="3days">3 Hari Terakhir</SelectItem>
                <SelectItem value="week">1 Minggu Terakhir</SelectItem>
                <SelectItem value="2weeks">2 Minggu Terakhir</SelectItem>
                <SelectItem value="month">1 Bulan Terakhir</SelectItem>
                <SelectItem value="all">Semua Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <p className="text-muted-foreground">Memuat data dokumen...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive font-semibold mb-2">Gagal memuat data</p>
              <p className="text-muted-foreground text-sm">Terjadi kesalahan saat mengambil data dokumen.</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="mt-4"
                data-testid="button-retry"
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <AutoScrollTable 
              title="Dokumen SELESAI"
              documents={filteredSelesai}
              statusColor="hsl(145 65% 45%)"
              scrollPosition={scrollPosition}
              onPauseChange={setIsPaused}
            />

            <AutoScrollTable 
              title="Dokumen DIPROSES"
              documents={filteredDiproses}
              statusColor="hsl(30 90% 55%)"
              scrollPosition={scrollPosition}
              onPauseChange={setIsPaused}
            />

            <AutoScrollTable 
              title="Dokumen DITUNDA"
              documents={filteredDitunda}
              statusColor="hsl(0 75% 50%)"
              scrollPosition={scrollPosition}
              onPauseChange={setIsPaused}
            />
          </div>
        )}
      </main>
    </div>
  );
}
