import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

import {
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { db } from "@/lib/firebase";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

interface TutorialSession {
  id: string;
  title: string;
  tutor: string;
  subject: string;
  description: string;
  schedule: string;
  duration: number; // in minutes
  maxStudents: number;
  enrolledStudents: number;
  location: string;
  deliveryMode?: "online" | "in-person";
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  imageUrl?: string;
  createdAt: any;
}

interface TutorialRegistrationRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentId?: string;
  department?: string;
  batch?: string;
  motivation?: string | null;
  registeredAt?: any;
}

const formatDateTime = (value: any) => {
  if (!value) return "N/A";
  try {
    if (typeof value === "string") {
      return new Date(value).toLocaleString();
    }
    if (value.toDate) {
      return value.toDate().toLocaleString();
    }
  } catch (error) {
    console.warn("Unable to format date", error);
  }
  return String(value);
};

const TutorialAdminDashboard = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<TutorialSession[]>([]);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [editingSession, setEditingSession] = useState<TutorialSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<{
    title: string;
    tutor: string;
    subject: string;
    description: string;
    schedule: string;
    duration: string;
    maxStudents: string;
    enrolledStudents: string;
    location: string;
    deliveryMode: "online" | "in-person";
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
  }>({
    title: "",
    tutor: "",
    subject: "",
    description: "",
    schedule: "",
    duration: "60",
    maxStudents: "30",
    enrolledStudents: "0",
    location: "",
    deliveryMode: "in-person",
    status: "upcoming",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [registrationsOpen, setRegistrationsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TutorialSession | null>(null);
  const [registrations, setRegistrations] = useState<TutorialRegistrationRecord[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tutorial_sessions"));
      const sessionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TutorialSession[];
      setSessions(sessionsData);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load tutorial sessions",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = editingSession?.imageUrl || "";
      
      const sessionData: any = {
        title: formData.title,
        tutor: formData.tutor,
        subject: formData.subject,
        description: formData.description,
        schedule: formData.schedule,
        duration: parseInt(formData.duration),
        maxStudents: parseInt(formData.maxStudents),
        enrolledStudents: parseInt(formData.enrolledStudents),
        location: formData.location,
        deliveryMode: formData.deliveryMode,
        status: formData.status,
        createdAt: Timestamp.now(),
      };

      // Upload image first if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        sessionData.imageUrl = imageUrl;
      }

      if (editingSession) {
        await updateDoc(doc(db, "tutorial_sessions", editingSession.id), sessionData);
        toast({
          title: "Success",
          description: "Session updated successfully",
        });
      } else {
        await addDoc(collection(db, "tutorial_sessions"), sessionData);
        toast({
          title: "Success",
          description: "Session created successfully",
        });
      }

      resetForm();
      loadSessions();
    } catch (error) {
      console.error("Error saving session:", error);
      toast({
        title: "Error",
        description: "Failed to save session",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    
    try {
      await deleteDoc(doc(db, "tutorial_sessions", id));
      toast({
        title: "Success",
        description: "Session deleted successfully",
      });
      loadSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (session: TutorialSession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      tutor: session.tutor,
      subject: session.subject,
      description: session.description,
      schedule: session.schedule,
      duration: session.duration.toString(),
      maxStudents: session.maxStudents.toString(),
      enrolledStudents: session.enrolledStudents.toString(),
      location: session.location,
      deliveryMode: session.deliveryMode || "in-person",
      status: session.status,
    });
    setImagePreview(session.imageUrl || null);
    setImageFile(null);
    setIsAddingSession(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      tutor: "",
      subject: "",
      description: "",
      schedule: "",
      duration: "60",
      maxStudents: "30",
      enrolledStudents: "0",
      location: "",
      deliveryMode: "in-person",
      status: "upcoming",
    });
    setImageFile(null);
    setImagePreview(null);
    setIsAddingSession(false);
    setEditingSession(null);
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.tutor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalSessions: sessions.length,
    upcomingSessions: sessions.filter(s => s.status === "upcoming").length,
    ongoingSessions: sessions.filter(s => s.status === "ongoing").length,
    completedSessions: sessions.filter(s => s.status === "completed").length,
    totalEnrolled: sessions.reduce((sum, s) => sum + (s.enrolledStudents ?? 0), 0),
  };

  const openRegistrations = async (session: TutorialSession) => {
    setSelectedSession(session);
    setRegistrationsOpen(true);
    setRegistrations([]);
    setRegistrationsLoading(true);
    try {
      const registrationsSnapshot = await getDocs(
        collection(db, "tutorial_sessions", session.id, "registrations")
      );
      const registrationData = registrationsSnapshot.docs.map((doc): TutorialRegistrationRecord => {
        const data = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          studentId: data.studentId,
          department: data.department,
          batch: data.batch,
          motivation: data.motivation ?? null,
          registeredAt: data.registeredAt,
        };
      });
      setRegistrations(registrationData);
    } catch (error) {
      console.error("Error loading registrations:", error);
      toast({
        title: "Error",
        description: "Failed to load registered students",
        variant: "destructive",
      });
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
      case "ongoing": return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "completed": return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
      case "cancelled": return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tutorial Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage tutoring sessions and schedules</p>
          </div>
          <Button onClick={() => setIsAddingSession(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Session
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcomingSessions}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEnrolled}</p>
                <p className="text-xs text-muted-foreground">Enrolled</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedSessions}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {isAddingSession && (
          <Card className="p-6 border-0 shadow-md">
            <h2 className="text-lg font-bold mb-4">
              {editingSession ? "Edit Session" : "Create New Session"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Session Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Advanced Mathematics Tutorial"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tutor">Tutor Name *</Label>
                  <Input
                    id="tutor"
                    value={formData.tutor}
                    onChange={(e) => setFormData({ ...formData, tutor: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Mathematics, Physics"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Session details and objectives..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule">Schedule *</Label>
                  <Input
                    id="schedule"
                    type="datetime-local"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={
                    formData.deliveryMode === "online"
                      ? "e.g., Zoom or Google Meet link"
                      : "e.g., Room 101, Main Campus"
                  }
                  required
                />
              </div>

              <div>
                <Label>Delivery Mode *</Label>
                <RadioGroup
                  value={formData.deliveryMode}
                  onValueChange={(value: "online" | "in-person") =>
                    setFormData({ ...formData, deliveryMode: value })
                  }
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <div className="flex items-center gap-3 rounded-md border p-3 transition hover:border-primary">
                    <RadioGroupItem value="in-person" id="delivery-in-person" />
                    <label htmlFor="delivery-in-person" className="text-sm font-medium cursor-pointer">
                      In-person (Training Center)
                    </label>
                  </div>
                  <div className="flex items-center gap-3 rounded-md border p-3 transition hover:border-primary">
                    <RadioGroupItem value="online" id="delivery-online" />
                    <label htmlFor="delivery-online" className="text-sm font-medium cursor-pointer">
                      Online (Google Meet/Zoom)
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxStudents">Max Students *</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min="1"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="enrolledStudents">Enrolled Students</Label>
                  <Input
                    id="enrolledStudents"
                    type="number"
                    min="0"
                    value={formData.enrolledStudents}
                    onChange={(e) => setFormData({ ...formData, enrolledStudents: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <Label htmlFor="image">Session Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={uploading}>
                  {uploading ? "Uploading..." : (editingSession ? "Update Session" : "Create Session")}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={uploading}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Tutorial Sessions ({filteredSessions.length})</h2>
          {filteredSessions.map((session) => (
            <Card key={session.id} className="p-4 border-0 shadow-md">
              {session.imageUrl && (
                <img 
                  src={session.imageUrl} 
                  alt={session.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{session.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Tutor:</strong> {session.tutor} | <strong>Subject:</strong> {session.subject}
                  </p>
                  {session.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {session.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(session.schedule).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{session.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{session.enrolledStudents}/{session.maxStudents} students</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Location:</strong> {session.location}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Delivery:</strong> {session.deliveryMode === "online" ? "Online (Google Meet/Zoom)" : "In-person"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openRegistrations(session)}
                  >
                    View Registrations
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(session)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(session.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filteredSessions.length === 0 && (
            <Card className="p-8 border-0 shadow-md text-center">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? "No sessions found matching your search" : "No sessions created yet"}
              </p>
            </Card>
          )}
        </div>
      </div>

      <Dialog
        open={registrationsOpen}
        onOpenChange={(open) => {
          setRegistrationsOpen(open);
          if (!open) {
            setSelectedSession(null);
            setRegistrations([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registered Students</DialogTitle>
            <DialogDescription>
              {selectedSession ? selectedSession.title : "Select a session to view registrations"}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-80 pr-4">
            {registrationsLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading registrations...
              </div>
            ) : registrations.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No students have registered yet.
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((participant) => (
                  <Card key={participant.id} className="p-4 border-0 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm">{participant.fullName}</p>
                        <p className="text-sm text-muted-foreground">{participant.email}</p>
                        <p className="text-sm text-muted-foreground">{participant.phone}</p>
                        <div className="mt-2 grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <span><strong>ID:</strong> {participant.studentId || "N/A"}</span>
                          <span><strong>Dept:</strong> {participant.department || "N/A"}</span>
                          <span><strong>Batch:</strong> {participant.batch || "N/A"}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {participant.registeredAt ? formatDateTime(participant.registeredAt) : ""}
                      </span>
                    </div>
                    {participant.motivation ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        "{participant.motivation}"
                      </p>
                    ) : null}
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setRegistrationsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default TutorialAdminDashboard;
