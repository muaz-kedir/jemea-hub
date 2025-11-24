import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  Trash2,
  BookOpen,
  FolderOpen,
  Home,
  Calendar,
  Building2,
  Eye,
} from "lucide-react";
import type { ClassifiedResource } from "@/types/resources";

interface NavigationBreadcrumb {
  level: "home" | "college" | "department" | "year" | "semester" | "course";
  label: string;
  value?: string;
}

interface ExpandedState {
  [key: string]: boolean;
}

interface DigitalLibraryHierarchyProps {
  resources: ClassifiedResource[];
  onDelete?: (id: string) => Promise<void>;
  isAdmin?: boolean;
}

const inferYear = (semesterName: string): string => {
  const semesterNum = parseInt(semesterName.match(/\d+/)?.[0] || "1");
  if (semesterNum <= 2) return "Year 1";
  if (semesterNum <= 4) return "Year 2";
  if (semesterNum <= 6) return "Year 3";
  if (semesterNum <= 8) return "Year 4";
  return "Year 5";
};

interface HierarchyStructure {
  [college: string]: {
    departments: {
      [department: string]: {
        years: {
          [year: string]: {
            semesters: {
              [semester: string]: {
                courses: {
                  [course: string]: ClassifiedResource[];
                };
              };
            };
          };
        };
      };
    };
  };
}

export const DigitalLibraryHierarchy = ({
  resources,
  onDelete,
  isAdmin = false,
}: DigitalLibraryHierarchyProps) => {
  const [expandedState, setExpandedState] = useState<ExpandedState>({});
  const [breadcrumbs, setBreadcrumbs] = useState<NavigationBreadcrumb[]>([
    { level: "home", label: "Home" },
  ]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Build hierarchy from resources
  const hierarchy = useMemo(() => {
    const result: HierarchyStructure = {};

    resources.forEach((resource) => {
      if (resource.placement !== "academic") return;

      const college = resource.college || "Uncategorized";
      const department = resource.department || "General";
      const semester = resource.semester || "Semester 1";
      const year = inferYear(semester);
      const course = resource.course || "General";

      if (!result[college]) {
        result[college] = { departments: {} };
      }
      if (!result[college].departments[department]) {
        result[college].departments[department] = { years: {} };
      }
      if (!result[college].departments[department].years[year]) {
        result[college].departments[department].years[year] = { semesters: {} };
      }
      if (!result[college].departments[department].years[year].semesters[semester]) {
        result[college].departments[department].years[year].semesters[semester] = {
          courses: {},
        };
      }
      if (!result[college].departments[department].years[year].semesters[semester].courses[course]) {
        result[college].departments[department].years[year].semesters[semester].courses[course] = [];
      }

      result[college].departments[department].years[year].semesters[semester].courses[course].push(
        resource
      );
    });

    return result;
  }, [resources]);

  const toggleExpand = (key: string) => {
    setExpandedState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    if (!onDelete) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const navigateToCollege = (collegeName: string) => {
    setBreadcrumbs([
      { level: "home", label: "Home" },
      { level: "college", label: collegeName, value: collegeName },
    ]);
  };

  const navigateToDepartment = (collegeName: string, departmentName: string) => {
    setBreadcrumbs([
      { level: "home", label: "Home" },
      { level: "college", label: collegeName, value: collegeName },
      { level: "department", label: departmentName, value: departmentName },
    ]);
  };

  const navigateToYear = (
    collegeName: string,
    departmentName: string,
    yearName: string
  ) => {
    setBreadcrumbs([
      { level: "home", label: "Home" },
      { level: "college", label: collegeName, value: collegeName },
      { level: "department", label: departmentName, value: departmentName },
      { level: "year", label: yearName, value: yearName },
    ]);
  };

  const navigateToSemester = (
    collegeName: string,
    departmentName: string,
    yearName: string,
    semesterName: string
  ) => {
    setBreadcrumbs([
      { level: "home", label: "Home" },
      { level: "college", label: collegeName, value: collegeName },
      { level: "department", label: departmentName, value: departmentName },
      { level: "year", label: yearName, value: yearName },
      { level: "semester", label: semesterName, value: semesterName },
    ]);
  };

  const navigateToCourse = (
    collegeName: string,
    departmentName: string,
    yearName: string,
    semesterName: string,
    courseName: string
  ) => {
    setBreadcrumbs([
      { level: "home", label: "Home" },
      { level: "college", label: collegeName, value: collegeName },
      { level: "department", label: departmentName, value: departmentName },
      { level: "year", label: yearName, value: yearName },
      { level: "semester", label: semesterName, value: semesterName },
      { level: "course", label: courseName, value: courseName },
    ]);
  };

  const goHome = () => {
    setBreadcrumbs([{ level: "home", label: "Home" }]);
  };

  const currentLevel = breadcrumbs[breadcrumbs.length - 1]?.level;
  const colleges = Object.keys(hierarchy).sort();

  // Render different views based on current breadcrumb level
  const renderContent = () => {
    if (currentLevel === "home") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges.map((college) => {
            const deptCount = Object.keys(hierarchy[college].departments).length;
            const resourceCount = Object.values(hierarchy[college].departments).reduce(
              (acc, dept) => {
                return (
                  acc +
                  Object.values(dept.years).reduce((yacc, year) => {
                    return (
                      yacc +
                      Object.values(year.semesters).reduce((sacc, sem) => {
                        return (
                          sacc +
                          Object.values(sem.courses).reduce(
                            (cacc, courses) => cacc + courses.length,
                            0
                          )
                        );
                      }, 0)
                    );
                  }, 0)
                );
              },
              0
            );

            return (
              <Card
                key={college}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-0 bg-secondary/30"
                onClick={() => navigateToCollege(college)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{college}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {deptCount} Department{deptCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {resourceCount} Resource{resourceCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Card>
            );
          })}
        </div>
      );
    }

    if (currentLevel === "college") {
      const collegeName = breadcrumbs[1]?.value;
      if (!collegeName || !hierarchy[collegeName]) return null;

      const departments = Object.keys(hierarchy[collegeName].departments).sort();

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((department) => {
            const yearCount = Object.keys(
              hierarchy[collegeName].departments[department].years
            ).length;
            const resourceCount = Object.values(
              hierarchy[collegeName].departments[department].years
            ).reduce((acc, year) => {
              return (
                acc +
                Object.values(year.semesters).reduce((sacc, sem) => {
                  return (
                    sacc +
                    Object.values(sem.courses).reduce(
                      (cacc, courses) => cacc + courses.length,
                      0
                    )
                  );
                }, 0)
              );
            }, 0);

            return (
              <Card
                key={department}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-0 bg-secondary/30"
                onClick={() => navigateToDepartment(collegeName, department)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{department}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {yearCount} Year{yearCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {resourceCount} Resource{resourceCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Card>
            );
          })}
        </div>
      );
    }

    if (currentLevel === "department") {
      const collegeName = breadcrumbs[1]?.value;
      const departmentName = breadcrumbs[2]?.value;
      if (!collegeName || !departmentName || !hierarchy[collegeName]?.departments[departmentName])
        return null;

      const years = Object.keys(
        hierarchy[collegeName].departments[departmentName].years
      ).sort();

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {years.map((year) => {
            const semesterCount = Object.keys(
              hierarchy[collegeName].departments[departmentName].years[year].semesters
            ).length;
            const resourceCount = Object.values(
              hierarchy[collegeName].departments[departmentName].years[year].semesters
            ).reduce((acc, sem) => {
              return (
                acc +
                Object.values(sem.courses).reduce(
                  (cacc, courses) => cacc + courses.length,
                  0
                )
              );
            }, 0);

            return (
              <Card
                key={year}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-0 bg-secondary/30"
                onClick={() => navigateToYear(collegeName, departmentName, year)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{year}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {semesterCount} Semester{semesterCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {resourceCount} Resource{resourceCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Card>
            );
          })}
        </div>
      );
    }

    if (currentLevel === "year") {
      const collegeName = breadcrumbs[1]?.value;
      const departmentName = breadcrumbs[2]?.value;
      const yearName = breadcrumbs[3]?.value;
      if (
        !collegeName ||
        !departmentName ||
        !yearName ||
        !hierarchy[collegeName]?.departments[departmentName]?.years[yearName]
      )
        return null;

      const semesters = Object.keys(
        hierarchy[collegeName].departments[departmentName].years[yearName].semesters
      ).sort();

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {semesters.map((semester) => {
            const courseCount = Object.keys(
              hierarchy[collegeName].departments[departmentName].years[yearName].semesters[
                semester
              ].courses
            ).length;
            const resourceCount = Object.values(
              hierarchy[collegeName].departments[departmentName].years[yearName].semesters[
                semester
              ].courses
            ).reduce((acc, courses) => acc + courses.length, 0);

            return (
              <Card
                key={semester}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-0 bg-secondary/30"
                onClick={() =>
                  navigateToSemester(collegeName, departmentName, yearName, semester)
                }
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{semester}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {courseCount} Course{courseCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {resourceCount} Resource{resourceCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Card>
            );
          })}
        </div>
      );
    }

    if (currentLevel === "semester") {
      const collegeName = breadcrumbs[1]?.value;
      const departmentName = breadcrumbs[2]?.value;
      const yearName = breadcrumbs[3]?.value;
      const semesterName = breadcrumbs[4]?.value;
      if (
        !collegeName ||
        !departmentName ||
        !yearName ||
        !semesterName ||
        !hierarchy[collegeName]?.departments[departmentName]?.years[yearName]?.semesters[
          semesterName
        ]
      )
        return null;

      const courses = Object.keys(
        hierarchy[collegeName].departments[departmentName].years[yearName].semesters[semesterName]
          .courses
      ).sort();

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const resourceCount =
              hierarchy[collegeName].departments[departmentName].years[yearName].semesters[
                semesterName
              ].courses[course].length;

            return (
              <Card
                key={course}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-0 bg-secondary/30"
                onClick={() =>
                  navigateToCourse(
                    collegeName,
                    departmentName,
                    yearName,
                    semesterName,
                    course
                  )
                }
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{course}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {resourceCount} File{resourceCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Card>
            );
          })}
        </div>
      );
    }

    if (currentLevel === "course") {
      const collegeName = breadcrumbs[1]?.value;
      const departmentName = breadcrumbs[2]?.value;
      const yearName = breadcrumbs[3]?.value;
      const semesterName = breadcrumbs[4]?.value;
      const courseName = breadcrumbs[5]?.value;
      if (
        !collegeName ||
        !departmentName ||
        !yearName ||
        !semesterName ||
        !courseName ||
        !hierarchy[collegeName]?.departments[departmentName]?.years[yearName]?.semesters[
          semesterName
        ]?.courses[courseName]
      )
        return null;

      const courseResources =
        hierarchy[collegeName].departments[departmentName].years[yearName].semesters[semesterName]
          .courses[courseName];

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{courseName}</h2>
            <Badge variant="secondary">{courseResources.length} Files</Badge>
          </div>

          <div className="space-y-3">
            {courseResources.map((resource) => (
              <Card key={resource.id} className="p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                      <h3 className="font-semibold truncate">{resource.title}</h3>
                    </div>

                    {resource.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {resource.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {resource.createdAt && (
                        <span>
                          Uploaded:{" "}
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {resource.postedBy && <span>• By {resource.postedBy}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(resource.file.url, "_blank")}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(resource.id)}
                        disabled={deletingId === resource.id}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingId === resource.id ? "..." : "Delete"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm overflow-x-auto pb-2">
        <button
          onClick={goHome}
          className="flex items-center gap-1 text-primary hover:underline flex-shrink-0"
        >
          <Home className="w-4 h-4" />
          Home
        </button>

        {breadcrumbs.slice(1).map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-2 flex-shrink-0">
            <span className="text-muted-foreground">/</span>
            <button
              onClick={() => {
                const newBreadcrumbs = breadcrumbs.slice(0, idx + 2);
                setBreadcrumbs(newBreadcrumbs);
              }}
              className="text-primary hover:underline"
            >
              {crumb.label}
            </button>
          </div>
        ))}
      </div>

      {/* Content */}
      {colleges.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">No Resources Yet</h3>
          <p className="text-muted-foreground">
            Academic resources will appear here once they are uploaded.
          </p>
        </Card>
      ) : (
        renderContent()
      )}
    </div>
  );
};
