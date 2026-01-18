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

    // Get all draft events
    const draftEvents = await prisma.event.findMany({
      where: {
        status: 'DRAFT',
      },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
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

          // Only count ACCEPTED submissions for scoring
          const acceptedSubmissions = submissions.filter(s => s.verdict === 'ACCEPTED');
          
          // Check for locked answers (matching admin's correct answer)
          const lockedSubmissions = acceptedSubmissions.filter((s: any) => 
            s.executionResult && (s.executionResult as any).matchesCorrectAnswer === true
          );
          
          const totalScore = acceptedSubmissions.reduce((sum, s) => sum + s.score, 0);
          const totalTimeTaken = acceptedSubmissions.reduce((sum, s) => sum + (s.timeTakenSeconds || 0), 0);
          const lockedAnswersCount = lockedSubmissions.length;
          const lockedTimeTaken = lockedSubmissions.reduce((sum: number, s: any) => 
            sum + (s.timeTakenSeconds || 0), 0
          );

          return {
            studentId: participant.studentId,
            studentName: participant.student.masterStudent.name,
            htNo: participant.student.masterStudent.htNo,
            branch: participant.student.masterStudent.branch,
            section: participant.student.masterStudent.section,
            year: participant.student.masterStudent.year,
            totalScore,
            timeTaken: totalTimeTaken,
            lockedAnswersCount,
            lockedTimeTaken,
          };
        })
      );

      // Same ranking logic as event leaderboard
      participantScores.sort((a, b) => {
        if (a.lockedAnswersCount > 0 && b.lockedAnswersCount > 0) {
          if (a.lockedAnswersCount === b.lockedAnswersCount) {
            return a.lockedTimeTaken - b.lockedTimeTaken;
          }
          return b.lockedAnswersCount - a.lockedAnswersCount;
        }
        if (a.lockedAnswersCount > 0) return -1;
        if (b.lockedAnswersCount > 0) return 1;
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

    const responseData = {
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
      draftEvents: draftEvents.map((e) => ({
        id: e.id,
        title: e.title,
        language: e.language,
        description: e.description,
        questionsCount: e._count.questions,
        maxParticipants: e.maxParticipants,
        createdAt: e.createdAt,
      })),
      pastEvents: pastEvents.map((e) => ({
        id: e.id,
        title: e.title,
        language: e.language,
        startTime: e.startTime,
        endTime: e.endTime,
        createdAt: e.createdAt,
      })),
    };

    console.log('Admin dashboard response:', {
      activeEvent: responseData.activeEvent ? 'Yes' : 'No',
      draftEventsCount: responseData.draftEvents.length,
      pastEventsCount: responseData.pastEvents.length,
    });

    res.json(responseData);
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

