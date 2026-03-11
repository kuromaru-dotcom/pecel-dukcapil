import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: number;
  currentStatus: string;
  onUpdate: (status: 'DIPROSES' | 'DITUNDA' | 'SELESAI', keterangan: string) => void;
}

const getAutoKeterangan = (status: string): string => {
  switch (status) {
    case 'DITERIMA':
      return 'Menunggu Diproses';
    case 'DIPROSES':
      return 'Sedang Diproses';
    case 'SELESAI':
      return 'Dokumen selesai';
    default:
      return '';
  }
};

export default function UpdateStatusDialog({ 
  open, 
  onOpenChange, 
  documentId,
  currentStatus,
  onUpdate 
}: UpdateStatusDialogProps) {
  const [status, setStatus] = useState<'DIPROSES' | 'DITUNDA' | 'SELESAI'>('DIPROSES');
  const [keterangan, setKeterangan] = useState('');
  const ditundaKeteranganRef = useRef('');

  // Reset ref when dialog opens
  useEffect(() => {
    if (open) {
      ditundaKeteranganRef.current = '';
    }
  }, [open]);

  // Auto-fill keterangan based on status
  useEffect(() => {
    const autoKeterangan = getAutoKeterangan(status);
    if (autoKeterangan) {
      // Auto-fill for non-DITUNDA statuses
      setKeterangan(autoKeterangan);
    } else {
      // Restore saved DITUNDA keterangan or clear
      setKeterangan(ditundaKeteranganRef.current);
    }
  }, [status]);

  // Save DITUNDA keterangan when user types
  const handleKeteranganChange = (value: string) => {
    setKeterangan(value);
    if (status === 'DITUNDA') {
      ditundaKeteranganRef.current = value;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'DITUNDA' && !keterangan.trim()) {
      alert('Keterangan wajib diisi untuk status DITUNDA');
      return;
    }
    onUpdate(status, keterangan);
    setStatus('DIPROSES');
    setKeterangan('');
    ditundaKeteranganRef.current = '';
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-update-status">
        <DialogHeader>
          <DialogTitle>Update Status Dokumen #{documentId}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Status Saat Ini: <span className="font-semibold">{currentStatus}</span></Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newStatus">Status Baru</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as 'DIPROSES' | 'DITUNDA' | 'SELESAI')}>
              <SelectTrigger id="newStatus" data-testid="select-new-status">
                <SelectValue placeholder="Pilih status baru" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIPROSES">DIPROSES</SelectItem>
                <SelectItem value="DITUNDA">DITUNDA</SelectItem>
                <SelectItem value="SELESAI">SELESAI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">
              Keterangan {status === 'DITUNDA' && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="keterangan"
              value={keterangan}
              onChange={(e) => handleKeteranganChange(e.target.value)}
              placeholder={status === 'DITUNDA' ? 'Wajib diisi untuk status DITUNDA' : 'Otomatis terisi berdasarkan status'}
              rows={3}
              disabled={status !== 'DITUNDA'}
              className={status !== 'DITUNDA' ? 'bg-muted' : ''}
              data-testid="textarea-keterangan"
            />
            {status !== 'DITUNDA' && (
              <p className="text-xs text-muted-foreground">
                Keterangan otomatis terisi untuk status {status}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" data-testid="button-submit-update">
              Update Status
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
