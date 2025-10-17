import { useState } from 'react';
import UpdateStatusDialog from '../UpdateStatusDialog';
import { Button } from '@/components/ui/button';

export default function UpdateStatusDialogExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Update Status Dialog</Button>
      <UpdateStatusDialog
        open={open}
        onOpenChange={setOpen}
        documentId={1}
        currentStatus="DITERIMA"
        onUpdate={(status, keterangan) => {
          console.log('Update:', status, keterangan);
        }}
      />
    </div>
  );
}
