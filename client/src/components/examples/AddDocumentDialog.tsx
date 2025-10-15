import { useState } from 'react';
import AddDocumentDialog from '../AddDocumentDialog';
import { Button } from '@/components/ui/button';

export default function AddDocumentDialogExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Add Document Dialog</Button>
      <AddDocumentDialog
        open={open}
        onOpenChange={setOpen}
        onAdd={(data) => {
          console.log('Add document:', data);
        }}
      />
    </div>
  );
}
