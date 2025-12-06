import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Library, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Users, 
  TrendingUp,
  Search,
  FileText,
  GraduationCap,
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  Timestamp 
} from "firebase/firestore";
import { notifyNewBook, notifyBookUpdate } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LibraryAnalytics } from "@/components/LibraryAnalytics";
import { ResourceAdminPanel } from "@/components/ResourceAdminPanel";
import { CourseManagement } from "@/components/CourseManagement";

interface LibraryResource {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  isbn?: string;
  publishedYear?: number;
  copies: number;
  available: number;
  imageUrl?: string;
  addedAt: any;
}

interface BorrowRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  fullName: string;
  email: string;
  telegramUsername: string;
  phoneNumber: string;
  idNumber: string;
  building: string;
  dormNumber: string;
  status: "pending" | "approved" | "rejected" | "returned";
  createdAt: any;
}

const sanitizeData = <T extends Record<string, any>>(data: T): T => {
  const cleanedEntries = Object.entries(data).filter(([_, value]) => {
    if (value === undefined || value === null) return false;
    if (typeof value === "number" && Number.isNaN(value)) return false;
    return true;
  });
  return Object.fromEntries(cleanedEntries) as T;
};

const LibraryAdminDashboard = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [editingResource, setEditingResource] = useState<LibraryResource | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "academic" | "courses" | "requests">("library");
  const [coursesUpdated, setCoursesUpdated] = useState(0); // Trigger re-renders when courses change
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
    isbn: "",
    publishedYear: "",
    copies: "1",
    available: "1",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadResources();
    loadBorrowRequests();
  }, []);

  const loadBorrowRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "borrow_requests"));
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BorrowRequest[];
      // Sort by createdAt descending
      requestsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setBorrowRequests(requestsData);
    } catch (error) {
      console.error("Error loading borrow requests:", error);
    }
  };

  const updateRequestStatus = async (requestId: string, status: BorrowRequest["status"]) => {
    try {
      await updateDoc(doc(db, "borrow_requests", requestId), { status });
      setBorrowRequests(prev => 
        prev.map(req => req.id === requestId ? { ...req, status } : req)
      );
      toast({
        title: "Status Updated",
        description: `Request has been ${status}`,
      });
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const loadResources = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "library_resources"));
      const resourcesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LibraryResource[];
      setResources(resourcesData);
    } catch (error) {
      console.error("Error loading resources:", error);
      toast({
        title: "Error",
        description: "Failed to load library resources",
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
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
    
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
    
    // Check authentication
    const { auth } = await import("@/lib/firebase");
    const currentUser = auth.currentUser;
    console.log("Current user:", currentUser);
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to add resources",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }
    
    try {
      let imageUrl = editingResource?.imageUrl || "";
      
      const parsedCopies = parseInt(formData.copies, 10);
      const parsedAvailable = parseInt(formData.available, 10);
      const parsedPublishedYear = formData.publishedYear ? parseInt(formData.publishedYear, 10) : undefined;

      // Upload image first if selected
      if (imageFile) {
        console.log("Starting image upload...");
        imageUrl = await uploadImage(imageFile);
        console.log("Image uploaded successfully! URL:", imageUrl);
      }

      const resourceData = sanitizeData({
        title: formData.title,
        author: formData.author,
        category: formData.category,
        description: formData.description,
        isbn: formData.isbn?.trim() || undefined,
        publishedYear: parsedPublishedYear,
        copies: Number.isNaN(parsedCopies) ? undefined : parsedCopies,
        available: Number.isNaN(parsedAvailable) ? undefined : parsedAvailable,
        addedAt: Timestamp.now(),
        imageUrl: imageUrl || undefined,
      } as any);

      console.log("Saving to Firestore with data:", resourceData);

      if (editingResource) {
        await updateDoc(doc(db, "library_resources", editingResource.id), resourceData);
        console.log("Resource updated in Firestore");
        // Send notification for book update
        await notifyBookUpdate(formData.title).catch(console.error);
        toast({
          title: "Success",
          description: "Resource updated successfully",
        });
      } else {
        const docRef = await addDoc(collection(db, "library_resources"), resourceData);
        console.log("Resource added to Firestore with ID:", docRef.id);
        // Send notification for new book
        await notifyNewBook(formData.title).catch(console.error);
        toast({
          title: "Success",
          description: "Resource added successfully",
        });
      }

      resetForm();
      loadResources();
    } catch (error: any) {
      console.error("Error saving resource:", error);
      const errorMessage = error?.message || error?.code || "Failed to save resource";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    
    try {
      await deleteDoc(doc(db, "library_resources", id));
      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });
      loadResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (resource: LibraryResource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      author: resource.author,
      category: resource.category,
      description: resource.description,
      isbn: resource.isbn || "",
      publishedYear: resource.publishedYear?.toString() || "",
      copies: resource.copies.toString(),
      available: resource.available.toString(),
    });
    setImagePreview(resource.imageUrl || null);
    setImageFile(null);
    setIsAddingResource(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      category: "",
      description: "",
      isbn: "",
      publishedYear: "",
      copies: "1",
      available: "1",
    });
    setImageFile(null);
    setImagePreview(null);
    setIsAddingResource(false);
    setEditingResource(null);
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalResources: resources.length,
    totalCopies: resources.reduce((sum, r) => sum + r.copies, 0),
    availableCopies: resources.reduce((sum, r) => sum + r.available, 0),
    borrowedCopies: resources.reduce((sum, r) => sum + (r.copies - r.available), 0),
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Library Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage library resources and books</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                const { notifyNewBook } = await import("@/services/notificationService");
                await notifyNewBook("Test Library Notification");
                toast({ title: "Test notification sent!" });
              }}
              className="gap-2"
            >
              🔔 Test Notification
            </Button>
            <Button onClick={() => setIsAddingResource(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Resource
            </Button>
            <Button onClick={() => setActiveTab("academic")} variant="outline" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Add Academic Resource
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "library" | "academic" | "courses" | "requests")}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="library">Resources</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Requests
              {borrowRequests.filter(r => r.status === "pending").length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {borrowRequests.filter(r => r.status === "pending").length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalResources}</p>
                <p className="text-xs text-muted-foreground">Total Resources</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.availableCopies}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.borrowedCopies}</p>
                <p className="text-xs text-muted-foreground">Borrowed</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCopies}</p>
                <p className="text-xs text-muted-foreground">Total Copies</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Library Analytics */}
        <LibraryAnalytics />

        {/* Add/Edit Form */}
        {isAddingResource && (
          <Card className="p-6 border-0 shadow-md">
            <h2 className="text-lg font-bold mb-4">
              {editingResource ? "Edit Resource" : "Add New Resource"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Islamic Studies, Science, Literature"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="publishedYear">Published Year</Label>
                  <Input
                    id="publishedYear"
                    type="number"
                    value={formData.publishedYear}
                    onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="copies">Total Copies *</Label>
                  <Input
                    id="copies"
                    type="number"
                    min="1"
                    value={formData.copies}
                    onChange={(e) => setFormData({ ...formData, copies: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="available">Available Copies *</Label>
                  <Input
                    id="available"
                    type="number"
                    min="0"
                    value={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Cover Image</Label>
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
                      className="w-32 h-40 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={uploading}>
                  {uploading ? "Uploading..." : (editingResource ? "Update Resource" : "Add Resource")}
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
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Resources List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Library Resources ({filteredResources.length})</h2>
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="p-4 border-0 shadow-md">
              <div className="flex items-start gap-4 mb-3">
                {resource.imageUrl && (
                  <img 
                    src={resource.imageUrl} 
                    alt={resource.title}
                    className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">by {resource.author}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {resource.category}
                    </span>
                    {resource.isbn && (
                      <span className="text-xs text-muted-foreground">ISBN: {resource.isbn}</span>
                    )}
                  </div>
                  {resource.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {resource.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-medium">
                      {resource.available} available
                    </span>
                    <span className="text-muted-foreground">
                      / {resource.copies} total
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(resource)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(resource.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filteredResources.length === 0 && (
            <Card className="p-8 border-0 shadow-md text-center">
              <Library className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? "No resources found matching your search" : "No resources added yet"}
              </p>
            </Card>
          )}
        </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <ResourceAdminPanel
              title="Academic Resource Management"
              description="Post and manage academic resources for the digital library."
              coursesUpdated={coursesUpdated}
            />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <CourseManagement onCoursesUpdate={() => setCoursesUpdated(prev => prev + 1)} />
          </TabsContent>

          {/* Borrow Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {/* Request Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 border-0 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{borrowRequests.filter(r => r.status === "pending").length}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-0 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{borrowRequests.filter(r => r.status === "approved").length}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-0 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{borrowRequests.filter(r => r.status === "rejected").length}</p>
                    <p className="text-xs text-muted-foreground">Rejected</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-0 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{borrowRequests.length}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Requests List */}
            {borrowRequests.length === 0 ? (
              <Card className="p-8 text-center border-0 shadow-md">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No borrow requests yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {borrowRequests.map((request) => (
                  <Card key={request.id} className="p-4 border-0 shadow-md">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Book Info */}
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg">{request.bookTitle}</h3>
                          <p className="text-sm text-muted-foreground">by {request.bookAuthor}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                              request.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                              request.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {request.createdAt?.toDate?.().toLocaleDateString() || "Unknown date"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 bg-muted/50 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{request.fullName}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="truncate">{request.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span>{request.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Telegram:</span>
                            <span>{request.telegramUsername}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">ID:</span>
                            <span>{request.idNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span>{request.building}, Dorm {request.dormNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {request.status === "pending" && (
                        <div className="flex lg:flex-col gap-2">
                          <Button
                            size="sm"
                            className="flex-1 lg:flex-none gap-1"
                            onClick={() => updateRequestStatus(request.id, "approved")}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 lg:flex-none gap-1"
                            onClick={() => updateRequestStatus(request.id, "rejected")}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {request.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => updateRequestStatus(request.id, "returned")}
                        >
                          Mark Returned
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default LibraryAdminDashboard;
