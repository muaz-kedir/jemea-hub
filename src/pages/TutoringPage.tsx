import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  Search, 
  Star,
  Clock,
  Users,
  ArrowLeft,
  Code,
  Calculator,
  Atom,
  MessageSquare,
  BookOpen,
  Languages,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SpotlightCard } from "@/components/SpotlightCard";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, DocumentData } from "firebase/firestore";

type FirestoreRecord = DocumentData & { id: string };

const categories = [
  { name: "Programming", icon: Code, color: "bg-blue-500", count: 12 },
  { name: "Mathematics", icon: Calculator, color: "bg-green-500", count: 8 },
  { name: "Physics", icon: Atom, color: "bg-purple-500", count: 6 },
  { name: "Soft Skills", icon: MessageSquare, color: "bg-orange-500", count: 5 },
  { name: "Islamic Studies", icon: BookOpen, color: "bg-amber-500", count: 7 },
  { name: "Languages", icon: Languages, color: "bg-pink-500", count: 4 },
];

const sampleTutors = [
  { id: 1, name: "Ahmed Hassan", subject: "Programming", rating: 4.9, sessions: 120, available: true },
  { id: 2, name: "Fatima Ali", subject: "Mathematics", rating: 4.8, sessions: 95, available: true },
  { id: 3, name: "Omar Ibrahim", subject: "Physics", rating: 4.7, sessions: 78, available: false },
  { id: 4, name: "Aisha Mohammed", subject: "Islamic Studies", rating: 5.0, sessions: 150, available: true },
];


const TutoringPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTutorials, setActiveTutorials] = useState<FirestoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorials = async () => {
    try {
      const tutorialsQuery = query(
        collection(db, "tutorial_sessions"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(tutorialsQuery);
      const data = snapshot.docs.map((doc): FirestoreRecord => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      }));
      setActiveTutorials(data);
    } catch (error) {
      console.error("Error loading tutorials:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = sampleTutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutor.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || tutor.subject === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/landing" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold">Tutoring & Academic Support</h1>
              </div>
            </div>
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800">
                Become a Tutor
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Get Personalized Academic Support</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Connect with expert tutors who can help you excel in your studies. One-on-one sessions tailored to your learning needs.
          </p>
        </div>

        {/* How It Works */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-slate-800">
          <h3 className="text-2xl font-bold mb-6 text-center">How Tutoring Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Choose a Subject</h4>
              <p className="text-slate-400 text-sm">Browse categories and find the subject you need help with</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-2">Select a Tutor</h4>
              <p className="text-slate-400 text-sm">Pick from our verified tutors based on ratings and availability</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Start Learning</h4>
              <p className="text-slate-400 text-sm">Schedule a session and begin your personalized learning journey</p>
            </div>
          </div>
        </Card>

        {/* Active Tutorial Sessions from Firestore */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Active Tutorial Sessions</h3>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading tutorials...</p>
            </div>
          ) : activeTutorials.length === 0 ? (
            <Card className="p-8 text-center bg-slate-900 border-slate-800">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">No active tutorial sessions available yet</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTutorials.map((tutorial) => (
                <SpotlightCard key={tutorial.id} className="p-6 bg-slate-900/70">
                  {tutorial.imageUrl && (
                    <img
                      src={tutorial.imageUrl}
                      alt={tutorial.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                      {tutorial.status || "Active"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tutorial.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{tutorial.subject}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tutor:</span>
                      <span className="font-medium">{tutorial.tutor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Students:</span>
                      <span className="font-medium">{tutorial.enrolledStudents || 0}</span>
                    </div>
                    {tutorial.location && (
                      <div className="text-xs text-slate-400 mt-2">{tutorial.location}</div>
                    )}
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 rounded-full"
                    size="sm"
                    onClick={() => navigate(`/tutorials/${tutorial.id}/register`)}
                  >
                    Join Session
                  </Button>
                </SpotlightCard>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(isSelected ? null : category.name)}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-slate-800 border-green-500' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-sm">{category.name}</p>
                  <p className="text-xs text-slate-400">{category.count} tutors</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="max-w-xl mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search tutors by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-slate-900 border-slate-700 rounded-xl"
            />
          </div>
        </div>

        {/* Available Tutors */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">Available Tutors</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTutors.map(tutor => (
              <Card key={tutor.id} className="p-6 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold">{tutor.name.charAt(0)}</span>
                  </div>
                  <h4 className="font-semibold">{tutor.name}</h4>
                  <p className="text-sm text-slate-400">{tutor.subject}</p>
                  <span className={`text-xs px-2 py-1 rounded-full mt-2 ${
                    tutor.available 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {tutor.available ? 'Available' : 'Busy'}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{tutor.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{tutor.sessions}</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={!tutor.available}
                >
                  Request Tutoring
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="p-8 mt-12 bg-gradient-to-r from-green-600 to-blue-600 border-0 text-center">
          <h3 className="text-2xl font-bold mb-4">Want to Share Your Knowledge?</h3>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Join our team of tutors and help fellow students succeed. Flexible hours, great experience.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="rounded-full">
              Apply as Tutor
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  );
};

export default TutoringPage;
