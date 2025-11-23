import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { academicColleges, getCollegeById, getDepartmentById } from "@/data/academic-structure";
import { createResource, deleteResource, fetchResources } from "@/services/resourceService";
import type { ClassifiedResource } from "@/types/resources";
import { FileDown, GraduationCap, Upload, XCircle } from "lucide-react";

const placementTabs = [
  { key: "all", label: "All" },
  { key: "landing", label: "Landing" },
  { key: "academic", label: "Academic" },
] as const;

type PlacementTab = (typeof placementTabs)[number]["key"];

type PlacementOption = "landing" | "academic";

const ResourceAdminDashboard = () => {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const [resources, setResources] = useState<ClassifiedResource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [activeTab, setActiveTab] = useState<PlacementTab>("all");

  const [placement, setPlacement] = useState<PlacementOption>("landing");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  const filteredResources = useMemo(() => {
    if (activeTab === "all") return resources;
    return resources.filter((resource) => resource.placement === activeTab);
  }, [resources, activeTab]);

  const selectedCollege = useMemo(() => {
    if (!selectedCollegeId) return null;
    return getCollegeById(selectedCollegeId);
  }, [selectedCollegeId]);

  const selectedDepartment = useMemo(() => {
    if (!selectedCollegeId || !selectedDepartmentId) return null;
    return getDepartmentById(selectedCollegeId, selectedDepartmentId);
  }, [selectedCollegeId, selectedDepartmentId]);

  const availableDepartments = selectedCollege?.departments ?? [];
  const availableYears = selectedDepartment?.years ?? [];
  const selectedYear = useMemo(() => {
    if (!selectedYearId) return null;
    return availableYears.find((year) => year.id === selectedYearId) ?? null;
  }, [availableYears, selectedYearId]);

  const availableSemesters = selectedYear?.semesters ?? [];

  const resetAcademicSelections = () => {
    setSelectedCollegeId("");
    setSelectedDepartmentId("");
    setSelectedYearId("");
    setSelectedSemesterId("");
  };

  const loadResources = async (tab: PlacementTab) => {
    setLoadingResources(true);
    try {
      const filters = tab === "all" ? {} : { placement: tab as PlacementOption };
      const data = await fetchResources(filters);
      setResources(data);
    } catch (error: any) {
      console.error("Failed to load resources", error);
      toast({
        title: "Error",
        description: error?.message || "Unable to load resources",
        variant: "destructive",
      });
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    loadResources(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handlePlacementChange = (value: PlacementOption) => {
    setPlacement(value);
    if (value === "landing") {
      resetAcademicSelections();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      toast({
        title: "File required",
        description: "Please choose a resource file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for the resource.",
        variant: "destructive",
      });
      return;
    }

    if (placement === "academic" && (!selectedCollegeId || !selectedDepartmentId || !selectedYearId || !selectedSemesterId)) {
      toast({
        title: "Classification missing",
        description: "Academic resources must include college, department, year, and semester.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        placement,
        college: placement === "academic" ? selectedCollegeId : undefined,
        department: placement === "academic" ? selectedDepartmentId : undefined,
        year: placement === "academic" ? selectedYearId : undefined,
        semester: placement === "academic" ? selectedSemesterId : undefined,
        tags,
        file: selectedFile,
        postedBy: userProfile?.email || user?.email || null,
      } as const;

      await createResource(payload);

      toast({
        title: "Resource posted",
        description: "The resource has been published successfully.",
      });

      setTitle("");
      setDescription("");
      setSelectedFile(null);
      setTagsInput("");
      if (placement === "academic") {
        resetAcademicSelections();
        setPlacement("landing");
      }

      await loadResources(activeTab);
    } catch (error: any) {
      console.error("Failed to create resource", error);
      toast({
        title: "Upload failed",
        description: error?.message || "Unable to create resource",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;

    try {
      await deleteResource(id);
      toast({
        title: "Resource removed",
        description: "The resource was deleted successfully.",
      });
      await loadResources(activeTab);
    } catch (error: any) {
      console.error("Failed to delete resource", error);
      toast({
        title: "Delete failed",
        description: error?.message || "Unable to delete resource",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-background via-background to-primary/10">
      <Header />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Resource Management</h1>
            <p className="text-sm text-muted-foreground">
              Host resource files on Cloudinary and classify them for students.
            </p>
          </div>
        </div>

        <Card className="p-6 border-0 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Post a resource</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
              </div>

              <div>
                <Label>Placement *</Label>
                <Select value={placement} onValueChange={(value) => handlePlacementChange(value as PlacementOption)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landing">Landing Page</SelectItem>
                    <SelectItem value="academic">Academic Library</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short summary or usage instructions"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="e.g. orientation, campus, syllabus"
              />
            </div>

            {placement === "academic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>College *</Label>
                  <Select
                    value={selectedCollegeId}
                    onValueChange={(value) => {
                      setSelectedCollegeId(value);
                      setSelectedDepartmentId("");
                      setSelectedYearId("");
                      setSelectedSemesterId("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicColleges.map((college) => (
                        <SelectItem key={college.id} value={college.id}>
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Department *</Label>
                  <Select
                    value={selectedDepartmentId}
                    onValueChange={(value) => {
                      setSelectedDepartmentId(value);
                      setSelectedYearId("");
                      setSelectedSemesterId("");
                    }}
                    disabled={!availableDepartments.length}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDepartments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Year *</Label>
                  <Select
                    value={selectedYearId}
                    onValueChange={(value) => {
                      setSelectedYearId(value);
                      setSelectedSemesterId("");
                    }}
                    disabled={!availableYears.length}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Semester *</Label>
                  <Select
                    value={selectedSemesterId}
                    onValueChange={setSelectedSemesterId}
                    disabled={!availableSemesters.length}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSemesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="resource-file">Resource file *</Label>
              <Input
                id="resource-file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.gif,.webp,.svg,.txt,.json"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex items-center gap-2" disabled={submitting}>
                <Upload className="w-4 h-4" />
                {submitting ? "Uploading..." : "Publish Resource"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTitle("");
                  setDescription("");
                  setSelectedFile(null);
                  setTagsInput("");
                  resetAcademicSelections();
                  setPlacement("landing");
                }}
                disabled={submitting}
              >
                Reset
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Posted resources</h2>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PlacementTab)}>
            <TabsList className="grid grid-cols-3 mb-4">
              {placementTabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="space-y-3">
              {loadingResources ? (
                <div className="p-6 text-center text-muted-foreground">Loading resources…</div>
              ) : filteredResources.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No resources found.</div>
              ) : (
                filteredResources.map((resource) => (
                  <Card key={resource.id} className="p-4 border shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileDown className="w-5 h-5" />
                            {resource.title}
                          </h3>
                          <Badge variant={resource.placement === "academic" ? "secondary" : "outline"}>
                            {resource.placement === "academic" ? "Academic" : "Landing"}
                          </Badge>
                        </div>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>Uploaded: {resource.createdAt ? new Date(resource.createdAt).toLocaleString() : "Pending"}</span>
                          {resource.postedBy && <span>• Posted by {resource.postedBy}</span>}
                        </div>
                        {resource.placement === "academic" && (
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {resource.college && <Badge variant="outline">College: {resource.college}</Badge>}
                            {resource.department && <Badge variant="outline">Dept: {resource.department}</Badge>}
                            {resource.year && <Badge variant="outline">{resource.year}</Badge>}
                            {resource.semester && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                {resource.semester}
                              </Badge>
                            )}
                          </div>
                        )}
                        {resource.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {resource.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 items-start md:items-end">
                        <a
                          href={resource.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Upload className="w-4 h-4" />
                          View file
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive flex items-center gap-2"
                          onClick={() => handleDelete(resource.id)}
                        >
                          <XCircle className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default ResourceAdminDashboard;
