import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "./StatusBadge";

export interface Document {
  id: number;
  tanggal: string;
  nama: string;
  nomorHP: string;
  email: string;
  alamat: 'Kotamobagu Utara' | 'Kotamobagu Selatan' | 'Kotamobagu Barat' | 'Kotamobagu Timur';
  nomorRegister: string; // Format: 0001/001/X/2025 (urut/kode-doc/bulan-romawi/tahun)
  jenisDokumen: string;
  keteranganDLL?: string; // Keterangan tambahan jika jenisDokumen = "DLL"
  status: 'DITERIMA' | 'DIPROSES' | 'DITUNDA' | 'SELESAI';
  keterangan: string;
  namaCS?: string;
  namaOperator?: string;
  createdBy?: string; // Username CS yang membuat dokumen (untuk permission control)
}

interface DocumentTableProps {
  documents: Document[];
  userRole?: 'public' | 'cs' | 'operator' | 'superadmin';
  onRowClick?: (doc: Document) => void;
}

export default function DocumentTable({ 
  documents, 
  userRole = 'public',
  onRowClick
}: DocumentTableProps) {
  const isPublic = userRole === 'public';

  return (
    <div className="rounded-2xl border overflow-hidden shadow-sm bg-card" role="region" aria-label="Tabel dokumen kependudukan">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow role="row">
              <TableHead className="bg-document-yellow/20 border-l-4 border-document-yellow w-16">
                NO
              </TableHead>
              <TableHead className="bg-document-yellow/20 border-l-4 border-document-yellow">
                TANGGAL
              </TableHead>
              <TableHead className="bg-document-yellow/20 border-l-4 border-document-yellow">
                NAMA
              </TableHead>
              {!isPublic && (
                <>
                  <TableHead className="bg-document-yellow/20 border-l-4 border-document-yellow">
                    NOMOR HP
                  </TableHead>
                  <TableHead className="bg-document-yellow/20 border-l-4 border-document-yellow">
                    EMAIL
                  </TableHead>
                  <TableHead className="bg-document-yellow/20 border-l-4 border-document-yellow">
                    ALAMAT
                  </TableHead>
                  <TableHead className="bg-document-yellow/20 border-l-4 border-document-yellow">
                    REGISTER
                  </TableHead>
                </>
              )}
              <TableHead className="bg-document-yellow/20 border-l-4 border-document-yellow">
                JENIS DOKUMEN
              </TableHead>
              <TableHead className="bg-document-yellow/20 border-l-4 border-document-yellow">
                STATUS
              </TableHead>
              <TableHead className="bg-document-yellow/20 border-l-4 border-document-yellow">
                KETERANGAN
              </TableHead>
              {!isPublic && (
                <>
                  <TableHead className="bg-document-green/20 border-l-4 border-document-green">
                    NAMA CS
                  </TableHead>
                  <TableHead className="bg-document-green/20 border-l-4 border-document-green">
                    NAMA OPERATOR
                  </TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow 
                key={doc.id} 
                className={`hover-elevate ${!isPublic ? 'cursor-pointer' : ''}`}
                onClick={() => !isPublic && onRowClick?.(doc)}
                data-testid={`row-document-${doc.id}`}
              >
                <TableCell className="border-l-4 border-document-yellow font-medium">
                  {doc.id}
                </TableCell>
                <TableCell className="border-l-4 border-document-yellow">
                  {doc.tanggal}
                </TableCell>
                <TableCell className="border-l-4 border-document-yellow">
                  {doc.nama}
                </TableCell>
                {!isPublic && (
                  <>
                    <TableCell className="border-l-4 border-document-yellow">
                      {doc.nomorHP}
                    </TableCell>
                    <TableCell className="border-l-4 border-document-yellow">
                      {doc.email}
                    </TableCell>
                    <TableCell className="border-l-4 border-document-yellow">
                      {doc.alamat}
                    </TableCell>
                    <TableCell className="border-l-4 border-document-yellow font-medium">
                      {doc.nomorRegister}
                    </TableCell>
                  </>
                )}
                <TableCell className="border-l-4 border-document-yellow">
                  {doc.jenisDokumen === 'DLL' && doc.keteranganDLL 
                    ? `DLL (${doc.keteranganDLL})` 
                    : doc.jenisDokumen}
                </TableCell>
                <TableCell className="border-l-4 border-document-yellow">
                  <StatusBadge status={doc.status} />
                </TableCell>
                <TableCell className="border-l-4 border-document-yellow">
                  {doc.keterangan}
                </TableCell>
                {!isPublic && (
                  <>
                    <TableCell className="border-l-4 border-document-green">
                      {doc.namaCS || '-'}
                    </TableCell>
                    <TableCell className="border-l-4 border-document-green">
                      {doc.namaOperator || '-'}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
