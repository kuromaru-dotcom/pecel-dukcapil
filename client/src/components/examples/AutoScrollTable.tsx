import AutoScrollTable from '../AutoScrollTable';

const mockDocs = [
  {
    id: 1,
    tanggal: '2025-01-10',
    nama: 'Ahmad Hidayat',
    jenisDokumen: 'KTP',
    status: 'DITERIMA' as const,
    keterangan: 'Lengkap',
  },
  {
    id: 2,
    tanggal: '2025-01-11',
    nama: 'Dewi Lestari',
    jenisDokumen: 'Akta Kelahiran',
    status: 'DITERIMA' as const,
    keterangan: 'Lengkap',
  },
  {
    id: 3,
    tanggal: '2025-01-12',
    nama: 'Budi Santoso',
    jenisDokumen: 'KK',
    status: 'DITERIMA' as const,
    keterangan: 'Lengkap',
  },
];

export default function AutoScrollTableExample() {
  return (
    <div className="p-6">
      <AutoScrollTable
        title="Dokumen DITERIMA"
        documents={mockDocs}
        statusColor="hsl(210 85% 55%)"
      />
    </div>
  );
}
