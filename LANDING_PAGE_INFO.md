# Landing Page Documentation

## Overview
The new landing page serves as the main entry point for the TEACH-ME platform, providing visitors with a comprehensive overview of all available services and features.

## Features

### 1. Navigation Bar
- **Desktop Navigation**: About, Mission, Vision, Goals
- **Mobile Responsive**: Hamburger menu for mobile devices
- **Auth Buttons**: Login and Sign Up buttons
- **Sticky Header**: Stays visible while scrolling

### 2. Hero Section
- Large welcome banner with gradient background
- Call-to-action buttons (Get Started, Explore Sectors)
- Animated entrance effects

### 3. Daily Quote/Hadith Section
- Displays inspirational Islamic quotes or Hadith
- Amber-themed design with bell icon
- Easily customizable content

### 4. Dynamic Content Cards

#### Upcoming Trainings
- Shows 3 upcoming training programs
- Displays: Title, Date, Instructor, Participant count
- Register Now button for each training
- Purple-themed section

#### Active Tutorials
- Shows 3 active tutorial sessions
- Displays: Subject, Tutor, Students, Schedule
- Join Session button for each tutorial
- Green-themed section

#### Latest Library Uploads
- Shows 3 recently uploaded books
- Displays: Title, Author, Category, Pages, Upload date
- View Details button for each book
- Blue-themed section

### 5. Sectors Navigation
- 4 main sectors with icons and descriptions:
  - **Library**: Access books and resources
  - **Tutoring**: Get academic support
  - **Training**: Enhance skills
  - **Community**: Connect with students
- Each sector links to its respective dashboard

### 6. About Section
- Detailed information about TEACH-ME
- Statistics cards showing:
  - 500+ Active Students
  - 1000+ Books Available
  - 50+ Expert Tutors
  - 100+ Training Programs

### 7. Mission, Vision, Goals Section
- Three cards with detailed information:
  - **Mission**: Target icon, blue gradient
  - **Vision**: Eye icon, purple gradient
  - **Goals**: Heart icon, green gradient with bullet points

### 8. Footer
- Company branding
- Quick links to all sections
- Sector links
- Get Started links
- Copyright information

## Routes
- **Main Route**: `/landing`
- **Splash Screen**: Redirects to `/landing` after 2 seconds

## Customization

### Update Dynamic Content
Edit the following arrays in `LandingPage.tsx`:

```typescript
// Upcoming Trainings
const upcomingTrainings = [...]

// Active Tutorials
const activeTutorials = [...]

// Latest Library Uploads
const latestLibraryUploads = [...]

// Daily Quote
const dailyQuote = {
  text: "Your quote here",
  author: "Author name",
  type: "Hadith" or "Quote"
}
```

### Update Statistics
Modify the stats in the About section:
```typescript
<p className="text-3xl font-bold mb-2">500+</p>
<p className="text-sm text-muted-foreground">Active Students</p>
```

### Update Mission, Vision, Goals
Edit the content in the respective Card components in the Mission, Vision, Goals section.

## Design Features
- **Responsive Design**: Works on all screen sizes
- **Modern UI**: Gradient backgrounds, shadows, rounded corners
- **Smooth Animations**: Hover effects and transitions
- **Dark Mode Support**: Automatically adapts to theme
- **Accessibility**: Semantic HTML and proper ARIA labels

## Color Scheme
- **Primary**: Blue (#3B82F6)
- **Library**: Blue (#3B82F6)
- **Tutoring**: Green (#10B981)
- **Training**: Purple (#8B5CF6)
- **Community**: Orange (#F97316)

## Icons
Uses Lucide React icons throughout:
- GraduationCap, BookOpen, Award, Users
- Calendar, Bell, ChevronRight, Menu, X
- Target, Eye, Heart, TrendingUp, Activity

## Next Steps
1. Connect dynamic content to backend API
2. Add real-time data fetching
3. Implement search functionality
4. Add user testimonials section
5. Create blog/news section
6. Add contact form
7. Integrate analytics

## Notes
- All sector links currently point to their respective dashboards
- Authentication is required to access dashboards
- Non-authenticated users can browse the landing page freely
- The page is fully functional and ready for production
