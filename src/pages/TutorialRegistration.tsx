import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  Timestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { Calendar, Users, GraduationCap, MapPin, Clock, ArrowLeft, Loader2 } from "lucide-react";

import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

interface TutorialSession {
  id: string;
  title: string;
  tutor: string;
  subject?: string;
  description?: string;
  schedule?: string;
  duration?: number;
  maxStudents?: number;
  enrolledStudents?: number;
  location?: string;
  status?: string;
  imageUrl?: string;
}

const formatDateTime = (value?: string) => {
  if (!value) return "TBA";
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return value;
  }
};

const TutorialRegistration = () => {
  const { tutorialId } = useParams<{ tutorialId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [tutorial, setTutorial] = useState<TutorialSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    studentId: "",
    department: "",
    batch: "",
    motivation: "",
  });

  useEffect(() => {
    const fetchTutorial = async () => {
      if (!tutorialId) return;

      try {
        const tutorialDoc = await getDoc(doc(db, "tutorial_sessions", tutorialId));
        if (!tutorialDoc.exists()) {
          toast({
            title: "Tutorial not found",
            description: "The tutorial you are trying to register for does not exist.",
            variant: "destructive",
          });
          navigate("/landing", { replace: true });
          return;
        }

        setTutorial({ id: tutorialDoc.id, ...(tutorialDoc.data() as TutorialSession) });
      } catch (error) {
        console.error("Error loading tutorial:", error);
        toast({
          title: "Error",
          description: "Unable to load tutorial details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTutorial();
  }, [tutorialId, navigate, toast]);

  const handleChange = (key: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tutorialId || !tutorial) return;

    if (!user) {
      toast({
        title: "Please log in",
        description: "You need an account to register for tutorials.",
        variant: "destructive",
      });
      navigate("/login", { state: { redirectTo: `/tutorials/${tutorialId}/register` } });
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.studentId || !formData.department || !formData.batch) {
      toast({
        title: "Missing information",
        description: "Please fill in your full name, email, phone number, ID, department, and batch.",
        variant: "destructive",
      });
      return;
    }

    if (
      typeof tutorial.maxStudents === "number" &&
      typeof tutorial.enrolledStudents === "number" &&
      tutorial.enrolledStudents >= tutorial.maxStudents
    ) {
      toast({
        title: "Session full",
        description: "This tutorial session has reached its maximum capacity.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const registrationData = {
        tutorialId,
        userId: user.uid,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        studentId: formData.studentId.trim(),
        department: formData.department.trim(),
        batch: formData.batch.trim(),
        motivation: formData.motivation.trim() || null,
        registeredAt: Timestamp.now(),
      };

      await addDoc(collection(db, "tutorial_sessions", tutorialId, "registrations"), registrationData);

      if (typeof tutorial.enrolledStudents === "number") {
        await updateDoc(doc(db, "tutorial_sessions", tutorialId), {
          enrolledStudents: increment(1),
        });
        setTutorial((prev) =>
          prev
            ? {
                ...prev,
                enrolledStudents: (prev.enrolledStudents ?? 0) + 1,
              }
            : prev
        );
      }

      toast({
        title: "Registration submitted",
        description: "You have successfully registered for this tutorial session.",
      });

      navigate("/landing", { replace: true });
    } catch (error) {
      console.error("Error submitting registration:", error);
      toast({
        title: "Registration failed",
        description: "We could not submit your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tutorial) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-green-500/5 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="ghost" className="mb-6 flex items-center gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-8">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">{tutorial.title}</h1>
                <p className="text-sm text-muted-foreground">Led by {tutorial.tutor}</p>
              </div>
            </div>

            {tutorial.imageUrl && (
              <img
                src={tutorial.imageUrl}
                alt={tutorial.title}
                className="w-full h-60 object-cover rounded-xl mb-6"
              />
            )}

            <div className="space-y-3 text-sm text-muted-foreground">
              {tutorial.schedule && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDateTime(tutorial.schedule)}</span>
                </div>
              )}
              {tutorial.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{tutorial.duration} minutes</span>
                </div>
              )}
              {tutorial.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{tutorial.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {(tutorial.enrolledStudents ?? 0)} / {(tutorial.maxStudents ?? "∞")} students registered
                </span>
              </div>
              {tutorial.description && (
                <p className="text-base text-foreground pt-4 leading-relaxed">
                  {tutorial.description}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Register for this Tutorial</h2>
            {!user && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
                You must be logged in to submit this form.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="fullName">
                  Full Name *
                </label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleChange("fullName")}
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  placeholder="jane.doe@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">
                  Phone Number *
                </label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  placeholder="+251 900 000 000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="studentId">
                  Student ID *
                </label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={handleChange("studentId")}
                  placeholder="e.g., HU-IT-2020-1234"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="department">
                    Department *
                  </label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={handleChange("department")}
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="batch">
                    Batch *
                  </label>
                  <Input
                    id="batch"
                    value={formData.batch}
                    onChange={handleChange("batch")}
                    placeholder="e.g., Batch 2023"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="motivation">
                  Why are you interested in this tutorial?
                </label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={handleChange("motivation")}
                  placeholder="Share your goals or expectations"
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full rounded-full" disabled={submitting || !user}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TutorialRegistration;
