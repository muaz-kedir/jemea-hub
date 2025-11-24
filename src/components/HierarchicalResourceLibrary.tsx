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
} from "lucide-react";
import type { ClassifiedResource } from "@/types/resources";

interface HierarchyNode {
  college: string;
  departments: {
    [key: string]: {
      years: {
        [key: string]: {
          semesters: {
            [key: string]: ClassifiedResource[];
          };
        };
      };
    };
  };
}

interface ExpandedState {
  [key: string]: boolean;
}

interface HierarchicalResourceLibraryProps {
  resources: ClassifiedResource[];
  onDelete: (id: string) => Promise<void>;
  onView: (resource: ClassifiedResource) => void;
  loading?: boolean;
}

const inferYear = (semesterName: string): string => {
  const semesterNum = parseInt(semesterName.match(/\d+/)?.[0] || "1");
  if (semesterNum <= 2) return "Year 1";
  if (semesterNum <= 4) return "Year 2";
  if (semesterNum <= 6) return "Year 3";
  if (semesterNum <= 8) return "Year 4";
  return "Year 5";
};

export const HierarchicalResourceLibrary = ({
  resources,
  onDelete,
  onView,
  loading = false,
}: HierarchicalResourceLibraryProps) => {
  const [expandedState, setExpandedState] = useState<ExpandedState>({});
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Build hierarchy from resources
  const hierarchy = useMemo(() => {
    const result: { [college: string]: HierarchyNode["departments"] } = {};

    resources.forEach((resource) => {
      if (resource.placement !== "academic") return;

      const college = resource.college || "Uncategorized";
      const department = resource.department || "General";
      const semester = resource.semester || "Semester 1";
      const year = inferYear(semester);

      if (!result[college]) {
        result[college] = {};
      }
      if (!result[college][department]) {
        result[college][department] = { years: {} };
      }
      if (!result[college][department].years[year]) {
        result[college][department].years[year] = { semesters: {} };
      }
      if (!result[college][department].years[year].semesters[semester]) {
        result[college][department].years[year].semesters[semester] = [];
      }

      result[college][department].years[year].semesters[semester].push(resource);
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
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const colleges = Object.keys(hierarchy).sort();
  const selectedResources = selectedSemester
    ? resources.filter(
        (r) =>
          r.placement === "academic" &&
          r.semester === selectedSemester.split("|")[1]
      )
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Sidebar - Hierarchy Tree */}
      <div className="lg:col-span-1 bg-secondary/30 rounded-lg border border-border p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">Academic Structure</h3>
        </div>

        <div className="space-y-2">
          {colleges.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-8">
              No academic resources yet
            </div>
          ) : (
            colleges.map((college) => {
              const collegeKey = `college-${college}`;
              const isCollegeExpanded = expandedState[collegeKey];
              const departments = Object.keys(hierarchy[college]).sort();

              return (
                <div key={college} className="space-y-1">
                  {/* College */}
                  <button
                    onClick={() => toggleExpand(collegeKey)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-secondary/50 transition-colors text-left text-sm font-medium"
                  >
                    {isCollegeExpanded ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )}
                    <FolderOpen className="w-4 h-4 flex-shrink-0 text-primary" />
                    <span className="truncate">{college}</span>
                  </button>

                  {/* Departments */}
                  {isCollegeExpanded && (
                    <div className="ml-4 space-y-1">
                      {departments.map((department) => {
                        const deptKey = `dept-${college}-${department}`;
                        const isDeptExpanded = expandedState[deptKey];
                        const years = Object.keys(
                          hierarchy[college][department].years
                        ).sort();

                        return (
                          <div key={department} className="space-y-1">
                            {/* Department */}
                            <button
                              onClick={() => toggleExpand(deptKey)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-secondary/50 transition-colors text-left text-xs font-medium text-muted-foreground"
                            >
                              {isDeptExpanded ? (
                                <ChevronDown className="w-3 h-3 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                              )}
                              <FolderOpen className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{department}</span>
                            </button>

                            {/* Years */}
                            {isDeptExpanded && (
                              <div className="ml-4 space-y-1">
                                {years.map((year) => {
                                  const yearKey = `year-${college}-${department}-${year}`;
                                  const isYearExpanded = expandedState[yearKey];
                                  const semesters = Object.keys(
                                    hierarchy[college][department].years[year]
                                      .semesters
                                  ).sort();

                                  return (
                                    <div key={year} className="space-y-1">
                                      {/* Year */}
                                      <button
                                        onClick={() => toggleExpand(yearKey)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-secondary/50 transition-colors text-left text-xs font-medium text-muted-foreground"
                                      >
                                        {isYearExpanded ? (
                                          <ChevronDown className="w-3 h-3 flex-shrink-0" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                        )}
                                        <span className="truncate">{year}</span>
                                      </button>

                                      {/* Semesters */}
                                      {isYearExpanded && (
                                        <div className="ml-4 space-y-1">
                                          {semesters.map((semester) => {
                                            const semesterKey = `${college}|${semester}`;
                                            const resourceCount =
                                              hierarchy[college][department]
                                                .years[year].semesters[semester]
                                                .length;
                                            const isSelected =
                                              selectedSemester === semesterKey;

                                            return (
                                              <button
                                                key={semester}
                                                onClick={() =>
                                                  setSelectedSemester(
                                                    isSelected
                                                      ? null
                                                      : semesterKey
                                                  )
                                                }
                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors text-left text-xs ${
                                                  isSelected
                                                    ? "bg-primary/20 text-primary font-medium"
                                                    : "hover:bg-secondary/50 text-muted-foreground"
                                                }`}
                                              >
                                                <FileText className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate flex-1">
                                                  {semester}
                                                </span>
                                                <Badge
                                                  variant="secondary"
                                                  className="text-xs px-1.5 py-0"
                                                >
                                                  {resourceCount}
                                                </Badge>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Resource List */}
      <div className="lg:col-span-2 space-y-4">
        {selectedSemester ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedSemester.split("|")[1]}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedResources.length} resource
                  {selectedResources.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSemester(null)}
              >
                Clear Selection
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading resources...</div>
              </div>
            ) : selectedResources.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No resources in this semester
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {selectedResources.map((resource) => (
                  <Card
                    key={resource.id}
                    className="p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                          <h3 className="font-semibold truncate">
                            {resource.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {resource.placement}
                          </Badge>
                        </div>

                        {resource.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {resource.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {resource.college && (
                            <Badge variant="outline" className="text-xs">
                              {resource.college}
                            </Badge>
                          )}
                          {resource.department && (
                            <Badge variant="outline" className="text-xs">
                              {resource.department}
                            </Badge>
                          )}
                          {resource.semester && (
                            <Badge variant="outline" className="text-xs">
                              {resource.semester}
                            </Badge>
                          )}
                          {resource.postedBy && (
                            <span>Posted by {resource.postedBy}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(resource)}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          View
                        </Button>
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
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Select a Semester</h3>
            <p className="text-muted-foreground">
              Choose a semester from the left panel to view its resources
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
