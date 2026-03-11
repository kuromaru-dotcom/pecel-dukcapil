import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (filters: ExportFilters) => void;
}

export interface ExportFilters {
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  documentType: string;
}

const documentTypes = [
  "Semua Jenis",
  "KTP",
  "KIA",
  "Kartu Keluarga",
  "Pindah Keluar",
  "Pindah Datang",
  "Akte Lahir",
  "Akte Kematian",
  "Akte Kawin",
  "Akte Cerai",
  "DLL"
];

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "DITERIMA", label: "DITERIMA" },
  { value: "DIPROSES", label: "DIPROSES" },
  { value: "DITUNDA", label: "DITUNDA" },
  { value: "SELESAI", label: "SELESAI" }
];

export default function ExportDialog({ open, onOpenChange, onExport }: ExportDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<string>("all");
  const [documentType, setDocumentType] = useState<string>("Semua Jenis");

  const handleExport = () => {
    onExport({
      startDate: startDate || null,
      endDate: endDate || null,
      status,
      documentType
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatus("all");
    setDocumentType("Semua Jenis");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-export">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Data ke Spreadsheet
          </DialogTitle>
          <DialogDescription>
            Pilih kriteria data yang ingin diexport ke file CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rentang Tanggal</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal rounded-full h-11"
                    data-testid="button-start-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd MMM yyyy") : "Dari Tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[200]" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    data-testid="calendar-start-date"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal rounded-full h-11"
                    data-testid="button-end-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd MMM yyyy") : "Sampai Tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[200]" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    data-testid="calendar-end-date"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status Dokumen</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="rounded-full h-11" data-testid="select-status">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Jenis Dokumen</label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="rounded-full h-11" data-testid="select-document-type">
                <SelectValue placeholder="Pilih jenis dokumen" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleReset}
            className="rounded-full"
            data-testid="button-reset-filters"
          >
            Reset Filter
          </Button>
          <Button
            onClick={handleExport}
            className="rounded-full"
            data-testid="button-confirm-export"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
