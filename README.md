# Records and Tracking

A comprehensive case and offender management system designed for judicial and administrative organizations.

## What This System Does

This is a digital case management system that helps law courts and administrative offices track cases, manage offenders, handle staff attendance, and organize files. Instead of relying on paper files and manual tracking, everything is organized digitally with proper security controls.

### Key Features

**Case Management**
- Track all types of cases (Civil, Criminal, Children, Succession)
- Assign cases to staff members with priority levels
- Monitor case status from opening to closure
- Schedule court hearings and manage the court diary

**Staff & Attendance**
- Manage staff profiles and roles
- Track daily attendance with reasons for absence
- Role-based access (Super Admin, Court Admin, Staff)
- Contact management and communication

**File & Document Management**
- Upload and organize case-related documents
- Version control for file updates
- Link documents to specific cases
- Advanced search and filtering

**Offender Tracking**
- Complete offender profiles with photo management
- Track case history and penalties per offender
- Support for various penalty types (fines, incarceration, community service, etc.)
- Export capabilities for reports

**Court Schedule Management**
- Interactive calendar for court hearings
- Professional Excel export of court schedules
- Print-ready court documents
- WhatsApp integration for reminders

**Security Features**
- Secure login with password protection
- Role-based permissions
- Audit logging of system changes
- Data validation and protection

### User Experience
- Modern, clean interface that works on mobile and desktop
- Light and dark mode support
- Real-time notifications
- Interactive charts and data visualization
- Advanced search capabilities

---

## Technical Information

### Architecture
- **Frontend**: React + TypeScript with Vite
- **Backend**: Rust with Tauri framework
- **Database**: SQLite with local storage
- **UI Framework**: HeroUI components with Tailwind CSS

### Database Schema
The system uses 10 main tables: users, staff, attendance, cases, files, notifications, contacts, reports_analytics, news, themes, and summaries.

### Development Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run Tauri development
npm run tauri dev

# Build Tauri application
npm run tauri build
```

### System Requirements
- Node.js 18+
- Rust toolchain
- SQLite
- Modern web browser

### Deployment
The application can be deployed as a desktop application using Tauri or as a web application. All data is stored locally with optional cloud sync capabilities.
