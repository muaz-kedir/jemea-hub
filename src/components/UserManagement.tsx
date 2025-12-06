import { useState, useEffect } from "react";
import { useAuth, UserRole, UserProfile } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Shield, BookOpen, GraduationCap, Award, Search, RefreshCw } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

type UserWithRole = UserProfile & { email: string };

export const UserManagement = () => {
  const { userProfile, user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Real-time listener for users - combines users and user_roles collections
  useEffect(() => {
    if (!user || userProfile?.role !== "super_admin") return;

    setLoading(true);

    // Listen to both collections and merge data
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (usersSnapshot) => {
        // Also listen to user_roles
        const unsubRoles = onSnapshot(
          collection(db, "user_roles"),
          (rolesSnapshot) => {
            // Create maps for both collections
            const usersMap = new Map<string, any>();
            const rolesMap = new Map<string, string>();

            // Process users collection
            usersSnapshot.docs.forEach(doc => {
              usersMap.set(doc.id, doc.data());
            });

            // Process user_roles collection
            rolesSnapshot.docs.forEach(doc => {
              rolesMap.set(doc.id, doc.data().role || "student");
            });

            // Merge: include all users from both collections
            const allUserIds = new Set([...usersMap.keys(), ...rolesMap.keys()]);
            
            const usersData: UserWithRole[] = Array.from(allUserIds).map(uid => {
              const userData = usersMap.get(uid) || {};
              const role = rolesMap.get(uid) || "student";
              
              return {
                uid,
                email: userData.email || "",
                role: role as UserRole,
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                department: userData.department,
                year: userData.year,
              };
            });

            // Sort by name/email
            usersData.sort((a, b) => {
              const nameA = a.firstName || a.email;
              const nameB = b.firstName || b.email;
              return nameA.localeCompare(nameB);
            });

            setUsers(usersData);
            setLoading(false);
          },
          (error) => {
            console.error("Error listening to user_roles:", error);
            setLoading(false);
          }
        );

        return () => unsubRoles();
      },
      (error) => {
        console.error("Error listening to users:", error);
        toast.error("Failed to load users");
        setLoading(false);
      }
    );

    return () => unsubscribeUsers();
  }, [user, userProfile?.role]);


  // Refresh users manually
  const refreshUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await new Promise<UserWithRole[]>((resolve) => {
        const unsub = onSnapshot(collection(db, "users"), async (snap) => {
          const rolesMap = new Map<string, string>();
          const rolesSnap = await new Promise<any>((res) => {
            const unsubR = onSnapshot(collection(db, "user_roles"), (r) => {
              res(r);
              unsubR();
            });
          });
          rolesSnap.docs.forEach((d: any) => rolesMap.set(d.id, d.data().role));
          
          const data = snap.docs.map(doc => ({
            uid: doc.id,
            email: doc.data().email || "",
            role: (rolesMap.get(doc.id) || "student") as UserRole,
            firstName: doc.data().firstName || "",
            lastName: doc.data().lastName || "",
          }));
          resolve(data);
          unsub();
        });
      });
      setUsers(usersSnapshot);
      toast.success("Users refreshed");
    } catch (error) {
      toast.error("Failed to refresh users");
    } finally {
      setLoading(false);
    }
  };

  // Handle role change with immediate UI update
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!user || userProfile?.role !== "super_admin") {
      toast.error("Only super_admin can assign roles");
      return;
    }

    try {
      setUpdating(userId);
      
      // Update role in Firestore
      await setDoc(doc(db, "user_roles", userId), {
        userId,
        role: newRole,
        assignedAt: new Date(),
        assignedBy: user.uid
      });

      // Also update the role field in users collection for consistency
      await setDoc(doc(db, "users", userId), { role: newRole }, { merge: true });

      // Immediately update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.uid === userId ? { ...u, role: newRole } : u
        )
      );

      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return <Shield className="w-4 h-4" />;
      case "librarian":
      case "library_admin":
        return <BookOpen className="w-4 h-4" />;
      case "tutor":
      case "tutorial_admin":
        return <GraduationCap className="w-4 h-4" />;
      case "trainer":
      case "training_admin":
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
      case "library_admin":
        return "bg-blue-500";
      case "tutor":
      case "tutorial_admin":
        return "bg-green-500";
      case "trainer":
      case "training_admin":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // Filter users by search query
  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return (
      fullName.includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  });

  // Group users by role
  const groupedUsers = {
    librarians: filteredUsers.filter(u => u.role === "librarian" || u.role === "library_admin"),
    tutors: filteredUsers.filter(u => u.role === "tutor" || u.role === "tutorial_admin"),
    trainers: filteredUsers.filter(u => u.role === "trainer" || u.role === "training_admin"),
    admins: filteredUsers.filter(u => u.role === "super_admin"),
    students: filteredUsers.filter(u => u.role === "student"),
  };

  const getRoleCounts = () => ({
    librarian: users.filter(u => u.role === "librarian" || u.role === "library_admin").length,
    tutor: users.filter(u => u.role === "tutor" || u.role === "tutorial_admin").length,
    trainer: users.filter(u => u.role === "trainer" || u.role === "training_admin").length,
    super_admin: users.filter(u => u.role === "super_admin").length,
    student: users.filter(u => u.role === "student").length,
  });

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

  const UserCard = ({ user: u }: { user: UserWithRole }) => (
    <div
      key={u.uid}
      className="flex items-center justify-between p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-10 h-10 ${getRoleColor(u.role)} rounded-full flex items-center justify-center text-white`}>
          {getRoleIcon(u.role)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {u.firstName && u.lastName 
              ? `${u.firstName} ${u.lastName}` 
              : u.email.split('@')[0]}
          </p>
          <p className="text-sm text-muted-foreground truncate">{u.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={u.role}
          onValueChange={(value) => handleRoleChange(u.uid, value as UserRole)}
          disabled={updating === u.uid || u.uid === userProfile?.uid}
        >
          <SelectTrigger className="w-[140px]">
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
        {updating === u.uid && (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
    </div>
  );

  const UserSection = ({ title, icon: Icon, color, users: sectionUsers }: { 
    title: string; 
    icon: any; 
    color: string; 
    users: UserWithRole[] 
  }) => {
    if (sectionUsers.length === 0) return null;
    
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">({sectionUsers.length})</span>
        </div>
        <div className="space-y-2">
          {sectionUsers.map(u => <UserCard key={u.uid} user={u} />)}
        </div>
      </div>
    );
  };

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

      {/* Search and Users List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Manage User Roles</h2>
          <Button variant="outline" size="sm" onClick={refreshUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        {/* No Results */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search term
              </p>
            )}
          </div>
        )}

        {/* Grouped User Sections */}
        <div className="space-y-2">
          <UserSection title="Admins" icon={Shield} color="bg-red-500" users={groupedUsers.admins} />
          <UserSection title="Librarians" icon={BookOpen} color="bg-blue-500" users={groupedUsers.librarians} />
          <UserSection title="Tutors" icon={GraduationCap} color="bg-green-500" users={groupedUsers.tutors} />
          <UserSection title="Trainers" icon={Award} color="bg-purple-500" users={groupedUsers.trainers} />
          <UserSection title="Students" icon={Users} color="bg-gray-500" users={groupedUsers.students} />
        </div>

        {/* Total Count */}
        <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
          Total: {users.length} users | Showing: {filteredUsers.length} users
        </div>
      </Card>
    </div>
  );
};
