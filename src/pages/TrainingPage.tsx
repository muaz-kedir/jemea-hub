import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Award, 
  Search, 
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  MapPin,
  CheckCircle,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpotlightCard } from "@/components/SpotlightCard";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, DocumentData } from "firebase/firestore";

type FirestoreRecord = DocumentData & { id: string };

const skillCategories = [
  { name: "Technology", color: "bg-blue-500", count: 15 },
  { name: "Soft Skills", color: "bg-green-500", count: 8 },
  { name: "Design", color: "bg-purple-500", count: 6 },
  { name: "Leadership", color: "bg-orange-500", count: 5 },
  { name: "Languages", color: "bg-pink-500", count: 4 },
  { name: "Business", color: "bg-amber-500", count: 7 },
];


const TrainingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [trainings, setTrainings] = useState<FirestoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      const trainingsQuery = query(
        collection(db, "trainings"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(trainingsQuery);
      const data = snapshot.docs.map((doc): FirestoreRecord => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      }));
      setTrainings(data);
    } catch (error) {
      console.error("Error loading trainings:", error);
    } finally {
      setLoading(false);
    }
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

  const getTrainingEmoji = (category: string) => {
    const lowerCategory = category?.toLowerCase() || "";
    if (lowerCategory.includes("web") || lowerCategory.includes("technology")) return "🎓";
    if (lowerCategory.includes("data") || lowerCategory.includes("science")) return "📊";
    if (lowerCategory.includes("mobile") || lowerCategory.includes("app")) return "📱";
    if (lowerCategory.includes("leadership")) return "👔";
    return "📚";
  };

  // Separate upcoming and past trainings
  const now = new Date();
  const upcomingTrainings = trainings.filter(t => {
    if (!t.startDate) return true;
    const date = t.startDate.toDate ? t.startDate.toDate() : new Date(t.startDate);
    return date >= now;
  });
  const pastTrainings = trainings.filter(t => {
    if (!t.startDate) return false;
    const date = t.startDate.toDate ? t.startDate.toDate() : new Date(t.startDate);
    return date < now;
  });

  const filteredUpcoming = upcomingTrainings.filter(t => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold">Training & Skill Development</h1>
              </div>
            </div>
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800">
                Become a Trainer
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Enhance Your Skills</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Join expert-led training programs designed to boost your professional and personal development
          </p>
        </div>

        {/* Skill Categories */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Skill Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {skillCategories.map(category => (
              <Card key={category.name} className="p-4 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors text-center cursor-pointer">
                <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="font-medium text-sm">{category.name}</p>
                <p className="text-xs text-slate-400">{category.count} programs</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search trainings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-slate-900 border-slate-700 rounded-xl"
            />
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="upcoming">Upcoming ({upcomingTrainings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastTrainings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-400">Loading trainings...</p>
              </div>
            ) : filteredUpcoming.length === 0 ? (
              <Card className="p-8 text-center bg-slate-900 border-slate-800">
                <Award className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">No upcoming trainings available</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUpcoming.map(training => (
                  <SpotlightCard key={training.id} className="p-6 bg-slate-900/70">
                    {training.imageUrl ? (
                      <img
                        src={training.imageUrl}
                        alt={training.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="text-5xl mb-4">{getTrainingEmoji(training.category)}</div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                        {training.category || "General"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {training.maxParticipants ? `${training.maxParticipants - (training.enrolledParticipants || 0)} spots left` : "Open"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-4">{training.title}</h3>
                    <div className="space-y-2 text-sm text-slate-400 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(training.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>{training.trainer || "TBA"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{training.enrolledParticipants || 0} enrolled</span>
                      </div>
                      {training.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{training.location}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 rounded-full"
                      onClick={() => navigate(`/trainings/${training.id}/register`)}
                    >
                      Join Training
                    </Button>
                  </SpotlightCard>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastTrainings.length === 0 ? (
              <Card className="p-8 text-center bg-slate-900 border-slate-800">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">No past trainings yet</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastTrainings.map(training => (
                  <Card key={training.id} className="p-6 bg-slate-900 border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-xs text-green-400">Completed</span>
                    </div>
                    <h3 className="font-bold mb-2">{training.title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{formatDate(training.startDate)}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{training.enrolledParticipants || 0} participants</span>
                      <span className="text-purple-400">{training.category}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="p-8 mt-12 bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-center">
          <h3 className="text-2xl font-bold mb-4">Have Expertise to Share?</h3>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Become a trainer and help students develop new skills. We're always looking for passionate instructors.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="rounded-full">
              Apply as Trainer
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  );
};

export default TrainingPage;
