// Utility functions for generating register numbers

// Mapping dokumen ke kode
const DOCUMENT_CODES: Record<string, string> = {
  'KTP': '001',
  'KIA': '002',
  'Kartu Keluarga': '003',
  'Pindah Keluar': '004',
  'Pindah Datang': '005',
  'Akte Lahir': '006',
  'Akte Kematian': '007',
  'Akte Kawin': '008',
  'Akte Cerai': '009',
  'DLL': '010',
};

// Convert month number to Roman numeral
const ROMAN_MONTHS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
  12: 'XII',
};

export function getDocumentCode(jenisDokumen: string): string {
  return DOCUMENT_CODES[jenisDokumen] || '010'; // Default to DLL code
}

export function getRomanMonth(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth() + 1; // getMonth() returns 0-11
  return ROMAN_MONTHS[month] || 'I';
}

export function generateRegisterNumber(
  sequence: number,
  jenisDokumen: string,
  tanggal: string
): string {
  const sequenceStr = sequence.toString().padStart(4, '0');
  const docCode = getDocumentCode(jenisDokumen);
  const romanMonth = getRomanMonth(tanggal);
  const year = new Date(tanggal).getFullYear();
  
  return `${sequenceStr}/${docCode}/${romanMonth}/${year}`;
}

// Get next sequence number from existing documents
export function getNextSequenceNumber(existingDocuments: Array<{ nomorRegister: string }>): number {
  if (existingDocuments.length === 0) return 1;
  
  // Extract sequence numbers from existing register numbers
  const sequences = existingDocuments
    .map(doc => {
      const parts = doc.nomorRegister.split('/');
      return parseInt(parts[0], 10);
    })
    .filter(num => !isNaN(num));
  
  if (sequences.length === 0) return 1;
  
  return Math.max(...sequences) + 1;
}
