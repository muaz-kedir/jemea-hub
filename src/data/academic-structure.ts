export interface AcademicCourse {
  id: string;
  name: string;
  code: string;
}

export interface AcademicSemester {
  id: string;
  name: string;
  courses: AcademicCourse[];
}

export interface AcademicYear {
  id: string;
  name: string;
  semesters: AcademicSemester[];
}

export interface AcademicDepartment {
  id: string;
  name: string;
  years: AcademicYear[];
}

export interface AcademicCollege {
  id: string;
  name: string;
  departments: AcademicDepartment[];
}

// Sample courses for each semester
const createCoursesForSemester = (departmentPrefix: string, semesterNumber: number, courseCount: number = 3): AcademicCourse[] =>
  Array.from({ length: courseCount }, (_, index) => ({
    id: `course-${departmentPrefix}-sem${semesterNumber}-${index + 1}`,
    code: `${departmentPrefix.toUpperCase()}${semesterNumber}${String(index + 1).padStart(2, '0')}`,
    name: `${departmentPrefix} Semester ${semesterNumber} Course ${index + 1}`,
  }));

const baseSemesters: AcademicSemester[] = [
  { 
    id: 'semester-1', 
    name: 'Semester 1',
    courses: []
  },
  { 
    id: 'semester-2', 
    name: 'Semester 2',
    courses: []
  },
];

const createYears = (departmentPrefix: string, count: number): AcademicYear[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `year-${index + 1}`,
    name: `Year ${index + 1}`,
    semesters: [
      {
        id: 'semester-1',
        name: 'Semester 1',
        courses: createCoursesForSemester(departmentPrefix, 1, 3),
      },
      {
        id: 'semester-2',
        name: 'Semester 2',
        courses: createCoursesForSemester(departmentPrefix, 2, 3),
      },
    ],
  }));

export const academicColleges: AcademicCollege[] = [
  {
    id: 'college-agriculture-environment',
    name: 'College of Agriculture and Environmental Science',
    departments: [
      {
        id: 'dept-agro-economics-agri-business',
        name: 'Agro Economics and Agri Business',
        years: createYears('agroeconomics', 4),
      },
      {
        id: 'dept-animal-range-science',
        name: 'Animal Range and Science',
        years: createYears('animalscience', 4),
      },
      {
        id: 'dept-natural-resource-management',
        name: 'Natural Resource Management',
        years: createYears('naturalresource', 4),
      },
      {
        id: 'dept-environmental-science',
        name: 'Environmental Science',
        years: createYears('envscience', 4),
      },
      {
        id: 'dept-plant-science',
        name: 'Plant Science',
        years: createYears('plantscience', 4),
      },
      {
        id: 'dept-rural-development-innovation',
        name: 'Rural Development and Agricultural Innovation',
        years: createYears('ruraldevelopment', 4),
      },
    ],
  },
  {
    id: 'college-business-economics',
    name: 'College of Business and Economics',
    departments: [
      {
        id: 'dept-accounting-finance',
        name: 'Accounting and Finance',
        years: createYears('accounting', 4),
      },
      {
        id: 'dept-cooperatives',
        name: 'Cooperatives',
        years: createYears('cooperatives', 4),
      },
      {
        id: 'dept-economics',
        name: 'Economics',
        years: createYears('economics', 4),
      },
      {
        id: 'dept-management',
        name: 'Management',
        years: createYears('management', 4),
      },
      {
        id: 'dept-public-administration',
        name: 'Public Administration and Development Management',
        years: createYears('publicadmin', 4),
      },
    ],
  },
  {
    id: 'college-computing-informatics',
    name: 'College of Computing and Informatics',
    departments: [
      {
        id: 'dept-computer-science',
        name: 'Computer Science',
        years: createYears('cs', 4),
      },
      {
        id: 'dept-information-systems',
        name: 'Information Systems',
        years: createYears('is', 4),
      },
      {
        id: 'dept-information-technology',
        name: 'Information Technology',
        years: createYears('it', 4),
      },
      {
        id: 'dept-software-engineering',
        name: 'Software Engineering',
        years: createYears('se', 5),
      },
      {
        id: 'dept-information-science',
        name: 'Information Science',
        years: createYears('infoscience', 4),
      },
      {
        id: 'dept-statistics-computing',
        name: 'Statistics',
        years: createYears('stats', 4),
      },
    ],
  },
  {
    id: 'college-education-behavioral',
    name: 'College of Educational and Behavioral Science',
    departments: [
      {
        id: 'dept-adult-education',
        name: 'Adult Education and Community Development',
        years: createYears('adulted', 4),
      },
      {
        id: 'dept-educational-planning',
        name: 'Educational Planning and Management',
        years: createYears('edplan', 4),
      },
      {
        id: 'dept-psychology',
        name: 'Psychology',
        years: createYears('psych', 4),
      },
      {
        id: 'dept-special-needs-education',
        name: 'Special Needs and Inclusive Education',
        years: createYears('specialed', 4),
      },
    ],
  },
  {
    id: 'college-natural-computational',
    name: 'College of Natural and Computational Science',
    departments: [
      {
        id: 'dept-mathematics',
        name: 'Mathematics',
        years: createYears('math', 4),
      },
      {
        id: 'dept-physics',
        name: 'Physics',
        years: createYears('physics', 4),
      },
      {
        id: 'dept-chemistry',
        name: 'Chemistry',
        years: createYears('chem', 4),
      },
      {
        id: 'dept-biology',
        name: 'Biology',
        years: createYears('bio', 4),
      },
      {
        id: 'dept-biotechnology',
        name: 'Biotechnology',
        years: createYears('biotech', 4),
      },
    ],
  },
  {
    id: 'college-social-science',
    name: 'College of Social Science',
    departments: [
      {
        id: 'dept-geography',
        name: 'Geography and Environmental Studies',
        years: createYears('geography', 4),
      },
      {
        id: 'dept-history',
        name: 'History and Heritage Management',
        years: createYears('history', 4),
      },
      {
        id: 'dept-foreign-language',
        name: 'Foreign Language Studies',
        years: createYears('foreignlang', 4),
      },
      {
        id: 'dept-afaan-oromoo',
        name: 'Afaan Oromoo',
        years: createYears('afaanoromoo', 4),
      },
      {
        id: 'dept-gender-development',
        name: 'Gender and Development Studies',
        years: createYears('gender', 4),
      },
      {
        id: 'dept-sociology',
        name: 'Sociology',
        years: createYears('sociology', 4),
      },
    ],
  },
  {
    id: 'college-law',
    name: 'College of Law',
    departments: [
      {
        id: 'dept-law',
        name: 'Law',
        years: createYears('law', 5),
      },
    ],
  },
  {
    id: 'college-sport-science',
    name: 'College of Sport Science',
    departments: [
      {
        id: 'dept-sport-science',
        name: 'Sport Science',
        years: createYears('sports', 4),
      },
      {
        id: 'dept-physical-education',
        name: 'Physical Education',
        years: createYears('pe', 4),
      },
    ],
  },
];


export const yearOptions = academicColleges[0]?.departments[0]?.years.map((year) => ({ id: year.id, name: year.name })) || [];
export const semesterOptions = baseSemesters.map((semester) => ({ id: semester.id, name: semester.name }));

export const getCollegeById = (collegeId: string) =>
  academicColleges.find((college) => college.id === collegeId) || null;

export const getDepartmentById = (collegeId: string, departmentId: string) => {
  const college = getCollegeById(collegeId);
  return college?.departments.find((department) => department.id === departmentId) || null;
};

export const getCoursesByDepartmentAndSemester = (collegeId: string, departmentId: string, semesterId: string) => {
  const department = getDepartmentById(collegeId, departmentId);
  const year = department?.years[0];
  const semester = year?.semesters.find((s) => s.id === semesterId);
  return semester?.courses || [];
};

export const getCourseById = (collegeId: string, departmentId: string, semesterId: string, courseId: string) => {
  const courses = getCoursesByDepartmentAndSemester(collegeId, departmentId, semesterId);
  return courses.find((course) => course.id === courseId) || null;
};
