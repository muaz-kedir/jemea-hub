import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  Search, 
  Bell,
  Calendar,
  MessageSquare,
  Heart,
  ArrowLeft,
  Megaphone,
  HandHeart,
  Clock,
  MapPin,
  GraduationCap,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpotlightCard } from "@/components/SpotlightCard";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, DocumentData } from "firebase/firestore";

type FirestoreRecord = DocumentData & { id: string };

const announcements = [
  { id: 1, title: "Ramadan Program Schedule Released", date: "Dec 1, 2025", content: "The complete schedule for our Ramadan activities has been published.", priority: "high" },
  { id: 2, title: "New Study Room Hours", date: "Nov 28, 2025", content: "Extended study room hours during exam period. Open until 11 PM.", priority: "normal" },
  { id: 3, title: "Volunteer Registration Open", date: "Nov 25, 2025", content: "Sign up for community service opportunities this semester.", priority: "normal" },
];

const discussions = [
  { id: 1, title: "Best study techniques for finals?", author: "Ahmed M.", replies: 23, likes: 45, time: "2 hours ago" },
  { id: 2, title: "Looking for study group - Data Structures", author: "Sara K.", replies: 8, likes: 12, time: "5 hours ago" },
  { id: 3, title: "Tips for balancing studies and worship", author: "Omar H.", replies: 31, likes: 67, time: "1 day ago" },
];

const volunteerPrograms = [
  { id: 1, title: "Campus Cleanup Initiative", date: "Dec 8, 2025", volunteers: 15, needed: 25, description: "Help keep our campus clean" },
  { id: 2, title: "Tutoring for Freshmen", date: "Ongoing", volunteers: 12, needed: 20, description: "Support new students" },
  { id: 3, title: "Food Distribution Program", date: "Dec 12, 2025", volunteers: 8, needed: 15, description: "Distribute food to those in need" },
];


const CommunityPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [trainings, setTrainings] = useState<FirestoreRecord[]>([]);
  const [tutorials, setTutorials] = useState<FirestoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load trainings
      const trainingsQuery = query(
        collection(db, "trainings"),
        orderBy("createdAt", "desc"),
        limit(4)
      );
      const trainingsSnapshot = await getDocs(trainingsQuery);
      const trainingsData = trainingsSnapshot.docs.map((doc): FirestoreRecord => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      }));
      setTrainings(trainingsData);

      // Load tutorials
      const tutorialsQuery = query(
        collection(db, "tutorial_sessions"),
        orderBy("createdAt", "desc"),
        limit(4)
      );
      const tutorialsSnapshot = await getDocs(tutorialsQuery);
      const tutorialsData = tutorialsSnapshot.docs.map((doc): FirestoreRecord => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      }));
      setTutorials(tutorialsData);
    } catch (error) {
      console.error("Error loading data:", error);
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
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold">Student Community</h1>
              </div>
            </div>
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800">
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Connect & Grow Together</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Join our vibrant community of Muslim students. Share knowledge, participate in events, and make a difference.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search community..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-slate-900 border-slate-700 rounded-xl"
            />
          </div>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="events" className="text-xs sm:text-sm">
              <Calendar className="w-4 h-4 mr-1 hidden sm:inline" />
              Events
            </TabsTrigger>
            <TabsTrigger value="announcements" className="text-xs sm:text-sm">
              <Bell className="w-4 h-4 mr-1 hidden sm:inline" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="discussions" className="text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4 mr-1 hidden sm:inline" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="volunteer" className="text-xs sm:text-sm">
              <HandHeart className="w-4 h-4 mr-1 hidden sm:inline" />
              Volunteer
            </TabsTrigger>
          </TabsList>

          {/* Events Tab - Shows Trainings and Tutorials */}
          <TabsContent value="events">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-400">Loading events...</p>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Upcoming Trainings */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-400" />
                      Upcoming Trainings
                    </h3>
                    <Link to="/training" className="text-sm text-purple-400 hover:text-purple-300">
                      View All →
                    </Link>
                  </div>
                  {trainings.length === 0 ? (
                    <Card className="p-6 text-center bg-slate-900 border-slate-800">
                      <p className="text-slate-400">No upcoming trainings</p>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {trainings.map(training => (
                        <SpotlightCard key={training.id} className="p-4 bg-slate-900/70">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                              <Award className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs text-purple-300">{training.category || "Training"}</span>
                          </div>
                          <h4 className="font-semibold mb-2 line-clamp-2">{training.title}</h4>
                          <div className="text-xs text-slate-400 space-y-1 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(training.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{training.enrolledParticipants || 0} enrolled</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={() => navigate(`/trainings/${training.id}/register`)}
                          >
                            Register
                          </Button>
                        </SpotlightCard>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Tutorials */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-green-400" />
                      Active Tutorials
                    </h3>
                    <Link to="/tutoring" className="text-sm text-green-400 hover:text-green-300">
                      View All →
                    </Link>
                  </div>
                  {tutorials.length === 0 ? (
                    <Card className="p-6 text-center bg-slate-900 border-slate-800">
                      <p className="text-slate-400">No active tutorials</p>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {tutorials.map(tutorial => (
                        <SpotlightCard key={tutorial.id} className="p-4 bg-slate-900/70">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                              <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs text-green-300">{tutorial.subject || "Tutorial"}</span>
                          </div>
                          <h4 className="font-semibold mb-2 line-clamp-2">{tutorial.title}</h4>
                          <div className="text-xs text-slate-400 space-y-1 mb-3">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>Tutor: {tutorial.tutor || "TBA"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{tutorial.enrolledStudents || 0} students</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => navigate(`/tutorials/${tutorial.id}/register`)}
                          >
                            Join
                          </Button>
                        </SpotlightCard>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <div className="space-y-4">
              {announcements.map(announcement => (
                <Card key={announcement.id} className={`p-6 bg-slate-900 border-slate-800 ${announcement.priority === 'high' ? 'border-l-4 border-l-orange-500' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <span className="text-xs text-slate-400">{announcement.date}</span>
                      </div>
                      <p className="text-slate-400 text-sm">{announcement.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Discussions Tab */}
          <TabsContent value="discussions">
            <div className="space-y-4">
              {discussions.map(discussion => (
                <Card key={discussion.id} className="p-6 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{discussion.title}</h3>
                      <p className="text-sm text-slate-400">Posted by {discussion.author} · {discussion.time}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{discussion.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{discussion.likes}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              <div className="text-center pt-4">
                <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                  Start New Discussion
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Volunteer Tab */}
          <TabsContent value="volunteer">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteerPrograms.map(program => (
                <Card key={program.id} className="p-6 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2 mb-4">
                    <HandHeart className="w-5 h-5 text-pink-400" />
                    <span className="text-xs text-pink-400">{program.volunteers}/{program.needed} volunteers</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{program.title}</h3>
                  <p className="text-sm text-slate-400 mb-2">{program.date}</p>
                  <p className="text-sm text-slate-400 mb-6">{program.description}</p>
                  <Button className="w-full bg-pink-600 hover:bg-pink-700">
                    Volunteer Now
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="p-8 mt-12 bg-gradient-to-r from-orange-600 to-red-600 border-0 text-center">
          <h3 className="text-2xl font-bold mb-4">Be Part of Something Bigger</h3>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Join our community and connect with fellow Muslim students. Together, we can achieve more.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="rounded-full">
              Join Now
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  );
};

export default CommunityPage;
