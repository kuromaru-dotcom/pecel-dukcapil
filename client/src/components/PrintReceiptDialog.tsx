import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Document } from "./DocumentTable";
import PrintReceipt from "./PrintReceipt";

interface PrintReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export default function PrintReceiptDialog({ open, onOpenChange, document }: PrintReceiptDialogProps) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bukti Penerimaan Dokumen</DialogTitle>
        </DialogHeader>
        <PrintReceipt document={document} />
      </DialogContent>
    </Dialog>
  );
}
