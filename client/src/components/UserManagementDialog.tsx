import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  role: string;
  // Note: password is not included in GET response for security
}

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserManagementDialog({ open, onOpenChange }: UserManagementDialogProps) {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'cs'
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: open,
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; role: string }) => {
      await apiRequest('POST', '/api/users', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowAddForm(false);
      setFormData({ username: '', password: '', role: 'cs' });
      toast({
        title: "Berhasil",
        description: "User berhasil ditambahkan",
      });
    },
    onError: () => {
      toast({
        title: "Gagal",
        description: "Gagal menambahkan user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: string; username: string; password?: string; role: string }) => {
      const { id, ...updateData } = data;
      // Only include password if it's not empty
      const payload = updateData.password ? updateData : { username: updateData.username, role: updateData.role };
      await apiRequest('PATCH', `/api/users/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditingUser(null);
      setFormData({ username: '', password: '', role: 'cs' });
      toast({
        title: "Berhasil",
        description: "User berhasil diperbarui",
      });
    },
    onError: () => {
      toast({
        title: "Gagal",
        description: "Gagal memperbarui user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Berhasil",
        description: "User berhasil dihapus",
      });
    },
    onError: () => {
      toast({
        title: "Gagal",
        description: "Gagal menghapus user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        ...formData,
      });
    } else {
      addUserMutation.mutate(formData);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't pre-fill password for security
      role: user.role,
    });
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'cs' });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'default';
      case 'operator':
        return 'secondary';
      case 'cs':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'operator':
        return 'Operator';
      case 'cs':
        return 'CS';
      default:
        return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-user-management">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Kelola User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showAddForm && (
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="gap-2"
                data-testid="button-add-user"
              >
                <Plus className="w-4 h-4" />
                Tambah User Baru
              </Button>
            </div>
          )}

          {showAddForm && (
            <div className="border rounded-2xl p-4 bg-muted/30 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{editingUser ? 'Edit User' : 'Tambah User Baru'}</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCancelForm}
                  data-testid="button-cancel-form"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Masukkan username"
                      required
                      data-testid="input-username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password {editingUser && <span className="text-muted-foreground text-xs">(kosongkan jika tidak diubah)</span>}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Masukkan password"
                      required={!editingUser}
                      data-testid="input-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role User</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger id="role" data-testid="select-role">
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cs">CS</SelectItem>
                        <SelectItem value="operator">Operator</SelectItem>
                        <SelectItem value="superadmin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelForm}
                    data-testid="button-cancel-submit"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addUserMutation.isPending || updateUserMutation.isPending}
                    data-testid="button-submit-user"
                  >
                    {editingUser ? 'Update User' : 'Tambah User'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="border rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Belum ada user. Klik "Tambah User Baru" untuk menambahkan user.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium" data-testid={`text-username-${user.id}`}>
                        {user.username}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} data-testid={`badge-role-${user.id}`}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(user)}
                            data-testid={`button-edit-${user.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              if (confirm(`Hapus user "${user.username}"?`)) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                            data-testid={`button-delete-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
