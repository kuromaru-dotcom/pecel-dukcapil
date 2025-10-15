import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileEdit } from "lucide-react";
import { Document } from "./DocumentTable";

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  userRole: 'cs' | 'operator' | 'superadmin';
  currentUserName?: string; // Username untuk check permission
  onEditDocument?: () => void;
  onDeleteDocument?: () => void;
  onUpdateStatus?: () => void;
}

export default function ActionDialog({
  open,
  onOpenChange,
  document,
  userRole,
  currentUserName,
  onEditDocument,
  onDeleteDocument,
  onUpdateStatus,
}: ActionDialogProps) {
  if (!document) return null;

  // Check permission: CS hanya bisa edit/delete dokumen yang dia buat sendiri
  // Super Admin bisa edit/delete semua dokumen
  const canEditDelete = userRole === 'superadmin' || 
                        (userRole === 'cs' && document.createdBy === currentUserName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih Aksi</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2">
          <div className="p-4 bg-muted/50 rounded-xl mb-4">
            <p className="text-sm text-muted-foreground">Dokumen</p>
            <p className="font-semibold">{document.nama}</p>
            <p className="text-sm text-muted-foreground">{document.jenisDokumen}</p>
          </div>

          {canEditDelete && (
            <Button
              variant="outline"
              className="w-full justify-start h-12 rounded-xl"
              onClick={() => {
                onEditDocument?.();
                onOpenChange(false);
              }}
              data-testid="button-action-edit"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Dokumen
            </Button>
          )}

          {(userRole === 'operator' || userRole === 'superadmin') && (
            <Button
              variant="outline"
              className="w-full justify-start h-12 rounded-xl"
              onClick={() => {
                onUpdateStatus?.();
                onOpenChange(false);
              }}
              data-testid="button-action-update-status"
            >
              <FileEdit className="w-4 h-4 mr-2" />
              Update Status
            </Button>
          )}

          {canEditDelete && (
            <Button
              variant="outline"
              className="w-full justify-start h-12 rounded-xl text-destructive hover:text-destructive"
              onClick={() => {
                onDeleteDocument?.();
                onOpenChange(false);
              }}
              data-testid="button-action-delete"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Dokumen
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
