import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticate, requireStudent } from '../middleware/auth.middleware';
import { executeCode } from '../utils/codeExecution';

const router = express.Router();

// All routes require student authentication
router.use(authenticate);
router.use(requireStudent);

// Submit code
router.post(
  '/events/:eventId/questions/:questionId',
  [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('language').isIn(['C', 'Python', 'Java', 'Other']).withMessage('Invalid language'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const eventId = req.params.eventId;
      const questionId = req.params.questionId;
      const studentId = req.user!.userId;
      const { code, language } = req.body;

      // Verify event is active and student has joined
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Event is not active' });
      }

      const participant = await prisma.eventParticipant.findUnique({
        where: {
          eventId_studentId: {
            eventId,
            studentId,
          },
        },
      });

      if (!participant) {
        return res.status(403).json({ error: 'You have not joined this event' });
      }

      // Check if time is up
      if (event.startTime) {
        const now = new Date();
        const endTime = event.endTime || new Date(event.startTime.getTime() + 2 * 60 * 60 * 1000);
        if (now > endTime) {
          return res.status(400).json({ error: 'Event time has ended' });
        }
      }

      // Get question with test cases
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      if (question.eventId !== eventId) {
        return res.status(400).json({ error: 'Question does not belong to this event' });
      }

      // Execute code
      const testCases = question.testCases as Array<{
        input: string;
        expectedOutput: string;
        score: number;
      }>;

      const executionResult = await executeCode(code, language, testCases);

      // Calculate time taken
      const timeTaken = event.startTime
        ? Math.floor((new Date().getTime() - event.startTime.getTime()) / 1000)
        : null;

      // Save submission
      const submission = await prisma.submission.create({
        data: {
          eventId,
          questionId,
          studentId,
          language,
          code,
          verdict: executionResult.verdict as any,
          score: executionResult.score,
          timeTakenSeconds: timeTaken,
          executionResult: executionResult as any,
        },
      });

      res.json({
        message: 'Submission received',
        submission: {
          id: submission.id,
          verdict: submission.verdict,
          score: submission.score,
          passedTests: executionResult.passedTests,
          totalTests: executionResult.totalTests,
          executionDetails: executionResult.executionDetails,
        },
      });
    } catch (error: any) {
      console.error('Submission error:', error);
      res.status(500).json({ error: 'Failed to process submission' });
    }
  }
);

// Get student's submissions for an event
router.get('/events/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const studentId = req.user!.userId;

    const submissions = await prisma.submission.findMany({
      where: {
        eventId,
        studentId,
      },
      include: {
        question: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    res.json({ submissions });
  } catch (error: any) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

export default router;

