import React, { createContext, useContext, useState, useEffect } from 'react';
import { academicColleges as initialAcademicColleges, AcademicCollege } from '@/data/academic-structure';

interface AcademicStructureContextType {
  academicColleges: AcademicCollege[];
  updateCourses: (collegeId: string, departmentId: string, yearId: string, semesterId: string, courses: any[]) => void;
  addCourse: (collegeId: string, departmentId: string, yearId: string, semesterId: string, course: any) => void;
  refreshTrigger: number;
}

const AcademicStructureContext = createContext<AcademicStructureContextType | undefined>(undefined);

export const AcademicStructureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [academicColleges, setAcademicColleges] = useState<AcademicCollege[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize with deep copy of initial data
  useEffect(() => {
    setAcademicColleges(JSON.parse(JSON.stringify(initialAcademicColleges)));
  }, []);

  const updateCourses = (collegeId: string, departmentId: string, yearId: string, semesterId: string, courses: any[]) => {
    setAcademicColleges((prevColleges) => {
      const newColleges = JSON.parse(JSON.stringify(prevColleges));
      const college = newColleges.find((c: AcademicCollege) => c.id === collegeId);
      if (college) {
        const department = college.departments.find((d: any) => d.id === departmentId);
        if (department) {
          const year = department.years.find((y: any) => y.id === yearId);
          if (year) {
            const semester = year.semesters.find((s: any) => s.id === semesterId);
            if (semester) {
              semester.courses = courses;
            }
          }
        }
      }
      return newColleges;
    });
    setRefreshTrigger((prev) => prev + 1);
  };

  const addCourse = (collegeId: string, departmentId: string, yearId: string, semesterId: string, course: any) => {
    setAcademicColleges((prevColleges) => {
      const newColleges = JSON.parse(JSON.stringify(prevColleges));
      const college = newColleges.find((c: AcademicCollege) => c.id === collegeId);
      if (college) {
        const department = college.departments.find((d: any) => d.id === departmentId);
        if (department) {
          const year = department.years.find((y: any) => y.id === yearId);
          if (year) {
            const semester = year.semesters.find((s: any) => s.id === semesterId);
            if (semester) {
              // Append course to existing courses instead of replacing
              semester.courses = [...(semester.courses || []), course];
            }
          }
        }
      }
      return newColleges;
    });
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AcademicStructureContext.Provider value={{ academicColleges, updateCourses, addCourse, refreshTrigger }}>
      {children}
    </AcademicStructureContext.Provider>
  );
};

export const useAcademicStructure = () => {
  const context = useContext(AcademicStructureContext);
  if (!context) {
    throw new Error('useAcademicStructure must be used within AcademicStructureProvider');
  }
  return context;
};
