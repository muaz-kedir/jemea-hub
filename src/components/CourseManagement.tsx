import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getCollegeById, getDepartmentById } from "@/data/academic-structure";
import { useAcademicStructure } from "@/context/AcademicStructureContext";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface CourseManagementProps {
  onCoursesUpdate?: () => void;
}

export const CourseManagement = ({ onCoursesUpdate }: CourseManagementProps) => {
  const { toast } = useToast();
  const { academicColleges, updateCourses, addCourse } = useAcademicStructure();

  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");

  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseName, setEditingCourseName] = useState("");
  const [editingCourseCode, setEditingCourseCode] = useState("");

  const selectedCollege = useMemo(() => {
    if (!selectedCollegeId) return null;
    return getCollegeById(selectedCollegeId);
  }, [selectedCollegeId]);

  const selectedDepartment = useMemo(() => {
    if (!selectedCollegeId || !selectedDepartmentId) return null;
    return getDepartmentById(selectedCollegeId, selectedDepartmentId);
  }, [selectedCollegeId, selectedDepartmentId]);

  const availableYears = selectedDepartment?.years ?? [];
  const selectedYear = useMemo(() => {
    if (!selectedYearId) return null;
    return availableYears.find((year) => year.id === selectedYearId) ?? null;
  }, [availableYears, selectedYearId]);

  const availableSemesters = selectedYear?.semesters ?? [];
  const selectedSemester = useMemo(() => {
    if (!selectedSemesterId) return null;
    return availableSemesters.find((s) => s.id === selectedSemesterId) ?? null;
  }, [availableSemesters, selectedSemesterId]);

  const availableCourses = selectedSemester?.courses ?? [];

  const handleAddCourse = () => {
    if (!newCourseName.trim() || !newCourseCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter both course name and code.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSemester) {
      toast({
        title: "Error",
        description: "Please select a semester first.",
        variant: "destructive",
      });
      return;
    }

    // Add course to the semester
    const newCourse = {
      id: `course-${Date.now()}`,
      name: newCourseName.trim(),
      code: newCourseCode.trim(),
    };

    // Use addCourse to append instead of replace
    addCourse(selectedCollegeId, selectedDepartmentId, selectedYearId, selectedSemesterId, newCourse);

    setNewCourseName("");
    setNewCourseCode("");

    toast({
      title: "Success",
      description: `Course "${newCourseName}" added successfully.`,
    });

    onCoursesUpdate?.();
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!selectedSemester) return;

    const courseIndex = selectedSemester.courses.findIndex((c) => c.id === courseId);
    if (courseIndex > -1) {
      const courseName = selectedSemester.courses[courseIndex].name;
      const updatedCourses = selectedSemester.courses.filter((c) => c.id !== courseId);
      updateCourses(selectedCollegeId, selectedDepartmentId, selectedYearId, selectedSemesterId, updatedCourses);

      toast({
        title: "Success",
        description: `Course "${courseName}" removed successfully.`,
      });

      onCoursesUpdate?.();
    }
  };

  const handleEditCourse = (courseId: string) => {
    if (!selectedSemester) return;

    const course = selectedSemester.courses.find((c) => c.id === courseId);
    if (course) {
      setEditingCourseId(courseId);
      setEditingCourseName(course.name);
      setEditingCourseCode(course.code);
    }
  };

  const handleSaveEdit = () => {
    if (!editingCourseId || !selectedSemester) return;

    if (!editingCourseName.trim() || !editingCourseCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter both course name and code.",
        variant: "destructive",
      });
      return;
    }

    const updatedCourses = selectedSemester.courses.map((c) =>
      c.id === editingCourseId
        ? { ...c, name: editingCourseName.trim(), code: editingCourseCode.trim() }
        : c
    );
    updateCourses(selectedCollegeId, selectedDepartmentId, selectedYearId, selectedSemesterId, updatedCourses);

    setEditingCourseId(null);
    setEditingCourseName("");
    setEditingCourseCode("");

    toast({
      title: "Success",
      description: "Course updated successfully.",
    });

    onCoursesUpdate?.();
  };

  const handleCancelEdit = () => {
    setEditingCourseId(null);
    setEditingCourseName("");
    setEditingCourseCode("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Course Management</h2>
        <p className="text-muted-foreground">Add, edit, or remove courses from semesters.</p>
      </div>

      {/* Selection Controls */}
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="college-select">College</Label>
            <Select value={selectedCollegeId} onValueChange={setSelectedCollegeId}>
              <SelectTrigger id="college-select">
                <SelectValue placeholder="Select a college" />
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

          <div className="space-y-2">
            <Label htmlFor="department-select">Department</Label>
            <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
              <SelectTrigger id="department-select" disabled={!selectedCollege}>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {selectedCollege?.departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year-select">Year</Label>
            <Select value={selectedYearId} onValueChange={setSelectedYearId}>
              <SelectTrigger id="year-select" disabled={!selectedDepartment}>
                <SelectValue placeholder="Select a year" />
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

          <div className="space-y-2">
            <Label htmlFor="semester-select">Semester</Label>
            <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
              <SelectTrigger id="semester-select" disabled={!selectedYear}>
                <SelectValue placeholder="Select a semester" />
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
      </Card>

      {/* Add Course Section */}
      {selectedSemester && (
        <Card className="p-6 space-y-4 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold">Add New Course</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-code">Course Code</Label>
              <Input
                id="course-code"
                placeholder="e.g., CS101"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-name">Course Name</Label>
              <Input
                id="course-name"
                placeholder="e.g., Introduction to Programming"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddCourse} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Courses List */}
      {selectedSemester && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Courses in {selectedSemester.name}
            </h3>
            <Badge variant="secondary">{availableCourses.length} courses</Badge>
          </div>

          {availableCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No courses yet. Add your first course above.
            </div>
          ) : (
            <div className="space-y-2">
              {availableCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  {editingCourseId === course.id ? (
                    <div className="flex-1 flex gap-2 mr-4">
                      <Input
                        placeholder="Course Code"
                        value={editingCourseCode}
                        onChange={(e) => setEditingCourseCode(e.target.value)}
                        className="w-24"
                      />
                      <Input
                        placeholder="Course Name"
                        value={editingCourseName}
                        onChange={(e) => setEditingCourseName(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="font-mono font-semibold text-sm">{course.code}</div>
                      <div className="text-sm text-muted-foreground">{course.name}</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editingCourseId === course.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleSaveEdit}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCourse(course.id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
