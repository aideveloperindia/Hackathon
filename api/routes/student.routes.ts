import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authenticate, requireStudent } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(requireStudent);

// Get current student profile
router.get('/me', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.user!.userId },
      include: {
        masterStudent: true,
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      id: student.id,
      email: student.email,
      htNo: student.masterStudent.htNo,
      name: student.masterStudent.name,
      branch: student.masterStudent.branch,
      section: student.masterStudent.section,
      year: student.masterStudent.year,
      selectedLanguage: student.selectedLanguage,
      isEmailVerified: student.isEmailVerified,
    });
  } catch (error: any) {
    console.error('Get student profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update language selection
router.post(
  '/select-language',
  [
    body('language').isIn(['C', 'Python', 'Java', 'Other']).withMessage('Invalid language selection'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { language } = req.body;

      await prisma.student.update({
        where: { id: req.user!.userId },
        data: { selectedLanguage: language },
      });

      res.json({ message: 'Language selected successfully', language });
    } catch (error: any) {
      console.error('Language selection error:', error);
      res.status(500).json({ error: 'Failed to save language selection' });
    }
  }
);

// Get student dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const studentId = req.user!.userId;

    // Get student info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { masterStudent: true },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get participation stats
    const eventCount = await prisma.eventParticipant.count({
      where: { studentId },
    });

    // Get accepted submissions count
    const solvedCount = await prisma.submission.count({
      where: {
        studentId,
        verdict: 'ACCEPTED',
      },
      distinct: ['questionId'],
    });

    // Get current/last event leaderboard position
    const activeEvent = await prisma.event.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        participants: {
          include: {
            student: {
              include: { masterStudent: true },
            },
          },
        },
      },
    });

    let leaderboardPosition = null;
    if (activeEvent) {
      // Calculate scores for all participants
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
          const timeTaken = firstSubmission
            ? Math.floor((firstSubmission.submittedAt.getTime() - activeEvent.startTime!.getTime()) / 1000)
            : 0;

          return {
            studentId: participant.studentId,
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

      const position = participantScores.findIndex((p) => p.studentId === studentId);
      if (position !== -1) {
        leaderboardPosition = position + 1;
      }
    }

    res.json({
      student: {
        name: student.masterStudent.name,
        htNo: student.masterStudent.htNo,
        branch: student.masterStudent.branch,
        section: student.masterStudent.section,
        year: student.masterStudent.year,
      },
      stats: {
        eventsParticipated: eventCount,
        questionsSolved: solvedCount,
        leaderboardPosition,
      },
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;

