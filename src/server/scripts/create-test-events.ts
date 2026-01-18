// Script to create test events with questions from TEST_QUESTIONS.md
// Run with: tsx src/server/scripts/create-test-events.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test questions data
const pythonQuestions = [
  {
    title: 'Sum of Two Numbers',
    description: 'Write a Python program that takes two integers as input and prints their sum.',
    sampleInput: '5\n10',
    sampleOutput: '15',
    correctAnswer: '15',
    testCases: [
      { input: '5\n10', expectedOutput: '15', score: 10 },
      { input: '-5\n10', expectedOutput: '5', score: 10 },
      { input: '0\n0', expectedOutput: '0', score: 10 },
      { input: '100\n200', expectedOutput: '300', score: 10 },
    ],
  },
  {
    title: 'Find Maximum Number',
    description: 'Write a Python program that takes three integers as input and prints the maximum among them.',
    sampleInput: '5\n10\n3',
    sampleOutput: '10',
    correctAnswer: '10',
    testCases: [
      { input: '5\n10\n3', expectedOutput: '10', score: 10 },
      { input: '1\n2\n3', expectedOutput: '3', score: 10 },
      { input: '-5\n-2\n-10', expectedOutput: '-2', score: 10 },
      { input: '100\n100\n100', expectedOutput: '100', score: 10 },
    ],
  },
  {
    title: 'Check Even or Odd',
    description: 'Write a Python program that takes an integer as input and prints "Even" if the number is even, otherwise prints "Odd".',
    sampleInput: '5',
    sampleOutput: 'Odd',
    correctAnswer: 'Odd',
    testCases: [
      { input: '5', expectedOutput: 'Odd', score: 10 },
      { input: '4', expectedOutput: 'Even', score: 10 },
      { input: '0', expectedOutput: 'Even', score: 10 },
      { input: '-3', expectedOutput: 'Odd', score: 10 },
    ],
  },
  {
    title: 'Calculate Factorial',
    description: 'Write a Python program that takes a positive integer n as input and prints the factorial of n.',
    sampleInput: '5',
    sampleOutput: '120',
    correctAnswer: '120',
    testCases: [
      { input: '5', expectedOutput: '120', score: 10 },
      { input: '3', expectedOutput: '6', score: 10 },
      { input: '1', expectedOutput: '1', score: 10 },
      { input: '7', expectedOutput: '5040', score: 10 },
    ],
  },
  {
    title: 'Reverse a String',
    description: 'Write a Python program that takes a string as input and prints the reversed string.',
    sampleInput: 'hello',
    sampleOutput: 'olleh',
    correctAnswer: 'olleh',
    testCases: [
      { input: 'hello', expectedOutput: 'olleh', score: 10 },
      { input: 'world', expectedOutput: 'dlrow', score: 10 },
      { input: 'a', expectedOutput: 'a', score: 10 },
      { input: '12345', expectedOutput: '54321', score: 10 },
    ],
  },
];

const cQuestions = [
  {
    title: 'Sum of Array Elements',
    description: 'Write a C program that reads n integers, stores them in an array, and prints the sum of all elements.',
    sampleInput: '5\n1 2 3 4 5',
    sampleOutput: '15',
    correctAnswer: '15',
    testCases: [
      { input: '5\n1 2 3 4 5', expectedOutput: '15', score: 10 },
      { input: '3\n10 20 30', expectedOutput: '60', score: 10 },
      { input: '1\n100', expectedOutput: '100', score: 10 },
      { input: '4\n-1 2 -3 4', expectedOutput: '2', score: 10 },
    ],
  },
];

const javaQuestions = [
  {
    title: 'Check Prime Number',
    description: 'Write a Java program that takes an integer as input and prints "Prime" if it\'s a prime number, otherwise prints "Not Prime".',
    sampleInput: '7',
    sampleOutput: 'Prime',
    correctAnswer: 'Prime',
    testCases: [
      { input: '7', expectedOutput: 'Prime', score: 10 },
      { input: '4', expectedOutput: 'Not Prime', score: 10 },
      { input: '2', expectedOutput: 'Prime', score: 10 },
      { input: '1', expectedOutput: 'Not Prime', score: 10 },
    ],
  },
];

async function getAdmin() {
  // Find existing admin user (don't create new one)
  const admin = await prisma.admin.findFirst({
    orderBy: { createdAt: 'asc' }, // Get the first admin created
  });

  if (!admin) {
    throw new Error('No admin user found. Please create an admin account first.');
  }

  console.log(`✅ Using existing admin: ${admin.email} (${admin.name})`);
  return admin;
}

async function createEvent(adminId: string, title: string, language: string, description: string) {
  // Check if event with same title and language exists in DRAFT status
  const existing = await prisma.event.findFirst({
    where: {
      title,
      language,
      status: 'DRAFT',
      createdByAdminId: adminId,
    },
  });

  if (existing) {
    console.log(`⚠️  Event "${title}" already exists in DRAFT, deleting old questions and updating...`);
    // Delete existing questions and recreate them
    await prisma.question.deleteMany({
      where: { eventId: existing.id },
    });
    console.log(`  🗑️  Deleted old questions from existing event`);
    return existing;
  }

  const event = await prisma.event.create({
    data: {
      title,
      language,
      description,
      maxParticipants: 120,
      createdByAdminId: adminId,
      status: 'DRAFT',
    },
  });

  console.log(`✅ Created event: ${title} (${language})`);
  return event;
}

async function createQuestion(eventId: string, questionData: any) {
  // Check if question already exists
  const existing = await prisma.question.findFirst({
    where: {
      eventId,
      title: questionData.title,
    },
  });

  if (existing) {
    console.log(`  ⚠️  Question "${questionData.title}" already exists, skipping...`);
    return existing;
  }

  const question = await prisma.question.create({
    data: {
      eventId,
      title: questionData.title,
      description: questionData.description,
      sampleInput: questionData.sampleInput || null,
      sampleOutput: questionData.sampleOutput || null,
      testCases: questionData.testCases,
      correctAnswer: questionData.correctAnswer,
    },
  });

  console.log(`  ✅ Added question: ${questionData.title}`);
  return question;
}

async function main() {
  try {
    console.log('🚀 Starting test events creation...\n');

    // Get existing admin (don't create new one)
    const admin = await getAdmin();
    console.log(`📋 Using admin: ${admin.email}\n`);

    // Create Python Event
    console.log('📝 Creating Python Event...');
    const pythonEvent = await createEvent(
      admin.id,
      'Python Coding Challenge',
      'Python',
      'Test your Python programming skills with these coding challenges'
    );

    for (const question of pythonQuestions) {
      await createQuestion(pythonEvent.id, question);
    }
    console.log(`✅ Python Event created with ${pythonQuestions.length} questions\n`);

    // Create C Event
    console.log('📝 Creating C Event...');
    const cEvent = await createEvent(
      admin.id,
      'C Programming Challenge',
      'C',
      'Test your C programming skills'
    );

    for (const question of cQuestions) {
      await createQuestion(cEvent.id, question);
    }
    console.log(`✅ C Event created with ${cQuestions.length} question\n`);

    // Create Java Event
    console.log('📝 Creating Java Event...');
    const javaEvent = await createEvent(
      admin.id,
      'Java Programming Challenge',
      'Java',
      'Test your Java programming skills'
    );

    for (const question of javaQuestions) {
      await createQuestion(javaEvent.id, question);
    }
    console.log(`✅ Java Event created with ${javaQuestions.length} question\n`);

    console.log('🎉 All test events created successfully!');
    console.log('\n📌 Next Steps:');
    console.log('1. Login as admin (admin@jits.local / admin123)');
    console.log('2. Go to Admin Dashboard');
    console.log('3. Click "Start Event" on any event you want to test');
    console.log('4. Login as student and join the event');
    console.log('5. Start coding and testing! 🚀\n');

  } catch (error: any) {
    console.error('❌ Error creating events:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
