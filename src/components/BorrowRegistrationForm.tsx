import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BookOpen, CheckCircle, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface BorrowFormData {
  fullName: string;
  email: string;
  telegramUsername: string;
  phoneNumber: string;
  idNumber: string;
  building: string;
  dormNumber: string;
}

interface BookData {
  id: string;
  title?: string;
  author?: string;
  category?: string;
  [key: string]: unknown;
}

interface BorrowRegistrationFormProps {
  book: BookData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialFormData: BorrowFormData = {
  fullName: "",
  email: "",
  telegramUsername: "",
  phoneNumber: "",
  idNumber: "",
  building: "",
  dormNumber: "",
};

export const BorrowRegistrationForm = ({ book, open, onOpenChange }: BorrowRegistrationFormProps) => {
  const [formData, setFormData] = useState<BorrowFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<BorrowFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<BorrowFormData | null>(null);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<BorrowFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.telegramUsername.trim()) {
      newErrors.telegramUsername = "Telegram username is required";
    } else if (!formData.telegramUsername.startsWith("@")) {
      newErrors.telegramUsername = "Username should start with @";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^(\+251|0)?[79]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Please enter a valid Ethiopian phone number";
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "ID number is required";
    }

    if (!formData.building.trim()) {
      newErrors.building = "Building is required";
    }

    if (!formData.dormNumber.trim()) {
      newErrors.dormNumber = "Dorm number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !book) return;

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "borrow_requests"), {
        bookId: book.id,
        bookTitle: book.title || "Unknown Title",
        bookAuthor: book.author || "Unknown",
        ...formData,
        status: "pending",
        createdAt: Timestamp.now(),
      });

      setSubmittedData(formData);
      setIsSuccess(true);
      toast({
        title: "Request Submitted!",
        description: "Your borrow request has been submitted successfully.",
      });
    } catch (error) {
      console.error("Error submitting borrow request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsSuccess(false);
    setSubmittedData(null);
    onOpenChange(false);
  };

  const handleInputChange = (field: keyof BorrowFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {isSuccess && submittedData ? (
          // Success State
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">Thank You!</DialogTitle>
              <DialogDescription className="text-center">
                Your borrow request has been submitted successfully.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Book Details
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{book.title || "Book"}</p>
                    <p className="text-sm text-muted-foreground">{book.author || "Unknown Author"}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Your Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{submittedData.fullName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium truncate">{submittedData.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{submittedData.phoneNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telegram:</span>
                    <p className="font-medium">{submittedData.telegramUsername}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID Number:</span>
                    <p className="font-medium">{submittedData.idNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">{submittedData.building}, Dorm {submittedData.dormNumber}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Next Steps:</strong> Visit the library desk with your student ID to collect the book. 
                  You will receive a confirmation via Telegram.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full rounded-full">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Form State
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Borrow Book</DialogTitle>
              <DialogDescription>
                Fill in your details to request "{book.title || 'this book'}"
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+251 9XX XXX XXX"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className={errors.phoneNumber ? "border-red-500" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telegramUsername">Telegram Username *</Label>
                  <Input
                    id="telegramUsername"
                    placeholder="@username"
                    value={formData.telegramUsername}
                    onChange={(e) => handleInputChange("telegramUsername", e.target.value)}
                    className={errors.telegramUsername ? "border-red-500" : ""}
                  />
                  {errors.telegramUsername && (
                    <p className="text-xs text-red-500">{errors.telegramUsername}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">Student ID Number *</Label>
                  <Input
                    id="idNumber"
                    placeholder="Enter your ID number"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange("idNumber", e.target.value)}
                    className={errors.idNumber ? "border-red-500" : ""}
                  />
                  {errors.idNumber && (
                    <p className="text-xs text-red-500">{errors.idNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building">Building *</Label>
                  <Input
                    id="building"
                    placeholder="e.g., Block A"
                    value={formData.building}
                    onChange={(e) => handleInputChange("building", e.target.value)}
                    className={errors.building ? "border-red-500" : ""}
                  />
                  {errors.building && (
                    <p className="text-xs text-red-500">{errors.building}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dormNumber">Dorm Number *</Label>
                  <Input
                    id="dormNumber"
                    placeholder="e.g., 101"
                    value={formData.dormNumber}
                    onChange={(e) => handleInputChange("dormNumber", e.target.value)}
                    className={errors.dormNumber ? "border-red-500" : ""}
                  />
                  {errors.dormNumber && (
                    <p className="text-xs text-red-500">{errors.dormNumber}</p>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
