import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  Clock,
  Search,
  TrendingUp
} from "lucide-react";
import { TrainingAnalytics } from "@/components/TrainingAnalytics";
import { db } from "@/lib/firebase";
import { notifyNewTraining, notifyTrainingUpdate } from "@/services/notificationService";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  Timestamp 
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface Training {
  id: string;
  title: string;
  trainer: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number; // in hours
  maxParticipants: number;
  enrolledParticipants: number;
  location: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "upcoming" | "active" | "completed" | "cancelled";
  deliveryMode?: "online" | "in-person";
  imageUrl?: string;
  createdAt: any;
}

interface TrainingRegistrationRecord {
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

const TrainingAdminDashboard = () => {
  const { toast } = useToast();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isAddingTraining, setIsAddingTraining] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<{
    title: string;
    trainer: string;
    category: string;
    description: string;
    startDate: string;
    endDate: string;
    duration: string;
    maxParticipants: string;
    enrolledParticipants: string;
    location: string;
    level: "beginner" | "intermediate" | "advanced";
    status: "upcoming" | "active" | "completed" | "cancelled";
    deliveryMode: "online" | "in-person";
  }>({
    title: "",
    trainer: "",
    category: "",
    description: "",
    startDate: "",
    endDate: "",
    duration: "40",
    maxParticipants: "50",
    enrolledParticipants: "0",
    location: "",
    level: "beginner",
    status: "upcoming",
    deliveryMode: "in-person",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [registrationsOpen, setRegistrationsOpen] = useState(false);
  const [selectedTrainingRegistrations, setSelectedTrainingRegistrations] = useState<Training | null>(null);
  const [registrations, setRegistrations] = useState<TrainingRegistrationRecord[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "trainings"));
      const trainingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Training[];
      setTrainings(trainingsData);
    } catch (error) {
      console.error("Error loading trainings:", error);
      toast({
        title: "Error",
        description: "Failed to load training programs",
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
      let imageUrl = editingTraining?.imageUrl || "";
      
      const trainingData: any = {
        title: formData.title,
        trainer: formData.trainer,
        category: formData.category,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: parseInt(formData.duration),
        maxParticipants: parseInt(formData.maxParticipants),
        enrolledParticipants: parseInt(formData.enrolledParticipants),
        location: formData.location,
        level: formData.level,
        status: formData.status,
        deliveryMode: formData.deliveryMode,
        createdAt: Timestamp.now(),
      };

      // Upload image first if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        trainingData.imageUrl = imageUrl;
      }

      if (editingTraining) {
        await updateDoc(doc(db, "trainings", editingTraining.id), trainingData);
        // Send notification for training update
        await notifyTrainingUpdate(formData.title).catch(console.error);
        toast({
          title: "Success",
          description: "Training program updated successfully",
        });
      } else {
        await addDoc(collection(db, "trainings"), trainingData);
        // Send notification for new training
        await notifyNewTraining(formData.title).catch(console.error);
        toast({
          title: "Success",
          description: "Training program created successfully",
        });
      }

      resetForm();
      loadTrainings();
    } catch (error) {
      console.error("Error saving training:", error);
      toast({
        title: "Error",
        description: "Failed to save training program",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this training program?")) return;
    
    try {
      await deleteDoc(doc(db, "trainings", id));
      toast({
        title: "Success",
        description: "Training program deleted successfully",
      });
      loadTrainings();
    } catch (error) {
      console.error("Error deleting training:", error);
      toast({
        title: "Error",
        description: "Failed to delete training program",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    setFormData({
      title: training.title,
      trainer: training.trainer,
      category: training.category,
      description: training.description,
      startDate: training.startDate,
      endDate: training.endDate,
      duration: training.duration.toString(),
      maxParticipants: training.maxParticipants.toString(),
      enrolledParticipants: training.enrolledParticipants.toString(),
      location: training.location,
      level: training.level,
      status: training.status,
      deliveryMode: training.deliveryMode || "in-person",
    });
    setImagePreview(training.imageUrl || null);
    setImageFile(null);
    setIsAddingTraining(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      trainer: "",
      category: "",
      description: "",
      startDate: "",
      endDate: "",
      duration: "40",
      maxParticipants: "50",
      enrolledParticipants: "0",
      location: "",
      level: "beginner",
      status: "upcoming",
      deliveryMode: "in-person",
    });
    setImageFile(null);
    setImagePreview(null);
    setIsAddingTraining(false);
    setEditingTraining(null);
  };

  const filteredTrainings = trainings.filter(training =>
    training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    training.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    training.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openRegistrations = async (training: Training) => {
    setSelectedTrainingRegistrations(training);
    setRegistrationsOpen(true);
    setRegistrations([]);
    setRegistrationsLoading(true);
    try {
      const registrationsSnapshot = await getDocs(
        collection(db, "trainings", training.id, "registrations")
      );
      const registrationData = registrationsSnapshot.docs.map((doc): TrainingRegistrationRecord => {
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
        description: "Failed to load registered participants",
        variant: "destructive",
      });
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const stats = {
    totalTrainings: trainings.length,
    upcomingTrainings: trainings.filter(t => t.status === "upcoming").length,
    activeTrainings: trainings.filter(t => t.status === "active").length,
    completedTrainings: trainings.filter(t => t.status === "completed").length,
    totalParticipants: trainings.reduce((sum, t) => sum + t.enrolledParticipants, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
      case "active": return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "completed": return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
      case "cancelled": return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "intermediate": return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
      case "advanced": return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Training Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage training programs and participants</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                const { notifyNewTraining } = await import("@/services/notificationService");
                await notifyNewTraining("Test Training Notification");
                toast({ title: "Test notification sent!" });
              }}
              className="gap-2"
            >
              🔔 Test Notification
            </Button>
            <Button onClick={() => setIsAddingTraining(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Training
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTrainings}</p>
                <p className="text-xs text-muted-foreground">Total Programs</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcomingTrainings}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeTrainings}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                <p className="text-xs text-muted-foreground">Participants</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {isAddingTraining && (
          <Card className="p-6 border-0 shadow-md">
            <h2 className="text-lg font-bold mb-4">
              {editingTraining ? "Edit Training Program" : "Create New Training Program"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Training Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Web Development Bootcamp"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trainer">Trainer Name *</Label>
                  <Input
                    id="trainer"
                    value={formData.trainer}
                    onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Technology, Leadership"
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
                  placeholder="Training objectives and content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (hours) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
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
                        : "e.g., Main Hall, Training Center"
                    }
                    required
                  />
                </div>
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
                    <RadioGroupItem value="in-person" id="training-delivery-in-person" />
                    <label htmlFor="training-delivery-in-person" className="text-sm font-medium cursor-pointer">
                      In-person (Training Center)
                    </label>
                  </div>
                  <div className="flex items-center gap-3 rounded-md border p-3 transition hover:border-primary">
                    <RadioGroupItem value="online" id="training-delivery-online" />
                    <label htmlFor="training-delivery-online" className="text-sm font-medium cursor-pointer">
                      Online (Google Meet/Zoom)
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxParticipants">Max Participants *</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="enrolledParticipants">Enrolled Participants</Label>
                  <Input
                    id="enrolledParticipants"
                    type="number"
                    min="0"
                    value={formData.enrolledParticipants}
                    onChange={(e) => setFormData({ ...formData, enrolledParticipants: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Level *</Label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
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
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="image">Training Image</Label>
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
                  {uploading ? "Uploading..." : (editingTraining ? "Update Training" : "Create Training")}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={uploading}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Analytics Section */}
        <TrainingAnalytics />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search training programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Trainings List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Training Programs ({filteredTrainings.length})</h2>
          {filteredTrainings.map((training) => (
            <Card key={training.id} className="p-4 border-0 shadow-md">
              {training.imageUrl && (
                <img 
                  src={training.imageUrl} 
                  alt={training.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-bold text-lg">{training.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(training.status)}`}>
                      {training.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getLevelColor(training.level)}`}>
                      {training.level}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Trainer:</strong> {training.trainer} | <strong>Category:</strong> {training.category}
                  </p>
                  {training.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {training.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(training.startDate).toLocaleDateString()} - {new Date(training.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{training.duration} hours</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{training.enrolledParticipants}/{training.maxParticipants} participants</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Location:</strong> {training.location}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Delivery:</strong> {training.deliveryMode === "online" ? "Online (Google Meet/Zoom)" : "In-person"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openRegistrations(training)}
                  >
                    View Registrations
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(training)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(training.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filteredTrainings.length === 0 && (
            <Card className="p-8 border-0 shadow-md text-center">
              <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? "No training programs found matching your search" : "No training programs created yet"}
              </p>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={registrationsOpen} onOpenChange={(open) => {
        setRegistrationsOpen(open);
        if (!open) {
          setSelectedTrainingRegistrations(null);
          setRegistrations([]);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registered Participants</DialogTitle>
            <DialogDescription>
              {selectedTrainingRegistrations ? selectedTrainingRegistrations.title : "Select a training to view registrations"}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-80 pr-4">
            {registrationsLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading registrations...
              </div>
            ) : registrations.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No participants have registered yet.
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

export default TrainingAdminDashboard;
