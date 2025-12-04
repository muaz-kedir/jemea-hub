import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Sample data
const sampleResources = [
  { id: 1, title: "Introduction to Programming", course: "CS101", type: "PDF", uploader: "Dr. Ahmed", date: "2024-01-15", downloads: 234 },
  { id: 2, title: "Calculus I Notes", course: "MATH201", type: "PDF", uploader: "Prof. Sara", date: "2024-01-12", downloads: 189 },
  { id: 3, title: "Islamic Studies Guide", course: "IS101", type: "PDF", uploader: "Sheikh Omar", date: "2024-01-10", downloads: 312 },
  { id: 4, title: "Physics Lab Manual", course: "PHY102", type: "PDF", uploader: "Dr. Fatima", date: "2024-01-08", downloads: 156 },
  { id: 5, title: "English Grammar Handbook", course: "ENG101", type: "PDF", uploader: "Ms. Aisha", date: "2024-01-05", downloads: 278 },
  { id: 6, title: "Data Structures & Algorithms", course: "CS201", type: "PDF", uploader: "Dr. Mohammed", date: "2024-01-03", downloads: 421 },
];

const colleges = ["All Colleges", "Computing", "Natural Sciences", "Social Sciences", "Engineering", "Agriculture"];
const departments = ["All Departments", "Computer Science", "Mathematics", "Physics", "Chemistry", "Biology"];
const years = ["All Years", "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];
const semesters = ["All Semesters", "Semester 1", "Semester 2"];

const LibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [college, setCollege] = useState("All Colleges");
  const [department, setDepartment] = useState("All Departments");
  const [year, setYear] = useState("All Years");
  const [semester, setSemester] = useState("All Semesters");

  const filteredResources = sampleResources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/landing" className="flex items-center gap-2 text-slate-300 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <h1 className="text-xl font-bold text-white">Digital Library</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Digital Library</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Access thousands of academic resources organized by college, department, year, and semester
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search resources by title, course, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl text-lg"
          />
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8 bg-slate-900/50 border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Filter Resources</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select value={college} onValueChange={setCollege}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="College" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400">
            Showing <span className="text-white font-semibold">{filteredResources.length}</span> resources
          </p>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            {filteredResources.length} Results
          </Badge>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card
              key={resource.id}
              className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">{resource.course}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Uploaded by {resource.uploader}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Download className="w-3 h-3" />
                  <span>{resource.downloads} downloads</span>
                </div>
                <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <Card className="p-12 text-center bg-slate-900/50 border-slate-800">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No resources found</h3>
            <p className="text-slate-400">Try adjusting your search or filters</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default LibraryPage;
