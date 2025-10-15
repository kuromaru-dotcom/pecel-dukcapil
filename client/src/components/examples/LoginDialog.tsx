import { useState } from 'react';
import LoginDialog from '../LoginDialog';
import { Button } from '@/components/ui/button';

export default function LoginDialogExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Login Dialog</Button>
      <LoginDialog
        open={open}
        onOpenChange={setOpen}
        onLogin={(username, password, role) => {
          console.log('Login:', username, role);
          setOpen(false);
        }}
      />
    </div>
  );
}
