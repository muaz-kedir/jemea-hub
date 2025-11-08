# HUMSJ Academic Platform

<div align="center">
  <img src="public/favicon.svg" alt="HUMSJ Logo" width="120" height="120">
  
  <h3>Haramaya University Muslim Students Jema'a</h3>
  <p><em>Academic Excellence Through Faith and Knowledge</em></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-12.5-orange)](https://firebase.google.com/)
</div>

---

## 📖 About

The HUMSJ Academic Platform is a comprehensive web application designed to empower Muslim students at Haramaya University through integrated educational services. The platform combines library management, personalized tutoring, and professional training programs, all rooted in Islamic values.

### Key Features

- 📚 **Digital Library System** - Access thousands of books and academic resources
- 👨‍🏫 **Tutoring Platform** - Connect with expert tutors for personalized academic support
- 🎓 **Training Programs** - Skill development through professional training courses
- 👥 **User Management** - Role-based access control (Student, Tutor, Trainer, Librarian, Super Admin)
- 🌙 **Islamic Integration** - Daily Hadith/quotes and faith-based learning approach
- 📱 **Responsive Design** - Seamless experience across all devices

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Firebase Account** - [Get Started](https://firebase.google.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/muaz-kedir/jemea-hub.git
   cd jemea-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore Database
   - Update Firebase config in `src/lib/firebase.ts`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:8080`
   - The app will automatically reload on code changes

---

## 🏗️ Project Structure

```
jemea-hub/
├── public/                 # Static assets
│   ├── favicon.svg        # HUMSJ favicon
│   └── humsj-logo.svg     # Logo file
├── scripts/               # Utility scripts
│   ├── create-super-admin.js
│   └── assign-super-admin-role.js
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   ├── HumsjLogo.tsx
│   │   └── UserManagement.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/              # Utilities and configs
│   │   └── firebase.ts
│   ├── pages/            # Page components
│   │   ├── LandingPage.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── LibraryDashboard.tsx
│   │   ├── TutorDashboard.tsx
│   │   └── TrainerDashboard.tsx
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── firestore.rules       # Firestore security rules
├── package.json
└── README.md
```

---

## 🔐 User Roles & Permissions

The platform supports five distinct user roles:

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| **Student** | Basic | Access library, join tutorials, enroll in training |
| **Tutor** | Elevated | Manage tutorial sessions, view enrolled students |
| **Trainer** | Elevated | Create training programs, track participants |
| **Librarian** | Elevated | Manage library resources, upload books |
| **Super Admin** | Full | Complete system control, user management, all dashboards |

---

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.8** - Type-safe JavaScript
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **React Router 6.30** - Client-side routing
- **Lucide React** - Icon library

### Backend & Services
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase Analytics** - Usage analytics

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run build:dev        # Build in development mode
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Super Admin Setup
npm run create-super-admin        # Create super admin user
npm run assign-super-admin-role   # Assign super admin role
```

---

## 🔥 Firebase Setup

### 1. Firestore Security Rules

Deploy the security rules from `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

### 2. Create Super Admin

Follow the instructions in `SUPER_ADMIN_SETUP.md`:

1. Update Firestore rules to allow initial super admin creation
2. Run: `npm run create-super-admin`
3. Login with credentials:
   - Email: kedirmuaz955@gmail.com
   - Password: mk12@mk12

### 3. Database Collections

The app uses these Firestore collections:

- `users` - User profiles (without roles)
- `user_roles` - User role assignments (security-separated)
- `books` - Library resources
- `tutorials` - Tutorial sessions
- `trainings` - Training programs

---

## 🎨 Branding & Design

### Logo
The HUMSJ logo is implemented as an SVG component (`HumsjLogo.tsx`) featuring:
- Mosque minaret and dome
- Crescent moon and star (Islamic symbols)
- Organization name and acronym
- Teal color scheme (#1A9BA8)

### Color Palette
- **Primary**: Teal (#1A9BA8)
- **Library**: Blue (#3B82F6)
- **Tutoring**: Green (#10B981)
- **Training**: Purple (#8B5CF6)
- **Community**: Orange (#F97316)

---

## 📱 Features Overview

### Landing Page
- Hero section with organization mission
- Daily Hadith/Islamic quotes
- Upcoming trainings showcase
- Active tutorials display
- Latest library uploads
- Sector navigation cards
- About, Mission, Vision, Goals sections

### Dashboards

#### Student Dashboard
- Personal learning overview
- Enrolled courses and tutorials
- Library access
- Training programs

#### Tutor Dashboard
- Tutorial session management
- Student enrollment tracking
- Session scheduling

#### Trainer Dashboard
- Training program creation
- Participant management
- Progress tracking

#### Librarian Dashboard
- Book catalog management
- Resource uploads
- Borrowing system

#### Super Admin Dashboard
- Complete system overview
- User role management
- Statistics and analytics
- Access to all sector dashboards
- System health monitoring

---

## 🔒 Security

- **Role-based access control** via Firestore security rules
- **Secure authentication** with Firebase Auth
- **Data validation** on client and server
- **Protected routes** with authentication checks
- **Separated role storage** for enhanced security

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### Environment Variables

Create a `.env` file for environment-specific configs:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

---

## 📚 Documentation

- [Landing Page Info](LANDING_PAGE_INFO.md) - Landing page customization guide
- [Super Admin Setup](SUPER_ADMIN_SETUP.md) - Super admin creation instructions
- [Logo Setup](LOGO_SETUP.md) - Logo integration guide
- [Branding Update](BRANDING_UPDATE_COMPLETE.md) - Branding changes documentation

---

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Haramaya University Muslim Students Jema'a (HUMSJ)**

- **Developer**: Muaz Kedir
- **Organization**: Haramaya University Muslim Students Jema'a
- **Contact**: kedirmuaz955@gmail.com

---

## 🙏 Acknowledgments

- Haramaya University for supporting student initiatives
- The Muslim Students Jema'a community
- All contributors and testers
- Open source community for amazing tools

---

## 📞 Support

For support, email kedirmuaz955@gmail.com or open an issue in the GitHub repository.

---

<div align="center">
  <p>Made with ❤️ by HUMSJ</p>
  <p>© 2025 Haramaya University Muslim Students Jema'a. All rights reserved.</p>
</div>
