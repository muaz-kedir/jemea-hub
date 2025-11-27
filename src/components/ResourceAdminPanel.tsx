import { useState, useMemo, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAcademicStructure } from "@/context/AcademicStructureContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, BookOpen, Download, FileText, GraduationCap, Layers, XCircle } from "lucide-react";
import { getCollegeById, getDepartmentById } from "@/data/academic-structure";
import type { ClassifiedResource } from "@/types/resources";
import { fetchResources, createResource, deleteResource } from "@/services/resourceService";
import { HierarchicalResourceLibrary } from "./HierarchicalResourceLibrary";

const placementTabs = [
  { key: "all", label: "All" },
  { key: "landing", label: "Landing" },
  { key: "academic", label: "Academic" },
] as const;

type PlacementTab = (typeof placementTabs)[number]["key"];
type PlacementOption = "landing" | "academic";

interface ResourceAdminPanelProps {
  title?: string;
  description?: string;
  coursesUpdated?: number;
}

export const ResourceAdminPanel = ({
  title = "Resource Management",
  description = "Host resource files on Cloudinary and classify them for students.",
  coursesUpdated = 0,
}: ResourceAdminPanelProps) => {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const { academicColleges, refreshTrigger } = useAcademicStructure();

  const [resources, setResources] = useState<ClassifiedResource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [activeTab, setActiveTab] = useState<PlacementTab>("all");

  const [placement, setPlacement] = useState<PlacementOption>("landing");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  const filteredResources = useMemo(() => {
    if (activeTab === "all") return resources;
    return resources.filter((resource) => resource.placement === activeTab);
  }, [resources, activeTab]);

  const resourceStats = useMemo(() => {
    const total = resources.length;
    const landing = resources.filter((resource) => resource.placement === "landing").length;
    const academic = resources.filter((resource) => resource.placement === "academic").length;

    return {
      total,
      landing,
      academic,
    };
  }, [resources]);

  const statsCards = [
    {
      label: "Total Resources",
      value: resourceStats.total,
      icon: BookOpen,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Landing Resources",
      value: resourceStats.landing,
      icon: Layers,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      label: "Academic Resources",
      value: resourceStats.academic,
      icon: GraduationCap,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
    },
  ];

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
  const availableCourses = useMemo(() => {
    if (!selectedCollegeId || !selectedDepartmentId || !selectedSemesterId) return [];
    // Use context's academicColleges instead of static data
    const college = academicColleges.find((c) => c.id === selectedCollegeId);
    const department = college?.departments.find((d) => d.id === selectedDepartmentId);
    const year = department?.years.find((y) => y.id === selectedYearId);
    const semester = year?.semesters.find((s) => s.id === selectedSemesterId);
    return semester?.courses || [];
  }, [selectedCollegeId, selectedDepartmentId, selectedYearId, selectedSemesterId, academicColleges, refreshTrigger]);

  const resetAcademicSelections = () => {
    setSelectedCollegeId("");
    setSelectedDepartmentId("");
    setSelectedYearId("");
    setSelectedSemesterId("");
    setSelectedCourseId("");
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

    if (!resourceTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for the resource.",
        variant: "destructive",
      });
      return;
    }

    if (placement === "academic") {
      if (!selectedCollegeId) {
        toast({
          title: "College required",
          description: "Please select a college for this academic resource.",
          variant: "destructive",
        });
        return;
      }
      if (!selectedDepartmentId) {
        toast({
          title: "Department required",
          description: "Please select a department for this academic resource.",
          variant: "destructive",
        });
        return;
      }
      if (!selectedYearId) {
        toast({
          title: "Year required",
          description: "Please select a year for this academic resource.",
          variant: "destructive",
        });
        return;
      }
      if (!selectedSemesterId) {
        toast({
          title: "Semester required",
          description: "Please select a semester for this academic resource.",
          variant: "destructive",
        });
        return;
      }
      if (!selectedCourseId) {
        toast({
          title: "Course required",
          description: "You must select a course for this academic resource. If no courses are available, add them in the Manage Courses tab first.",
          variant: "destructive",
        });
        return;
      }
    }

    setSubmitting(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      // Get names from IDs for academic classification
      let collegeName: string | undefined;
      let departmentName: string | undefined;
      let yearName: string | undefined;
      let semesterName: string | undefined;
      let courseName: string | undefined;

      if (placement === "academic") {
        const college = selectedCollege;
        const department = selectedDepartment;
        const year = selectedYear;
        const semester = availableSemesters.find((s) => s.id === selectedSemesterId);
        const course = availableCourses.find((c) => c.id === selectedCourseId);

        collegeName = college?.name;
        departmentName = department?.name;
        yearName = year?.name;
        semesterName = semester?.name;
        courseName = course?.name;
      }

      const payload = {
        title: resourceTitle.trim(),
        description: resourceDescription.trim() || undefined,
        placement,
        college: collegeName,
        department: departmentName,
        year: yearName,
        semester: semesterName,
        course: courseName,
        tags,
        file: selectedFile,
        postedBy: userProfile?.email || user?.email || null,
      } as const;

      await createResource(payload);

      toast({
        title: "Resource posted",
        description: "The resource has been published successfully.",
      });

      setResourceTitle("");
      setResourceDescription("");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>

      <Card className="p-6 border-0 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Post a resource</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="resource-title">Title *</Label>
              <Input
                id="resource-title"
                value={resourceTitle}
                onChange={(event) => setResourceTitle(event.target.value)}
                required
              />
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
            <Label htmlFor="resource-description">Description</Label>
            <Textarea
              id="resource-description"
              value={resourceDescription}
              onChange={(event) => setResourceDescription(event.target.value)}
              placeholder="Short summary or usage instructions"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="resource-tags">Tags (comma separated)</Label>
            <Input
              id="resource-tags"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="e.g. orientation, campus, syllabus"
            />
          </div>

          {placement === "academic" && (
            <>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>📚 Academic Resource:</strong> Select the course where this resource should be placed. 
                  Courses are organized by College → Department → Year → Semester. 
                  Make sure courses are added in the <strong>Manage Courses</strong> tab first.
                </p>
              </div>

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
                    setSelectedCourseId("");
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

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold">
                    📌 Select Course <span className="text-red-500">*</span> (Required)
                  </Label>
                  {availableCourses.length > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {availableCourses.length} available
                    </Badge>
                  )}
                </div>
                <Select
                  value={selectedCourseId}
                  onValueChange={setSelectedCourseId}
                  disabled={!availableCourses.length}
                >
                  <SelectTrigger 
                    className={`${
                      !availableCourses.length 
                        ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800" 
                        : selectedCourseId 
                        ? "border-green-300 dark:border-green-800" 
                        : ""
                    }`}
                  >
                    <SelectValue 
                      placeholder={
                        !availableCourses.length 
                          ? "❌ No courses available - Add courses first" 
                          : "🎓 Select a course for this resource"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground text-center">
                        <p className="font-semibold mb-1">No courses available</p>
                        <p>Add courses in the Manage Courses tab first</p>
                      </div>
                    ) : (
                      availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-primary">{course.code}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-medium">{course.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {!availableCourses.length && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <strong>⚠️ Action Required:</strong> No courses available for this semester. 
                      Go to the <strong>Manage Courses</strong> tab to add courses first.
                    </p>
                  </div>
                )}
                {selectedCourseId && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✅ Course selected: <strong>{availableCourses.find(c => c.id === selectedCourseId)?.code}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
            </>
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

          <div className="space-y-3">
            {placement === "academic" && !selectedCourseId && availableCourses.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>⚠️ Reminder:</strong> You must select a course before publishing this academic resource.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex items-center gap-2" 
                disabled={submitting || (placement === "academic" && !selectedCourseId)}
                title={placement === "academic" && !selectedCourseId ? "Please select a course first" : ""}
              >
                <Upload className="w-4 h-4" />
                {submitting ? "Uploading..." : "Publish Resource"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResourceTitle("");
                  setResourceDescription("");
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
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Posted Resources</h3>
          <div className="text-sm text-muted-foreground">
            Total: {resources.length} | Academic: {resources.filter((r) => r.placement === "academic").length}
          </div>
        </div>

        <HierarchicalResourceLibrary
          resources={resources}
          onDelete={handleDelete}
          onView={(resource) => {
            window.open(resource.file.url, "_blank");
          }}
          loading={loadingResources}
        />
      </div>
    </div>
  );
};
