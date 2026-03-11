import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { 
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

export default function AddDocumentDialog({ open, onOpenChange, onAdd }: AddDocumentDialogProps) {
  const [tanggal, setTanggal] = useState('');
  const [nama, setNama] = useState('');
  const [nomorHP, setNomorHP] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jenisDokumen, setJenisDokumen] = useState('');
  const [keteranganDLL, setKeteranganDLL] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ 
      tanggal, 
      nama,
      nomorHP,
      email,
      alamat,
      jenisDokumen, 
      keteranganDLL: jenisDokumen === 'DLL' ? keteranganDLL : undefined 
    });
    setTanggal('');
    setNama('');
    setNomorHP('');
    setEmail('');
    setAlamat('');
    setJenisDokumen('');
    setKeteranganDLL('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-add-document">
        <DialogHeader>
          <DialogTitle>Tambah Dokumen Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input
              id="tanggal"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
              data-testid="input-tanggal"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nama">Nama</Label>
            <Input
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama pemohon"
              required
              data-testid="input-nama"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomorHP">Nomor HP</Label>
            <Input
              id="nomorHP"
              type="tel"
              value={nomorHP}
              onChange={(e) => setNomorHP(e.target.value)}
              placeholder="Masukkan nomor HP"
              required
              data-testid="input-nomor-hp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              required
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Select value={alamat} onValueChange={setAlamat} required>
              <SelectTrigger id="alamat" data-testid="select-alamat">
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
            <Label htmlFor="jenisDokumen">Jenis Dokumen</Label>
            <Select value={jenisDokumen} onValueChange={setJenisDokumen} required>
              <SelectTrigger id="jenisDokumen" data-testid="select-jenis-dokumen">
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
              <Label htmlFor="keteranganDLL">
                Keterangan DLL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="keteranganDLL"
                value={keteranganDLL}
                onChange={(e) => setKeteranganDLL(e.target.value)}
                placeholder="Masukkan jenis dokumen lainnya"
                required
                data-testid="input-keterangan-dll"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" data-testid="button-submit-document">
              Tambah Dokumen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
