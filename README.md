# JITS Coding Event Platform

A production-grade web application for conducting coding competitions with separate workflows for students and admins.

## 🚀 Features

### Student Features
- **Registration**: Register using Hall Ticket Number (HT No.) with email verification
- **Language Selection**: Choose preferred programming language (C, Python, Java, Other)
- **Event Participation**: Join active events (max 120 participants per event)
- **Coding Environment**: 
  - Monaco code editor with syntax highlighting
  - Real-time timer
  - Submit code and get instant feedback
- **Dashboard**: View participation stats, solved questions, and leaderboard position
- **Leaderboard**: View rankings for past and current events

### Admin Features
- **Event Management**: Create, start, and stop coding events
- **Question Management**: Add multiple questions per event with test cases
- **Participant Monitoring**: View real-time leaderboard and participant list
- **Event History**: Access past events and their results

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Monaco Editor** for code editing
- **React Router** for navigation
- **Vite** for build tooling

### Backend
- **Node.js** with TypeScript
- **Express.js** for REST API
- **Prisma** as ORM
- **MySQL** database
- **JWT** for authentication
- **Nodemailer** for email verification
- **Docker** for code execution

### Infrastructure
- **Docker & Docker Compose** for containerization
- **MongoDB Atlas** (cloud database)
- **MailHog** for email testing (development)

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- MongoDB Atlas account (credentials saved in `credentials.txt`)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd JITS
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database - MongoDB Atlas
DATABASE_URL=mongodb+srv://aideveloperindia_db_user:dTMeXZSFckyimshj@hackathon.chqxqsv.mongodb.net/jits_coding_platform?appName=Hackathon

# Backend
NODE_ENV=development
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# Email Configuration - Gmail (for real email verification)
# See GMAIL_SETUP.md for detailed setup instructions
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
SMTP_FROM=your-email@gmail.com

# Alternative: MailHog for development (comment out Gmail settings above)
# SMTP_HOST=mailhog
# SMTP_PORT=1025

# Frontend
FRONTEND_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:5001
```

### 3. Start with Docker Compose

```bash
docker-compose up -d
```

This will start:
- MailHog (email testing) on ports 1025 (SMTP) and 8025 (Web UI)
- Backend API on port 5001 (connected to MongoDB Atlas)
- Frontend on port 3001

### 4. Setup Database

```bash
# Enter backend container
docker exec -it jits-backend sh

# Generate Prisma Client (MongoDB doesn't use migrations)
npm run prisma:generate

# Seed database with sample data
npm run prisma:seed
```

**Note:** MongoDB doesn't use migrations like SQL databases. The schema is applied automatically when you first create documents. Just ensure Prisma Client is generated.

### 5. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001
- **MailHog UI**: http://localhost:8025 (for viewing emails)

## 📝 Default Credentials

After seeding, you can use:

**Admin Account:**
- Email: `admin@jits.ac.in`
- Password: `admin123`

**Sample Student Accounts:**
- HT No: `HT001` through `HT010`
- Use the registration form to create student accounts
- Check MailHog at http://localhost:8025 for verification emails

## 🏗️ Project Structure

```
JITS/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   ├── utils/           # Utilities (JWT, email, code execution)
│   │   └── index.ts         # Express server
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed script
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── context/         # Auth context
│   │   └── utils/           # API utilities
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔧 Development

### Running Locally (without Docker)

#### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database Management

```bash
# Access Prisma Studio
cd backend
npm run prisma:studio

# Regenerate Prisma Client after schema changes
npm run prisma:generate

# Note: MongoDB doesn't use migrations. Schema changes are applied automatically.
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/student/register` - Student registration
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/student/verify-email` - Email verification
- `POST /api/auth/admin/register` - Admin registration
- `POST /api/auth/admin/login` - Admin login

### Student Routes
- `GET /api/student/me` - Get student profile
- `POST /api/student/select-language` - Select language
- `GET /api/student/dashboard` - Get dashboard data

### Admin Routes
- `GET /api/admin/dashboard` - Get admin dashboard
- `GET /api/admin/students` - List all students
- `POST /api/admin/events` - Create event
- `GET /api/admin/events` - List all events
- `POST /api/admin/events/:id/start` - Start event
- `POST /api/admin/events/:id/stop` - Stop event
- `POST /api/admin/events/:id/questions` - Add question

### Event Routes
- `GET /api/events/active` - Get active event (student)
- `POST /api/events/:id/join` - Join event (student)
- `GET /api/events/:id` - Get event details
- `GET /api/events/:id/leaderboard` - Get leaderboard

### Submission Routes
- `POST /api/submissions/events/:eventId/questions/:questionId` - Submit code
- `GET /api/submissions/events/:eventId` - Get submissions

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Email verification required for student login
- Hall Ticket Number validation against master student list
- One account per HT No. and email
- Protected routes with role-based access control
- Server-side validation for all inputs

## 🧪 Code Execution

The platform supports code execution for:
- **C** (compiled with gcc)
- **Python** (Python 3)
- **Java** (compiled with javac)

Code is executed in isolated environments with:
- Time limit: 5 seconds per test case
- Memory limit: 256 MB
- Automatic test case validation

## 📊 Database Schema

### Key Collections (MongoDB)
- `master_students` - Pre-loaded official college student data
- `students` - Student app accounts
- `admins` - Admin accounts
- `events` - Coding events
- `questions` - Questions for events
- `event_participants` - Students who joined events
- `submissions` - Code submissions with results

**Note:** MongoDB uses collections instead of tables, and ObjectIds instead of auto-incrementing integers.

## 🐛 Troubleshooting

### Database Connection Issues
- Check DATABASE_URL in .env file matches MongoDB Atlas connection string
- Verify MongoDB credentials in `credentials.txt`
- Ensure MongoDB Atlas network access allows connections from anywhere (0.0.0.0/0)
- Check MongoDB Atlas cluster is running

### Email Not Sending
- Check MailHog is running: http://localhost:8025
- Verify SMTP settings in .env
- For production, configure real SMTP credentials

### Code Execution Fails
- Ensure Docker is running (required for code execution)
- Check backend logs: `docker logs jits-backend`
- Verify language compilers are available

## 🚢 Production Deployment

1. Update `.env` with production values:
   - Strong JWT_SECRET (min 32 characters)
   - Production SMTP credentials
   - Secure database passwords
   - Set `NODE_ENV=production`

2. Build and deploy:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. Generate Prisma Client:
   ```bash
   docker exec -it jits-backend npm run prisma:generate
   ```

## 📄 License

This project is proprietary software for JITS (Jawaharlal Institute of Technology and Science).

## 👥 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for JITS Coding Competitions**

