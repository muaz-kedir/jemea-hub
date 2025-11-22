import { Link, useNavigate } from "react-router-dom";
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
import StarBorder from "@/components/StarBorder";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect, useRef } from "react";
import { HumsjLogo } from "@/components/HumsjLogo";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, DocumentData } from "firebase/firestore";
import gsap from "gsap";

type FirestoreRecord = DocumentData & { id: string };

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [upcomingTrainings, setUpcomingTrainings] = useState<FirestoreRecord[]>([]);
  const [activeTutorials, setActiveTutorials] = useState<FirestoreRecord[]>([]);
  const [latestLibraryUploads, setLatestLibraryUploads] = useState<FirestoreRecord[]>([]);
  const [selectedLibraryResource, setSelectedLibraryResource] = useState<FirestoreRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Refs for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // GSAP Hero Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate background image with zoom effect
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { scale: 1.2, opacity: 0 },
          { scale: 1, opacity: 1, duration: 2, ease: "power3.out" }
        );
      }

      // Animate title with fade and slide up
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power3.out" }
        );
      }

      // Animate subtitle
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, delay: 0.6, ease: "power3.out" }
        );
      }

      // Animate buttons
      if (buttonsRef.current) {
        gsap.fromTo(
          buttonsRef.current.children,
          { y: 20, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            delay: 0.9, 
            stagger: 0.2,
            ease: "power3.out" 
          }
        );
      }

      // Floating animation for decorative elements
      gsap.to(".glow-orb", {
        y: "+=20",
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.5
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const loadData = async () => {
    try {
      // Load trainings
      const trainingsQuery = query(
        collection(db, "trainings"),
        orderBy("createdAt", "desc"),
        limit(3)
      );
      const trainingsSnapshot = await getDocs(trainingsQuery);
      const trainingsData = trainingsSnapshot.docs.map((doc): FirestoreRecord => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      }));
      setUpcomingTrainings(trainingsData);

      // Load tutorial sessions
      const tutorialsQuery = query(
        collection(db, "tutorial_sessions"),
        orderBy("createdAt", "desc"),
        limit(3)
      );
      const tutorialsSnapshot = await getDocs(tutorialsQuery);
      const tutorialsData = tutorialsSnapshot.docs.map((doc): FirestoreRecord => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      }));
      setActiveTutorials(tutorialsData);

      // Load library resources
      const libraryQuery = query(
        collection(db, "library_resources"),
        orderBy("addedAt", "desc"),
        limit(3)
      );
      const librarySnapshot = await getDocs(libraryQuery);
      const libraryData = librarySnapshot.docs.map((doc): FirestoreRecord => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      }));
      console.log("Library resources loaded:", libraryData);
      libraryData.forEach(item => {
        console.log(`Resource: ${item.title}, imageUrl: ${item.imageUrl}`);
      });
      setLatestLibraryUploads(libraryData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrainingEmoji = (category: string) => {
    const lowerCategory = category?.toLowerCase() || "";
    if (lowerCategory.includes("web") || lowerCategory.includes("technology")) return "🎓";
    if (lowerCategory.includes("data") || lowerCategory.includes("science")) return "📊";
    if (lowerCategory.includes("mobile") || lowerCategory.includes("app")) return "📱";
    if (lowerCategory.includes("leadership")) return "👔";
    return "📚";
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "TBA";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "TBA";
    }
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Recently";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch {
      return "Recently";
    }
  };

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
      link: "/landing"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800 shadow-sm text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <HumsjLogo size={48} className="flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-primary leading-tight">HUMSJ</span>
                <span className="text-xs text-slate-400 leading-tight hidden sm:block">Haramaya University</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
                About
              </a>
              <a href="#mission" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
                Mission
              </a>
              <a href="#vision" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
                Vision
              </a>
              <a href="#goals" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
                Goals
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/notifications"
                className="group flex items-center justify-center rounded-full p-2 text-slate-200 transition-colors hover:bg-slate-800/60 hover:text-white"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5 transition-colors group-hover:text-white" />
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:text-slate-900">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-full bg-white text-slate-900 hover:bg-slate-900 hover:text-white">Sign Up</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950">
            <div className="px-4 py-4 space-y-3">
              <a href="#about" className="block py-2 text-sm font-medium text-slate-200 hover:text-white">
                About
              </a>
              <a href="#mission" className="block py-2 text-sm font-medium text-slate-200 hover:text-white">
                Mission
              </a>
              <a href="#vision" className="block py-2 text-sm font-medium text-slate-200 hover:text-white">
                Vision
              </a>
              <a href="#goals" className="block py-2 text-sm font-medium text-slate-200 hover:text-white">
                Goals
              </a>
              <div className="flex gap-3 pt-3 border-t">
                <Link
                  to="/notifications"
                  className="group flex items-center justify-center rounded-full p-2 text-slate-200 transition-colors hover:bg-slate-800/60 hover:text-white"
                  aria-label="View notifications"
                >
                  <Bell className="h-5 w-5 transition-colors group-hover:text-white" />
                </Link>
                <Link to="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-slate-700 text-white hover:bg-white hover:text-slate-900">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" className="flex-1">
                  <Button size="sm" className="w-full rounded-full bg-white text-slate-900 hover:bg-slate-900 hover:text-white">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative text-white py-32 overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            ref={imageRef}
            src="/mosque-hero.jpg" 
            alt="Mosque at night"
            className="w-full h-full object-cover brightness-90"
            onError={(e) => {
              // Hide image and show gradient background if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Fallback gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
          {/* Lighter overlay for better image visibility while keeping text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="glow-orb absolute top-10 left-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="glow-orb absolute bottom-10 right-10 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 ref={titleRef} className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              Haramaya University Muslim Students Jema'a
            </h1>
            <p ref={subtitleRef} className="text-xl md:text-2xl mb-8 text-white/95 drop-shadow-lg">
              Academic Excellence Through Faith and Knowledge
            </p>
            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <StarBorder
                  as="button"
                  color="cyan"
                  speed="5s"
                  thickness={8}
                  className="group rounded-full"
                  innerClassName="rounded-full bg-white text-gray-900 px-8 py-3 font-semibold text-lg transition-transform duration-300 group-hover:bg-white/90 group-focus-visible:bg-white/90"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-5 h-5" />
                </StarBorder>
              </Link>
              <a href="#sectors">
                <StarBorder
                  as="button"
                  color="cyan"
                  speed="5s"
                  thickness={8}
                  className="group rounded-full"
                  innerClassName="rounded-full border border-white/60 text-white px-8 py-3 font-semibold text-lg backdrop-blur-sm transition-transform duration-300 group-hover:bg-white/10 group-focus-visible:bg-white/10"
                  innerStyle={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <span>Explore Sectors</span>
                </StarBorder>
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
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading trainings...</p>
              </div>
            ) : upcomingTrainings.length === 0 ? (
              <Card className="p-8 text-center border-0 shadow-md">
                <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No training programs available yet</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {upcomingTrainings.map((training) => (
                  <Card
                    key={training.id}
                    className="interactive-card group relative overflow-hidden p-6 border-0 shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {training.imageUrl ? (
                      <img
                        src={training.imageUrl}
                        alt={training.title}
                        className="w-full h-48 object-cover rounded-lg mb-4 transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          console.error("Failed to load training image:", training.imageUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => console.log("Training image loaded:", training.imageUrl)}
                      />
                    ) : (
                      <div className="text-5xl mb-4">{getTrainingEmoji(training.category)}</div>
                    )}
                    <h3 className="text-xl font-bold mb-2">{training.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(training.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>{training.trainer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{training.enrolledParticipants || 0} participants</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 mb-3">
                      Prepare for registration
                    </p>
                    <Button
                      className="w-full rounded-full transition-transform duration-500 group-hover:translate-y-[-2px]"
                      size="sm"
                      onClick={() => navigate(`/trainings/${training.id}/register`)}
                    >
                      Register Now
                    </Button>
                  </Card>
                ))}
              </div>
            )}
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
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading tutorials...</p>
              </div>
            ) : activeTutorials.length === 0 ? (
              <Card className="p-8 text-center border-0 shadow-md">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No tutorial sessions available yet</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {activeTutorials.map((tutorial) => (
                  <Card
                    key={tutorial.id}
                    className="interactive-card group relative overflow-hidden p-6 border-0 shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-emerald-200/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {tutorial.imageUrl && (
                      <img
                        src={tutorial.imageUrl}
                        alt={tutorial.title}
                        className="w-full h-48 object-cover rounded-lg mb-4 transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          console.error("Failed to load tutorial image:", tutorial.imageUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => console.log("Tutorial image loaded:", tutorial.imageUrl)}
                      />
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                        {tutorial.status || "Active"}
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
                        <span className="font-medium">{tutorial.enrolledStudents || 0}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {tutorial.location || "TBA"}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full rounded-full transition-transform duration-500 group-hover:translate-y-[-2px]"
                      size="sm"
                      onClick={() => navigate(`/tutorials/${tutorial.id}/register`)}
                    >
                      Join Session
                    </Button>
                  </Card>
                ))}
              </div>
            )}
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
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading library resources...</p>
              </div>
            ) : latestLibraryUploads.length === 0 ? (
              <Card className="p-8 text-center border-0 shadow-md">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No library resources available yet</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {latestLibraryUploads.map((book) => (
                  <Card
                    key={book.id}
                    className="interactive-card group relative overflow-hidden p-6 border-0 shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-blue-200/15 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start gap-4 mb-4">
                      {book.imageUrl ? (
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded-lg flex-shrink-0 transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            console.error("Failed to load image:", book.imageUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => console.log("Image loaded successfully:", book.imageUrl)}
                        />
                      ) : (
                        <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                      )}
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
                        <span className="text-muted-foreground">Copies:</span>
                        <span className="font-medium">{book.available || 0}/{book.copies || 0}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Added {getTimeAgo(book.addedAt)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      size="sm"
                      onClick={() => setSelectedLibraryResource(book)}
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedLibraryResource} onOpenChange={(open) => !open && setSelectedLibraryResource(null)}>
        <DialogContent className="max-w-3xl">
          {selectedLibraryResource && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {selectedLibraryResource.title}
                </DialogTitle>
                <DialogDescription>
                  Added {getTimeAgo(selectedLibraryResource.addedAt)} by {selectedLibraryResource.author}
                </DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-[280px_1fr] gap-6 py-4">
                <div className="space-y-3">
                  {selectedLibraryResource.imageUrl ? (
                    <img
                      src={selectedLibraryResource.imageUrl}
                      alt={selectedLibraryResource.title}
                      className="w-full h-64 object-cover rounded-xl shadow-md"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <div className="rounded-xl border p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">{selectedLibraryResource.category || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ISBN</span>
                      <span className="font-medium">{selectedLibraryResource.isbn || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Published</span>
                      <span className="font-medium">
                        {selectedLibraryResource.publishedYear || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Copies</span>
                      <span className="font-medium">
                        {selectedLibraryResource.available ?? 0} / {selectedLibraryResource.copies ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedLibraryResource.description || "No description provided."}
                    </p>
                  </div>
                  {selectedLibraryResource.keywords?.length ? (
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLibraryResource.keywords.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="rounded-xl border p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">How to Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Visit the library desk with the book title and ISBN to request a copy. Availability shown above is updated in real-time.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Last updated {getTimeAgo(selectedLibraryResource.addedAt)}
                </span>
                <Button onClick={() => setSelectedLibraryResource(null)} className="rounded-full">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
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
                <li><Link to="/landing" className="hover:text-white transition-colors">Community</Link></li>
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
