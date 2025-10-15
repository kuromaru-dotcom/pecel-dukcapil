import { useState } from 'react';
import UserManagementDialog from '../UserManagementDialog';
import { Button } from '@/components/ui/button';

export default function UserManagementDialogExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open User Management Dialog</Button>
      <UserManagementDialog
        open={open}
        onOpenChange={setOpen}
        onAddUser={(data) => {
          console.log('Add user:', data);
        }}
      />
    </div>
  );
}
