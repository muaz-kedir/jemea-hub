import { useState, useEffect } from "react";
import { useAuth, UserRole, UserProfile } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Shield, BookOpen, GraduationCap, Award } from "lucide-react";

export const UserManagement = () => {
  const { getAllUsers, assignRole, userProfile } = useAuth();
  const [users, setUsers] = useState<Array<UserProfile & { email: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setUpdating(userId);
      await assignRole(userId, newRole);
      toast.success("Role updated successfully!");
      await loadUsers(); // Reload users
    } catch (error) {
      toast.error("Failed to update role");
      console.error(error);
    } finally {
      setUpdating(null);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return <Shield className="w-4 h-4" />;
      case "librarian":
        return <BookOpen className="w-4 h-4" />;
      case "tutor":
        return <GraduationCap className="w-4 h-4" />;
      case "trainer":
        return <Award className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "bg-red-500";
      case "librarian":
        return "bg-blue-500";
      case "tutor":
        return "bg-green-500";
      case "trainer":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleCounts = () => {
    const counts = {
      librarian: users.filter(u => u.role === "librarian").length,
      tutor: users.filter(u => u.role === "tutor").length,
      trainer: users.filter(u => u.role === "trainer").length,
      super_admin: users.filter(u => u.role === "super_admin").length,
      student: users.filter(u => u.role === "student").length,
    };
    return counts;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  const roleCounts = getRoleCounts();

  return (
    <div className="space-y-6">
      {/* Role Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">Librarians</span>
          </div>
          <p className="text-2xl font-bold">{roleCounts.librarian}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">Tutors</span>
          </div>
          <p className="text-2xl font-bold">{roleCounts.tutor}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">Trainers</span>
          </div>
          <p className="text-2xl font-bold">{roleCounts.trainer}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">Admins</span>
          </div>
          <p className="text-2xl font-bold">{roleCounts.super_admin}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">Students</span>
          </div>
          <p className="text-2xl font-bold">{roleCounts.student}</p>
        </Card>
      </div>

      {/* Users List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Manage User Roles</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.uid}
              className="flex items-center justify-between p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 ${getRoleColor(user.role)} rounded-full flex items-center justify-center text-white`}>
                  {getRoleIcon(user.role)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.uid, value as UserRole)}
                  disabled={updating === user.uid || user.uid === userProfile?.uid}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="librarian">Librarian</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                {updating === user.uid && (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
