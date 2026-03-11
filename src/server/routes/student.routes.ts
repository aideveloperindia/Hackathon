import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticate, requireStudent } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(requireStudent);

// Get current student profile
router.get('/me', async (req: Request, res: Response) => {
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
  async (req: Request, res: Response) => {
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

// Helper: compute leaderboard stats for an event (used for active or last ended)
async function computeEventLeaderboard(event: any, studentId: string) {
  const participants = await prisma.eventParticipant.findMany({
    where: { eventId: event.id },
    include: {
      student: { include: { masterStudent: true } },
    },
  });

  const participantScores = await Promise.all(
    participants.map(async (participant) => {
      const submissions = await prisma.submission.findMany({
        where: {
          eventId: event.id,
          studentId: participant.studentId,
        },
      });

      const acceptedSubmissions = submissions.filter(s => s.verdict === 'ACCEPTED');
      const lockedSubmissions = acceptedSubmissions.filter((s: any) =>
        s.executionResult && (s.executionResult as any).matchesCorrectAnswer === true
      );

      const totalScore = acceptedSubmissions.reduce((sum, s) => sum + s.score, 0);
      const totalTimeTaken = acceptedSubmissions.reduce((sum, s) => sum + (s.timeTakenSeconds ?? 0), 0);
      const lockedAnswersCount = lockedSubmissions.length;
      const lockedTimeTaken = lockedSubmissions.reduce((sum: number, s: any) =>
        sum + (s.timeTakenSeconds ?? 0), 0
      );
      const questionsAttempted = new Set(submissions.map((s: any) => s.questionId)).size;
      const questionsSolved = new Set(acceptedSubmissions.map((s: any) => s.questionId)).size;

      return {
        studentId: participant.studentId,
        totalScore,
        timeTaken: totalTimeTaken,
        lockedAnswersCount,
        lockedTimeTaken,
        questionsAttempted,
        questionsSolved,
      };
    })
  );

  participantScores.sort((a, b) => {
    if (a.lockedAnswersCount > 0 && b.lockedAnswersCount > 0) {
      if (a.lockedAnswersCount === b.lockedAnswersCount) {
        return a.lockedTimeTaken - b.lockedTimeTaken;
      }
      return b.lockedAnswersCount - a.lockedAnswersCount;
    }
    if (a.lockedAnswersCount > 0) return -1;
    if (b.lockedAnswersCount > 0) return 1;
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.timeTaken - b.timeTaken;
  });

  const studentEntry = participantScores.find((p) => p.studentId === studentId);
  const position = participantScores.findIndex((p) => p.studentId === studentId);

  return {
    eventId: event.id,
    eventTitle: event.title,
    eventStatus: event.status,
    totalQuestions: await prisma.question.count({ where: { eventId: event.id } }),
    leaderboardPosition: position >= 0 ? position + 1 : null,
    totalScore: studentEntry?.totalScore ?? 0,
    totalTimeTaken: studentEntry?.timeTaken ?? 0,
    questionsAttempted: studentEntry?.questionsAttempted ?? 0,
    questionsSolved: studentEntry?.questionsSolved ?? 0,
  };
}

// Get student dashboard data
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { masterStudent: true },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const eventCount = await prisma.eventParticipant.count({
      where: { studentId },
    });

    const solvedQuestions = await prisma.submission.findMany({
      where: { studentId, verdict: 'ACCEPTED' },
      select: { questionId: true },
      distinct: ['questionId'],
    });
    const solvedCount = solvedQuestions.length;

    // Use ACTIVE event first (if student joined); else last event the student participated in
    const activeEvent = await prisma.event.findFirst({
      where: { status: 'ACTIVE' },
    });
    const hasJoinedActive = activeEvent
      ? await prisma.eventParticipant.findUnique({
          where: {
            eventId_studentId: { eventId: activeEvent.id, studentId },
          },
        })
      : null;

    let targetEvent: { id: string; title: string; status: string } | null = null;
    if (activeEvent && hasJoinedActive) {
      targetEvent = activeEvent;
    } else {
      const lastParticipated = await prisma.eventParticipant.findFirst({
        where: { studentId },
        include: { event: true },
        orderBy: { joinedAt: 'desc' },
      });
      if (lastParticipated?.event) {
        targetEvent = lastParticipated.event;
      }
    }

    let currentEventStats: {
      eventId: string;
      eventTitle: string;
      eventStatus: string;
      totalQuestions: number;
      leaderboardPosition: number | null;
      totalScore: number;
      totalTimeTaken: number;
      questionsAttempted: number;
      questionsSolved: number;
    } | null = null;

    if (targetEvent) {
      const stats = await computeEventLeaderboard(targetEvent, studentId);
      currentEventStats = {
        eventId: stats.eventId,
        eventTitle: stats.eventTitle,
        eventStatus: stats.eventStatus,
        totalQuestions: stats.totalQuestions,
        leaderboardPosition: stats.leaderboardPosition,
        totalScore: stats.totalScore,
        totalTimeTaken: stats.totalTimeTaken,
        questionsAttempted: stats.questionsAttempted,
        questionsSolved: stats.questionsSolved,
      };
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.json({
      student: {
        id: student.id,
        email: student.email,
        name: student.masterStudent.name,
        htNo: student.masterStudent.htNo,
        branch: student.masterStudent.branch,
        section: student.masterStudent.section,
        year: student.masterStudent.year,
        phoneNumber: student.masterStudent.phoneNumber,
      },
      stats: {
        eventsParticipated: eventCount,
        questionsSolved: solvedCount,
        leaderboardPosition: currentEventStats?.leaderboardPosition ?? null,
        totalScore: currentEventStats?.totalScore ?? 0,
        totalTimeTaken: currentEventStats?.totalTimeTaken ?? 0,
        questionsAttempted: currentEventStats?.questionsAttempted ?? 0,
        questionsSolvedInEvent: currentEventStats?.questionsSolved ?? 0,
        totalQuestionsInEvent: currentEventStats?.totalQuestions ?? 0,
        currentEventId: currentEventStats?.eventId ?? null,
        currentEventTitle: currentEventStats?.eventTitle ?? null,
        currentEventStatus: currentEventStats?.eventStatus ?? null,
      },
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;

