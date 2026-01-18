# JITS Coding Event Platform - Implementation Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Design](#4-database-design)
5. [API Documentation](#5-api-documentation)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Frontend Implementation](#7-frontend-implementation)
8. [Backend Implementation](#8-backend-implementation)
9. [Code Execution System](#9-code-execution-system)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Security Features](#11-security-features)
12. [Testing Strategy](#12-testing-strategy)
13. [Future Enhancements](#13-future-enhancements)

---

## 1. Project Overview

### 1.1 Purpose
The JITS Coding Event Platform is a web-based application designed to conduct coding competitions for students. It provides separate interfaces for students and administrators, enabling seamless event management, real-time code submission, and automated evaluation.

### 1.2 Objectives
- Provide a secure platform for conducting coding competitions
- Enable real-time code submission and evaluation
- Support multiple programming languages (C, Python, Java)
- Implement fair competition through question shuffling
- Provide real-time leaderboard and analytics
- Ensure scalability for up to 120 participants per event

### 1.3 Key Features

#### Student Features
- **Registration & Authentication**: Hall Ticket Number (HT No.) based registration with email verification
- **Language Selection**: Choose preferred programming language
- **Event Participation**: Join active events with participant limit enforcement
- **Coding Environment**: 
  - Monaco Editor with syntax highlighting
  - Real-time timer for each question
  - Auto-save functionality
  - Code submission with instant feedback
- **Dashboard**: View participation history, scores, and statistics
- **Leaderboard**: Real-time rankings for events

#### Admin Features
- **Event Management**: Create, start, and stop coding events
- **Question Management**: Add multiple questions with test cases
- **Participant Monitoring**: View real-time participant list and leaderboard
- **Analytics**: Track event performance and student participation

---

## 2. System Architecture

### 2.1 Architecture Overview
The system follows a **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (React Frontend - Port 5001)                │
│  - Student Interface  -  Admin Interface                │
│  - Monaco Editor      -  Dashboard                      │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                      │
│            (Express.js Backend - Port 5001)               │
│  - Authentication    -  Event Management                 │
│  - Code Execution    -  Submission Processing            │
└─────────────────────────────────────────────────────────┘
                          ↕ Prisma ORM
┌─────────────────────────────────────────────────────────┐
│                      Data Layer                           │
│              (MongoDB Atlas - Cloud)                     │
│  - Master Students   -  Events                           │
│  - Submissions       -  Questions                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Unified Development Server
The system uses a **unified development server** approach:
- Single Express server running on port 5001
- Vite middleware integrated for frontend development
- API routes handled by Express before Vite middleware
- Production build serves static files from Express

### 2.3 Request Flow

```
User Request → Express Server (Port 5001)
                    ↓
            Check if /api route
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
    API Route              Vite Middleware
    (Express)              (Frontend)
        ↓                       ↓
    Process Request        Serve React App
        ↓                       ↓
    Return JSON            Return HTML/JS
```

---

## 3. Technology Stack

### 3.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| TypeScript | 5.3.3 | Type Safety |
| Vite | 5.0.8 | Build Tool & Dev Server |
| React Router | 6.20.1 | Client-side Routing |
| Monaco Editor | 4.6.0 | Code Editor Component |
| Tailwind CSS | 3.3.6 | Utility-first CSS Framework |
| Axios | 1.6.2 | HTTP Client |

### 3.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime Environment |
| Express.js | 4.18.2 | Web Framework |
| TypeScript | 5.3.3 | Type Safety |
| Prisma | 5.7.1 | ORM for Database |
| MongoDB | Cloud | NoSQL Database |
| JWT | 9.0.2 | Authentication Tokens |
| bcryptjs | 2.4.3 | Password Hashing |
| Nodemailer | 6.9.7 | Email Service |
| Express Validator | 7.0.1 | Input Validation |

### 3.3 Development Tools

| Tool | Purpose |
|------|---------|
| tsx | TypeScript Execution |
| ESLint | Code Linting |
| Docker | Containerization |
| Vercel | Production Deployment |

---

## 4. Database Design

### 4.1 Database Schema (MongoDB)

The system uses MongoDB with the following collections:

#### 4.1.1 MasterStudent Collection
**Purpose**: Pre-loaded official college student data

```typescript
{
  _id: ObjectId,
  ht_no: String (unique),
  name: String,
  branch: String,
  section: String,
  year: Int,
  phone_number: String?,
  created_at: DateTime,
  updated_at: DateTime
}
```

**Relationships**: One-to-one with Student

#### 4.1.2 Student Collection
**Purpose**: Student application accounts

```typescript
{
  _id: ObjectId,
  master_student_id: ObjectId (unique, references MasterStudent),
  email: String (unique),
  password_hash: String,
  is_email_verified: Boolean,
  email_verify_token: String?,
  email_verify_expiry: DateTime?,
  selected_language: String?,
  created_at: DateTime,
  updated_at: DateTime
}
```

**Relationships**: 
- Belongs to MasterStudent
- Has many EventParticipant
- Has many Submission

#### 4.1.3 Admin Collection
**Purpose**: Administrator accounts

```typescript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password_hash: String,
  created_at: DateTime,
  updated_at: DateTime
}
```

**Relationships**: Has many Event

#### 4.1.4 Event Collection
**Purpose**: Coding competition events

```typescript
{
  _id: ObjectId,
  title: String,
  language: String,
  description: String?,
  status: Enum (DRAFT, ACTIVE, ENDED),
  max_participants: Int (default: 120),
  start_time: DateTime?,
  end_time: DateTime?,
  created_by_admin_id: ObjectId (references Admin),
  created_at: DateTime,
  updated_at: DateTime
}
```

**Relationships**:
- Belongs to Admin
- Has many Question
- Has many EventParticipant
- Has many Submission

#### 4.1.5 Question Collection
**Purpose**: Questions for events

```typescript
{
  _id: ObjectId,
  event_id: ObjectId (references Event),
  title: String,
  description: String,
  sample_input: String?,
  sample_output: String?,
  test_cases: JSON (Array of {input, expectedOutput, score}),
  time_limit_minutes: Int?,
  created_at: DateTime,
  updated_at: DateTime
}
```

**Relationships**:
- Belongs to Event
- Has many Submission

#### 4.1.6 EventParticipant Collection
**Purpose**: Students who joined events

```typescript
{
  _id: ObjectId,
  event_id: ObjectId (references Event),
  student_id: ObjectId (references Student),
  joined_at: DateTime,
  selected_language: String?,
  shuffled_question_order: JSON? (Array of question IDs)
}
```

**Unique Constraint**: (event_id, student_id)

#### 4.1.7 Submission Collection
**Purpose**: Code submissions with results

```typescript
{
  _id: ObjectId,
  event_id: ObjectId (references Event),
  question_id: ObjectId (references Question),
  student_id: ObjectId (references Student),
  language: String,
  code: String,
  verdict: Enum (PENDING, ACCEPTED, PARTIAL, WRONG_ANSWER, etc.),
  score: Int,
  time_taken_seconds: Int?,
  execution_result: JSON?,
  submitted_at: DateTime
}
```

### 4.2 Entity Relationship Diagram

```
MasterStudent (1) ──── (1) Student
                              │
                              ├─── (many) EventParticipant
                              │
                              └─── (many) Submission

Admin (1) ──── (many) Event
                          │
                          ├─── (many) Question
                          │
                          ├─── (many) EventParticipant
                          │
                          └─── (many) Submission
```

---

## 5. API Documentation

### 5.1 Base URL
- **Development**: `http://localhost:5001/api`
- **Production**: `https://jits-coding-platform-new.vercel.app/api`

### 5.2 Authentication Endpoints

#### 5.2.1 Student Registration
```http
POST /api/auth/student/register
Content-Type: application/json

{
  "htNo": "22271A6651",
  "email": "student@example.com",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "message": "Registration successful. Please verify your email.",
  "studentId": "507f1f77bcf86cd799439011"
}
```

#### 5.2.2 Student Login (HT No + Phone)
```http
POST /api/auth/student/login-ht
Content-Type: application/json

{
  "htNo": "22271A6651",
  "phoneNumber": "7842413888"
}
```

**Response** (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "22271a6651@jits.local",
    "htNo": "22271A6651",
    "name": "M.SURAJ",
    "branch": "CSM",
    "section": "A",
    "year": 4,
    "phoneNumber": "7842413888",
    "role": "student"
  }
}
```

#### 5.2.3 Email Verification
```http
POST /api/auth/student/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

#### 5.2.4 Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@jits.ac.in",
  "password": "admin123"
}
```

### 5.3 Student Endpoints

#### 5.3.1 Get Student Profile
```http
GET /api/student/me
Authorization: Bearer <token>
```

#### 5.3.2 Select Language
```http
POST /api/student/select-language
Authorization: Bearer <token>
Content-Type: application/json

{
  "language": "Python"
}
```

#### 5.3.3 Get Dashboard Data
```http
GET /api/student/dashboard
Authorization: Bearer <token>
```

**Response**:
```json
{
  "student": {
    "id": "...",
    "name": "M.SURAJ",
    "htNo": "22271A6651",
    "selectedLanguage": "Python"
  },
  "stats": {
    "totalEvents": 5,
    "completedEvents": 3,
    "totalScore": 450,
    "averageScore": 150
  },
  "recentSubmissions": [...]
}
```

### 5.4 Event Endpoints

#### 5.4.1 Get Active Event
```http
GET /api/events/active
Authorization: Bearer <token>
```

#### 5.4.2 Join Event
```http
POST /api/events/:eventId/join
Authorization: Bearer <token>
```

#### 5.4.3 Get Event Details
```http
GET /api/events/:eventId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "event": {
    "id": "...",
    "title": "Coding Competition 2024",
    "language": "Python",
    "status": "ACTIVE",
    "questions": [
      {
        "id": "...",
        "title": "Question 1",
        "description": "...",
        "sampleInput": "...",
        "sampleOutput": "...",
        "timeLimitMinutes": 30
      }
    ]
  }
}
```

#### 5.4.4 Get Leaderboard
```http
GET /api/events/:eventId/leaderboard
```

### 5.5 Submission Endpoints

#### 5.5.1 Submit Code
```http
POST /api/submissions/events/:eventId/questions/:questionId
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "def solve():\n    return 42",
  "language": "python"
}
```

**Response**:
```json
{
  "submission": {
    "id": "...",
    "verdict": "ACCEPTED",
    "score": 100,
    "passedTests": 5,
    "totalTests": 5,
    "executionDetails": [
      {
        "testCase": 1,
        "passed": true
      }
    ]
  }
}
```

### 5.6 Admin Endpoints

#### 5.6.1 Create Event
```http
POST /api/events/admin
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Coding Competition 2024",
  "language": "Python",
  "description": "Annual coding competition",
  "maxParticipants": 120
}
```

#### 5.6.2 Start Event
```http
POST /api/events/admin/:eventId/start
Authorization: Bearer <admin-token>
```

#### 5.6.3 Add Question
```http
POST /api/events/admin/:eventId/questions
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Question 1",
  "description": "Solve this problem...",
  "sampleInput": "5",
  "sampleOutput": "25",
  "testCases": [
    {
      "input": "5",
      "expectedOutput": "25",
      "score": 20
    }
  ],
  "timeLimitMinutes": 30
}
```

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow

#### 6.1.1 Student Authentication
1. Student registers with HT No, email, and password
2. System validates HT No against MasterStudent collection
3. Email verification token sent
4. Student verifies email
5. Student can login with HT No + Phone Number

#### 6.1.2 JWT Token Structure
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "student@example.com",
  "role": "student",
  "htNo": "22271A6651",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### 6.2 Authorization Middleware

#### 6.2.1 Authentication Middleware
```typescript
// src/server/middleware/auth.middleware.ts
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### 6.2.2 Role-Based Access Control
```typescript
export const requireStudent = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
```

### 6.3 Password Security
- Passwords hashed using bcryptjs with salt rounds: 10
- Never stored in plain text
- Phone numbers used as passwords for HT No login

---

## 7. Frontend Implementation

### 7.1 Project Structure

```
src/client/
├── App.tsx                 # Main app component with routing
├── main.tsx               # React entry point
├── index.css              # Global styles
├── pages/                 # Page components
│   ├── Home.tsx
│   ├── StudentLogin.tsx
│   ├── StudentRegister.tsx
│   ├── StudentDashboard.tsx
│   ├── CodingEnvironment.tsx
│   ├── AdminDashboard.tsx
│   └── ...
├── context/
│   └── AuthContext.tsx    # Authentication context
├── components/
│   └── Footer.tsx         # Footer component
└── utils/
    └── api.ts             # API client configuration
```

### 7.2 Key Components

#### 7.2.1 Authentication Context
```typescript
// src/client/context/AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 7.2.2 Coding Environment
- **Monaco Editor**: Integrated for code editing
- **Real-time Timer**: Countdown for each question
- **Auto-save**: Saves code every 30 seconds
- **Question Navigation**: Switch between questions
- **Submission**: Submit code and view results

#### 7.2.3 Routing
```typescript
// Protected routes with role-based access
<Route
  path="/student/dashboard"
  element={
    <PrivateRoute requireRole="student">
      <StudentDashboard />
    </PrivateRoute>
  }
/>
```

### 7.3 State Management
- **React Context**: For authentication state
- **Local Storage**: For token persistence
- **React State**: For component-level state

---

## 8. Backend Implementation

### 8.1 Project Structure

```
src/server/
├── index.ts               # Production server
├── dev.ts                 # Unified development server
├── routes/                # API route handlers
│   ├── auth.routes.ts
│   ├── student.routes.ts
│   ├── admin.routes.ts
│   ├── event.routes.ts
│   └── submission.routes.ts
├── middleware/
│   └── auth.middleware.ts  # Authentication middleware
├── utils/
│   ├── prisma.ts          # Prisma client singleton
│   ├── jwt.ts             # JWT utilities
│   ├── password.ts        # Password hashing
│   ├── email.ts           # Email service
│   └── codeExecution.ts   # Code execution engine
└── prisma/
    ├── schema.prisma      # Database schema
    └── seed.ts            # Database seeding
```

### 8.2 Unified Development Server

```typescript
// src/server/dev.ts
import { createServer as createViteServer } from 'vite';
import express from 'express';

const app = express();
const PORT = 5001;

// API Routes - MUST be before Vite middleware
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
// ... other routes

// Vite middleware for frontend
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

app.use(vite.middlewares);

app.listen(PORT, () => {
  console.log(`🚀 Unified server running on port ${PORT}`);
});
```

### 8.3 Code Execution System

#### 8.3.1 Execution Flow
1. Receive code submission
2. Validate code syntax
3. Create temporary file
4. Compile (if needed) or execute
5. Run against test cases
6. Compare outputs
7. Calculate score
8. Return results

#### 8.3.2 Supported Languages

**Python**:
```typescript
// Execute Python code
const result = await executePython(code, input);
```

**C**:
```typescript
// Compile and execute C code
const result = await executeC(code, input);
```

**Java**:
```typescript
// Compile and execute Java code
const result = await executeJava(code, input);
```

### 8.4 Error Handling
- Centralized error middleware
- Detailed error logging
- User-friendly error messages
- Development vs production error responses

---

## 9. Code Execution System

### 9.1 Execution Architecture

```
Code Submission
      ↓
Validate Language
      ↓
Create Temp File
      ↓
Compile (if needed)
      ↓
Execute with Test Cases
      ↓
Compare Outputs
      ↓
Calculate Score
      ↓
Return Results
```

### 9.2 Security Measures
- **Time Limit**: 5 seconds per test case
- **Memory Limit**: 256 MB
- **Isolated Execution**: Each test case runs separately
- **Input Validation**: Sanitize user input
- **Resource Limits**: Prevent infinite loops

### 9.3 Test Case Evaluation
```typescript
interface TestCase {
  input: string;
  expectedOutput: string;
  score: number;
}

interface ExecutionResult {
  passed: boolean;
  actualOutput: string;
  error?: string;
  timeTaken: number;
}
```

---

## 10. Deployment Architecture

### 10.1 Production Deployment (Vercel)

#### 10.1.1 Project Structure
- **Frontend**: Deployed as static site
- **Backend**: Deployed as serverless functions
- **Database**: MongoDB Atlas (cloud)

#### 10.1.2 Environment Variables
```
DATABASE_URL=mongodb+srv://...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GMAIL_USER=...
GMAIL_APP_PASSWORD=...
```

#### 10.1.3 Build Process
```json
{
  "vercel-build": "npm install --include=dev && prisma generate && npm run build"
}
```

### 10.2 Local Development

#### 10.2.1 Setup
```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Seed database
npm run prisma:seed

# Start development server
npm run dev
```

#### 10.2.2 Development Server
- Single unified server on port 5001
- Hot module replacement (HMR)
- API proxy for frontend

---

## 11. Security Features

### 11.1 Authentication Security
- JWT tokens with expiration
- Password hashing (bcrypt)
- Email verification required
- Role-based access control

### 11.2 Input Validation
- Server-side validation for all inputs
- Express Validator middleware
- SQL injection prevention (Prisma)
- XSS protection

### 11.3 API Security
- CORS configuration
- Rate limiting (future enhancement)
- Request size limits
- Error message sanitization

### 11.4 Code Execution Security
- Time limits per execution
- Memory limits
- Isolated execution environment
- Resource cleanup

---

## 12. Testing Strategy

### 12.1 Manual Testing
- **Unit Testing**: Individual functions
- **Integration Testing**: API endpoints
- **E2E Testing**: Complete user flows

### 12.2 Test Cases

#### 12.2.1 Authentication
- ✅ Student registration with valid HT No
- ✅ Student registration with invalid HT No
- ✅ Email verification flow
- ✅ Login with correct credentials
- ✅ Login with incorrect credentials

#### 12.2.2 Event Management
- ✅ Create event (admin)
- ✅ Start event
- ✅ Join event (student)
- ✅ Submit code
- ✅ View leaderboard

### 12.3 Future Testing Enhancements
- Automated unit tests (Jest)
- Integration tests (Supertest)
- E2E tests (Playwright)

---

## 13. Future Enhancements

### 13.1 Planned Features
1. **Real-time Collaboration**: Live coding sessions
2. **Code Review**: Peer review system
3. **Advanced Analytics**: Detailed performance metrics
4. **Mobile App**: React Native application
5. **AI Assistance**: Code suggestions and hints

### 13.2 Technical Improvements
1. **Caching**: Redis for performance
2. **Load Balancing**: Multiple server instances
3. **CDN**: Static asset delivery
4. **Monitoring**: Application performance monitoring
5. **Logging**: Centralized logging system

### 13.3 Scalability
- Horizontal scaling support
- Database sharding
- Microservices architecture
- Container orchestration (Kubernetes)

---

## 14. Conclusion

The JITS Coding Event Platform is a comprehensive solution for conducting coding competitions. It provides:

- **Secure Authentication**: HT No-based registration with email verification
- **Real-time Code Execution**: Support for multiple programming languages
- **Fair Competition**: Question shuffling and participant limits
- **Scalable Architecture**: Unified server with MongoDB cloud database
- **User-friendly Interface**: Modern React frontend with Monaco Editor

The platform is production-ready and deployed on Vercel, serving students and administrators at JITS.

---

## 15. References

### 15.1 Technologies Used
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

### 15.2 Project Files
- `package.json`: Dependencies and scripts
- `prisma/schema.prisma`: Database schema
- `vercel.json`: Deployment configuration
- `.env`: Environment variables (not in repository)

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: JITS Development Team
