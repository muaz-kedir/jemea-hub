import { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Download,
  Loader2,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  MessageCircle,
  Send,
} from "lucide-react";
import {
  Link,
  Outlet,
  useOutletContext,
  useParams,
  useRoutes,
  useNavigate,
} from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchResources,
  getResourceById,
  getResourceAIData,
  generateResourceSummary,
  generateResourceFlashcards,
  chatWithResource,
  type ResourceAIData,
  type Flashcard,
  type ChatMessage,
} from "@/services/resourceService";
import type { ClassifiedResource } from "@/types/resources";
import { useAcademicStructure } from "@/context/AcademicStructureContext";
import { useAuth } from "@/contexts/AuthContext";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface DigitalLibraryContext {
  loading: boolean;
  error: string | null;
}

const DigitalLibrary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const element = useRoutes([
    {
      path: "/",
      element: <LibraryLayout loading={loading} error={error} />,
      children: [
        { index: true, element: <CollegesView /> },
        { path: "college/:collegeId", element: <CollegeView /> },
        { path: "college/:collegeId/department/:departmentId", element: <DepartmentView /> },
        {
          path: "college/:collegeId/department/:departmentId/year/:yearId/semester/:semesterId",
          element: <SemesterView />,
        },
        {
          path: "college/:collegeId/department/:departmentId/year/:yearId/semester/:semesterId/course/:courseId",
          element: <CourseView />,
        },
        {
          path: "resource/:resourceId",
          element: <ResourceViewer />,
        },
      ],
    },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {element}
      </main>
      <BottomNav />
    </div>
  );
};

const LibraryLayout = ({ loading, error }: DigitalLibraryContext) => (
  <Outlet context={{ loading, error }} />
);

const useDigitalLibraryContext = () =>
  useOutletContext<DigitalLibraryContext>();

const CollegesView = () => {
  const { academicColleges } = useAcademicStructure();
  return (
    <div className="space-y-16">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary font-semibold uppercase tracking-widest text-xs">
          <BookOpen className="w-4 h-4" />
          Digital Library
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Academic Resources by College, Department, Year & Semester
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse academic materials organized by your academic structure. Navigate through colleges, departments, years, and semesters to find your resources.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {academicColleges.map((college) => (
          <Card
            key={college.id}
            className="p-6 border-0 shadow-lg bg-secondary/20 flex flex-col gap-6 hover:shadow-xl transition-shadow"
          >
            <div className="space-y-3">
              <Badge className="w-fit bg-primary/15 text-primary border-primary/30 uppercase tracking-wider text-xs">
                {college.departments.length} Departments
              </Badge>
              <h2 className="text-2xl font-semibold">{college.name}</h2>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Explore resources by department
              </span>
              <Button asChild>
                <Link to={`college/${college.id}`}>
                  View Departments
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
};

const CollegeView = () => {
  const { collegeId } = useParams<{ collegeId: string }>();
  const { academicColleges } = useAcademicStructure();
  const college = academicColleges.find((c) => c.id === collegeId);

  if (!college) {
    return (
      <NotFoundCard
        message="We couldn't find that college."
        actionLabel="Back to Colleges"
        to="/digital-library"
      />
    );
  }

  return (
    <div className="space-y-10">
      <Link
        to="/digital-library"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Colleges
      </Link>

      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">{college.name}</h1>
        <p className="text-muted-foreground">
          Select a department to view resources organized by year and semester.
        </p>
      </div>

      <Separator className="bg-secondary/50" />

      <section className="grid gap-6 md:grid-cols-2">
        {college.departments.map((department) => (
          <Card
            key={department.id}
            className="p-6 border-0 shadow-lg bg-secondary/20 flex flex-col gap-5 hover:shadow-xl transition-shadow"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{department.name}</h2>
              <p className="text-sm text-muted-foreground">
                {department.years.length} years of study
              </p>
            </div>

            <Button asChild className="self-start">
              <Link to={`department/${department.id}`}>
                View Years
              </Link>
            </Button>
          </Card>
        ))}
      </section>
    </div>
  );
};

const DepartmentView = () => {
  const { collegeId, departmentId } = useParams<{
    collegeId: string;
    departmentId: string;
  }>();
  const { academicColleges } = useAcademicStructure();
  const college = academicColleges.find((c) => c.id === collegeId);
  const department = college?.departments.find((d) => d.id === departmentId);

  if (!college || !department) {
    return (
      <NotFoundCard
        message="We couldn't find that department."
        actionLabel="Back to College"
        to={`/digital-library/college/${collegeId}`}
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link
          to={`/digital-library/college/${collegeId}`}
          className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Departments
        </Link>
        <Link
          to="/digital-library"
          className="text-primary/70 hover:text-primary hover:underline"
        >
          All Colleges
        </Link>
      </div>

      <div className="space-y-3">
        <Badge className="w-fit bg-primary/15 text-primary border-primary/30 uppercase tracking-wider text-xs">
          {college.name}
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold">{department.name}</h1>
        <p className="text-muted-foreground">
          Select a semester to view courses and their resources.
        </p>
      </div>

      <Separator className="bg-secondary/50" />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Semesters & Courses</h2>
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {department.years.map((year) => (
          <Card
            key={year.id}
            className="p-6 border-0 shadow-lg bg-secondary/20 flex flex-col gap-4 hover:shadow-xl transition-shadow"
          >
            <div className="space-y-2">
              <Badge className="w-fit bg-primary/15 text-primary border-primary/30">
                {year.name}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {year.semesters.length} semesters
              </p>
            </div>

            <div className="space-y-3">
              {year.semesters.map((semester) => (
                <div key={semester.id} className="space-y-2">
                  <div className="text-sm font-semibold text-primary">{semester.name}</div>
                  <div className="space-y-1">
                    {semester.courses.map((course) => (
                      <Button
                        key={course.id}
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                      >
                        <Link
                          to={`year/${year.id}/semester/${semester.id}/course/${course.id}`}
                        >
                          <span className="font-mono">{course.code}</span>
                          <span className="ml-2 flex-1 text-left">{course.name}</span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
        </section>
      </div>
    </div>
  );
};

const SemesterView = () => {
  const { collegeId, departmentId, yearId, semesterId } = useParams<{
    collegeId: string;
    departmentId: string;
    yearId: string;
    semesterId: string;
  }>();
  const { academicColleges } = useAcademicStructure();
  const { userProfile } = useAuth();

  const [resources, setResources] = useState<ClassifiedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const college = academicColleges.find((c) => c.id === collegeId);
  const department = college?.departments.find((d) => d.id === departmentId);
  const year = department?.years.find((y) => y.id === yearId);
  const semester = year?.semesters.find((s) => s.id === semesterId);

  const canDownload = userProfile?.role === "super_admin" || userProfile?.role === "librarian";

  useEffect(() => {
    const loadResources = async () => {
      if (!college || !department || !year || !semester) return;

      try {
        setLoading(true);
        setError(null);

        const data = await fetchResources({
          placement: 'academic',
          college: college.name,
          department: department.name,
          year: year.name,
          semester: semester.name,
        });

        setResources(data);
      } catch (err) {
        console.error('Failed to load resources:', err);
        setError(err instanceof Error ? err.message : 'Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [college, department, year, semester]);

  if (!college || !department || !year || !semester) {
    return (
      <NotFoundCard
        message="Invalid semester path."
        actionLabel="Back to Department"
        to={`/digital-library/college/${collegeId}/department/${departmentId}`}
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link
          to={`/digital-library/college/${collegeId}/department/${departmentId}`}
          className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Department
        </Link>
        <Link
          to={`/digital-library/college/${collegeId}`}
          className="text-primary/70 hover:text-primary hover:underline"
        >
          {college.name}
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-primary/15 text-primary border-primary/30 uppercase tracking-wider text-xs">
            {college.name}
          </Badge>
          <Badge className="bg-primary/15 text-primary border-primary/30 uppercase tracking-wider text-xs">
            {department.name}
          </Badge>
          <Badge className="bg-primary/15 text-primary border-primary/30 uppercase tracking-wider text-xs">
            {year.name}
          </Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{semester.name} Resources</h1>
      </div>

      <Separator className="bg-secondary/50" />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="p-10 text-center border-0 shadow-lg bg-secondary/20 space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      ) : resources.length === 0 ? (
        <Card className="p-10 text-center border-0 shadow-lg bg-secondary/20 space-y-4">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            No resources available for this semester yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later or contact your administrator.
          </p>
        </Card>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card
              key={resource.id}
              className="p-6 border-0 shadow-lg bg-secondary/20 flex flex-col gap-4 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 break-words">
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {resource.description}
                    </p>
                  )}
                </div>
              </div>

              {resource.course && (
                <Badge className="w-fit bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {resource.course}
                </Badge>
              )}

              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {resource.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {resource.postedBy && (
                <div className="text-xs text-muted-foreground">
                  <p>Posted by: {resource.postedBy}</p>
                  {resource.createdAt && (
                    <p>
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t gap-2">
                <span className="text-xs text-muted-foreground">
                  {resource.file.format?.toUpperCase() || 'FILE'}
                </span>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      to={`/digital-library/resource/${resource.id}`}
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View
                    </Link>
                  </Button>
                  {canDownload && (
                    <Button asChild size="sm">
                      <a
                        href={`${resource.file.url}?fl_attachment:${resource.file.originalName}`}
                        download
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
};

const CourseView = () => {
  const { collegeId, departmentId, yearId, semesterId, courseId } = useParams<{
    collegeId: string;
    departmentId: string;
    yearId: string;
    semesterId: string;
    courseId: string;
  }>();
  const { academicColleges } = useAcademicStructure();
  const { userProfile } = useAuth();

  const [resources, setResources] = useState<ClassifiedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const college = academicColleges.find((c) => c.id === collegeId);
  const department = college?.departments.find((d) => d.id === departmentId);
  const year = department?.years.find((y) => y.id === yearId);
  const semester = year?.semesters.find((s) => s.id === semesterId);
  const course = semester?.courses.find((c) => c.id === courseId);

  const canDownload = userProfile?.role === "super_admin" || userProfile?.role === "librarian";

  useEffect(() => {
    const loadResources = async () => {
      if (!college || !department || !year || !semester || !course) return;

      try {
        setLoading(true);
        setError(null);

        const data = await fetchResources({
          placement: 'academic',
          college: college.name,
          department: department.name,
          year: year.name,
          semester: semester.name,
          course: course.name,
        });

        setResources(data);
      } catch (err) {
        console.error('Failed to load resources:', err);
        setError(err instanceof Error ? err.message : 'Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [college, department, year, semester, course]);

  if (!college || !department || !year || !semester || !course) {
    return (
      <NotFoundCard
        message="Invalid course path."
        actionLabel="Back to Department"
        to={`/digital-library/college/${collegeId}/department/${departmentId}`}
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link
          to={`/digital-library/college/${collegeId}/department/${departmentId}`}
          className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Department
        </Link>
        <Link
          to={`/digital-library/college/${collegeId}`}
          className="text-primary/70 hover:text-primary hover:underline"
        >
          {college.name}
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-primary/15 text-primary border-primary/30 uppercase tracking-wider text-xs">
            {college.name}
          </Badge>
          <Badge className="bg-primary/15 text-primary border-primary/30 uppercase tracking-wider text-xs">
            {department.name}
          </Badge>
          <Badge className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 uppercase tracking-wider text-xs">
            {course.code}
          </Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{course.name}</h1>
      </div>

      <Separator className="bg-secondary/50" />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="p-10 text-center border-0 shadow-lg bg-secondary/20 space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      ) : resources.length === 0 ? (
        <Card className="p-10 text-center border-0 shadow-lg bg-secondary/20 space-y-4">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            No resources available for this course yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later or contact your administrator.
          </p>
        </Card>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card
              key={resource.id}
              className="p-6 border-0 shadow-lg bg-secondary/20 flex flex-col gap-4 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 break-words">
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {resource.description}
                    </p>
                  )}
                </div>
              </div>

              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {resource.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {resource.postedBy && (
                <div className="text-xs text-muted-foreground">
                  <p>Posted by: {resource.postedBy}</p>
                  {resource.createdAt && (
                    <p>
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t gap-2">
                <span className="text-xs text-muted-foreground">
                  {resource.file.format?.toUpperCase() || 'FILE'}
                </span>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      to={`/digital-library/resource/${resource.id}`}
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View
                    </Link>
                  </Button>
                  {canDownload && (
                    <Button asChild size="sm">
                      <a
                        href={`${resource.file.url}?fl_attachment:${resource.file.originalName}`}
                        download
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
};

const ResourceViewer = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<ClassifiedResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.2);
  const [aiData, setAIData] = useState<ResourceAIData | null>(null);
  const [aiLoadError, setAILoadError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("viewer");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showFlashcardBack, setShowFlashcardBack] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    const loadResource = async () => {
      if (!resourceId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getResourceById(resourceId);
        setResource(data);
      } catch (err) {
        console.error("Failed to load resource:", err);
        setError(err instanceof Error ? err.message : "Failed to load resource");
      } finally {
        setLoading(false);
      }
    };

    loadResource();
  }, [resourceId]);

  const loadAIData = useCallback(async () => {
    if (!resourceId) return;

    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const data = await getResourceAIData(resourceId);
      setAIData(data);
    } catch (err) {
      console.error("Failed to load AI data:", err);
      setAILoadError(err instanceof Error ? err.message : "Failed to load AI data");
    } finally {
      setSummaryLoading(false);
      setFlashcardsLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    loadAIData();
  }, [loadAIData]);

  const handleGenerateSummary = useCallback(async () => {
    if (!resourceId) return;

    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const summary = await generateResourceSummary(resourceId);
      setAIData((prev) => ({
        ...(prev || {
          resourceId,
          placement: resource?.placement ?? null,
          college: resource?.college ?? null,
          department: resource?.department ?? null,
          year: resource?.year ?? null,
          semester: resource?.semester ?? null,
          course: resource?.course ?? null,
        }),
        summaryShort: summary.summaryShort,
        summaryLong: summary.summaryLong,
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      console.error("Failed to generate summary:", err);
      setSummaryError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  }, [resourceId, resource]);

  const hasSummary = !!aiData?.summaryShort || !!aiData?.summaryLong;

  const flashcards = aiData?.flashcards ?? [];

  // Chat handler
  const handleSendMessage = useCallback(async () => {
    if (!resourceId || !chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);
    setChatError(null);

    try {
      const response = await chatWithResource(resourceId, userMessage.content, chatMessages);
      const assistantMessage: ChatMessage = { role: 'assistant', content: response.answer };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Failed to get chat response:", err);
      setChatError(err instanceof Error ? err.message : "Failed to get response");
    } finally {
      setChatLoading(false);
    }
  }, [resourceId, chatInput, chatLoading, chatMessages]);

  useEffect(() => {
    setFlashcardIndex(0);
    setShowFlashcardBack(false);
  }, [flashcards.length]);

  const handleGenerateFlashcards = useCallback(async () => {
    if (!resourceId) return;

    try {
      setFlashcardsLoading(true);
      setFlashcardsError(null);
      const generated = await generateResourceFlashcards(resourceId);
      setAIData((prev) => ({
        ...(prev || {
          resourceId,
          placement: resource?.placement ?? null,
          college: resource?.college ?? null,
          department: resource?.department ?? null,
          year: resource?.year ?? null,
          semester: resource?.semester ?? null,
          course: resource?.course ?? null,
        }),
        flashcards: generated,
        updatedAt: new Date().toISOString(),
      }));
      setFlashcardIndex(0);
      setShowFlashcardBack(false);
    } catch (err) {
      console.error("Failed to generate flashcards:", err);
      setFlashcardsError(err instanceof Error ? err.message : "Failed to generate flashcards");
    } finally {
      setFlashcardsLoading(false);
    }
  }, [resourceId, resource]);

  const summaryContent = useMemo(() => {
    if (!hasSummary) return null;

    return (
      <div className="space-y-6">
        {aiData?.summaryShort && (
          <Card className="p-4 border-0 bg-primary/10">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Quick Summary</h3>
            <p className="text-sm mt-2 text-primary/80 leading-relaxed">{aiData.summaryShort}</p>
          </Card>
        )}

        {aiData?.summaryLong && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Detailed Summary</h3>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-line">
              {aiData.summaryLong}
            </div>
          </div>
        )}
      </div>
    );
  }, [aiData, hasSummary]);

  const flashcardContent = useMemo(() => {
    if (!flashcards.length) return null;

    const current = flashcards[Math.min(flashcardIndex, flashcards.length - 1)];
    if (!current) return null;

    return (
      <div className="space-y-6">
        <Card className="p-6 border border-primary/20 bg-background shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>Card {flashcardIndex + 1} of {flashcards.length}</span>
            <span>{showFlashcardBack ? "Answer" : "Prompt"}</span>
          </div>
          <div className="min-h-[120px] flex items-center justify-center text-center">
            <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap">
              {showFlashcardBack ? current.back : current.front}
            </p>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFlashcardBack((prev) => !prev)}
          >
            {showFlashcardBack ? "Hide Answer" : "Show Answer"}
          </Button>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              disabled={flashcardIndex === 0}
              onClick={() => {
                setFlashcardIndex((prev) => Math.max(prev - 1, 0));
                setShowFlashcardBack(false);
              }}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <Button
              variant="outline"
              disabled={flashcardIndex >= flashcards.length - 1}
              onClick={() => {
                setFlashcardIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
                setShowFlashcardBack(false);
              }}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }, [flashcards, flashcardIndex, showFlashcardBack]);

  const isPdf =
    resource?.file?.mimeType?.toLowerCase?.().includes("pdf") ||
    resource?.file?.format?.toLowerCase?.() === "pdf";

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.6));
  const handlePrevPage = () => setPageNumber((p) => Math.max(p - 1, 1));
  const handleNextPage = () =>
    setPageNumber((p) => (numPages ? Math.min(p + 1, numPages) : p));

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  if (!resourceId) {
    return (
      <NotFoundCard
        message="We couldn't find that resource."
        actionLabel="Back to Digital Library"
        to="/digital-library"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <Card className="p-8 text-center border-0 shadow-lg bg-secondary/20 space-y-4">
        <p className="text-destructive">{error || "Resource not found."}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-0"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        <div className="text-right flex-1 min-w-[200px]">
          <h1 className="text-xl md:text-2xl font-bold break-words">
            {resource.title}
          </h1>
          {resource.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {resource.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {resource.college && (
          <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
            {resource.college}
          </Badge>
        )}
        {resource.department && (
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
            {resource.department}
          </Badge>
        )}
        {resource.year && (
          <Badge variant="secondary" className="text-xs">
            {resource.year}
          </Badge>
        )}
        {resource.semester && (
          <Badge variant="secondary" className="text-xs">
            {resource.semester}
          </Badge>
        )}
        {resource.course && (
          <Badge variant="secondary" className="text-xs">
            {resource.course}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="viewer">Document</TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Summary
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Chat with PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="viewer" className="mt-0">
          {!isPdf && (
            <Card className="p-8 text-center border-0 shadow-lg bg-secondary/20 space-y-4">
              <p className="text-muted-foreground">
                This resource is not a PDF or cannot be rendered inline.
              </p>
              <Button asChild>
                <a
                  href={resource.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Open in new tab
                </a>
              </Button>
            </Card>
          )}

          {isPdf && (
            <Card className="border-0 shadow-lg bg-secondary/20 flex flex-col h-[70vh]">
              <div className="flex items-center justify-between px-4 py-2 border-b gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleZoomOut}
                    className="h-8 w-8"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-16 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleZoomIn}
                    className="h-8 w-8"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={pageNumber <= 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span>
                    Page {pageNumber} {numPages ? `of ${numPages}` : ""}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={numPages !== null && pageNumber >= numPages}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-muted/40 flex items-center justify-center">
                <Document
                  file={resource.file.url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(err) => {
                    console.error("Failed to render PDF:", err);
                    setError(
                      err instanceof Error
                        ? err.message
                        : "Failed to render PDF document."
                    );
                  }}
                  loading={
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  }
                  className="flex items-center justify-center"
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={zoom}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="summary" className="mt-0">
          <Card className="p-6 border-0 shadow-lg bg-secondary/20 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Summary
                </h3>
                <p className="text-sm text-muted-foreground">
                  Gemini generates a concise and detailed overview of this resource.
                </p>
              </div>
              <Button
                onClick={handleGenerateSummary}
                disabled={summaryLoading}
                className="flex items-center gap-2"
              >
                {summaryLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : hasSummary ? (
                  <>
                    <Sparkles className="w-4 h-4" /> Regenerate Summary
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Summary
                  </>
                )}
              </Button>
            </div>

            {summaryError && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {summaryError}
              </div>
            )}

            {summaryLoading && !hasSummary && (
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Preparing summary...
              </div>
            )}

            {!hasSummary && !summaryLoading && !summaryError && (
              <div className="text-sm text-muted-foreground">
                No summary generated yet. Click "Generate Summary" to create one.
              </div>
            )}

            {summaryContent}
          </Card>
        </TabsContent>

        <TabsContent value="flashcards" className="mt-0">
          <Card className="p-6 border-0 shadow-lg bg-secondary/20 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Flashcards
                </h3>
                <p className="text-sm text-muted-foreground">
                  Practice spaced-repetition cards generated from this resource.
                </p>
              </div>
              <Button
                onClick={handleGenerateFlashcards}
                disabled={flashcardsLoading}
                className="flex items-center gap-2"
              >
                {flashcardsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : flashcards.length ? (
                  <>
                    <Layers className="w-4 h-4" /> Regenerate
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" /> Generate
                  </>
                )}
              </Button>
            </div>

            {flashcardsError && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {flashcardsError}
              </div>
            )}

            {flashcardsLoading && !flashcards.length && (
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Building flashcards...
              </div>
            )}

            {!flashcards.length && !flashcardsLoading && !flashcardsError && (
              <div className="text-sm text-muted-foreground">
                No flashcards yet. Click "Generate" to create a deck for this resource.
              </div>
            )}

            {flashcardContent}

            {flashcards.length > 0 && (
              <div className="flex justify-end">
                <Button variant="outline" disabled>
                  Download deck (coming soon)
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <Card className="border-0 shadow-lg bg-secondary/20 flex flex-col h-[70vh]">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Chat with PDF
              </h3>
              <p className="text-sm text-muted-foreground">
                Ask any question about this document and get detailed explanations.
              </p>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.length === 0 && !chatLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Start a conversation about this document.</p>
                    <p className="text-xs mt-2">Try asking about key concepts, definitions, or explanations.</p>
                  </div>
                )}

                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}

                {chatError && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    {chatError}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about this document..."
                  disabled={chatLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={chatLoading || !chatInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
};

interface NotFoundCardProps {
  message: string;
  actionLabel: string;
  to: string;
}

const NotFoundCard = ({ message, actionLabel, to }: NotFoundCardProps) => (
  <Card className="p-10 text-center border-0 shadow-lg bg-secondary/20 space-y-4">
    <p className="text-muted-foreground">{message}</p>
    <Button asChild>
      <Link to={to}>{actionLabel}</Link>
    </Button>
  </Card>
);

export default DigitalLibrary;
