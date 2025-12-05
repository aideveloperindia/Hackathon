import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const masterStudents = [];
  const sections = ['A', 'B', 'C'];
  const firstNames = ['Aarav', 'Aditya', 'Akash', 'Aman', 'Aniket', 'Arjun', 'Arnav', 'Ayush', 'Dhruv', 'Gaurav', 
                      'Harsh', 'Ishaan', 'Karan', 'Krishna', 'Manav', 'Mohit', 'Nikhil', 'Pranav', 'Rahul', 'Raj',
                      'Rohan', 'Sahil', 'Samarth', 'Sarthak', 'Shivam', 'Siddharth', 'Tanmay', 'Varun', 'Vedant', 'Vikram',
                      'Aanya', 'Aditi', 'Ananya', 'Anika', 'Anjali', 'Arpita', 'Avni', 'Divya', 'Isha', 'Kavya',
                      'Khushi', 'Meera', 'Neha', 'Pooja', 'Priya', 'Riya', 'Sakshi', 'Sanvi', 'Shreya', 'Sneha',
                      'Suhani', 'Tanya', 'Vidhi', 'Yashvi', 'Zara', 'Aarushi', 'Bhavya', 'Chhavi', 'Disha', 'Esha',
                      'Fiza', 'Gia', 'Hina', 'Ira', 'Jiya', 'Kia', 'Lavanya', 'Maya', 'Naina', 'Ojasvi',
                      'Pari', 'Qirat', 'Radha', 'Sia', 'Tara', 'Uma', 'Vanya', 'Warda', 'Xara', 'Yamini',
                      'Zara', 'Aadi', 'Bhavin', 'Chirag', 'Dev', 'Eshaan', 'Farhan', 'Gagan', 'Harshit', 'Ishan',
                      'Jay', 'Kartik', 'Laksh', 'Manan', 'Nakul', 'Om', 'Parth', 'Qadir', 'Rishabh', 'Sahil',
                      'Tanish', 'Uday', 'Vihaan', 'Yash', 'Zayan', 'Aarohi', 'Bhumika', 'Charvi', 'Daksha', 'Esha',
                      'Falak', 'Gargi', 'Harshita', 'Ishita', 'Jhanvi', 'Kritika', 'Lavanya', 'Mansi', 'Nidhi', 'Ojasvi'];
  
  const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Yadav', 'Reddy', 'Rao', 'Nair',
                     'Mehta', 'Jain', 'Agarwal', 'Malhotra', 'Kapoor', 'Chopra', 'Bansal', 'Goyal', 'Arora', 'Saxena',
                     'Mishra', 'Pandey', 'Tiwari', 'Dubey', 'Shukla', 'Srivastava', 'Trivedi', 'Joshi', 'Bhatt', 'Desai',
                     'Shah', 'Patil', 'Kulkarni', 'Naik', 'Kamble', 'Gaikwad', 'Jadhav', 'More', 'Pawar', 'Chavan'];

  let studentIndex = 0;

  // ===== CSM BRANCH =====
  // HT Numbers: 22271A6600 to 22271A6660 (61 students: 0-60 inclusive)
  console.log('📝 Adding CSM branch students (22271A6600 to 22271A6660)...');
  for (let i = 0; i <= 60; i++) {
    const htNumber = `22271A${String(6600 + i).padStart(4, '0')}`;
    const firstName = firstNames[studentIndex % firstNames.length];
    const lastName = lastNames[Math.floor(studentIndex / firstNames.length) % lastNames.length];
    const section = sections[i % sections.length];
    const year = Math.floor(i / 15) + 1;
    
    masterStudents.push({
      htNo: htNumber,
      name: `${firstName} ${lastName}`,
      branch: 'CSM',
      section: section,
      year: year > 4 ? 4 : year,
    });
    studentIndex++;
  }

  // ===== CSE BRANCH =====
  console.log('📝 Adding CSE branch students...');
  
  // Range 1: 22271A0500 to 22271A0599 (100 students)
  for (let i = 0; i < 100; i++) {
    const htNumber = `22271A${String(500 + i).padStart(4, '0')}`;
    const firstName = firstNames[studentIndex % firstNames.length];
    const lastName = lastNames[Math.floor(studentIndex / firstNames.length) % lastNames.length];
    const section = sections[i % sections.length];
    const year = Math.floor(i / 25) + 1; // Distribute across 4 years
    
    masterStudents.push({
      htNo: htNumber,
      name: `${firstName} ${lastName}`,
      branch: 'CSE',
      section: section,
      year: year > 4 ? 4 : year,
    });
    studentIndex++;
  }

  // Range 2: 22271A05A1 to 22271A05A9 (9 students)
  for (let i = 1; i <= 9; i++) {
    const htNumber = `22271A05A${i}`;
    const firstName = firstNames[studentIndex % firstNames.length];
    const lastName = lastNames[Math.floor(studentIndex / firstNames.length) % lastNames.length];
    const section = sections[(studentIndex - 100) % sections.length];
    const year = Math.floor((studentIndex - 100) / 3) + 1;
    
    masterStudents.push({
      htNo: htNumber,
      name: `${firstName} ${lastName}`,
      branch: 'CSE',
      section: section,
      year: year > 4 ? 4 : year,
    });
    studentIndex++;
  }

  // Range 3: 22271A05B1 to 22271A05B9 (9 students)
  for (let i = 1; i <= 9; i++) {
    const htNumber = `22271A05B${i}`;
    const firstName = firstNames[studentIndex % firstNames.length];
    const lastName = lastNames[Math.floor(studentIndex / firstNames.length) % lastNames.length];
    const section = sections[(studentIndex - 109) % sections.length];
    const year = Math.floor((studentIndex - 109) / 3) + 1;
    
    masterStudents.push({
      htNo: htNumber,
      name: `${firstName} ${lastName}`,
      branch: 'CSE',
      section: section,
      year: year > 4 ? 4 : year,
    });
    studentIndex++;
  }

  // Range 4: 22271A05C1 to 22271A05C9 (9 students)
  for (let i = 1; i <= 9; i++) {
    const htNumber = `22271A05C${i}`;
    const firstName = firstNames[studentIndex % firstNames.length];
    const lastName = lastNames[Math.floor(studentIndex / firstNames.length) % lastNames.length];
    const section = sections[(studentIndex - 118) % sections.length];
    const year = Math.floor((studentIndex - 118) / 3) + 1;
    
    masterStudents.push({
      htNo: htNumber,
      name: `${firstName} ${lastName}`,
      branch: 'CSE',
      section: section,
      year: year > 4 ? 4 : year,
    });
    studentIndex++;
  }

  // Create master students (skip if already exists)
  for (const student of masterStudents) {
    await prisma.masterStudent.upsert({
      where: { htNo: student.htNo },
      update: {},
      create: student,
    });
  }

  console.log(`✅ Created ${masterStudents.length} master students`);
  console.log(`   CSM Branch: 22271A6600 to 22271A6660 (61 students)`);
  console.log(`   CSE Branch: 22271A0500 to 22271A0599 (100 students)`);
  console.log(`   CSE Branch: 22271A05A1 to 22271A05A9 (9 students)`);
  console.log(`   CSE Branch: 22271A05B1 to 22271A05B9 (9 students)`);
  console.log(`   CSE Branch: 22271A05C1 to 22271A05C9 (9 students)`);
  console.log(`   Total: ${masterStudents.length} students`);

  // Seed a default admin (optional)
  const adminEmail = 'admin@jits.ac.in';
  const adminPassword = await hashPassword('admin123');

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin User',
      email: adminEmail,
      passwordHash: adminPassword,
    },
  });

  console.log('✅ Created default admin (admin@jits.ac.in / admin123)');

  // Create sample events with questions
  console.log('📚 Creating sample events with questions...');
  
  const admin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    console.error('❌ Admin not found. Cannot create events.');
    return;
  }

  // Check if Python event already exists, if not create it
  let pythonEvent = await prisma.event.findFirst({
    where: {
      title: 'Python Coding Challenge',
      language: 'Python',
    },
  });

  if (!pythonEvent) {
    pythonEvent = await prisma.event.create({
      data: {
        title: 'Python Coding Challenge',
        language: 'Python',
        description: 'Test your Python programming skills with these 5 challenging problems covering basic to intermediate concepts.',
        maxParticipants: 120,
        createdByAdminId: admin.id,
        status: 'DRAFT',
      },
    });
  }

  console.log('✅ Created Python event');

  // Python Questions
  const pythonQuestions = [
    {
      title: 'Sum of Two Numbers',
      description: 'Write a function that takes two integers as input and returns their sum.\n\nInput: Two integers a and b\nOutput: Sum of a and b',
      sampleInput: '5\n10',
      sampleOutput: '15',
      testCases: [
        { input: '5\n10', expectedOutput: '15', score: 20 },
        { input: '-5\n10', expectedOutput: '5', score: 20 },
        { input: '0\n0', expectedOutput: '0', score: 20 },
        { input: '100\n200', expectedOutput: '300', score: 20 },
        { input: '-10\n-20', expectedOutput: '-30', score: 20 },
      ],
    },
    {
      title: 'Find Maximum in Array',
      description: 'Write a function that takes an array of integers and returns the maximum value.\n\nInput: First line contains n (number of elements), next n lines contain the array elements\nOutput: Maximum value in the array',
      sampleInput: '5\n3\n7\n2\n9\n1',
      sampleOutput: '9',
      testCases: [
        { input: '5\n3\n7\n2\n9\n1', expectedOutput: '9', score: 20 },
        { input: '3\n-5\n-2\n-10', expectedOutput: '-2', score: 20 },
        { input: '1\n42', expectedOutput: '42', score: 20 },
        { input: '4\n10\n20\n30\n40', expectedOutput: '40', score: 20 },
        { input: '6\n1\n1\n1\n1\n1\n1', expectedOutput: '1', score: 20 },
      ],
    },
    {
      title: 'Check Prime Number',
      description: 'Write a function that checks if a given number is prime. Return "Yes" if prime, "No" otherwise.\n\nInput: A single integer n\nOutput: "Yes" or "No"',
      sampleInput: '7',
      sampleOutput: 'Yes',
      testCases: [
        { input: '7', expectedOutput: 'Yes', score: 20 },
        { input: '4', expectedOutput: 'No', score: 20 },
        { input: '2', expectedOutput: 'Yes', score: 20 },
        { input: '17', expectedOutput: 'Yes', score: 20 },
        { input: '1', expectedOutput: 'No', score: 20 },
      ],
    },
    {
      title: 'Reverse a String',
      description: 'Write a function that takes a string and returns the reversed string.\n\nInput: A string\nOutput: Reversed string',
      sampleInput: 'hello',
      sampleOutput: 'olleh',
      testCases: [
        { input: 'hello', expectedOutput: 'olleh', score: 20 },
        { input: 'Python', expectedOutput: 'nohtyP', score: 20 },
        { input: 'a', expectedOutput: 'a', score: 20 },
        { input: '12345', expectedOutput: '54321', score: 20 },
        { input: 'Hello World', expectedOutput: 'dlroW olleH', score: 20 },
      ],
    },
    {
      title: 'Fibonacci Sequence',
      description: 'Write a function that returns the nth Fibonacci number. Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, ...\n\nInput: An integer n (0-indexed)\nOutput: nth Fibonacci number',
      sampleInput: '5',
      sampleOutput: '5',
      testCases: [
        { input: '0', expectedOutput: '0', score: 20 },
        { input: '1', expectedOutput: '1', score: 20 },
        { input: '5', expectedOutput: '5', score: 20 },
        { input: '7', expectedOutput: '13', score: 20 },
        { input: '10', expectedOutput: '55', score: 20 },
      ],
    },
  ];

  // Delete existing questions for Python event and recreate
  await prisma.question.deleteMany({
    where: { eventId: pythonEvent.id },
  });

  for (const q of pythonQuestions) {
    await prisma.question.create({
      data: {
        eventId: pythonEvent.id,
        title: q.title,
        description: q.description,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        testCases: q.testCases,
      },
    });
  }

  console.log('✅ Added 5 Python questions');

  // Check if C event already exists, if not create it
  let cEvent = await prisma.event.findFirst({
    where: {
      title: 'C Programming Challenge',
      language: 'C',
    },
  });

  if (!cEvent) {
    cEvent = await prisma.event.create({
      data: {
        title: 'C Programming Challenge',
        language: 'C',
        description: 'Master C programming with these 5 problems covering fundamentals, arrays, and algorithms.',
        maxParticipants: 120,
        createdByAdminId: admin.id,
        status: 'DRAFT',
      },
    });
  }

  console.log('✅ Created C event');

  // C Questions
  const cQuestions = [
    {
      title: 'Calculate Factorial',
      description: 'Write a program that calculates the factorial of a given number n.\n\nInput: An integer n (0 <= n <= 10)\nOutput: Factorial of n',
      sampleInput: '5',
      sampleOutput: '120',
      testCases: [
        { input: '5', expectedOutput: '120', score: 20 },
        { input: '0', expectedOutput: '1', score: 20 },
        { input: '1', expectedOutput: '1', score: 20 },
        { input: '3', expectedOutput: '6', score: 20 },
        { input: '7', expectedOutput: '5040', score: 20 },
      ],
    },
    {
      title: 'Count Vowels in String',
      description: 'Write a program that counts the number of vowels (a, e, i, o, u) in a given string (case-insensitive).\n\nInput: A string\nOutput: Number of vowels',
      sampleInput: 'Hello World',
      sampleOutput: '3',
      testCases: [
        { input: 'Hello World', expectedOutput: '3', score: 20 },
        { input: 'Programming', expectedOutput: '3', score: 20 },
        { input: 'AEIOU', expectedOutput: '5', score: 20 },
        { input: 'bcdfg', expectedOutput: '0', score: 20 },
        { input: 'a', expectedOutput: '1', score: 20 },
      ],
    },
    {
      title: 'Find Second Largest',
      description: 'Write a program that finds the second largest number in an array of integers.\n\nInput: First line contains n, next n lines contain array elements\nOutput: Second largest number',
      sampleInput: '5\n3\n7\n2\n9\n1',
      sampleOutput: '7',
      testCases: [
        { input: '5\n3\n7\n2\n9\n1', expectedOutput: '7', score: 20 },
        { input: '4\n10\n20\n30\n40', expectedOutput: '30', score: 20 },
        { input: '3\n5\n5\n5', expectedOutput: '5', score: 20 },
        { input: '2\n10\n20', expectedOutput: '10', score: 20 },
        { input: '6\n1\n2\n3\n4\n5\n6', expectedOutput: '5', score: 20 },
      ],
    },
    {
      title: 'Check Palindrome',
      description: 'Write a program that checks if a given string is a palindrome (reads same forwards and backwards). Return "Yes" if palindrome, "No" otherwise.\n\nInput: A string\nOutput: "Yes" or "No"',
      sampleInput: 'racecar',
      sampleOutput: 'Yes',
      testCases: [
        { input: 'racecar', expectedOutput: 'Yes', score: 20 },
        { input: 'hello', expectedOutput: 'No', score: 20 },
        { input: 'level', expectedOutput: 'Yes', score: 20 },
        { input: 'a', expectedOutput: 'Yes', score: 20 },
        { input: '12321', expectedOutput: 'Yes', score: 20 },
      ],
    },
    {
      title: 'Sum of Digits',
      description: 'Write a program that calculates the sum of digits of a given number.\n\nInput: An integer n\nOutput: Sum of digits of n',
      sampleInput: '12345',
      sampleOutput: '15',
      testCases: [
        { input: '12345', expectedOutput: '15', score: 20 },
        { input: '999', expectedOutput: '27', score: 20 },
        { input: '0', expectedOutput: '0', score: 20 },
        { input: '100', expectedOutput: '1', score: 20 },
        { input: '98765', expectedOutput: '35', score: 20 },
      ],
    },
  ];

  // Delete existing questions for C event and recreate
  await prisma.question.deleteMany({
    where: { eventId: cEvent.id },
  });

  for (const q of cQuestions) {
    await prisma.question.create({
      data: {
        eventId: cEvent.id,
        title: q.title,
        description: q.description,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        testCases: q.testCases,
      },
    });
  }

  console.log('✅ Added 5 C questions');

  // Check if Java event already exists, if not create it
  let javaEvent = await prisma.event.findFirst({
    where: {
      title: 'Java Programming Challenge',
      language: 'Java',
    },
  });

  if (!javaEvent) {
    javaEvent = await prisma.event.create({
      data: {
        title: 'Java Programming Challenge',
        language: 'Java',
        description: 'Enhance your Java skills with these 5 problems covering OOP concepts, collections, and algorithms.',
        maxParticipants: 120,
        createdByAdminId: admin.id,
        status: 'DRAFT',
      },
    });
  }

  console.log('✅ Created Java event');

  // Java Questions
  const javaQuestions = [
    {
      title: 'Find Average of Array',
      description: 'Write a method that calculates and returns the average of all elements in an integer array.\n\nInput: First line contains n, next n lines contain array elements\nOutput: Average (as integer, rounded down)',
      sampleInput: '5\n10\n20\n30\n40\n50',
      sampleOutput: '30',
      testCases: [
        { input: '5\n10\n20\n30\n40\n50', expectedOutput: '30', score: 20 },
        { input: '3\n5\n10\n15', expectedOutput: '10', score: 20 },
        { input: '1\n42', expectedOutput: '42', score: 20 },
        { input: '4\n1\n2\n3\n4', expectedOutput: '2', score: 20 },
        { input: '6\n10\n20\n30\n40\n50\n60', expectedOutput: '35', score: 20 },
      ],
    },
    {
      title: 'Check Even or Odd',
      description: 'Write a method that checks if a number is even or odd. Return "Even" if even, "Odd" if odd.\n\nInput: An integer n\nOutput: "Even" or "Odd"',
      sampleInput: '6',
      sampleOutput: 'Even',
      testCases: [
        { input: '6', expectedOutput: 'Even', score: 20 },
        { input: '7', expectedOutput: 'Odd', score: 20 },
        { input: '0', expectedOutput: 'Even', score: 20 },
        { input: '1', expectedOutput: 'Odd', score: 20 },
        { input: '100', expectedOutput: 'Even', score: 20 },
      ],
    },
    {
      title: 'Find Minimum in Array',
      description: 'Write a method that finds and returns the minimum value in an integer array.\n\nInput: First line contains n, next n lines contain array elements\nOutput: Minimum value',
      sampleInput: '5\n3\n7\n2\n9\n1',
      sampleOutput: '1',
      testCases: [
        { input: '5\n3\n7\n2\n9\n1', expectedOutput: '1', score: 20 },
        { input: '4\n10\n20\n30\n40', expectedOutput: '10', score: 20 },
        { input: '3\n-5\n-2\n-10', expectedOutput: '-10', score: 20 },
        { input: '1\n42', expectedOutput: '42', score: 20 },
        { input: '6\n5\n5\n5\n5\n5\n5', expectedOutput: '5', score: 20 },
      ],
    },
    {
      title: 'Count Words in String',
      description: 'Write a method that counts the number of words in a given string. Words are separated by spaces.\n\nInput: A string\nOutput: Number of words',
      sampleInput: 'Hello World',
      sampleOutput: '2',
      testCases: [
        { input: 'Hello World', expectedOutput: '2', score: 20 },
        { input: 'Java Programming', expectedOutput: '2', score: 20 },
        { input: 'a', expectedOutput: '1', score: 20 },
        { input: 'one two three four', expectedOutput: '4', score: 20 },
        { input: '  spaced  out  ', expectedOutput: '2', score: 20 },
      ],
    },
    {
      title: 'Power of Number',
      description: 'Write a method that calculates base raised to the power of exponent.\n\nInput: Two integers: base and exponent\nOutput: base^exponent',
      sampleInput: '2\n3',
      sampleOutput: '8',
      testCases: [
        { input: '2\n3', expectedOutput: '8', score: 20 },
        { input: '5\n2', expectedOutput: '25', score: 20 },
        { input: '10\n0', expectedOutput: '1', score: 20 },
        { input: '3\n4', expectedOutput: '81', score: 20 },
        { input: '2\n10', expectedOutput: '1024', score: 20 },
      ],
    },
  ];

  // Delete existing questions for Java event and recreate
  await prisma.question.deleteMany({
    where: { eventId: javaEvent.id },
  });

  for (const q of javaQuestions) {
    await prisma.question.create({
      data: {
        eventId: javaEvent.id,
        title: q.title,
        description: q.description,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        testCases: q.testCases,
      },
    });
  }

  console.log('✅ Added 5 Java questions');

  console.log('✨ Seeding completed!');
  console.log('\n📊 Summary:');
  console.log('   - Python Event: 5 questions');
  console.log('   - C Event: 5 questions');
  console.log('   - Java Event: 5 questions');
  console.log('   - Total: 15 questions across 3 events');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

