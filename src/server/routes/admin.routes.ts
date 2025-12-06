import express, { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Get current admin profile
router.get('/me', async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.user!.userId },
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });
  } catch (error: any) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get admin dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    // Get active event
    const activeEvent = await prisma.event.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        questions: true,
        participants: {
          include: {
            student: {
              include: { masterStudent: true },
            },
          },
        },
      },
    });

    // Get all past events
    const pastEvents = await prisma.event.findMany({
      where: {
        status: 'ENDED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // If active event exists, calculate leaderboard
    let leaderboard = null;
    if (activeEvent) {
      const participantScores = await Promise.all(
        activeEvent.participants.map(async (participant) => {
          const submissions = await prisma.submission.findMany({
            where: {
              eventId: activeEvent.id,
              studentId: participant.studentId,
            },
          });

          const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
          const firstSubmission = submissions[0];
          const timeTaken = firstSubmission && activeEvent.startTime
            ? Math.floor((firstSubmission.submittedAt.getTime() - activeEvent.startTime.getTime()) / 1000)
            : 0;

          return {
            studentId: participant.studentId,
            studentName: participant.student.masterStudent.name,
            htNo: participant.student.masterStudent.htNo,
            branch: participant.student.masterStudent.branch,
            section: participant.student.masterStudent.section,
            year: participant.student.masterStudent.year,
            totalScore,
            timeTaken,
          };
        })
      );

      participantScores.sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return a.timeTaken - b.timeTaken;
      });

      leaderboard = participantScores.map((p, index) => ({
        rank: index + 1,
        ...p,
      }));
    }

    res.json({
      activeEvent: activeEvent
        ? {
            id: activeEvent.id,
            title: activeEvent.title,
            language: activeEvent.language,
            status: activeEvent.status,
            startTime: activeEvent.startTime,
            participantCount: activeEvent.participants.length,
            maxParticipants: activeEvent.maxParticipants,
            questionsCount: activeEvent.questions.length,
          }
        : null,
      leaderboard,
      pastEvents: pastEvents.map((e) => ({
        id: e.id,
        title: e.title,
        language: e.language,
        startTime: e.startTime,
        endTime: e.endTime,
        createdAt: e.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all student accounts (for admin management)
router.get('/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        masterStudent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(
      students.map((s) => ({
        id: s.id,
        htNo: s.masterStudent.htNo,
        name: s.masterStudent.name,
        branch: s.masterStudent.branch,
        section: s.masterStudent.section,
        year: s.masterStudent.year,
        email: s.email,
        isEmailVerified: s.isEmailVerified,
        createdAt: s.createdAt,
      }))
    );
  } catch (error: any) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

export default router;

