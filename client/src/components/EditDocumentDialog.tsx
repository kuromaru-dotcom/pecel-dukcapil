import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Document } from "./DocumentTable";

interface EditDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onEdit: (data: { 
    id: number; 
    tanggal: string; 
    nama: string; 
    nomorHP: string;
    email: string;
    alamat: string;
    jenisDokumen: string; 
    keteranganDLL?: string 
  }) => void;
}

const jenisDoKumen = [
  'KTP',
  'KIA',
  'Kartu Keluarga',
  'Pindah Keluar',
  'Pindah Datang',
  'Akte Lahir',
  'Akte Kematian',
  'Akte Kawin',
  'Akte Cerai',
  'DLL',
];

const alamatOptions = [
  'Kotamobagu Utara',
  'Kotamobagu Selatan',
  'Kotamobagu Barat',
  'Kotamobagu Timur',
];

export default function EditDocumentDialog({ open, onOpenChange, document, onEdit }: EditDocumentDialogProps) {
  const [tanggal, setTanggal] = useState('');
  const [nama, setNama] = useState('');
  const [nomorHP, setNomorHP] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jenisDokumen, setJenisDokumen] = useState('');
  const [keteranganDLL, setKeteranganDLL] = useState('');

  useEffect(() => {
    if (document) {
      setTanggal(document.tanggal);
      setNama(document.nama);
      setNomorHP(document.nomorHP);
      setEmail(document.email);
      setAlamat(document.alamat);
      setJenisDokumen(document.jenisDokumen);
      setKeteranganDLL(document.keteranganDLL || '');
    }
  }, [document]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (document) {
      onEdit({ 
        id: document.id, 
        tanggal, 
        nama,
        nomorHP,
        email,
        alamat,
        jenisDokumen, 
        keteranganDLL: jenisDokumen === 'DLL' ? keteranganDLL : undefined 
      });
      onOpenChange(false);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-edit-document">
        <DialogHeader>
          <DialogTitle>Edit Dokumen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-tanggal">Tanggal</Label>
            <Input
              id="edit-tanggal"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
              data-testid="input-edit-tanggal"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-nama">Nama</Label>
            <Input
              id="edit-nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama pemohon"
              required
              data-testid="input-edit-nama"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-nomorHP">Nomor HP</Label>
            <Input
              id="edit-nomorHP"
              type="tel"
              value={nomorHP}
              onChange={(e) => setNomorHP(e.target.value)}
              placeholder="Masukkan nomor HP"
              required
              data-testid="input-edit-nomor-hp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              required
              data-testid="input-edit-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-alamat">Alamat</Label>
            <Select value={alamat} onValueChange={setAlamat} required>
              <SelectTrigger id="edit-alamat" data-testid="select-edit-alamat">
                <SelectValue placeholder="Pilih alamat" />
              </SelectTrigger>
              <SelectContent>
                {alamatOptions.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-jenisDokumen">Jenis Dokumen</Label>
            <Select value={jenisDokumen} onValueChange={setJenisDokumen} required>
              <SelectTrigger id="edit-jenisDokumen" data-testid="select-edit-jenis-dokumen">
                <SelectValue placeholder="Pilih jenis dokumen" />
              </SelectTrigger>
              <SelectContent>
                {jenisDoKumen.map((jenis) => (
                  <SelectItem key={jenis} value={jenis}>
                    {jenis}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {jenisDokumen === 'DLL' && (
            <div className="space-y-2">
              <Label htmlFor="edit-keteranganDLL">
                Keterangan DLL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-keteranganDLL"
                value={keteranganDLL}
                onChange={(e) => setKeteranganDLL(e.target.value)}
                placeholder="Masukkan jenis dokumen lainnya"
                required
                data-testid="input-edit-keterangan-dll"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" data-testid="button-submit-edit">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
