const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

initializeApp({
  credential: cert(require("./serviceAccountKey.json")),
});

const db = getFirestore();

async function main() {
  // Example docs – adjust as you like

  const libraryDocs = [
    {
      title: "Intro to Programming",
      author: "CS Dept",
      category: "Computer Science",
      description: "Basic programming concepts.",
      copies: 5,
      available: 5,
      addedAt: Timestamp.now(),
    },
  ];

  const trainingDocs = [
    {
      title: "Research Methods Workshop",
      trainer: "Dr. X",
      category: "Research",
      description: "How to design and conduct research.",
      startDate: "2025-01-15",
      endDate: "2025-01-20",
      duration: 40,
      maxParticipants: 50,
      enrolledParticipants: 0,
      location: "Room 101",
      level: "beginner",
      status: "upcoming",
      deliveryMode: "in-person",
      createdAt: Timestamp.now(),
    },
  ];

  const tutorialDocs = [
    {
      title: "Calculus I Tutorial",
      tutor: "Mr. Y",
      subject: "Calculus",
      description: "Weekly support session.",
      schedule: "2025-01-18 10:00",
      duration: 60,
      maxStudents: 30,
      enrolledStudents: 0,
      location: "Room 202",
      deliveryMode: "in-person",
      status: "upcoming",
      createdAt: Timestamp.now(),
    },
  ];

  const batch = db.batch();

  libraryDocs.forEach((data) => {
    const ref = db.collection("library_resources").doc();
    batch.set(ref, data);
  });

  trainingDocs.forEach((data) => {
    const ref = db.collection("trainings").doc();
    batch.set(ref, data);
  });

  tutorialDocs.forEach((data) => {
    const ref = db.collection("tutorial_sessions").doc();
    batch.set(ref, data);
  });

  await batch.commit();
  console.log("Seed data written.");
}

main().catch(console.error);