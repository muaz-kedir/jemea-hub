import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, FileText, Download, Loader2, FolderOpen } from "lucide-react";
import {
  Link,
  Outlet,
  useOutletContext,
  useParams,
  useRoutes,
} from "react-router-dom";
import { fetchResources } from "@/services/resourceService";
import type { ClassifiedResource } from "@/types/resources";
import { getCourseById, getCoursesByDepartmentAndSemester } from "@/data/academic-structure";
import { useAcademicStructure } from "@/context/AcademicStructureContext";

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
          path: "college/:collegeId/department/:departmentId/semester/:semesterId/course/:courseId",
          element: <CourseView />,
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
                          to={`semester/${semester.id}/course/${course.id}`}
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

  const [resources, setResources] = useState<ClassifiedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const college = academicColleges.find((c) => c.id === collegeId);
  const department = college?.departments.find((d) => d.id === departmentId);
  const year = department?.years.find((y) => y.id === yearId);
  const semester = year?.semesters.find((s) => s.id === semesterId);

  useEffect(() => {
    const loadResources = async () => {
      if (!college || !department || !semester) return;

      try {
        setLoading(true);
        setError(null);

        const data = await fetchResources({
          placement: 'academic',
          college: college.name,
          department: department.name,
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
  }, [college, department, semester]);

  if (!college || !department || !semester) {
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
                    <a
                      href={`${resource.file.url}?fl_attachment:inline`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View
                    </a>
                  </Button>
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
  const { collegeId, departmentId, semesterId, courseId } = useParams<{
    collegeId: string;
    departmentId: string;
    semesterId: string;
    courseId: string;
  }>();
  const { academicColleges } = useAcademicStructure();

  const [resources, setResources] = useState<ClassifiedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const college = academicColleges.find((c) => c.id === collegeId);
  const department = college?.departments.find((d) => d.id === departmentId);
  const year = department?.years[0];
  const semester = year?.semesters.find((s) => s.id === semesterId);
  const course = semester?.courses.find((c) => c.id === courseId);

  useEffect(() => {
    const loadResources = async () => {
      if (!college || !department || !semester || !course) return;

      try {
        setLoading(true);
        setError(null);

        const data = await fetchResources({
          placement: 'academic',
          college: college.name,
          department: department.name,
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
  }, [college, department, semester, course]);

  if (!college || !department || !semester || !course) {
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
                    <a
                      href={`${resource.file.url}?fl_attachment:inline`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View
                    </a>
                  </Button>
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
                </div>
              </div>
            </Card>
          ))}
        </section>
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
