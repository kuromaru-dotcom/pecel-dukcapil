import DocumentTable from '../DocumentTable';

const mockDocuments = [
  {
    id: 1,
    tanggal: '2025-01-10',
    nama: 'Ahmad Hidayat',
    jenisDokumen: 'KTP',
    status: 'DITERIMA' as const,
    keterangan: 'Dokumen lengkap',
    namaCS: 'Siti Aminah',
    namaOperator: '',
  },
  {
    id: 2,
    tanggal: '2025-01-11',
    nama: 'Dewi Lestari',
    jenisDokumen: 'Akta Kelahiran',
    status: 'DIPROSES' as const,
    keterangan: 'Sedang verifikasi',
    namaCS: 'Budi Santoso',
    namaOperator: 'Rahmat Wijaya',
  },
  {
    id: 3,
    tanggal: '2025-01-12',
    nama: 'Eko Prasetyo',
    jenisDokumen: 'KK',
    status: 'DITUNDA' as const,
    keterangan: 'Dokumen tidak lengkap',
    namaCS: 'Siti Aminah',
    namaOperator: 'Rahmat Wijaya',
  },
];

export default function DocumentTableExample() {
  return (
    <div className="p-6">
      <DocumentTable 
        documents={mockDocuments}
        userRole="operator"
        onEdit={(doc) => console.log('Edit', doc)}
        onDelete={(doc) => console.log('Delete', doc)}
      />
    </div>
  );
}
