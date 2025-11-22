import { useMemo } from "react";
import type { ComponentType, SVGProps } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Layers, ArrowLeft } from "lucide-react";
import {
  Link,
  Outlet,
  useOutletContext,
  useParams,
  useRoutes,
} from "react-router-dom";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface SemesterResource {
  title: string;
  type: "notes" | "slides" | "ebook" | "video" | "assessment";
  link?: string;
  summary?: string;
}

interface SemesterSection {
  name: string;
  focus: string;
  resources: SemesterResource[];
}

interface DepartmentSection {
  name: string;
  slug: string;
  overview: string;
  semesters: SemesterSection[];
}

interface CollegeSection {
  name: string;
  slug: string;
  description: string;
  departments: DepartmentSection[];
}

interface DigitalLibraryContext {
  colleges: CollegeSection[];
}

const resourceTypeMeta: Record<SemesterResource["type"], { label: string; Icon: IconComponent }> = {
  notes: { label: "Course Notes", Icon: Layers },
  slides: { label: "Lecture Slides", Icon: Layers },
  ebook: { label: "E-Book", Icon: BookOpen },
  video: { label: "Video", Icon: GraduationCap },
  assessment: { label: "Assessment", Icon: GraduationCap },
};

const DigitalLibrary = () => {
  const colleges = useMemo<CollegeSection[]>(
    () => [
      {
        name: "College of Agriculture and Environmental Science",
        slug: "agriculture-environmental-science",
        description:
          "Applied science resources supporting sustainable food systems, environmental stewardship, and rural innovation.",
        departments: [
          {
            name: "Agro Economics and Agri Business",
            slug: "agro-economics-agri-business",
            overview:
              "Materials covering agricultural markets, farm management, and agribusiness entrepreneurship.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Foundations of agricultural economics and farm accounting fundamentals.",
                resources: [
                  {
                    title: "Principles of Agricultural Economics",
                    type: "notes",
                    summary: "Chapter-by-chapter outlines with practice scenarios on market structures.",
                  },
                  {
                    title: "Farm Accounting Workbook",
                    type: "assessment",
                    summary: "Templates and problem sets for cash-flow statements and budgeting.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Agribusiness marketing strategies and commodity analysis.",
                resources: [
                  {
                    title: "Agricultural Marketing Slide Deck",
                    type: "slides",
                    summary: "Lecture slides covering value chains, branding, and export readiness.",
                  },
                  {
                    title: "Commodity Market Briefs",
                    type: "ebook",
                    summary: "Weekly briefs analyzing pricing trends for key crops in Ethiopia.",
                  },
                ],
              },
            ],
          },
          {
            name: "Animal Range and Science",
            slug: "animal-range-science",
            overview:
              "Resources on animal nutrition, breeding, and rangeland ecosystems.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Animal physiology and feed resource assessment.",
                resources: [
                  {
                    title: "Livestock Physiology Lab Manual",
                    type: "ebook",
                    summary: "Hands-on protocols for vital sign measurement and health monitoring.",
                  },
                  {
                    title: "Feed Composition Field Sheets",
                    type: "notes",
                    summary: "Reference tables for local forage species and nutrient profiles.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Rangeland management and herd improvement plans.",
                resources: [
                  {
                    title: "Rangeland Monitoring Toolkit",
                    type: "assessment",
                    summary: "Checklists and GIS-ready forms for vegetation surveys.",
                  },
                  {
                    title: "Breeding Programme Design Guide",
                    type: "notes",
                    summary: "Decision frameworks for cross-breeding and genetic selection.",
                  },
                ],
              },
            ],
          },
          {
            name: "Natural Resource Management",
            slug: "natural-resource-management",
            overview:
              "Integrated watershed, soil conservation, and climate resilience resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Watershed analysis and soil conservation techniques.",
                resources: [
                  {
                    title: "Watershed Assessment Templates",
                    type: "assessment",
                    summary: "Field survey forms with sample data synthesis worksheets.",
                  },
                  {
                    title: "Soil Conservation Techniques",
                    type: "video",
                    summary: "Demonstrations of terracing, contour ploughing, and mulching.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Climate adaptation planning and resource governance.",
                resources: [
                  {
                    title: "Climate Adaptation Planning Guide",
                    type: "ebook",
                    summary: "Case studies on drought mitigation and community engagement.",
                  },
                  {
                    title: "Policy Brief Writing Toolkit",
                    type: "notes",
                    summary: "Templates for synthesizing research into actionable policy briefs.",
                  },
                ],
              },
            ],
          },
          {
            name: "Environmental Science",
            slug: "environmental-science",
            overview:
              "Cross-disciplinary resources on ecology, pollution control, and environmental impact assessment.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Ecological principles and environmental chemistry monitoring.",
                resources: [
                  {
                    title: "Ecology Field Practicals",
                    type: "notes",
                    summary: "Sampling protocols and biodiversity assessment templates.",
                  },
                  {
                    title: "Environmental Chemistry Lab Pack",
                    type: "ebook",
                    summary: "Step-by-step experiments analysing water and soil contaminants.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Impact assessment and environmental management systems.",
                resources: [
                  {
                    title: "EIA Case Study Compendium",
                    type: "slides",
                    summary: "Annotated slide decks reviewing regional environmental assessments.",
                  },
                  {
                    title: "ISO 14001 Implementation Guide",
                    type: "notes",
                    summary: "Checklist-driven approach to environmental management system design.",
                  },
                ],
              },
            ],
          },
          {
            name: "Plant Science",
            slug: "plant-science",
            overview:
              "Resources for crop physiology, plant breeding, and pathology.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Plant anatomy, physiology, and propagation basics.",
                resources: [
                  {
                    title: "Plant Anatomy Lab Atlas",
                    type: "ebook",
                    summary: "Microscopy plates highlighting root, stem, and leaf structures.",
                  },
                  {
                    title: "Propagation Techniques Handbook",
                    type: "video",
                    summary: "Demonstrations of grafting, layering, and tissue culture basics.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Plant breeding strategies and integrated disease management.",
                resources: [
                  {
                    title: "Crop Improvement Strategy Notes",
                    type: "notes",
                    summary: "Comparison of conventional and molecular breeding approaches.",
                  },
                  {
                    title: "Disease Diagnostic Manual",
                    type: "assessment",
                    summary: "Field symptom charts with decision trees for treatment options.",
                  },
                ],
              },
            ],
          },
          {
            name: "Rural Development and Agricultural Innovation",
            slug: "rural-development-agricultural-innovation",
            overview:
              "Materials supporting rural livelihoods, extension services, and innovation ecosystems.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Community profiling and participatory extension methods.",
                resources: [
                  {
                    title: "Participatory Rural Appraisal Toolkit",
                    type: "assessment",
                    summary: "Field-ready facilitation guides and documentation templates.",
                  },
                  {
                    title: "Extension Communication Strategies",
                    type: "slides",
                    summary: "Presentation deck on message design and adoption pathways.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Innovation systems, agritech pilots, and impact evaluation.",
                resources: [
                  {
                    title: "Agritech Pilot Playbook",
                    type: "ebook",
                    summary: "Case studies on scaling digital advisory tools for farmers.",
                  },
                  {
                    title: "Impact Evaluation Methods",
                    type: "notes",
                    summary: "Guidance on designing baseline surveys and mixed-method evaluations.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "College of Business and Economics",
        slug: "business-economics",
        description:
          "Business leadership, finance, and policy resources for emerging professionals.",
        departments: [
          {
            name: "Accounting and Finance",
            slug: "accounting-finance",
            overview:
              "Resources on financial reporting, auditing, and corporate finance decisions.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Financial accounting principles and spreadsheet proficiency.",
                resources: [
                  {
                    title: "Accounting Principles Workbook",
                    type: "assessment",
                    summary: "Exercises covering journal entries and trial balances.",
                  },
                  {
                    title: "Excel for Finance Mini-Course",
                    type: "video",
                    summary: "Short lessons on financial modelling basics.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Corporate finance and auditing standards.",
                resources: [
                  {
                    title: "Corporate Finance Concept Notes",
                    type: "notes",
                    summary: "Capital budgeting, cost of capital, and risk analysis summaries.",
                  },
                  {
                    title: "Audit Case Study Pack",
                    type: "slides",
                    summary: "Scenario-based slides on internal controls and evidence gathering.",
                  },
                ],
              },
            ],
          },
          {
            name: "Business Management",
            slug: "business-management",
            overview:
              "Management theory, entrepreneurship, and operations resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Organisational behaviour and strategic planning foundations.",
                resources: [
                  {
                    title: "Organisational Behaviour Notes",
                    type: "notes",
                    summary: "Frameworks for motivation, leadership, and team dynamics.",
                  },
                  {
                    title: "Strategy Canvas Templates",
                    type: "assessment",
                    summary: "Editable matrices for SWOT and Balanced Scorecard exercises.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Entrepreneurship and operations optimisation.",
                resources: [
                  {
                    title: "Startup Launch Guide",
                    type: "ebook",
                    summary: "Step-by-step manual for business model validation.",
                  },
                  {
                    title: "Operations Management Cases",
                    type: "slides",
                    summary: "Lean management and supply chain optimisation examples.",
                  },
                ],
              },
            ],
          },
          {
            name: "Economics",
            slug: "economics",
            overview:
              "Macroeconomic policy, econometrics, and development economics references.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Micro and macro foundations with policy applications.",
                resources: [
                  {
                    title: "Development Economics Reader",
                    type: "ebook",
                    summary: "Curated articles on growth models and poverty alleviation.",
                  },
                  {
                    title: "Intro Econometrics Workshop",
                    type: "video",
                    summary: "Tutorials on regression analysis using open-source tools.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Applied econometrics and policy evaluation.",
                resources: [
                  {
                    title: "Policy Impact Evaluation Toolkit",
                    type: "assessment",
                    summary: "Data sets and assignments for RCT and quasi-experimental designs.",
                  },
                  {
                    title: "Macroeconomic Outlook Reports",
                    type: "notes",
                    summary: "Summaries of current regional economic indicators and forecasts.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "College of Computing and Informatics",
        slug: "computing-informatics",
        description:
          "Cutting-edge resources for software development, data science, and information systems.",
        departments: [
          {
            name: "Computer Science",
            slug: "computer-science",
            overview:
              "Programming paradigms, algorithms, and systems engineering materials.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Programming fundamentals and discrete structures.",
                resources: [
                  {
                    title: "Python Foundations Notes",
                    type: "notes",
                    summary: "Control structures, data types, and debugging exercises.",
                  },
                  {
                    title: "Discrete Structures Problem Set",
                    type: "assessment",
                    summary: "Logic, set theory, and combinatorics practice sheets.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Data structures and web application development.",
                resources: [
                  {
                    title: "Data Structures Slide Series",
                    type: "slides",
                    summary: "Visual explanations of lists, trees, and graphs.",
                  },
                  {
                    title: "Full-Stack Starter Workshop",
                    type: "video",
                    summary: "Project-based videos building RESTful services.",
                  },
                ],
              },
            ],
          },
          {
            name: "Information Systems",
            slug: "information-systems",
            overview:
              "Enterprise systems, database design, and IT governance resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Systems analysis and relational database design.",
                resources: [
                  {
                    title: "Systems Analysis Case Files",
                    type: "assessment",
                    summary: "Scenario packs for requirement elicitation and modelling.",
                  },
                  {
                    title: "Database Design Studio",
                    type: "notes",
                    summary: "Normalization checklists and ER diagram templates.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "IT project management and governance frameworks.",
                resources: [
                  {
                    title: "IT Governance Toolkit",
                    type: "slides",
                    summary: "COBIT and ITIL overview with implementation roadmaps.",
                  },
                  {
                    title: "Project Management Simulation",
                    type: "video",
                    summary: "Interactive walk-through of agile and waterfall delivery.",
                  },
                ],
              },
            ],
          },
          {
            name: "Software Engineering",
            slug: "software-engineering",
            overview:
              "Lifecycle methodologies, quality assurance, and devops practices.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Requirements engineering and design patterns.",
                resources: [
                  {
                    title: "Requirements Specification Templates",
                    type: "assessment",
                    summary: "Traceable templates with acceptance criteria examples.",
                  },
                  {
                    title: "Design Patterns Handbook",
                    type: "ebook",
                    summary: "Quick-reference guide to common structural and behavioural patterns.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Testing strategies and continuous delivery pipelines.",
                resources: [
                  {
                    title: "QA Strategy Slides",
                    type: "slides",
                    summary: "Unit, integration, and acceptance testing workflows.",
                  },
                  {
                    title: "CI/CD Playbook",
                    type: "notes",
                    summary: "Best practices for automated builds and deployments.",
                  },
                ],
              },
            ],
          },
          {
            name: "Information Science",
            slug: "information-science",
            overview:
              "Knowledge organisation, user services, and digital curation resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Information literacy, cataloguing basics, and metadata standards.",
                resources: [
                  {
                    title: "Cataloguing and Classification Notes",
                    type: "notes",
                    summary: "Summaries of AACR2, RDA, and Dewey Decimal applications with examples.",
                  },
                  {
                    title: "Metadata Schema Workbook",
                    type: "assessment",
                    summary: "Practice exercises designing Dublin Core and MARC records.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Digital repositories, information retrieval, and user experience.",
                resources: [
                  {
                    title: "Digital Repository Implementation Guide",
                    type: "ebook",
                    summary: "Step-by-step playbook for planning and deploying institutional repositories.",
                  },
                  {
                    title: "Information Retrieval Lab Tasks",
                    type: "slides",
                    summary: "Hands-on lab instructions for indexing, relevance ranking, and evaluation metrics.",
                  },
                ],
              },
            ],
          },
          {
            name: "Information Technology",
            slug: "information-technology",
            overview:
              "Infrastructure management, networking, and cybersecurity resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Computer hardware, operating systems, and network fundamentals.",
                resources: [
                  {
                    title: "Network Fundamentals Lab Manual",
                    type: "ebook",
                    summary: "Cabling, subnetting, and routing configuration exercises.",
                  },
                  {
                    title: "Operating Systems Command Reference",
                    type: "notes",
                    summary: "Quick guides for Linux administration and shell scripting basics.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Systems integration, cloud services, and cybersecurity operations.",
                resources: [
                  {
                    title: "Cloud Infrastructure Playbook",
                    type: "video",
                    summary: "Walkthroughs provisioning services on major cloud platforms.",
                  },
                  {
                    title: "Security Operations Runbook",
                    type: "assessment",
                    summary: "Incident response scenarios with log analysis and remediation steps.",
                  },
                ],
              },
            ],
          },
          {
            name: "Statistics",
            slug: "statistics",
            overview:
              "Probabilistic modelling, statistical inference, and data analysis resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Probability theory, exploratory data analysis, and statistical computing.",
                resources: [
                  {
                    title: "Probability Concepts Workbook",
                    type: "assessment",
                    summary: "Problem sets on combinatorics, distributions, and expected values.",
                  },
                  {
                    title: "Data Exploration with R",
                    type: "video",
                    summary: "Screen-cast tutorials for data wrangling and visualisation in R.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Statistical inference, regression modelling, and experimental design.",
                resources: [
                  {
                    title: "Inference Cheat Sheets",
                    type: "notes",
                    summary: "Concise summaries of estimation, hypothesis testing, and confidence intervals.",
                  },
                  {
                    title: "Regression Analysis Case Files",
                    type: "slides",
                    summary: "Case-based slide decks exploring linear, logistic, and time-series models.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "College of Education and Behavioral Science",
        slug: "education-behavioral-science",
        description:
          "Teaching practice, curriculum design, and behavioral research resources.",
        departments: [
          {
            name: "Curriculum and Instruction",
            slug: "curriculum-instruction",
            overview:
              "Instructional design, inclusive pedagogy, and assessment resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Curriculum foundations and lesson planning.",
                resources: [
                  {
                    title: "Instructional Planning Toolkit",
                    type: "assessment",
                    summary: "Backward design templates and observation rubrics.",
                  },
                  {
                    title: "Inclusive Pedagogy Guide",
                    type: "notes",
                    summary: "Strategies for differentiated instruction and classroom equity.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Assessment design and reflective teaching practice.",
                resources: [
                  {
                    title: "Authentic Assessment Library",
                    type: "slides",
                    summary: "Examples of project-based and performance assessments.",
                  },
                  {
                    title: "Reflective Practice Journal",
                    type: "ebook",
                    summary: "Guided prompts for documenting instructional growth.",
                  },
                ],
              },
            ],
          },
          {
            name: "Educational Psychology",
            slug: "educational-psychology",
            overview:
              "Learner development, motivation, and counseling resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Human development and learning theories.",
                resources: [
                  {
                    title: "Developmental Milestones Compendium",
                    type: "notes",
                    summary: "Quick-reference summaries of cognitive and socio-emotional stages.",
                  },
                  {
                    title: "Learning Theories Video Series",
                    type: "video",
                    summary: "Animated explainers on constructivist and behaviourist models.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Motivation, assessment, and counseling skills.",
                resources: [
                  {
                    title: "Motivation Strategies Toolkit",
                    type: "assessment",
                    summary: "Classroom scenarios with intervention planning worksheets.",
                  },
                  {
                    title: "School Counseling Casebook",
                    type: "ebook",
                    summary: "Case studies on supporting diverse learner needs.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "College of Natural and Computational Science",
        slug: "natural-computational-science",
        description:
          "Laboratory guides and theoretical resources across core natural sciences.",
        departments: [
          {
            name: "Mathematics",
            slug: "mathematics",
            overview:
              "Pure and applied mathematics resources supporting problem-solving competence.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Calculus and linear algebra foundations.",
                resources: [
                  {
                    title: "Calculus Problem Bank",
                    type: "assessment",
                    summary: "Differentiation and integration exercises with solutions.",
                  },
                  {
                    title: "Linear Algebra Concept Notes",
                    type: "notes",
                    summary: "Matrix operations, vector spaces, and eigenvalues overview.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Differential equations and numerical methods.",
                resources: [
                  {
                    title: "ODE Practice Worksheets",
                    type: "assessment",
                    summary: "First-order and higher-order differential equation sets.",
                  },
                  {
                    title: "Numerical Methods Slide Deck",
                    type: "slides",
                    summary: "Root-finding, interpolation, and numerical integration.",
                  },
                ],
              },
            ],
          },
          {
            name: "Physics",
            slug: "physics",
            overview:
              "Experimental and theoretical physics resources from mechanics to electromagnetism.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Classical mechanics and laboratory measurement skills.",
                resources: [
                  {
                    title: "Mechanics Experiment Manual",
                    type: "ebook",
                    summary: "Detailed lab guides with uncertainty analysis walkthroughs.",
                  },
                  {
                    title: "Problem-Solving Session Videos",
                    type: "video",
                    summary: "Worked problems on kinematics and Newtonian dynamics.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Electricity, magnetism, and modern physics introductions.",
                resources: [
                  {
                    title: "Electromagnetism Concept Maps",
                    type: "notes",
                    summary: "Maxwell equations visual summaries and problem hints.",
                  },
                  {
                    title: "Modern Physics Problem Sets",
                    type: "assessment",
                    summary: "Quantum and relativity introductory exercises.",
                  },
                ],
              },
            ],
          },
          {
            name: "Chemistry",
            slug: "chemistry",
            overview:
              "Organic, inorganic, and analytical chemistry lab and revision resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "General chemistry principles and laboratory safety.",
                resources: [
                  {
                    title: "General Chemistry Lab Safety Module",
                    type: "video",
                    summary: "Safety demonstrations and hazard communication basics.",
                  },
                  {
                    title: "Stoichiometry Practice Guide",
                    type: "assessment",
                    summary: "Balanced equation exercises with solution keys.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Organic mechanisms and spectroscopic analysis.",
                resources: [
                  {
                    title: "Organic Reaction Mechanisms Notes",
                    type: "notes",
                    summary: "Arrow-pushing guides for major reaction families.",
                  },
                  {
                    title: "Spectroscopy Problem Pack",
                    type: "assessment",
                    summary: "IR, NMR, and mass spec interpretation exercises.",
                  },
                ],
              },
            ],
          },
          {
            name: "Biology",
            slug: "biology",
            overview:
              "Cell biology, genetics, and ecology resources with laboratory emphasis.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Cell structure, genetics basics, and microscopy.",
                resources: [
                  {
                    title: "Cell Biology Lab Notebook",
                    type: "ebook",
                    summary: "Microscopy techniques and staining protocols.",
                  },
                  {
                    title: "Genetics Practice Problems",
                    type: "assessment",
                    summary: "Punnett squares, linkage, and population genetics drills.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Ecology and molecular biology techniques.",
                resources: [
                  {
                    title: "Ecology Field Methods Guide",
                    type: "notes",
                    summary: "Sampling strategies for biodiversity and ecosystem monitoring.",
                  },
                  {
                    title: "Molecular Biology Lab Videos",
                    type: "video",
                    summary: "PCR setup, gel electrophoresis, and DNA extraction demos.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "College of Social Science and Humanity",
        slug: "social-science-humanity",
        description:
          "Resources exploring society, culture, governance, and public discourse.",
        departments: [
          {
            name: "History and Heritage Studies",
            slug: "history-heritage-studies",
            overview:
              "Materials on Ethiopian and global history, archival practices, and heritage preservation.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Historical inquiry methods and source evaluation.",
                resources: [
                  {
                    title: "Primary Source Analysis Guide",
                    type: "notes",
                    summary: "Framework for contextualising and critiquing historical documents.",
                  },
                  {
                    title: "Archival Research Checklist",
                    type: "assessment",
                    summary: "Planning worksheets for archive visits and oral history interviews.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Regional histories and heritage conservation.",
                resources: [
                  {
                    title: "Ethiopian Heritage Case Studies",
                    type: "slides",
                    summary: "Presentations on UNESCO sites and preservation strategies.",
                  },
                  {
                    title: "Public History Project Toolkit",
                    type: "ebook",
                    summary: "Guidelines for community-engaged exhibitions and storytelling.",
                  },
                ],
              },
            ],
          },
          {
            name: "Sociology and Social Anthropology",
            slug: "sociology-social-anthropology",
            overview:
              "Theory, qualitative research, and social policy resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Classical social theory and ethnographic methods.",
                resources: [
                  {
                    title: "Social Theory Reader",
                    type: "ebook",
                    summary: "Key texts summarised with discussion questions.",
                  },
                  {
                    title: "Ethnographic Fieldwork Planner",
                    type: "assessment",
                    summary: "Interview guides, consent forms, and observation logs.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Applied sociology and policy analysis.",
                resources: [
                  {
                    title: "Social Policy Impact Briefs",
                    type: "notes",
                    summary: "Templates for translating research into policy recommendations.",
                  },
                  {
                    title: "Community Engagement Workshop",
                    type: "video",
                    summary: "Best practices for participatory action research.",
                  },
                ],
              },
            ],
          },
          {
            name: "Language and Literature",
            slug: "language-literature",
            overview:
              "Linguistics, literary analysis, and creative writing resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Linguistic analysis and critical reading skills.",
                resources: [
                  {
                    title: "Linguistics Study Guide",
                    type: "notes",
                    summary: "Phonetics, morphology, and syntax overview with exercises.",
                  },
                  {
                    title: "Critical Reading Workshop",
                    type: "video",
                    summary: "Strategies for textual analysis and annotation.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Literary theory and creative writing practice.",
                resources: [
                  {
                    title: "Literary Theory Primer",
                    type: "slides",
                    summary: "Comparative overview of major critical lenses.",
                  },
                  {
                    title: "Creative Writing Studio",
                    type: "assessment",
                    summary: "Prompt collections and peer review rubrics.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "College of Law",
        slug: "law",
        description:
          "Legal research, case analysis, and moot court resources for aspiring lawyers.",
        departments: [
          {
            name: "Public and Constitutional Law",
            slug: "public-constitutional-law",
            overview:
              "Constitutional frameworks, administrative law, and human rights resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Comparative constitutional structures and interpretation.",
                resources: [
                  {
                    title: "Constitutional Law Casebook",
                    type: "ebook",
                    summary: "Digest of landmark cases with analytical commentary.",
                  },
                  {
                    title: "Judicial Review Flowcharts",
                    type: "notes",
                    summary: "Procedural guides for administrative decision challenges.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Human rights litigation and public interest advocacy.",
                resources: [
                  {
                    title: "Human Rights Advocacy Toolkit",
                    type: "slides",
                    summary: "Litigation strategies and stakeholder engagement plans.",
                  },
                  {
                    title: "Moot Court Practice Bench",
                    type: "video",
                    summary: "Recorded oral arguments with coach feedback.",
                  },
                ],
              },
            ],
          },
          {
            name: "Commercial and Corporate Law",
            slug: "commercial-corporate-law",
            overview:
              "Business law, contract drafting, and corporate governance resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Contract law principles and company formation.",
                resources: [
                  {
                    title: "Contract Drafting Templates",
                    type: "assessment",
                    summary: "Annotated agreement clauses and negotiation checklists.",
                  },
                  {
                    title: "Company Law Lecture Notes",
                    type: "notes",
                    summary: "Corporate personality, directors' duties, and shareholder rights.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Corporate governance and international business transactions.",
                resources: [
                  {
                    title: "Governance Best Practices Guide",
                    type: "ebook",
                    summary: "Board structures, compliance, and risk management insights.",
                  },
                  {
                    title: "International Trade Law Briefs",
                    type: "slides",
                    summary: "Case digests on cross-border sales and dispute resolution.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "College of Sport Science",
        slug: "sport-science",
        description:
          "Performance science, coaching, and wellness resources for athletic development.",
        departments: [
          {
            name: "Sport Science and Coaching",
            slug: "sport-science-coaching",
            overview:
              "Training methodologies, biomechanics, and coaching pedagogy materials.",
            semesters: [
              {
                name: "Semester 1",
                focus: "Exercise physiology and foundational coaching techniques.",
                resources: [
                  {
                    title: "Exercise Physiology Lab Guide",
                    type: "ebook",
                    summary: "Protocols for VO2 max, lactate threshold, and strength testing.",
                  },
                  {
                    title: "Coaching Fundamentals Video Series",
                    type: "video",
                    summary: "Demonstrations of cueing, feedback, and practice design.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Performance analysis and athlete wellness.",
                resources: [
                  {
                    title: "Performance Analytics Workbook",
                    type: "assessment",
                    summary: "Data capture sheets for notational analysis and GPS tracking.",
                  },
                  {
                    title: "Athlete Wellbeing Toolkit",
                    type: "notes",
                    summary: "Guidance on nutrition, recovery, and mental health support.",
                  },
                ],
              },
            ],
          },
          {
            name: "Physical Education",
            slug: "physical-education",
            overview:
              "School-based physical education, adaptive sport, and pedagogy resources.",
            semesters: [
              {
                name: "Semester 1",
                focus: "PE curriculum design and motor skill development.",
                resources: [
                  {
                    title: "PE Curriculum Planning Guide",
                    type: "notes",
                    summary: "Curriculum pacing charts and skill progression outlines.",
                  },
                  {
                    title: "Motor Skill Development Activities",
                    type: "video",
                    summary: "Activity demonstrations for different age groups.",
                  },
                ],
              },
              {
                name: "Semester 2",
                focus: "Adaptive sport and inclusive practice.",
                resources: [
                  {
                    title: "Inclusive PE Toolkit",
                    type: "slides",
                    summary: "Strategies for adapting activities to diverse abilities.",
                  },
                  {
                    title: "Assessment in Physical Education",
                    type: "assessment",
                    summary: "Observation rubrics and student self-assessment forms.",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const element = useRoutes([
    {
      path: "/",
      element: <LibraryLayout colleges={colleges} />,
      children: [
        { index: true, element: <CollegesView /> },
        { path: "college/:collegeSlug", element: <CollegeView /> },
        { path: "college/:collegeSlug/department/:departmentSlug", element: <DepartmentView /> },
        {
          path: "*",
          element: (
            <NotFoundCard
              message="We couldn't find that page."
              actionLabel="Return to Colleges"
              to="/digital-library"
            />
          ),
        },
      ],
    },
  ]);

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {element}
      </main>
      <BottomNav />
    </div>
  );
};

const LibraryLayout = ({ colleges }: { colleges: CollegeSection[] }) => (
  <Outlet context={{ colleges }} />
);

const useDigitalLibraryContext = () =>
  useOutletContext<DigitalLibraryContext>();

const CollegesView = () => {
  const { colleges } = useDigitalLibraryContext();

  return (
    <div className="space-y-16">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary font-semibold uppercase tracking-widest text-xs">
          <BookOpen className="w-4 h-4" />
          Digital Library
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Curated Resources by College, Department, and Semester
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse academic materials organized the way you study. Start with your college, view department offerings, and dive into semester-specific collections.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {colleges.map((college) => (
          <Card
            key={college.slug}
            className="p-6 border-0 shadow-lg bg-secondary/20 flex flex-col gap-6"
          >
            <div className="space-y-3">
              <Badge className="w-fit bg-primary/15 text-primary border-primary/30 uppercase tracking-wider text-xs">
                {college.departments.length} Departments
              </Badge>
              <h2 className="text-2xl font-semibold">{college.name}</h2>
              <p className="text-sm text-muted-foreground">
                {college.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Explore resources tailored to each programme.
              </span>
              <Button asChild>
                <Link to={`college/${college.slug}`}>
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
  const { collegeSlug } = useParams<{ collegeSlug: string }>();
  const { colleges } = useDigitalLibraryContext();
  const college = colleges.find((item) => item.slug === collegeSlug);

  if (!college) {
    return (
      <NotFoundCard
        message="We couldn't find that college."
        actionLabel="Back to Colleges"
        to=".."
        relative="path"
      />
    );
  }

  return (
    <div className="space-y-10">
      <Link
        to=".."
        relative="path"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Colleges
      </Link>

      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">{college.name}</h1>
        <p className="text-muted-foreground max-w-3xl">
          {college.description}
        </p>
      </div>

      <Separator className="bg-secondary/50" />

      <section className="grid gap-6 md:grid-cols-2">
        {college.departments.map((department) => (
          <Card
            key={department.slug}
            className="p-6 border-0 shadow-lg bg-secondary/20 flex flex-col gap-5"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{department.name}</h2>
              <p className="text-sm text-muted-foreground">
                {department.overview}
              </p>
            </div>

            <Button asChild className="self-start">
              <Link to={`department/${department.slug}`}>
                View Semesters
              </Link>
            </Button>
          </Card>
        ))}
      </section>
    </div>
  );
};

const DepartmentView = () => {
  const { collegeSlug, departmentSlug } = useParams<{
    collegeSlug: string;
    departmentSlug: string;
  }>();
  const { colleges } = useDigitalLibraryContext();
  const college = colleges.find((item) => item.slug === collegeSlug);

  if (!college) {
    return (
      <NotFoundCard
        message="That college no longer exists."
        actionLabel="Back to Colleges"
        to="/digital-library"
      />
    );
  }

  const department = college.departments.find(
    (item) => item.slug === departmentSlug
  );

  if (!department) {
    return (
      <NotFoundCard
        message="We couldn't find that department."
        actionLabel="Back to Departments"
        to=".."
        relative="path"
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link
          to=".."
          relative="path"
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
        <p className="text-muted-foreground max-w-3xl">
          {department.overview}
        </p>
      </div>

      <Separator className="bg-secondary/50" />

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {department.semesters.map((semester) => (
          <Card
            key={semester.name}
            className="p-6 h-full border-0 shadow-lg bg-secondary/20 flex flex-col gap-4"
          >
            <div className="space-y-2">
              <Badge className="w-fit bg-primary/15 text-primary border-primary/30">
                {semester.name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {semester.focus}
              </span>
            </div>

            <div className="space-y-4">
              {semester.resources.map((resource) => {
                const { label, Icon } = resourceTypeMeta[resource.type];

                return (
                  <div
                    key={resource.title}
                    className="rounded-xl border border-secondary/40 bg-background/80 p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <Icon className="w-4 h-4" />
                      {label}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">{resource.title}</p>
                      {resource.summary && (
                        <p className="text-sm text-muted-foreground">
                          {resource.summary}
                        </p>
                      )}
                      {resource.link && (
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Open Resource
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
};

interface NotFoundCardProps {
  message: string;
  actionLabel: string;
  to: string;
  relative?: "path" | "route";
}

const NotFoundCard = ({ message, actionLabel, to, relative }: NotFoundCardProps) => (
  <Card className="p-10 text-center border-0 shadow-lg bg-secondary/20 space-y-4">
    <p className="text-muted-foreground">{message}</p>
    <Button asChild>
      <Link to={to} {...(relative ? { relative } : {})}>
        {actionLabel}
      </Link>
    </Button>
  </Card>
);

export default DigitalLibrary;
