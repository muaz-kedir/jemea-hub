import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
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
  ArrowLeft,
  FileText,
  Calendar
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
import { useToast } from "@/hooks/use-toast";

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
  addedAt: any;
}

const LibraryAdminDashboard = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [editingResource, setEditingResource] = useState<LibraryResource | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    loadResources();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resourceData = {
        title: formData.title,
        author: formData.author,
        category: formData.category,
        description: formData.description,
        isbn: formData.isbn,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : undefined,
        copies: parseInt(formData.copies),
        available: parseInt(formData.available),
        addedAt: Timestamp.now(),
      };

      if (editingResource) {
        await updateDoc(doc(db, "library_resources", editingResource.id), resourceData);
        toast({
          title: "Success",
          description: "Resource updated successfully",
        });
      } else {
        await addDoc(collection(db, "library_resources"), resourceData);
        toast({
          title: "Success",
          description: "Resource added successfully",
        });
      }

      resetForm();
      loadResources();
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({
        title: "Error",
        description: "Failed to save resource",
        variant: "destructive",
      });
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
    <div className="min-h-screen pb-24 bg-gradient-to-br from-background via-background to-blue-500/10">
      <Header />
      
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin-dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Library Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage library resources and books</p>
            </div>
          </div>
          <Button onClick={() => setIsAddingResource(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Resource
          </Button>
        </div>

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

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingResource ? "Update Resource" : "Add Resource"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
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
              <div className="flex items-start justify-between mb-3">
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
      </div>

      <BottomNav />
    </div>
  );
};

export default LibraryAdminDashboard;
