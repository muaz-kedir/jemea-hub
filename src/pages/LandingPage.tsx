import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Users, 
  Calendar,
  Bell,
  ChevronRight,
  Menu,
  X,
  Target,
  Eye,
  Heart,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { HumsjLogo } from "@/components/HumsjLogo";

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic content data
  const upcomingTrainings = [
    {
      id: 1,
      title: "Advanced Web Development",
      date: "Nov 15, 2025",
      instructor: "Dr. Ahmed Hassan",
      participants: 25,
      image: "🎓"
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      date: "Nov 20, 2025",
      instructor: "Prof. Sarah Ali",
      participants: 30,
      image: "📊"
    },
    {
      id: 3,
      title: "Mobile App Development",
      date: "Nov 25, 2025",
      instructor: "Eng. Omar Khalid",
      participants: 20,
      image: "📱"
    }
  ];

  const activeTutorials = [
    {
      id: 1,
      title: "Mathematics Tutoring",
      tutor: "Dr. Fatima Ibrahim",
      students: 15,
      time: "Mon, Wed, Fri - 2:00 PM",
      subject: "Calculus & Algebra"
    },
    {
      id: 2,
      title: "English Language",
      tutor: "Ms. Aisha Mohammed",
      students: 20,
      time: "Tue, Thu - 3:00 PM",
      subject: "Grammar & Writing"
    },
    {
      id: 3,
      title: "Computer Science",
      tutor: "Eng. Yusuf Ahmed",
      students: 18,
      time: "Mon, Wed - 4:00 PM",
      subject: "Programming Basics"
    }
  ];

  const latestLibraryUploads = [
    {
      id: 1,
      title: "Introduction to Artificial Intelligence",
      author: "Stuart Russell",
      category: "Computer Science",
      uploadDate: "2 days ago",
      pages: 1152
    },
    {
      id: 2,
      title: "Islamic Economics Principles",
      author: "Dr. Muhammad Akram Khan",
      category: "Economics",
      uploadDate: "3 days ago",
      pages: 456
    },
    {
      id: 3,
      title: "Modern Physics",
      author: "Raymond A. Serway",
      category: "Physics",
      uploadDate: "5 days ago",
      pages: 1328
    }
  ];

  const dailyQuote = {
    text: "Seek knowledge from the cradle to the grave.",
    author: "Prophet Muhammad (PBUH)",
    type: "Hadith"
  };

  const sectors = [
    {
      name: "Library",
      icon: BookOpen,
      description: "Access thousands of books and resources",
      color: "bg-blue-500",
      link: "/library-dashboard"
    },
    {
      name: "Tutoring",
      icon: GraduationCap,
      description: "Get personalized academic support",
      color: "bg-green-500",
      link: "/tutor-dashboard"
    },
    {
      name: "Training",
      icon: Award,
      description: "Enhance your skills with expert training",
      color: "bg-purple-500",
      link: "/trainer-dashboard"
    },
    {
      name: "Community",
      icon: Users,
      description: "Connect with fellow students",
      color: "bg-orange-500",
      link: "/dashboard"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <HumsjLogo size={48} className="flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-primary leading-tight">HUMSJ</span>
                <span className="text-xs text-muted-foreground leading-tight hidden sm:block">Haramaya University</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </a>
              <a href="#mission" className="text-sm font-medium hover:text-primary transition-colors">
                Mission
              </a>
              <a href="#vision" className="text-sm font-medium hover:text-primary transition-colors">
                Vision
              </a>
              <a href="#goals" className="text-sm font-medium hover:text-primary transition-colors">
                Goals
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-full">Sign Up</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white dark:bg-gray-900">
            <div className="px-4 py-4 space-y-3">
              <a href="#about" className="block py-2 text-sm font-medium hover:text-primary">
                About
              </a>
              <a href="#mission" className="block py-2 text-sm font-medium hover:text-primary">
                Mission
              </a>
              <a href="#vision" className="block py-2 text-sm font-medium hover:text-primary">
                Vision
              </a>
              <a href="#goals" className="block py-2 text-sm font-medium hover:text-primary">
                Goals
              </a>
              <div className="flex gap-3 pt-3 border-t">
                <Link to="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Login</Button>
                </Link>
                <Link to="/signup" className="flex-1">
                  <Button size="sm" className="w-full rounded-full">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Haramaya University Muslim Students Jema'a
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Academic Excellence Through Faith and Knowledge
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8">
                  Get Started
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#sectors">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8">
                  Explore Sectors
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Quote/Hadith */}
      <section className="py-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6 border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  {dailyQuote.type} of the Day
                </p>
                <p className="text-lg md:text-xl font-medium italic mb-2">
                  "{dailyQuote.text}"
                </p>
                <p className="text-sm text-muted-foreground">— {dailyQuote.author}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Main Content - Dynamic Cards */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Upcoming Trainings */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Upcoming Trainings</h2>
                <p className="text-muted-foreground">Enhance your skills with expert-led programs</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingTrainings.map((training) => (
                <Card key={training.id} className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
                  <div className="text-5xl mb-4">{training.image}</div>
                  <h3 className="text-xl font-bold mb-2">{training.title}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{training.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>{training.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{training.participants} participants</span>
                    </div>
                  </div>
                  <Button className="w-full rounded-full" size="sm">
                    Register Now
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Active Tutorials */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Active Tutorials</h2>
                <p className="text-muted-foreground">Get personalized academic support</p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-500" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {activeTutorials.map((tutorial) => (
                <Card key={tutorial.id} className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tutorial.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{tutorial.subject}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tutor:</span>
                      <span className="font-medium">{tutorial.tutor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Students:</span>
                      <span className="font-medium">{tutorial.students}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {tutorial.time}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-full" size="sm">
                    Join Session
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Latest Library Uploads */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Latest Library Uploads</h2>
                <p className="text-muted-foreground">Discover new books and resources</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {latestLibraryUploads.map((book) => (
                <Card key={book.id} className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{book.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pages:</span>
                      <span className="font-medium">{book.pages}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Uploaded {book.uploadDate}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-full" size="sm">
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sectors Navigation */}
      <section id="sectors" className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Sectors</h2>
            <p className="text-lg text-muted-foreground">
              Choose your path to knowledge and excellence
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {sectors.map((sector) => {
              const Icon = sector.icon;
              return (
                <Link
                  key={sector.name}
                  to={sector.link}
                  className="group"
                >
                  <Card className="p-6 text-center hover:shadow-xl transition-all border-0 shadow-md h-full">
                    <div className={`w-16 h-16 ${sector.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{sector.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {sector.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-primary font-medium text-sm">
                      <span>Explore</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">About HUMSJ</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Haramaya University Muslim Students Jema'a (HUMSJ) is a comprehensive academic platform 
                designed to empower Muslim students through integrated library services, personalized tutoring, 
                and professional training programs rooted in Islamic values.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                We believe in the transformative power of education combined with faith, striving to create an 
                environment where knowledge is accessible, learning is engaging, and spiritual growth is continuous.
              </p>
              <div className="flex gap-4">
                <Link to="/signup">
                  <Button size="lg" className="rounded-full">Join Us Today</Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center border-0 shadow-md">
                <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <p className="text-3xl font-bold mb-2">500+</p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </Card>
              <Card className="p-6 text-center border-0 shadow-md">
                <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <p className="text-3xl font-bold mb-2">1000+</p>
                <p className="text-sm text-muted-foreground">Books Available</p>
              </Card>
              <Card className="p-6 text-center border-0 shadow-md">
                <GraduationCap className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <p className="text-3xl font-bold mb-2">50+</p>
                <p className="text-sm text-muted-foreground">Expert Tutors</p>
              </Card>
              <Card className="p-6 text-center border-0 shadow-md">
                <Award className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <p className="text-3xl font-bold mb-2">100+</p>
                <p className="text-sm text-muted-foreground">Training Programs</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Goals */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission */}
            <Card id="mission" className="p-8 border-0 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To provide accessible, high-quality educational resources and support services 
                that empower students to achieve academic excellence and personal growth through 
                innovative learning solutions.
              </p>
            </Card>

            {/* Vision */}
            <Card id="vision" className="p-8 border-0 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become the leading academic platform that transforms education by seamlessly 
                integrating library services, tutoring, and training programs, creating a holistic 
                learning ecosystem for all.
              </p>
            </Card>

            {/* Goals */}
            <Card id="goals" className="p-8 border-0 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Goals</h3>
              <ul className="text-muted-foreground leading-relaxed space-y-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Expand digital library resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Enhance tutoring programs</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Develop skill-based training</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Foster learning community</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HumsjLogo size={40} />
                <span className="text-xl font-bold">HUMSJ</span>
              </div>
              <p className="text-gray-400 text-sm">
                Haramaya University Muslim Students Jema'a - Empowering minds through faith and knowledge.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#mission" className="hover:text-white transition-colors">Mission</a></li>
                <li><a href="#vision" className="hover:text-white transition-colors">Vision</a></li>
                <li><a href="#goals" className="hover:text-white transition-colors">Goals</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Sectors</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/library-dashboard" className="hover:text-white transition-colors">Library</Link></li>
                <li><Link to="/tutor-dashboard" className="hover:text-white transition-colors">Tutoring</Link></li>
                <li><Link to="/trainer-dashboard" className="hover:text-white transition-colors">Training</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Get Started</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 HUMSJ - Haramaya University Muslim Students Jema'a. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
