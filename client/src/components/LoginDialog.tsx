import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (username: string, role: string) => void;
}

export default function LoginDialog({ open, onOpenChange, onLogin }: LoginDialogProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(''); // Clear previous error

    try {
      const res = await apiRequest(
        'POST', 
        '/api/auth/login', 
        { username, password }
      );
      
      const data = await res.json() as { id: string; username: string; role: string };
      
      // Login successful
      onLogin(data.username, data.role);
      setUsername('');
      setPassword('');
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${data.username}!`,
      });
    } catch (error: any) {
      // Login failed - show user-friendly error message
      setErrorMessage("Username atau password yang Anda masukkan salah. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-login">
        <DialogHeader>
          <DialogTitle>Login Sistem</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div 
              className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl"
              data-testid="error-login"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">
                {errorMessage}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrorMessage(''); // Clear error when user types
              }}
              placeholder="Masukkan username"
              required
              data-testid="input-username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(''); // Clear error when user types
              }}
              placeholder="Masukkan password"
              required
              data-testid="input-password"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            data-testid="button-submit-login"
          >
            {isLoading ? "Memproses..." : "Login"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
