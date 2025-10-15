import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useDebounce } from "@/hooks/useDebounce";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocumentTable, { type Document } from "@/components/DocumentTable";
import TableSkeleton from "@/components/TableSkeleton";
import LoginDialog from "@/components/LoginDialog";
import AddDocumentDialog from "@/components/AddDocumentDialog";
import EditDocumentDialog from "@/components/EditDocumentDialog";
import UpdateStatusDialog from "@/components/UpdateStatusDialog";
import UserManagementDialog from "@/components/UserManagementDialog";
import ExportDialog, { ExportFilters } from "@/components/ExportDialog";
import ActionDialog from "@/components/ActionDialog";
import PrintReceiptDialog from "@/components/PrintReceiptDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Users, ChevronLeft, ChevronRight, LayoutDashboard, Download, BarChart3, CalendarIcon, X } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const [userRole, setUserRole] = useState<'public' | 'cs' | 'operator' | 'superadmin'>(() => 
    (localStorage.getItem('userRole') as 'public' | 'cs' | 'operator' | 'superadmin') || 'public'
  );
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [loginOpen, setLoginOpen] = useState(false);
  const [addDocOpen, setAddDocOpen] = useState(false);
  const [editDocOpen, setEditDocOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [userMgmtOpen, setUserMgmtOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [printReceiptOpen, setPrintReceiptOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  
  // Column filter states
  const [filterNama, setFilterNama] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filterRegister, setFilterRegister] = useState('');
  const [filterAlamat, setFilterAlamat] = useState<string>('all');
  const [filterJenisDokumen, setFilterJenisDokumen] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterNamaCS, setFilterNamaCS] = useState('');
  const [filterNamaOperator, setFilterNamaOperator] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounced search values to optimize filtering
  const debouncedFilterNama = useDebounce(filterNama, 500);
  const debouncedFilterRegister = useDebounce(filterRegister, 500);
  const debouncedFilterNamaCS = useDebounce(filterNamaCS, 500);
  const debouncedFilterNamaOperator = useDebounce(filterNamaOperator, 500);

  // Fetch documents using React Query
  const { data: documents = [], isLoading, isError } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Mutation for adding document
  const addDocumentMutation = useMutation({
    mutationFn: async (data: { 
      tanggal: string; 
      nama: string; 
      nomorHP: string;
      email: string;
      alamat: string;
      jenisDokumen: string; 
      keteranganDLL?: string;
      status: string;
      keterangan: string;
      namaCS: string;
      namaOperator: string;
      createdBy: string;
    }): Promise<Document> => {
      const response = await apiRequest('POST', '/api/documents', data);
      return await response.json();
    },
    onSuccess: (newDocument: Document) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      // Show print receipt dialog with newly created document
      setSelectedDoc(newDocument);
      setPrintReceiptOpen(true);
    },
  });

  // Mutation for editing document
  const editDocumentMutation = useMutation({
    mutationFn: async (data: { 
      id: number; 
      tanggal: string; 
      nama: string; 
      nomorHP: string;
      email: string;
      alamat: string;
      jenisDokumen: string; 
      keteranganDLL?: string 
    }) => {
      const { id, ...updateData } = data;
      await apiRequest('PATCH', `/api/documents/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
  });

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { 
      id: number; 
      status: string;
      keterangan: string;
      namaOperator: string;
    }) => {
      const { id, ...updateData } = data;
      await apiRequest('PATCH', `/api/documents/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
  });

  // Mutation for deleting document
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
  });

  // Filter documents by all column filters and sort newest-first (using debounced values for text inputs)
  const filteredDocuments = useMemo(() => {
    return documents
      .filter(doc => {
        const matchesNama = !debouncedFilterNama || doc.nama.toLowerCase().includes(debouncedFilterNama.toLowerCase());
        
        // Date range filter
        let matchesDateRange = true;
        if (dateRange?.from || dateRange?.to) {
          const docDate = new Date(doc.tanggal);
          if (dateRange.from && dateRange.to) {
            // Both dates selected - check if doc date is between range
            const fromDate = new Date(dateRange.from);
            const toDate = new Date(dateRange.to);
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(23, 59, 59, 999);
            matchesDateRange = docDate >= fromDate && docDate <= toDate;
          } else if (dateRange.from) {
            // Only start date - doc date should be on or after
            const fromDate = new Date(dateRange.from);
            fromDate.setHours(0, 0, 0, 0);
            matchesDateRange = docDate >= fromDate;
          } else if (dateRange.to) {
            // Only end date - doc date should be on or before
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999);
            matchesDateRange = docDate <= toDate;
          }
        }
        
        const matchesRegister = !debouncedFilterRegister || doc.nomorRegister.toLowerCase().includes(debouncedFilterRegister.toLowerCase());
        const matchesAlamat = filterAlamat === 'all' || doc.alamat === filterAlamat;
        const matchesJenisDokumen = filterJenisDokumen === 'all' || doc.jenisDokumen === filterJenisDokumen;
        const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
        const matchesNamaCS = !debouncedFilterNamaCS || (doc.namaCS && doc.namaCS.toLowerCase().includes(debouncedFilterNamaCS.toLowerCase()));
        const matchesNamaOperator = !debouncedFilterNamaOperator || (doc.namaOperator && doc.namaOperator.toLowerCase().includes(debouncedFilterNamaOperator.toLowerCase()));
        
        return matchesNama && matchesDateRange && matchesRegister && matchesAlamat && matchesJenisDokumen && matchesStatus && matchesNamaCS && matchesNamaOperator;
      })
      .sort((a, b) => b.id - a.id); // Sort by ID descending (newest first)
  }, [documents, debouncedFilterNama, dateRange, debouncedFilterRegister, filterAlamat, filterJenisDokumen, filterStatus, debouncedFilterNamaCS, debouncedFilterNamaOperator]);

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocuments, currentPage]);

  const handleLogin = (username: string, role: string) => {
    setUserName(username);
    setUserRole(role as any);
    setLoginOpen(false);
    // Save to localStorage for Dashboard access
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', username);
    console.log('Login successful:', username, role);
  };

  const handleLogout = () => {
    setUserRole('public');
    setUserName('');
    // Clear localStorage
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    console.log('Logged out');
  };

  const handleAddDocument = (data: { 
    tanggal: string; 
    nama: string; 
    nomorHP: string;
    email: string;
    alamat: string;
    jenisDokumen: string; 
    keteranganDLL?: string 
  }) => {
    // Call mutation with document data (server will generate nomorRegister)
    addDocumentMutation.mutate({
      tanggal: data.tanggal,
      nama: data.nama,
      nomorHP: data.nomorHP,
      email: data.email,
      alamat: data.alamat,
      jenisDokumen: data.jenisDokumen,
      keteranganDLL: data.keteranganDLL,
      status: 'DITERIMA',
      keterangan: 'Menunggu Diproses',
      namaCS: userName,
      namaOperator: '',
      createdBy: userName,
    });
    console.log('Document added');
  };

  const handleUpdateStatus = (status: 'DIPROSES' | 'DITUNDA' | 'SELESAI', keterangan: string) => {
    if (selectedDoc) {
      updateStatusMutation.mutate({
        id: selectedDoc.id,
        status,
        keterangan,
        namaOperator: userName,
      });
      console.log('Status updated:', selectedDoc.id, status, keterangan);
    }
  };

  const handleRowClick = (doc: Document) => {
    setSelectedDoc(doc);
    setActionDialogOpen(true);
  };

  const handleEditDocument = (data: { 
    id: number; 
    tanggal: string; 
    nama: string; 
    nomorHP: string;
    email: string;
    alamat: string;
    jenisDokumen: string; 
    keteranganDLL?: string 
  }) => {
    editDocumentMutation.mutate(data);
    console.log('Document edited:', data);
  };

  const handleDeleteDoc = () => {
    if (selectedDoc && confirm(`Hapus dokumen ${selectedDoc.nama}?`)) {
      deleteDocumentMutation.mutate(selectedDoc.id);
      console.log('Document deleted:', selectedDoc.id);
      setSelectedDoc(null);
    }
  };

  const handleExportWithFilters = (filters: ExportFilters) => {
    // Apply filters to documents
    let dataToExport = documents;

    console.log('Starting export with', documents.length, 'total documents');

    // Filter by date range (inclusive of both start and end dates)
    if (filters.startDate || filters.endDate) {
      const beforeDateFilter = dataToExport.length;
      dataToExport = dataToExport.filter(doc => {
        const docDate = new Date(doc.tanggal);
        docDate.setHours(0, 0, 0, 0); // Normalize to start of day
        
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          startDate.setHours(0, 0, 0, 0);
          if (docDate < startDate) return false;
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999); // End of day
          if (docDate > endDate) return false;
        }
        
        return true;
      });
      console.log(`After date filter: ${beforeDateFilter} → ${dataToExport.length} documents`);
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      const beforeStatusFilter = dataToExport.length;
      dataToExport = dataToExport.filter(doc => doc.status === filters.status);
      console.log(`After status filter (${filters.status}): ${beforeStatusFilter} → ${dataToExport.length} documents`);
    }

    // Filter by document type
    if (filters.documentType && filters.documentType !== 'Semua Jenis') {
      const beforeTypeFilter = dataToExport.length;
      dataToExport = dataToExport.filter(doc => doc.jenisDokumen === filters.documentType);
      console.log(`After document type filter (${filters.documentType}): ${beforeTypeFilter} → ${dataToExport.length} documents`);
    }

    // Convert documents to CSV format
    const headers = ['NO', 'TANGGAL', 'NAMA', 'NOMOR HP', 'EMAIL', 'ALAMAT', 'REGISTER', 'JENIS DOKUMEN', 'STATUS', 'KETERANGAN', 'NAMA CS', 'NAMA OPERATOR'];
    const csvData = dataToExport.map(doc => [
      doc.id,
      doc.tanggal,
      doc.nama,
      doc.nomorHP,
      doc.email,
      doc.alamat,
      doc.nomorRegister,
      doc.jenisDokumen,
      doc.status,
      doc.keterangan,
      doc.namaCS || '-',
      doc.namaOperator || '-'
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Generate filename with filters info
    let filename = 'dokumen-kependudukan';
    if (filters.startDate) filename += `_dari-${filters.startDate.toISOString().split('T')[0]}`;
    if (filters.endDate) filename += `_sampai-${filters.endDate.toISOString().split('T')[0]}`;
    if (filters.status && filters.status !== 'all') filename += `_${filters.status}`;
    if (filters.documentType && filters.documentType !== 'Semua Jenis') filename += `_${filters.documentType.replace(/ /g, '-')}`;
    filename += '.csv';
    
    console.log('Exporting with filters:', filters);
    console.log('Generated filename:', filename);
    console.log('Total records to export:', dataToExport.length);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup blob URL
    URL.revokeObjectURL(url);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-warm-50 to-background">
        <Header 
          userRole={userRole}
          userName={userName}
          onLogin={() => setLoginOpen(true)}
          onLogout={handleLogout}
        />
        <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              Lacak Status Dokumen Anda
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Memuat data dokumen...
            </p>
          </div>
          <TableSkeleton rows={10} columns={userRole === 'public' ? 5 : 10} />
        </main>
        <Footer />
        <LoginDialog 
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-warm-50 to-background">
        <Header 
          userRole={userRole}
          userName={userName}
          onLogin={() => setLoginOpen(true)}
          onLogout={handleLogout}
        />
        <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-destructive">Gagal memuat data dokumen. Silakan coba lagi.</p>
          </div>
        </main>
        <Footer />
        <LoginDialog 
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-background">
      <Header 
        userRole={userRole}
        userName={userName}
        onLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              Lacak Status Dokumen Anda
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Pantau proses dokumen kependudukan secara real-time
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/dashboard')}
              className="rounded-full h-11"
              data-testid="button-dashboard"
            >
              <LayoutDashboard className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Lihat Dashboard</span>
            </Button>

            {userRole === 'superadmin' && (
              <Button 
                variant="outline" 
                onClick={() => setLocation('/analytics')}
                className="rounded-full h-11"
                data-testid="button-analytics"
              >
                <BarChart3 className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Analitik</span>
              </Button>
            )}
            
            {userRole === 'cs' && (
              <Button 
                onClick={() => setAddDocOpen(true)}
                className="rounded-full shadow-sm"
                data-testid="button-add-document"
                disabled={addDocumentMutation.isPending}
              >
                <Plus className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">
                  {addDocumentMutation.isPending ? 'Menambahkan...' : 'Tambah Dokumen'}
                </span>
              </Button>
            )}
            
            {userRole === 'superadmin' && (
              <>
                <Button 
                  onClick={() => setUserMgmtOpen(true)}
                  className="rounded-full shadow-sm"
                  data-testid="button-user-management"
                >
                  <Users className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Kelola User</span>
                </Button>
                <Button 
                  onClick={() => setExportDialogOpen(true)}
                  variant="outline"
                  className="rounded-full h-11"
                  data-testid="button-export-data"
                >
                  <Download className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Export Data</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Column Filters */}
        <div className="mb-6 p-4 md:p-6 bg-card border border-warm-200 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Filter Dokumen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nama</label>
              <Input
                placeholder="Filter nama..."
                value={filterNama}
                onChange={(e) => {
                  setFilterNama(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border-warm-200"
                data-testid="input-filter-nama"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Rentang Tanggal</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-10 rounded-xl border-warm-200 justify-start text-left font-normal"
                    data-testid="button-filter-date-range"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from && dateRange?.to ? (
                      <>
                        {format(dateRange.from, "dd MMM yyyy", { locale: localeId })} - {format(dateRange.to, "dd MMM yyyy", { locale: localeId })}
                      </>
                    ) : dateRange?.from ? (
                      <>Dari {format(dateRange.from, "dd MMM yyyy", { locale: localeId })}</>
                    ) : (
                      <span className="text-muted-foreground">Pilih rentang tanggal...</span>
                    )}
                    {(dateRange?.from || dateRange?.to) && (
                      <X 
                        className="ml-auto h-4 w-4 hover:text-destructive cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDateRange(undefined);
                          setCurrentPage(1);
                        }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      setCurrentPage(1);
                    }}
                    locale={localeId}
                    numberOfMonths={1}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Jenis Dokumen</label>
              <Select value={filterJenisDokumen} onValueChange={(val) => {
                setFilterJenisDokumen(val);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="h-10 rounded-xl border-warm-200" data-testid="select-filter-jenis">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="KTP">KTP</SelectItem>
                  <SelectItem value="KIA">KIA</SelectItem>
                  <SelectItem value="Kartu Keluarga">Kartu Keluarga</SelectItem>
                  <SelectItem value="Pindah Keluar">Pindah Keluar</SelectItem>
                  <SelectItem value="Pindah Datang">Pindah Datang</SelectItem>
                  <SelectItem value="Akte Lahir">Akte Lahir</SelectItem>
                  <SelectItem value="Akte Kematian">Akte Kematian</SelectItem>
                  <SelectItem value="Akte Kawin">Akte Kawin</SelectItem>
                  <SelectItem value="Akte Cerai">Akte Cerai</SelectItem>
                  <SelectItem value="DLL">DLL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Status</label>
              <Select value={filterStatus} onValueChange={(val) => {
                setFilterStatus(val);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="h-10 rounded-xl border-warm-200" data-testid="select-filter-status">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="DITERIMA">DITERIMA</SelectItem>
                  <SelectItem value="DIPROSES">DIPROSES</SelectItem>
                  <SelectItem value="DITUNDA">DITUNDA</SelectItem>
                  <SelectItem value="SELESAI">SELESAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {userRole !== 'public' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Alamat</label>
                  <Select value={filterAlamat} onValueChange={(val) => {
                    setFilterAlamat(val);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="h-10 rounded-xl border-warm-200" data-testid="select-filter-alamat">
                      <SelectValue placeholder="Semua" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Alamat</SelectItem>
                      <SelectItem value="Kotamobagu Utara">Kotamobagu Utara</SelectItem>
                      <SelectItem value="Kotamobagu Selatan">Kotamobagu Selatan</SelectItem>
                      <SelectItem value="Kotamobagu Barat">Kotamobagu Barat</SelectItem>
                      <SelectItem value="Kotamobagu Timur">Kotamobagu Timur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Register</label>
                  <Input
                    placeholder="Filter register..."
                    value={filterRegister}
                    onChange={(e) => {
                      setFilterRegister(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-10 rounded-xl border-warm-200"
                    data-testid="input-filter-register"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nama CS</label>
                  <Input
                    placeholder="Filter CS..."
                    value={filterNamaCS}
                    onChange={(e) => {
                      setFilterNamaCS(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-10 rounded-xl border-warm-200"
                    data-testid="input-filter-cs"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nama Operator</label>
                  <Input
                    placeholder="Filter operator..."
                    value={filterNamaOperator}
                    onChange={(e) => {
                      setFilterNamaOperator(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-10 rounded-xl border-warm-200"
                    data-testid="input-filter-operator"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <DocumentTable 
          documents={paginatedDocuments}
          userRole={userRole}
          onRowClick={handleRowClick}
        />

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, filteredDocuments.length)} - {Math.min(currentPage * itemsPerPage, filteredDocuments.length)} dari {filteredDocuments.length} dokumen
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-11 px-4 rounded-full"
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Sebelumnya</span>
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(page)}
                  className="h-11 w-11 rounded-full"
                  data-testid={`button-page-${page}`}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-11 px-4 rounded-full"
              data-testid="button-next-page"
            >
              <span className="hidden md:inline">Berikutnya</span>
              <ChevronRight className="w-4 h-4 md:ml-1" />
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      <LoginDialog 
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onLogin={handleLogin}
      />

      <AddDocumentDialog 
        open={addDocOpen}
        onOpenChange={setAddDocOpen}
        onAdd={handleAddDocument}
      />

      {userRole !== 'public' && selectedDoc && (
        <ActionDialog
          open={actionDialogOpen}
          onOpenChange={setActionDialogOpen}
          document={selectedDoc}
          userRole={userRole}
          currentUserName={userName}
          onEditDocument={() => setEditDocOpen(true)}
          onUpdateStatus={() => setUpdateStatusOpen(true)}
          onDeleteDocument={handleDeleteDoc}
        />
      )}

      <EditDocumentDialog
        open={editDocOpen}
        onOpenChange={setEditDocOpen}
        document={selectedDoc}
        onEdit={handleEditDocument}
      />

      {selectedDoc && (
        <UpdateStatusDialog 
          open={updateStatusOpen}
          onOpenChange={setUpdateStatusOpen}
          documentId={selectedDoc.id}
          currentStatus={selectedDoc.status}
          onUpdate={handleUpdateStatus}
        />
      )}

      <UserManagementDialog 
        open={userMgmtOpen}
        onOpenChange={setUserMgmtOpen}
      />

      <ExportDialog 
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExportWithFilters}
      />

      <PrintReceiptDialog 
        open={printReceiptOpen}
        onOpenChange={setPrintReceiptOpen}
        document={selectedDoc}
      />
    </div>
  );
}
