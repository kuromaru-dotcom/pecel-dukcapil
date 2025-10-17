import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, CheckCircle, Clock, AlertCircle, TrendingUp, CalendarIcon, Users, X } from "lucide-react";
import { useLocation } from "wouter";
import type { Document } from "@/components/DocumentTable";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'public');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [loginOpen, setLoginOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Redirect if not logged in - Analytics accessible to all logged-in users
  useEffect(() => {
    if (userRole === 'public') {
      setLocation('/');
    }
  }, [userRole, setLocation]);

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Filter documents by date range
  const filteredDocs = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return documents;
    
    return documents.filter(doc => {
      const docDate = new Date(doc.tanggal);
      
      if (dateRange.from && dateRange.to) {
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        return docDate >= fromDate && docDate <= toDate;
      } else if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        return docDate >= fromDate;
      } else if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        return docDate <= toDate;
      }
      
      return true;
    });
  }, [documents, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredDocs.length;
    const selesai = filteredDocs.filter(d => d.status === 'SELESAI').length;
    const diproses = filteredDocs.filter(d => d.status === 'DIPROSES').length;
    const ditunda = filteredDocs.filter(d => d.status === 'DITUNDA').length;
    
    return { total, selesai, diproses, ditunda };
  }, [filteredDocs]);

  // Status distribution data
  const statusData = [
    { name: 'Selesai', value: stats.selesai, color: 'hsl(145 65% 45%)' },
    { name: 'Diproses', value: stats.diproses, color: 'hsl(30 90% 55%)' },
    { name: 'Ditunda', value: stats.ditunda, color: 'hsl(0 75% 50%)' },
  ];

  // Document type distribution
  const documentTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    filteredDocs.forEach(doc => {
      typeCounts[doc.jenisDokumen] = (typeCounts[doc.jenisDokumen] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [filteredDocs]);

  // Monthly trend data
  const monthlyTrendData = useMemo(() => {
    const monthCounts: Record<string, { selesai: number; diproses: number; ditunda: number }> = {};
    
    filteredDocs.forEach(doc => {
      const date = new Date(doc.tanggal);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthCounts[monthKey]) {
        monthCounts[monthKey] = { selesai: 0, diproses: 0, ditunda: 0 };
      }
      
      if (doc.status === 'SELESAI') monthCounts[monthKey].selesai++;
      if (doc.status === 'DIPROSES') monthCounts[monthKey].diproses++;
      if (doc.status === 'DITUNDA') monthCounts[monthKey].ditunda++;
    });
    
    return Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        ...data
      }));
  }, [filteredDocs]);

  // CS Performance Analytics
  const csPerformance = useMemo(() => {
    const csStats: Record<string, { total: number; diterima: number; diproses: number; ditunda: number; selesai: number }> = {};
    
    filteredDocs.forEach(doc => {
      if (doc.namaCS) {
        if (!csStats[doc.namaCS]) {
          csStats[doc.namaCS] = { total: 0, diterima: 0, diproses: 0, ditunda: 0, selesai: 0 };
        }
        csStats[doc.namaCS].total++;
        if (doc.status === 'DITERIMA') csStats[doc.namaCS].diterima++;
        if (doc.status === 'DIPROSES') csStats[doc.namaCS].diproses++;
        if (doc.status === 'DITUNDA') csStats[doc.namaCS].ditunda++;
        if (doc.status === 'SELESAI') csStats[doc.namaCS].selesai++;
      }
    });
    
    return Object.entries(csStats)
      .map(([nama, stats]) => ({
        nama,
        ...stats,
        successRate: stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredDocs]);

  // Operator Performance Analytics
  const operatorPerformance = useMemo(() => {
    const opStats: Record<string, { total: number; diproses: number; ditunda: number; selesai: number }> = {};
    
    filteredDocs.forEach(doc => {
      if (doc.namaOperator && doc.namaOperator !== '') {
        if (!opStats[doc.namaOperator]) {
          opStats[doc.namaOperator] = { total: 0, diproses: 0, ditunda: 0, selesai: 0 };
        }
        opStats[doc.namaOperator].total++;
        if (doc.status === 'DIPROSES') opStats[doc.namaOperator].diproses++;
        if (doc.status === 'DITUNDA') opStats[doc.namaOperator].ditunda++;
        if (doc.status === 'SELESAI') opStats[doc.namaOperator].selesai++;
      }
    });
    
    return Object.entries(opStats)
      .map(([nama, stats]) => ({
        nama,
        ...stats,
        successRate: stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredDocs]);

  const handleLogin = (username: string, role: string) => {
    setUserName(username);
    setUserRole(role);
    setLoginOpen(false);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', username);
  };

  const handleLogout = () => {
    setUserRole('public');
    setUserName('');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setLocation('/');
  };

  const getDateRangeLabel = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "dd MMM yyyy", { locale: localeId })} - ${format(dateRange.to, "dd MMM yyyy", { locale: localeId })}`;
    } else if (dateRange?.from) {
      return `Dari ${format(dateRange.from, "dd MMM yyyy", { locale: localeId })}`;
    }
    return 'Semua Data';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole={userRole as any}
        userName={userName}
        onLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Dashboard Analitik
              </h1>
              <p className="text-muted-foreground mt-1">
                Statistik dan laporan dokumen kependudukan
              </p>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-auto min-w-[280px] h-10 rounded-xl border justify-start text-left font-normal"
                  data-testid="button-analytics-date-range"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from && dateRange?.to ? (
                    <>
                      {format(dateRange.from, "dd MMM yyyy", { locale: localeId })} - {format(dateRange.to, "dd MMM yyyy", { locale: localeId })}
                    </>
                  ) : dateRange?.from ? (
                    <>Dari {format(dateRange.from, "dd MMM yyyy", { locale: localeId })}</>
                  ) : (
                    <span>Pilih rentang tanggal...</span>
                  )}
                  {(dateRange?.from || dateRange?.to) && (
                    <X 
                      className="ml-auto h-4 w-4 hover:text-destructive cursor-pointer" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDateRange(undefined);
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                  }}
                  locale={localeId}
                  numberOfMonths={1}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">{getDateRangeLabel()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Selesai</CardTitle>
                <CheckCircle className="h-4 w-4 text-document-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-document-green" data-testid="stat-selesai">{stats.selesai}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? `${Math.round((stats.selesai / stats.total) * 100)}%` : '0%'} dari total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Diproses</CardTitle>
                <Clock className="h-4 w-4 text-document-yellow" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-document-yellow" data-testid="stat-diproses">{stats.diproses}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? `${Math.round((stats.diproses / stats.total) * 100)}%` : '0%'} dari total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ditunda</CardTitle>
                <AlertCircle className="h-4 w-4 text-document-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-document-red" data-testid="stat-ditunda">{stats.ditunda}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? `${Math.round((stats.ditunda / stats.total) * 100)}%` : '0%'} dari total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Status Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Status Dokumen</CardTitle>
                <CardDescription>Perbandingan status dokumen saat ini</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Document Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Jenis Dokumen</CardTitle>
                <CardDescription>Distribusi berdasarkan tipe dokumen</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={documentTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tren Bulanan
              </CardTitle>
              <CardDescription>Pergerakan status dokumen per bulan</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="selesai" stroke="hsl(145 65% 45%)" strokeWidth={2} name="Selesai" />
                  <Line type="monotone" dataKey="diproses" stroke="hsl(30 90% 55%)" strokeWidth={2} name="Diproses" />
                  <Line type="monotone" dataKey="ditunda" stroke="hsl(0 75% 50%)" strokeWidth={2} name="Ditunda" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Performance Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CS Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Kinerja Customer Service
                </CardTitle>
                <CardDescription>Aktivitas penerimaan dokumen per CS</CardDescription>
              </CardHeader>
              <CardContent>
                {csPerformance.length > 0 ? (
                  <div className="space-y-4">
                    {csPerformance.map((cs, idx) => (
                      <div key={cs.nama} className="border-b pb-3 last:border-0" data-testid={`cs-performance-${idx}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{cs.nama}</h4>
                          <span className="text-xs text-muted-foreground">{cs.total} dokumen</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                            <div className="font-semibold text-blue-600 dark:text-blue-400">{cs.diterima}</div>
                            <div className="text-muted-foreground">Diterima</div>
                          </div>
                          <div className="text-center p-2 bg-amber-50 dark:bg-amber-950/30 rounded">
                            <div className="font-semibold text-amber-600 dark:text-amber-400">{cs.diproses}</div>
                            <div className="text-muted-foreground">Diproses</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded">
                            <div className="font-semibold text-green-600 dark:text-green-400">{cs.selesai}</div>
                            <div className="text-muted-foreground">Selesai</div>
                          </div>
                          <div className="text-center p-2 bg-red-50 dark:bg-red-950/30 rounded">
                            <div className="font-semibold text-red-600 dark:text-red-400">{cs.ditunda}</div>
                            <div className="text-muted-foreground">Ditunda</div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all" 
                              style={{ width: `${cs.successRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">{cs.successRate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Tidak ada data CS</p>
                )}
              </CardContent>
            </Card>

            {/* Operator Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Kinerja Operator
                </CardTitle>
                <CardDescription>Aktivitas pemrosesan dokumen per operator</CardDescription>
              </CardHeader>
              <CardContent>
                {operatorPerformance.length > 0 ? (
                  <div className="space-y-4">
                    {operatorPerformance.map((op, idx) => (
                      <div key={op.nama} className="border-b pb-3 last:border-0" data-testid={`operator-performance-${idx}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{op.nama}</h4>
                          <span className="text-xs text-muted-foreground">{op.total} dokumen</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-amber-50 dark:bg-amber-950/30 rounded">
                            <div className="font-semibold text-amber-600 dark:text-amber-400">{op.diproses}</div>
                            <div className="text-muted-foreground">Diproses</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded">
                            <div className="font-semibold text-green-600 dark:text-green-400">{op.selesai}</div>
                            <div className="text-muted-foreground">Selesai</div>
                          </div>
                          <div className="text-center p-2 bg-red-50 dark:bg-red-950/30 rounded">
                            <div className="font-semibold text-red-600 dark:text-red-400">{op.ditunda}</div>
                            <div className="text-muted-foreground">Ditunda</div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all" 
                              style={{ width: `${op.successRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">{op.successRate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Tidak ada data operator</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
