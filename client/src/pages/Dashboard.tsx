import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Wifi, WifiOff } from "lucide-react";
import logoKotamobagu from "@assets/logo-kotamobagu.png";
import AutoScrollTable from "@/components/AutoScrollTable";
import type { Document } from "@shared/schema";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useDocumentSync } from "@/hooks/useDocumentSync";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userRole, setUserRole] = useState<string>('public');
  const [dateRangeSelesai, setDateRangeSelesai] = useState<string>('all');
  const [dateRangeDiproses, setDateRangeDiproses] = useState<string>('all');
  const [dateRangeDitunda, setDateRangeDitunda] = useState<string>('all');
  
  // WebSocket real-time sync
  const { isConnected } = useWebSocket();
  useDocumentSync();

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
  const filterDocumentsByDateAndStatus = (docs: Document[], status: string, dateRange: string) => {
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
    filterDocumentsByDateAndStatus(documents, 'SELESAI', dateRangeSelesai), 
    [documents, dateRangeSelesai]
  );
  
  const filteredDiproses = useMemo(() => 
    filterDocumentsByDateAndStatus(documents, 'DIPROSES', dateRangeDiproses), 
    [documents, dateRangeDiproses]
  );
  
  const filteredDitunda = useMemo(() => 
    filterDocumentsByDateAndStatus(documents, 'DITUNDA', dateRangeDitunda), 
    [documents, dateRangeDitunda]
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
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent leading-tight">
                Dashboard Publik
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-tight">
                Monitoring Status Dokumen Real-time
              </p>
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
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-t-4 rounded-2xl shadow-sm overflow-hidden bg-card p-4">
                <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-12 bg-muted animate-pulse rounded"></div>
                  ))}
                </div>
              </div>
            ))}
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
            <div className="flex flex-col gap-3">
              <Select value={dateRangeSelesai} onValueChange={setDateRangeSelesai}>
                <SelectTrigger className="w-full h-10 rounded-xl border-green-200 shadow-sm" data-testid="select-date-range-selesai">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <SelectValue placeholder="Rentang Waktu" />
                  </div>
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="2days">2 Hari Terakhir</SelectItem>
                  <SelectItem value="3days">3 Hari Terakhir</SelectItem>
                  <SelectItem value="week">1 Minggu</SelectItem>
                  <SelectItem value="2weeks">2 Minggu</SelectItem>
                  <SelectItem value="month">1 Bulan</SelectItem>
                  <SelectItem value="all">Semua Data</SelectItem>
                </SelectContent>
              </Select>
              <AutoScrollTable 
                title="Dokumen SELESAI"
                documents={filteredSelesai}
                statusColor="hsl(145 65% 45%)"
                scrollPosition={scrollPosition}
                onPauseChange={setIsPaused}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Select value={dateRangeDiproses} onValueChange={setDateRangeDiproses}>
                <SelectTrigger className="w-full h-10 rounded-xl border-amber-200 shadow-sm" data-testid="select-date-range-diproses">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <SelectValue placeholder="Rentang Waktu" />
                  </div>
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="2days">2 Hari Terakhir</SelectItem>
                  <SelectItem value="3days">3 Hari Terakhir</SelectItem>
                  <SelectItem value="week">1 Minggu</SelectItem>
                  <SelectItem value="2weeks">2 Minggu</SelectItem>
                  <SelectItem value="month">1 Bulan</SelectItem>
                  <SelectItem value="all">Semua Data</SelectItem>
                </SelectContent>
              </Select>
              <AutoScrollTable 
                title="Dokumen DIPROSES"
                documents={filteredDiproses}
                statusColor="hsl(30 90% 55%)"
                scrollPosition={scrollPosition}
                onPauseChange={setIsPaused}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Select value={dateRangeDitunda} onValueChange={setDateRangeDitunda}>
                <SelectTrigger className="w-full h-10 rounded-xl border-red-200 shadow-sm" data-testid="select-date-range-ditunda">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <SelectValue placeholder="Rentang Waktu" />
                  </div>
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="2days">2 Hari Terakhir</SelectItem>
                  <SelectItem value="3days">3 Hari Terakhir</SelectItem>
                  <SelectItem value="week">1 Minggu</SelectItem>
                  <SelectItem value="2weeks">2 Minggu</SelectItem>
                  <SelectItem value="month">1 Bulan</SelectItem>
                  <SelectItem value="all">Semua Data</SelectItem>
                </SelectContent>
              </Select>
              <AutoScrollTable 
                title="Dokumen DITUNDA"
                documents={filteredDitunda}
                statusColor="hsl(0 75% 50%)"
                scrollPosition={scrollPosition}
                onPauseChange={setIsPaused}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
