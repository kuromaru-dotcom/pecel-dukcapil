import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { Document } from "./DocumentTable";
import logoKotamobagu from "@assets/logo-kotamobagu_1760671555998.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PrintReceiptProps {
  document: Document;
}

export default function PrintReceipt({ document }: PrintReceiptProps) {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrCodeRef.current) {
      // Generate QR code with application URL
      QRCode.toCanvas(
        qrCodeRef.current,
        'https://pecel-dukcapil.vercel.app/',
        {
          width: 120,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        },
        (error: Error | null | undefined) => {
          if (error) console.error('QR Code generation error:', error);
        }
      );
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      // Capture the receipt content as canvas
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Download PDF with filename based on register number
      pdf.save(`bukti-penerimaan-${document.nomorRegister}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    }
  };

  return (
    <div className="print:block">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
        }
      `}</style>

      <div ref={receiptRef} className="print-container max-w-4xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
          <div className="flex items-start gap-3">
            <img 
              src={logoKotamobagu} 
              alt="Logo Kotamobagu" 
              className="w-24 h-24 object-contain"
            />
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                PEMERINTAH KOTA KOTAMOBAGU
              </h1>
              <h2 className="text-base font-bold text-gray-900 leading-tight mt-1">
                DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL
              </h2>
              <p className="text-xs text-gray-700 leading-tight mt-1">
                Jl. Paloko- Kinalang No. 3 Kel. Kotobangon Kec. Kotamobagu Timur
              </p>
            </div>
          </div>
          <canvas ref={qrCodeRef} className="border-2 border-gray-200 rounded" />
        </div>

        {/* Receipt Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary mb-1">
            BUKTI PENERIMAAN DOKUMEN
          </h2>
          <p className="text-sm text-gray-600">
            Nomor Register: <span className="font-bold text-gray-900">{document.nomorRegister}</span>
          </p>
        </div>

        {/* Document Details */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6">
          <div className="flex">
            <span className="w-40 text-sm font-semibold text-gray-700">Tanggal Diterima</span>
            <span className="text-sm text-gray-900">
              : {format(new Date(document.tanggal), 'dd MMMM yyyy', { locale: localeId })}
            </span>
          </div>
          
          <div className="flex">
            <span className="w-40 text-sm font-semibold text-gray-700">Status</span>
            <span className="text-sm text-gray-900">: {document.status}</span>
          </div>

          <div className="flex">
            <span className="w-40 text-sm font-semibold text-gray-700">Nama Pemohon</span>
            <span className="text-sm text-gray-900">: {document.nama}</span>
          </div>

          <div className="flex">
            <span className="w-40 text-sm font-semibold text-gray-700">Nomor HP</span>
            <span className="text-sm text-gray-900">: {document.nomorHP}</span>
          </div>

          <div className="flex">
            <span className="w-40 text-sm font-semibold text-gray-700">Email</span>
            <span className="text-sm text-gray-900">: {document.email}</span>
          </div>

          <div className="flex">
            <span className="w-40 text-sm font-semibold text-gray-700">Kecamatan</span>
            <span className="text-sm text-gray-900">: {document.alamat}</span>
          </div>

          <div className="flex col-span-2">
            <span className="w-40 text-sm font-semibold text-gray-700">Jenis Dokumen</span>
            <span className="text-sm text-gray-900">
              : {document.jenisDokumen}
              {document.jenisDokumen === 'DLL' && document.keteranganDLL && 
                ` (${document.keteranganDLL})`
              }
            </span>
          </div>

          <div className="flex col-span-2">
            <span className="w-40 text-sm font-semibold text-gray-700">Keterangan</span>
            <span className="text-sm text-gray-900">: {document.keterangan}</span>
          </div>

          <div className="flex">
            <span className="w-40 text-sm font-semibold text-gray-700">Dilayani Oleh (CS)</span>
            <span className="text-sm text-gray-900">: {document.namaCS}</span>
          </div>

          {document.namaOperator && (
            <div className="flex">
              <span className="w-40 text-sm font-semibold text-gray-700">Diproses Oleh</span>
              <span className="text-sm text-gray-900">: {document.namaOperator}</span>
            </div>
          )}
        </div>

        {/* Important Notes */}
        <div className="bg-muted/30 border-l-4 border-primary p-4 mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-2">CATATAN PENTING:</h3>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Simpan bukti penerimaan ini dengan baik sebagai tanda bukti pengajuan dokumen</li>
            <li>• Gunakan Nomor Register untuk melacak status dokumen di Dashboard Publik</li>
            <li>• Scan QR Code untuk mengakses informasi dokumen secara online</li>
            <li>• Untuk informasi lebih lanjut, hubungi Customer Service Dukcapil Kotamobagu</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end border-t pt-4 mt-8">
          <div className="text-xs text-gray-600">
            <p>Dicetak pada: {format(new Date(), 'dd MMMM yyyy HH:mm', { locale: localeId })}</p>
            <p className="mt-1">PECEL DUKCAPIL - Sistem Pelacakan Dokumen</p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-12">Petugas,</p>
            <p className="text-sm font-bold text-gray-900 border-t border-gray-400 pt-1">
              {document.namaCS}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons (hidden on print) */}
      <div className="no-print flex justify-center gap-4 mt-6">
        <button
          onClick={handleDownloadPDF}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          data-testid="button-download-pdf"
        >
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          data-testid="button-print"
        >
          Cetak Bukti Penerimaan
        </button>
      </div>
    </div>
  );
}
