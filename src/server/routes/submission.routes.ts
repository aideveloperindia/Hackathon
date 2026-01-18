import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticate, requireStudent } from '../middleware/auth.middleware';
import { executeCodeWithJDoodle, normalizeOutput } from '../utils/jdoodle';

const router = express.Router();

// All routes require student authentication
router.use(authenticate);
router.use(requireStudent);

// Test/Run code (without submitting)
router.post(
  '/test',
  [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('language').notEmpty().withMessage('Language is required'),
    body('input').optional(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { code, language, input } = req.body;

      // Validate code is not empty after trimming
      const trimmedCode = (code || '').trim();
      if (!trimmedCode) {
        return res.status(400).json({ error: 'Code cannot be empty' });
      }

      // Log for debugging
      console.log('Test code request:', {
        codeLength: trimmedCode.length,
        codePreview: trimmedCode.substring(0, 100),
        language,
        hasInput: !!input,
      });

      // Execute code using JDoodle
      const result = await executeCodeWithJDoodle(trimmedCode, language, input || '');

      res.json({
        output: result.output,
        statusCode: result.statusCode,
        memory: result.memory,
        cpuTime: result.cpuTime,
        compilationStatus: result.compilationStatus,
      });
    } catch (error: any) {
      console.error('Test code error:', error);
      res.status(500).json({ 
        error: 'Failed to execute code',
        message: error.message 
      });
    }
  }
);

// Submit code
router.post(
  '/events/:eventId/questions/:questionId',
  [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('language').notEmpty().withMessage('Language is required'),
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

      // Get question with test cases and correct answer
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      if (question.eventId !== eventId) {
        return res.status(400).json({ error: 'Question does not belong to this event' });
      }

      // Get question start time from localStorage key (we'll pass it from frontend)
      const questionStartTime = req.body.questionStartTime 
        ? parseInt(req.body.questionStartTime) 
        : Date.now();

      // Execute code using JDoodle
      const testCases = (question.testCases as any) || [];
      const correctAnswer = (question as any).correctAnswer || '';

      let passedTests = 0;
      let totalScore = 0;
      const executionDetails: any[] = [];
      let verdict = 'WRONG_ANSWER';

      // Execute code with JDoodle for each test case
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        try {
          const jdoodleResult = await executeCodeWithJDoodle(
            code,
            language,
            testCase.input || ''
          );

          const studentOutput = normalizeOutput(jdoodleResult.output);
          const expectedOutput = normalizeOutput(testCase.expectedOutput || '');
          const passed = studentOutput === expectedOutput;

          if (passed) {
            passedTests++;
            totalScore += testCase.score || 0;
          }

          executionDetails.push({
            testCase: i + 1,
            passed,
            output: studentOutput,
            expectedOutput: expectedOutput,
            error: jdoodleResult.statusCode !== 200 ? 'Execution error' : undefined,
          });
        } catch (error: any) {
          executionDetails.push({
            testCase: i + 1,
            passed: false,
            error: error.message || 'Execution failed',
          });
        }
      }

      // Check against admin's correct answer if provided - this locks the answer
      let matchesCorrectAnswer = false;
      if (correctAnswer) {
        try {
          const jdoodleResult = await executeCodeWithJDoodle(code, language, '');
          const studentOutput = normalizeOutput(jdoodleResult.output);
          const adminAnswer = normalizeOutput(correctAnswer);
          
          if (studentOutput === adminAnswer) {
            matchesCorrectAnswer = true;
            verdict = 'ACCEPTED';
            passedTests = testCases.length;
            totalScore = testCases.reduce((sum: number, tc: any) => sum + (tc.score || 0), 0);
          }
        } catch (error) {
          // If JDoodle fails, rely on test cases
        }
      }

      // Determine verdict based on test cases
      if (verdict !== 'ACCEPTED') {
        if (passedTests === testCases.length) {
          verdict = 'ACCEPTED';
        } else if (passedTests > 0) {
          verdict = 'PARTIAL';
        } else {
          verdict = 'WRONG_ANSWER';
        }
      }

      // Calculate time taken (from question start to now)
      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

      // Save submission with flag indicating if it matches admin's correct answer
      const submission = await prisma.submission.create({
        data: {
          eventId,
          questionId,
          studentId,
          language,
          code,
          verdict: verdict as any,
          score: totalScore,
          timeTakenSeconds: timeTaken,
          executionResult: {
            passedTests,
            totalTests: testCases.length,
            executionDetails,
            matchesCorrectAnswer, // Flag to indicate answer is locked
          } as any,
        },
      });

      res.json({
        message: matchesCorrectAnswer ? 'Answer locked! Matches correct solution.' : 'Submission received',
        submission: {
          id: submission.id,
          verdict: submission.verdict,
          score: submission.score,
          timeTakenSeconds: timeTaken,
          passedTests,
          totalTests: testCases.length,
          executionDetails,
          matchesCorrectAnswer, // Flag to indicate answer is locked
        },
      });
    } catch (error: any) {
      console.error('Submission error:', error);
      res.status(500).json({ error: 'Failed to process submission', message: error.message });
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
