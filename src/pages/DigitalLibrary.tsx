import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import {
  Link,
  Outlet,
  useOutletContext,
  useParams,
  useRoutes,
  useNavigate,
} from "react-router-dom";
import { fetchResources, getResourceById } from "@/services/resourceService";
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
