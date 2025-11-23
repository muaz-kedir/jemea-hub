export interface AcademicSemester {
  id: string;
  name: string;
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

const baseSemesters: AcademicSemester[] = [
  { id: 'semester-1', name: 'Semester 1' },
  { id: 'semester-2', name: 'Semester 2' },
];

const createYears = (count: number): AcademicYear[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `year-${index + 1}`,
    name: `Year ${index + 1}`,
    semesters: baseSemesters.map((semester) => ({ ...semester })),
  }));

export const academicColleges: AcademicCollege[] = [
  {
    id: 'college-agriculture-environment',
    name: 'College of Agriculture and Environmental Science',
    departments: [
      {
        id: 'dept-agro-economics-agri-business',
        name: 'Agro Economics and Agri Business',
        years: createYears(4),
      },
      {
        id: 'dept-animal-range-science',
        name: 'Animal Range and Science',
        years: createYears(4),
      },
      {
        id: 'dept-natural-resource-management',
        name: 'Natural Resource Management',
        years: createYears(4),
      },
      {
        id: 'dept-environmental-science',
        name: 'Environmental Science',
        years: createYears(4),
      },
      {
        id: 'dept-plant-science',
        name: 'Plant Science',
        years: createYears(4),
      },
      {
        id: 'dept-rural-development-innovation',
        name: 'Rural Development and Agricultural Innovation',
        years: createYears(4),
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
        years: createYears(4),
      },
      {
        id: 'dept-business-management',
        name: 'Business Management',
        years: createYears(4),
      },
      {
        id: 'dept-economics',
        name: 'Economics',
        years: createYears(4),
      },
      {
        id: 'dept-public-administration',
        name: 'Public Administration and Development Management',
        years: createYears(4),
      },
      {
        id: 'dept-marketing-management',
        name: 'Marketing Management',
        years: createYears(4),
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
        years: createYears(4),
      },
      {
        id: 'dept-information-systems',
        name: 'Information Systems',
        years: createYears(4),
      },
      {
        id: 'dept-information-technology',
        name: 'Information Technology',
        years: createYears(4),
      },
      {
        id: 'dept-software-engineering',
        name: 'Software Engineering',
        years: createYears(5),
      },
      {
        id: 'dept-information-science',
        name: 'Information Science',
        years: createYears(4),
      },
      {
        id: 'dept-statistics-computing',
        name: 'Statistics',
        years: createYears(4),
      },
    ],
  },
  {
    id: 'college-education-behavioral',
    name: 'College of Education and Behavioral Science',
    departments: [
      {
        id: 'dept-educational-planning',
        name: 'Educational Planning and Management',
        years: createYears(4),
      },
      {
        id: 'dept-curriculum-instruction',
        name: 'Curriculum and Instruction',
        years: createYears(4),
      },
      {
        id: 'dept-psychology',
        name: 'Psychology',
        years: createYears(4),
      },
      {
        id: 'dept-adult-education',
        name: 'Adult and Lifelong Learning',
        years: createYears(4),
      },
      {
        id: 'dept-special-needs-education',
        name: 'Special Needs Education',
        years: createYears(4),
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
        years: createYears(4),
      },
      {
        id: 'dept-physics',
        name: 'Physics',
        years: createYears(4),
      },
      {
        id: 'dept-chemistry',
        name: 'Chemistry',
        years: createYears(4),
      },
      {
        id: 'dept-biology',
        name: 'Biology',
        years: createYears(4),
      },
      {
        id: 'dept-statistics',
        name: 'Statistics',
        years: createYears(4),
      },
    ],
  },
  {
    id: 'college-social-science-humanity',
    name: 'College of Social Science and Humanity',
    departments: [
      {
        id: 'dept-sociology',
        name: 'Sociology',
        years: createYears(4),
      },
      {
        id: 'dept-history',
        name: 'History',
        years: createYears(4),
      },
      {
        id: 'dept-geography',
        name: 'Geography and Environmental Studies',
        years: createYears(4),
      },
      {
        id: 'dept-english-language',
        name: 'English Language and Literature',
        years: createYears(4),
      },
      {
        id: 'dept-civics-ethics',
        name: 'Civics and Ethical Studies',
        years: createYears(4),
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
        years: createYears(5),
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
        years: createYears(4),
      },
      {
        id: 'dept-physical-education',
        name: 'Physical Education',
        years: createYears(4),
      },
    ],
  },
];

export const yearOptions = createYears(5).map((year) => ({ id: year.id, name: year.name }));
export const semesterOptions = baseSemesters.map((semester) => ({ id: semester.id, name: semester.name }));

export const getCollegeById = (collegeId: string) =>
  academicColleges.find((college) => college.id === collegeId) || null;

export const getDepartmentById = (collegeId: string, departmentId: string) => {
  const college = getCollegeById(collegeId);
  return college?.departments.find((department) => department.id === departmentId) || null;
};
