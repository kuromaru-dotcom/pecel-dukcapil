import { db } from "./db";
import { users as usersTable, documents as documentsTable } from "@shared/schema";
import { hashPassword } from "./auth";
import { generateRegisterNumber } from "./registerUtils";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    const existingUsers = await db.query.users.findMany();
    if (existingUsers.length > 0) {
      console.log('[SEED] Database already has data, skipping seed');
      return;
    }

    console.log('[SEED] Seeding database with initial data...');

    const usersData = [
      { username: 'Siti Aminah', password: await hashPassword('siti123'), role: 'cs' },
      { username: 'Rina Melati', password: await hashPassword('rina123'), role: 'cs' },
      { username: 'Andi Wijaya', password: await hashPassword('andi123'), role: 'operator' },
      { username: 'Budi Hartono', password: await hashPassword('budi123'), role: 'operator' },
      { username: 'Admin Dukcapil', password: await hashPassword('admin123'), role: 'superadmin' },
    ];

    const insertedUsers = await db.insert(usersTable).values(usersData).returning();
    console.log(`[SEED] Inserted ${insertedUsers.length} users`);

    const csUser1 = insertedUsers.find(u => u.username === 'Siti Aminah');
    const csUser2 = insertedUsers.find(u => u.username === 'Rina Melati');

    if (!csUser1 || !csUser2) {
      console.error('[SEED] Failed to find CS users for document seeding');
      return;
    }

    const today = new Date();
    const formatDate = (daysAgo: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const documentsData = [
      {
        tanggal: formatDate(0),
        nama: 'Ahmad Fauzi',
        nomorHP: '081234567890',
        email: 'ahmad.fauzi@gmail.com',
        alamat: 'Kotamobagu Utara',
        jenisDokumen: 'KTP',
        status: 'DITERIMA',
        keterangan: 'Menunggu Diproses',
        namaCS: csUser1.username,
        namaOperator: '',
        createdBy: csUser1.id,
      },
      {
        tanggal: formatDate(1),
        nama: 'Maria Tangkudung',
        nomorHP: '082345678901',
        email: 'maria.t@gmail.com',
        alamat: 'Kotamobagu Selatan',
        jenisDokumen: 'Kartu Keluarga',
        status: 'DIPROSES',
        keterangan: 'Sedang diverifikasi data',
        namaCS: csUser1.username,
        namaOperator: 'Andi Wijaya',
        createdBy: csUser1.id,
      },
      {
        tanggal: formatDate(2),
        nama: 'Stefanus Runtuwene',
        nomorHP: '085678901234',
        email: 'stef.runtuwene@yahoo.com',
        alamat: 'Kotamobagu Barat',
        jenisDokumen: 'Akte Lahir',
        status: 'SELESAI',
        keterangan: 'Dokumen selesai',
        namaCS: csUser2.username,
        namaOperator: 'Budi Hartono',
        createdBy: csUser2.id,
      },
      {
        tanggal: formatDate(3),
        nama: 'Ni Wayan Suartini',
        nomorHP: '087890123456',
        email: 'wayan.suartini@gmail.com',
        alamat: 'Kotamobagu Timur',
        jenisDokumen: 'KIA',
        status: 'DITUNDA',
        keterangan: 'Dokumen pendukung belum lengkap',
        namaCS: csUser2.username,
        namaOperator: 'Andi Wijaya',
        createdBy: csUser2.id,
      },
      {
        tanggal: formatDate(4),
        nama: 'Yusuf Mokodompit',
        nomorHP: '081290876543',
        email: 'yusuf.moko@gmail.com',
        alamat: 'Kotamobagu Utara',
        jenisDokumen: 'Pindah Keluar',
        status: 'SELESAI',
        keterangan: 'Dokumen selesai',
        namaCS: csUser1.username,
        namaOperator: 'Budi Hartono',
        createdBy: csUser1.id,
      },
      {
        tanggal: formatDate(1),
        nama: 'Dewi Lestari Mamonto',
        nomorHP: '089012345678',
        email: 'dewi.mamonto@gmail.com',
        alamat: 'Kotamobagu Selatan',
        jenisDokumen: 'Akte Kawin',
        status: 'DIPROSES',
        keterangan: 'Sedang diproses operator',
        namaCS: csUser1.username,
        namaOperator: 'Andi Wijaya',
        createdBy: csUser1.id,
      },
      {
        tanggal: formatDate(5),
        nama: 'Rivaldo Tumewu',
        nomorHP: '081345678901',
        email: 'rivaldo.t@yahoo.com',
        alamat: 'Kotamobagu Barat',
        jenisDokumen: 'Pindah Datang',
        status: 'SELESAI',
        keterangan: 'Dokumen selesai',
        namaCS: csUser2.username,
        namaOperator: 'Budi Hartono',
        createdBy: csUser2.id,
      },
      {
        tanggal: formatDate(0),
        nama: 'Salsabila Moha',
        nomorHP: '082456789012',
        email: 'salsa.moha@gmail.com',
        alamat: 'Kotamobagu Timur',
        jenisDokumen: 'KTP',
        status: 'DITERIMA',
        keterangan: 'Menunggu Diproses',
        namaCS: csUser2.username,
        namaOperator: '',
        createdBy: csUser2.id,
      },
    ];

    for (const docData of documentsData) {
      const tempRegister = `TEMP-${Math.random().toString(36).substring(7)}`;
      const [doc] = await db.insert(documentsTable).values({
        ...docData,
        nomorRegister: tempRegister,
      }).returning();

      const nomorRegister = generateRegisterNumber(doc.id, docData.jenisDokumen, docData.tanggal);
      await db.update(documentsTable).set({ nomorRegister }).where(eq(documentsTable.id, doc.id));
    }

    console.log(`[SEED] Inserted ${documentsData.length} documents`);
    console.log('[SEED] Database seeding complete!');
  } catch (error) {
    console.error('[SEED] Error seeding database:', error);
  }
}
