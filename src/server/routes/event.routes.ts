import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticate, requireStudent, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Get active event (public, but authenticated for students)
router.get('/active', authenticate, requireStudent, async (req: Request, res: Response) => {
  try {
    const activeEvent = await prisma.event.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        questions: {
          select: {
            id: true,
            title: true,
            description: true,
            sampleInput: true,
            sampleOutput: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!activeEvent) {
      return res.json({ event: null, message: 'No active event' });
    }

    // Check if student has joined
    const hasJoined = await prisma.eventParticipant.findUnique({
      where: {
        eventId_studentId: {
          eventId: activeEvent.id,
          studentId: req.user!.userId,
        },
      },
    });

    res.json({
      event: {
        id: activeEvent.id,
        title: activeEvent.title,
        language: activeEvent.language,
        description: activeEvent.description,
        startTime: activeEvent.startTime,
        questions: activeEvent.questions,
        participantCount: activeEvent._count.participants,
        maxParticipants: activeEvent.maxParticipants,
        hasJoined: !!hasJoined,
      },
    });
  } catch (error: any) {
    console.error('Get active event error:', error);
    res.status(500).json({ error: 'Failed to fetch active event' });
  }
});

// Join event (student only)
router.post('/:eventId/join', authenticate, requireStudent, async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const studentId = req.user!.userId;

    // Check if event is active
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Event is not active' });
    }

    // Check participant count
    if (event._count.participants >= event.maxParticipants) {
      return res.status(400).json({ error: 'This event is full. Please wait for the next batch.' });
    }

    // Check if already joined - allow rejoining if event is still active
    const existing = await prisma.eventParticipant.findUnique({
      where: {
        eventId_studentId: {
          eventId,
          studentId,
        },
      },
    });

    if (existing) {
      // Allow rejoining active events - just return success
      return res.json({ message: 'You are already in this event. Redirecting to coding environment...' });
    }

    // Get student's selected language
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    // Get all questions for this event
    const questions = await prisma.question.findMany({
      where: { eventId },
      select: { id: true },
    });

    // Shuffle question order for this student (to prevent copying)
    const questionIds = questions.map(q => q.id);
    const shuffledOrder = [...questionIds].sort(() => Math.random() - 0.5);

    // Join event with shuffled question order
    await prisma.eventParticipant.create({
      data: {
        eventId,
        studentId,
        selectedLanguage: student?.selectedLanguage || null,
        shuffledQuestionOrder: shuffledOrder,
      },
    });

    res.json({ message: 'Successfully joined the event' });
  } catch (error: any) {
    console.error('Join event error:', error);
    res.status(500).json({ error: 'Failed to join event' });
  }
});

// Get event details with questions (for coding environment)
router.get('/:eventId', authenticate, requireStudent, async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const studentId = req.user!.userId;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if student has joined
    let participant = await prisma.eventParticipant.findUnique({
      where: {
        eventId_studentId: {
          eventId,
          studentId,
        },
      },
    });

    // Auto-join if event is active and student hasn't joined
    if (!participant && event.status === 'ACTIVE') {
      // Check participant count
      const participantCount = await prisma.eventParticipant.count({
        where: { eventId },
      });

      if (participantCount < event.maxParticipants) {
        // Get student's selected language
        const student = await prisma.student.findUnique({
          where: { id: studentId },
        });

        // Get all questions for this event
        const questions = await prisma.question.findMany({
          where: { eventId },
          select: { id: true },
        });

        // Shuffle question order for this student
        const questionIds = questions.map(q => q.id);
        const shuffledOrder = [...questionIds].sort(() => Math.random() - 0.5);

        // Auto-join event
        participant = await prisma.eventParticipant.create({
          data: {
            eventId,
            studentId,
            selectedLanguage: student?.selectedLanguage || null,
            shuffledQuestionOrder: shuffledOrder,
          },
        });
      } else {
        return res.status(400).json({ error: 'This event is full. Please wait for the next batch.' });
      }
    }

    if (!participant) {
      return res.status(403).json({ error: 'You have not joined this event and it is not active' });
    }

    // Get participant with shuffled question order
    const participantWithOrder = await prisma.eventParticipant.findUnique({
      where: {
        eventId_studentId: {
          eventId,
          studentId,
        },
      },
    });

    if (!participantWithOrder) {
      return res.status(403).json({ error: 'You have not joined this event' });
    }

    // Get shuffled question order (or create one if missing for backward compatibility)
    let shuffledOrder = participantWithOrder.shuffledQuestionOrder as string[] | null;
    
    if (!shuffledOrder) {
      // Backward compatibility: create shuffled order if missing
      const allQuestions = await prisma.question.findMany({
        where: { eventId },
        select: { id: true },
      });
      shuffledOrder = allQuestions.map(q => q.id).sort(() => Math.random() - 0.5);
      
      // Save the shuffled order
      await prisma.eventParticipant.update({
        where: { id: participantWithOrder.id },
        data: { shuffledQuestionOrder: shuffledOrder },
      });
    }

    // Fetch questions in shuffled order
    const questions = await prisma.question.findMany({
      where: {
        id: { in: shuffledOrder },
      },
      select: {
        id: true,
        title: true,
        description: true,
        sampleInput: true,
        sampleOutput: true,
      },
    });

    // Sort questions according to shuffled order
    const questionMap = new Map(questions.map(q => [q.id, q]));
    const orderedQuestions = shuffledOrder.map(id => questionMap.get(id)).filter(Boolean);

    // Calculate remaining time
    let remainingTime = null;
    if (event.startTime && event.status === 'ACTIVE') {
      const now = new Date();
      const endTime = event.endTime || new Date(event.startTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
      remainingTime = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
    }

    res.json({
      event: {
        id: event.id,
        title: event.title,
        language: event.language,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        status: event.status,
        remainingTime,
        questions: orderedQuestions,
      },
    });
  } catch (error: any) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Get leaderboard for an event
router.get('/:eventId/leaderboard', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
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

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Calculate scores for all participants
    const participantScores = await Promise.all(
      event.participants.map(async (participant) => {
        const submissions = await prisma.submission.findMany({
          where: {
            eventId: event.id,
            studentId: participant.studentId,
          },
        });

        const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
        const firstSubmission = submissions[0];
        const timeTaken = firstSubmission && event.startTime
          ? Math.floor((firstSubmission.submittedAt.getTime() - event.startTime.getTime()) / 1000)
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

    const leaderboard = participantScores.map((p, index) => ({
      rank: index + 1,
      ...p,
    }));

    res.json({
      event: {
        id: event.id,
        title: event.title,
        language: event.language,
        status: event.status,
      },
      leaderboard,
    });
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get all events (public view)
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: 'ENDED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        language: true,
        startTime: true,
        endTime: true,
        createdAt: true,
      },
    });

    res.json({ events });
  } catch (error: any) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Admin routes for event management
const adminRouter = express.Router();
adminRouter.use(authenticate);
adminRouter.use(requireAdmin);

// Create event
adminRouter.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('language').isIn(['C', 'Python', 'Java', 'Other']).withMessage('Invalid language'),
    body('description').optional(),
    body('maxParticipants').optional().isInt({ min: 1, max: 500 }),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, language, description, maxParticipants } = req.body;
      const adminId = req.user!.userId;

      const event = await prisma.event.create({
        data: {
          title,
          language,
          description: description || null,
          maxParticipants: maxParticipants || 120,
          createdByAdminId: adminId,
          status: 'DRAFT',
        },
      });

      res.status(201).json({ event });
    } catch (error: any) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
);

// Get all events (admin)
adminRouter.get('/', async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            participants: true,
            questions: true,
          },
        },
      },
    });

    res.json({ events });
  } catch (error: any) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by ID (admin)
adminRouter.get('/:eventId', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
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

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error: any) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Start event
adminRouter.post('/:eventId/start', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;

    // Check if there's already an active event
    const activeEvent = await prisma.event.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (activeEvent && activeEvent.id !== eventId) {
      return res.status(400).json({
        error: 'Please stop the current event before starting a new one.',
        activeEventId: activeEvent.id,
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        questions: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Event can only be started from DRAFT status' });
    }

    if (event.questions.length === 0) {
      return res.status(400).json({ error: 'Event must have at least one question' });
    }

    // Start the event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'ACTIVE',
        startTime: new Date(),
      },
    });

    res.json({
      message: 'Event started successfully',
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error('Start event error:', error);
    res.status(500).json({ error: 'Failed to start event' });
  }
});

// Stop event
adminRouter.post('/:eventId/stop', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Only active events can be stopped' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'ENDED',
        endTime: new Date(),
      },
    });

    res.json({
      message: 'Event stopped successfully',
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error('Stop event error:', error);
    res.status(500).json({ error: 'Failed to stop event' });
  }
});

// Add question to event
adminRouter.post(
  '/:eventId/questions',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('sampleInput').optional(),
    body('sampleOutput').optional(),
    body('testCases').isArray().withMessage('Test cases must be an array'),
    body('testCases.*.input').notEmpty().withMessage('Test case input is required'),
    body('testCases.*.expectedOutput').notEmpty().withMessage('Test case expected output is required'),
    body('testCases.*.score').isInt({ min: 1 }).withMessage('Test case score must be a positive integer'),
    body('correctAnswer').optional().trim(),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const eventId = req.params.eventId;
      const { title, description, sampleInput, sampleOutput, testCases, correctAnswer } = req.body;

      // Check if event exists (can add questions to DRAFT or ACTIVE events)
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const question = await prisma.question.create({
        data: {
          eventId,
          title,
          description,
          sampleInput: sampleInput || null,
          sampleOutput: sampleOutput || null,
          testCases: testCases,
          correctAnswer: correctAnswer || null,
        },
      });

      res.status(201).json({ question });
    } catch (error: any) {
      console.error('Add question error:', error);
      res.status(500).json({ error: 'Failed to add question' });
    }
  }
);

// Update question (admin can edit questions anytime)
adminRouter.put(
  '/:eventId/questions/:questionId',
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('sampleInput').optional(),
    body('sampleOutput').optional(),
    body('testCases').optional().isArray(),
    body('correctAnswer').optional().trim(),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { eventId, questionId } = req.params;
      const updateData: any = {};

      if (req.body.title) updateData.title = req.body.title;
      if (req.body.description) updateData.description = req.body.description;
      if (req.body.sampleInput !== undefined) updateData.sampleInput = req.body.sampleInput || null;
      if (req.body.sampleOutput !== undefined) updateData.sampleOutput = req.body.sampleOutput || null;
      if (req.body.testCases) updateData.testCases = req.body.testCases;
      if (req.body.correctAnswer !== undefined) updateData.correctAnswer = req.body.correctAnswer || null;

      const question = await prisma.question.update({
        where: { id: questionId },
        data: updateData,
      });

      res.json({ question });
    } catch (error: any) {
      console.error('Update question error:', error);
      res.status(500).json({ error: 'Failed to update question' });
    }
  }
);

// Mount admin routes - these will be accessible at /api/events/admin/*
router.use('/admin', adminRouter);

export default router;

