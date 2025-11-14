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
import { Calendar, Users, GraduationCap, MapPin, ArrowLeft, Loader2 } from "lucide-react";

import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

interface Training {
  id: string;
  title: string;
  trainer: string;
  category: string;
  description?: string;
  startDate: string;
  endDate: string;
  duration?: number;
  maxParticipants?: number;
  enrolledParticipants?: number;
  location?: string;
  level?: string;
  imageUrl?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "TBA";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

const TrainingRegistration = () => {
  const { trainingId } = useParams<{ trainingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [training, setTraining] = useState<Training | null>(null);
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
    const fetchTraining = async () => {
      if (!trainingId) return;

      try {
        const trainingDoc = await getDoc(doc(db, "trainings", trainingId));
        if (!trainingDoc.exists()) {
          toast({
            title: "Training not found",
            description: "The training you are trying to register for does not exist.",
            variant: "destructive",
          });
          navigate("/landing", { replace: true });
          return;
        }

        setTraining({ id: trainingDoc.id, ...(trainingDoc.data() as Training) });
      } catch (error) {
        console.error("Error loading training:", error);
        toast({
          title: "Error",
          description: "Unable to load training details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTraining();
  }, [trainingId, navigate, toast]);

  const handleChange = (key: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trainingId || !training) return;

    if (!user) {
      toast({
        title: "Please log in",
        description: "You need an account to register for trainings.",
        variant: "destructive",
      });
      navigate("/login", { state: { redirectTo: `/trainings/${trainingId}/register` } });
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

    setSubmitting(true);
    try {
      const registrationData = {
        trainingId,
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

      await addDoc(collection(db, "trainings", trainingId, "registrations"), registrationData);

      if (typeof training.enrolledParticipants === "number") {
        await updateDoc(doc(db, "trainings", trainingId), {
          enrolledParticipants: increment(1),
        });
      }

      toast({
        title: "Registration submitted",
        description: "You have successfully registered for this training.",
      });

      navigate("/landing");
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

  if (!training) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="ghost" className="mb-6 flex items-center gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-8">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">{training.title}</h1>
                <p className="text-sm text-muted-foreground">Led by {training.trainer}</p>
              </div>
            </div>

            {training.imageUrl && (
              <img
                src={training.imageUrl}
                alt={training.title}
                className="w-full h-60 object-cover rounded-xl mb-6"
              />
            )}

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(training.startDate)}{training.endDate ? ` — ${formatDate(training.endDate)}` : ""}
                </span>
              </div>
              {training.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{training.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {(training.enrolledParticipants ?? 0)} / {(training.maxParticipants ?? "∞")} participants registered
                </span>
              </div>
              {training.description && (
                <p className="text-base text-foreground pt-4 leading-relaxed">
                  {training.description}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Register for this Training</h2>
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
                  Why are you interested in this training?
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

export default TrainingRegistration;
