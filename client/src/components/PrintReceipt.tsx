import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { Document } from "./DocumentTable";
import logoKotamobagu from "@assets/logo-kotamobagu.png";

interface PrintReceiptProps {
  document: Document;
}

export default function PrintReceipt({ document }: PrintReceiptProps) {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrCodeRef.current) {
      // Generate QR code with nomor register
      QRCode.toCanvas(
        qrCodeRef.current,
        document.nomorRegister,
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
  }, [document.nomorRegister]);

  const handlePrint = () => {
    window.print();
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

      <div className="print-container max-w-4xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-primary pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img 
              src={logoKotamobagu} 
              alt="Logo Kotamobagu" 
              className="w-20 h-20 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL
              </h1>
              <p className="text-sm text-gray-600">KOTA KOTAMOBAGU</p>
              <p className="text-xs text-gray-500">
                Jl. Jend. Sudirman No. 1, Kotamobagu, Sulawesi Utara
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
        <div className="bg-warm-50 border-l-4 border-primary p-4 mb-6">
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

      {/* Print Button (hidden on print) */}
      <div className="no-print flex justify-center mt-6">
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
