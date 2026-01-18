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
        correctAnswer: null, // Correct answer will be set by admin
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
        correctAnswer: null, // Correct answer will be set by admin
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
        correctAnswer: null, // Correct answer will be set by admin
      },
    });
  }

  console.log('✅ Added 5 Java questions');

  // ===== COMPUTER SCIENCE FUNDAMENTALS EVENT =====
  let csEvent = await prisma.event.findFirst({
    where: {
      title: 'Computer Science Fundamentals Challenge',
      language: 'Python',
    },
  });

  if (!csEvent) {
    csEvent = await prisma.event.create({
      data: {
        title: 'Computer Science Fundamentals Challenge',
        language: 'Python',
        description: 'Test your understanding of core computer science concepts: data structures, algorithms, complexity analysis, and problem-solving techniques.',
        maxParticipants: 120,
        createdByAdminId: admin.id,
        status: 'DRAFT',
      },
    });
  }

  console.log('✅ Created Computer Science Fundamentals event');

  const csQuestions = [
    {
      title: 'Binary Search Implementation',
      description: 'Implement binary search to find if a target value exists in a sorted array. Return the index if found, -1 otherwise.\n\nInput: First line contains n (array size), next n lines contain sorted array elements, last line contains target\nOutput: Index of target or -1',
      sampleInput: '5\n1\n3\n5\n7\n9\n5',
      sampleOutput: '2',
      testCases: [
        { input: '5\n1\n3\n5\n7\n9\n5', expectedOutput: '2', score: 20 },
        { input: '5\n1\n3\n5\n7\n9\n4', expectedOutput: '-1', score: 20 },
        { input: '1\n10\n10', expectedOutput: '0', score: 20 },
        { input: '4\n2\n4\n6\n8\n1', expectedOutput: '-1', score: 20 },
        { input: '6\n1\n2\n3\n4\n5\n6\n3', expectedOutput: '2', score: 20 },
      ],
    },
    {
      title: 'Merge Two Sorted Arrays',
      description: 'Given two sorted arrays, merge them into a single sorted array.\n\nInput: First line contains n1 and n2 (sizes), next n1 lines are first array, next n2 lines are second array\nOutput: Merged sorted array (one element per line)',
      sampleInput: '3 3\n1\n3\n5\n2\n4\n6',
      sampleOutput: '1\n2\n3\n4\n5\n6',
      testCases: [
        { input: '3 3\n1\n3\n5\n2\n4\n6', expectedOutput: '1\n2\n3\n4\n5\n6', score: 20 },
        { input: '2 2\n1\n2\n3\n4', expectedOutput: '1\n2\n3\n4', score: 20 },
        { input: '1 1\n5\n3', expectedOutput: '3\n5', score: 20 },
        { input: '0 2\n1\n2', expectedOutput: '1\n2', score: 20 },
        { input: '3 0\n1\n2\n3', expectedOutput: '1\n2\n3', score: 20 },
      ],
    },
    {
      title: 'Valid Parentheses Checker',
      description: 'Check if a string containing only parentheses (), [], {} is valid. Return "Valid" if valid, "Invalid" otherwise.\n\nInput: A string of parentheses\nOutput: "Valid" or "Invalid"',
      sampleInput: '()[]{}',
      sampleOutput: 'Valid',
      testCases: [
        { input: '()[]{}', expectedOutput: 'Valid', score: 20 },
        { input: '([{}])', expectedOutput: 'Valid', score: 20 },
        { input: '([)]', expectedOutput: 'Invalid', score: 20 },
        { input: '((', expectedOutput: 'Invalid', score: 20 },
        { input: '()', expectedOutput: 'Valid', score: 20 },
      ],
    },
    {
      title: 'Two Sum Problem',
      description: 'Given an array of integers and a target sum, find two numbers that add up to the target. Return their indices as "i j" or "No solution" if not found.\n\nInput: First line contains n and target, next n lines contain array elements\nOutput: Indices i j or "No solution"',
      sampleInput: '4 9\n2\n7\n11\n15',
      sampleOutput: '0 1',
      testCases: [
        { input: '4 9\n2\n7\n11\n15', expectedOutput: '0 1', score: 20 },
        { input: '3 6\n3\n2\n4', expectedOutput: '1 2', score: 20 },
        { input: '3 6\n3\n3\n3', expectedOutput: '0 1', score: 20 },
        { input: '2 10\n5\n5', expectedOutput: '0 1', score: 20 },
        { input: '3 10\n1\n2\n3', expectedOutput: 'No solution', score: 20 },
      ],
    },
    {
      title: 'Longest Common Prefix',
      description: 'Find the longest common prefix string among an array of strings. If no common prefix, return empty string.\n\nInput: First line contains n, next n lines contain strings\nOutput: Longest common prefix',
      sampleInput: '3\nflower\nflow\nflight',
      sampleOutput: 'fl',
      testCases: [
        { input: '3\nflower\nflow\nflight', expectedOutput: 'fl', score: 20 },
        { input: '3\ndog\nracecar\ncar', expectedOutput: '', score: 20 },
        { input: '2\ninterspecies\ninterstellar', expectedOutput: 'inters', score: 20 },
        { input: '1\nhello', expectedOutput: 'hello', score: 20 },
        { input: '2\nprefix\npre', expectedOutput: 'pre', score: 20 },
      ],
    },
  ];

  await prisma.question.deleteMany({
    where: { eventId: csEvent.id },
  });

  for (const q of csQuestions) {
    await prisma.question.create({
      data: {
        eventId: csEvent.id,
        title: q.title,
        description: q.description,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        testCases: q.testCases,
        correctAnswer: null,
      },
    });
  }

  console.log('✅ Added 5 Computer Science Fundamentals questions');

  // ===== SOFTWARE APPLICATIONS EVENT =====
  let appEvent = await prisma.event.findFirst({
    where: {
      title: 'Software Applications Development Challenge',
      language: 'Python',
    },
  });

  if (!appEvent) {
    appEvent = await prisma.event.create({
      data: {
        title: 'Software Applications Development Challenge',
        language: 'Python',
        description: 'Build practical software solutions: file processing, data manipulation, API-like functions, and real-world application logic.',
        maxParticipants: 120,
        createdByAdminId: admin.id,
        status: 'DRAFT',
      },
    });
  }

  console.log('✅ Created Software Applications event');

  const appQuestions = [
    {
      title: 'CSV Data Parser',
      description: 'Parse a CSV-like string and calculate the average of the second column. Input format: "name,value" per line.\n\nInput: First line contains n, next n lines contain "name,value" pairs\nOutput: Average of values (rounded to 2 decimal places)',
      sampleInput: '3\nAlice,85\nBob,90\nCharlie,75',
      sampleOutput: '83.33',
      testCases: [
        { input: '3\nAlice,85\nBob,90\nCharlie,75', expectedOutput: '83.33', score: 20 },
        { input: '2\nItem1,100\nItem2,200', expectedOutput: '150.00', score: 20 },
        { input: '1\nTest,50', expectedOutput: '50.00', score: 20 },
        { input: '4\nA,10\nB,20\nC,30\nD,40', expectedOutput: '25.00', score: 20 },
        { input: '5\nX,5\nY,10\nZ,15\nW,20\nV,25', expectedOutput: '15.00', score: 20 },
      ],
    },
    {
      title: 'Password Validator',
      description: 'Validate a password: at least 8 chars, contains uppercase, lowercase, digit, and special char (!@#$%^&*). Return "Valid" or "Invalid".\n\nInput: A password string\nOutput: "Valid" or "Invalid"',
      sampleInput: 'Password123!',
      sampleOutput: 'Valid',
      testCases: [
        { input: 'Password123!', expectedOutput: 'Valid', score: 20 },
        { input: 'weak', expectedOutput: 'Invalid', score: 20 },
        { input: 'NoSpecial1', expectedOutput: 'Invalid', score: 20 },
        { input: 'Strong@Pass1', expectedOutput: 'Valid', score: 20 },
        { input: 'short1!', expectedOutput: 'Invalid', score: 20 },
      ],
    },
    {
      title: 'URL Path Extractor',
      description: 'Extract the path from a URL. Given a URL, return the path part (everything after domain).\n\nInput: A URL string\nOutput: Path part of URL',
      sampleInput: 'https://example.com/api/users/123',
      sampleOutput: '/api/users/123',
      testCases: [
        { input: 'https://example.com/api/users/123', expectedOutput: '/api/users/123', score: 20 },
        { input: 'http://test.com/home', expectedOutput: '/home', score: 20 },
        { input: 'https://site.com/', expectedOutput: '/', score: 20 },
        { input: 'http://domain.com/path/to/resource', expectedOutput: '/path/to/resource', score: 20 },
        { input: 'https://api.example.com/v1/data', expectedOutput: '/v1/data', score: 20 },
      ],
    },
    {
      title: 'Email Domain Counter',
      description: 'Count how many emails belong to each domain. Return domain:count pairs, one per line, sorted by domain.\n\nInput: First line contains n, next n lines contain email addresses\nOutput: Domain:count pairs (sorted)',
      sampleInput: '3\nalice@gmail.com\nbob@yahoo.com\ncharlie@gmail.com',
      sampleOutput: 'gmail.com:2\nyahoo.com:1',
      testCases: [
        { input: '3\nalice@gmail.com\nbob@yahoo.com\ncharlie@gmail.com', expectedOutput: 'gmail.com:2\nyahoo.com:1', score: 20 },
        { input: '2\ntest@example.com\nuser@example.com', expectedOutput: 'example.com:2', score: 20 },
        { input: '1\nadmin@test.com', expectedOutput: 'test.com:1', score: 20 },
        { input: '4\na@x.com\nb@y.com\nc@x.com\nd@z.com', expectedOutput: 'x.com:2\ny.com:1\nz.com:1', score: 20 },
        { input: '3\nuser1@domain.com\nuser2@domain.com\nuser3@domain.com', expectedOutput: 'domain.com:3', score: 20 },
      ],
    },
    {
      title: 'JSON Key-Value Extractor',
      description: 'Extract a specific key value from a simple JSON-like string. Format: {"key":"value"}.\n\nInput: First line contains JSON string, second line contains key to extract\nOutput: Value for the key or "Not found"',
      sampleInput: '{"name":"John","age":"30","city":"NYC"}\nage',
      sampleOutput: '30',
      testCases: [
        { input: '{"name":"John","age":"30","city":"NYC"}\nage', expectedOutput: '30', score: 20 },
        { input: '{"id":"123","status":"active"}\nid', expectedOutput: '123', score: 20 },
        { input: '{"key":"value"}\nmissing', expectedOutput: 'Not found', score: 20 },
        { input: '{"a":"1","b":"2","c":"3"}\nb', expectedOutput: '2', score: 20 },
        { input: '{"x":"hello"}\nx', expectedOutput: 'hello', score: 20 },
      ],
    },
  ];

  await prisma.question.deleteMany({
    where: { eventId: appEvent.id },
  });

  for (const q of appQuestions) {
    await prisma.question.create({
      data: {
        eventId: appEvent.id,
        title: q.title,
        description: q.description,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        testCases: q.testCases,
        correctAnswer: null,
      },
    });
  }

  console.log('✅ Added 5 Software Applications questions');

  // ===== ARTIFICIAL INTELLIGENCE EVENT =====
  let aiEvent = await prisma.event.findFirst({
    where: {
      title: 'Artificial Intelligence Challenge',
      language: 'Python',
    },
  });

  if (!aiEvent) {
    aiEvent = await prisma.event.create({
      data: {
        title: 'Artificial Intelligence Challenge',
        language: 'Python',
        description: 'Solve AI problems: search algorithms, game theory, constraint satisfaction, and intelligent decision-making systems.',
        maxParticipants: 120,
        createdByAdminId: admin.id,
        status: 'DRAFT',
      },
    });
  }

  console.log('✅ Created Artificial Intelligence event');

  const aiQuestions = [
    {
      title: 'BFS Path Finder',
      description: 'Find shortest path using BFS. Given graph edges and start/end nodes, return path length or -1 if no path.\n\nInput: First line: n nodes, m edges. Next m lines: edges (u v). Last line: start end\nOutput: Shortest path length',
      sampleInput: '4 4\n0 1\n1 2\n2 3\n0 3\n0 3',
      sampleOutput: '1',
      testCases: [
        { input: '4 4\n0 1\n1 2\n2 3\n0 3\n0 3', expectedOutput: '1', score: 20 },
        { input: '3 2\n0 1\n1 2\n0 2', expectedOutput: '2', score: 20 },
        { input: '2 1\n0 1\n0 1', expectedOutput: '1', score: 20 },
        { input: '3 1\n0 1\n0 2', expectedOutput: '-1', score: 20 },
        { input: '5 6\n0 1\n1 2\n2 3\n3 4\n0 4\n1 3\n0 4', expectedOutput: '1', score: 20 },
      ],
    },
    {
      title: 'Tic-Tac-Toe Winner Checker',
      description: 'Check if there is a winner in a Tic-Tac-Toe board. Return "X", "O", "Draw", or "Continue".\n\nInput: 3 lines, each with 3 characters (X, O, or .)\nOutput: Winner or game status',
      sampleInput: 'X X O\nO X X\nO O X',
      sampleOutput: 'X',
      testCases: [
        { input: 'X X O\nO X X\nO O X', expectedOutput: 'X', score: 20 },
        { input: 'X O X\nO O X\nX O O', expectedOutput: 'O', score: 20 },
        { input: 'X O X\nO X O\nO X O', expectedOutput: 'Draw', score: 20 },
        { input: 'X X X\nO O .\n. . .', expectedOutput: 'X', score: 20 },
        { input: 'X O .\nX O .\nX . .', expectedOutput: 'X', score: 20 },
      ],
    },
    {
      title: 'N-Queens Validator',
      description: 'Check if n queens can be placed on n×n board without attacking each other. Given positions, return "Valid" or "Invalid".\n\nInput: First line: n, next n lines: row col positions\nOutput: "Valid" or "Invalid"',
      sampleInput: '4\n0 1\n1 3\n2 0\n3 2',
      sampleOutput: 'Valid',
      testCases: [
        { input: '4\n0 1\n1 3\n2 0\n3 2', expectedOutput: 'Valid', score: 20 },
        { input: '4\n0 0\n1 1\n2 2\n3 3', expectedOutput: 'Invalid', score: 20 },
        { input: '2\n0 0\n1 1', expectedOutput: 'Invalid', score: 20 },
        { input: '1\n0 0', expectedOutput: 'Valid', score: 20 },
        { input: '3\n0 0\n1 2\n2 1', expectedOutput: 'Valid', score: 20 },
      ],
    },
    {
      title: 'A* Heuristic Calculator',
      description: 'Calculate A* f-score: f(n) = g(n) + h(n). Given current cost g and heuristic h, return f.\n\nInput: Two integers: g (actual cost) and h (heuristic)\nOutput: f-score (g + h)',
      sampleInput: '5 3',
      sampleOutput: '8',
      testCases: [
        { input: '5 3', expectedOutput: '8', score: 20 },
        { input: '10 5', expectedOutput: '15', score: 20 },
        { input: '0 0', expectedOutput: '0', score: 20 },
        { input: '7 2', expectedOutput: '9', score: 20 },
        { input: '15 10', expectedOutput: '25', score: 20 },
      ],
    },
    {
      title: 'Minimax Score Evaluator',
      description: 'Evaluate game state scores. Given scores for terminal states, return the maximum score (maximizing player perspective).\n\nInput: First line: n, next n lines: scores\nOutput: Maximum score',
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
  ];

  await prisma.question.deleteMany({
    where: { eventId: aiEvent.id },
  });

  for (const q of aiQuestions) {
    await prisma.question.create({
      data: {
        eventId: aiEvent.id,
        title: q.title,
        description: q.description,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        testCases: q.testCases,
        correctAnswer: null,
      },
    });
  }

  console.log('✅ Added 5 Artificial Intelligence questions');

  // ===== MACHINE LEARNING EVENT =====
  let mlEvent = await prisma.event.findFirst({
    where: {
      title: 'Machine Learning Challenge',
      language: 'Python',
    },
  });

  if (!mlEvent) {
    mlEvent = await prisma.event.create({
      data: {
        title: 'Machine Learning Challenge',
        language: 'Python',
        description: 'Implement ML algorithms from scratch: data preprocessing, model evaluation, feature engineering, and algorithm implementation.',
        maxParticipants: 120,
        createdByAdminId: admin.id,
        status: 'DRAFT',
      },
    });
  }

  console.log('✅ Created Machine Learning event');

  const mlQuestions = [
    {
      title: 'Mean Squared Error Calculator',
      description: 'Calculate MSE between predicted and actual values. MSE = mean((predicted - actual)²).\n\nInput: First line: n, next n lines: predicted actual pairs\nOutput: MSE (rounded to 2 decimal places)',
      sampleInput: '3\n2.5 3.0\n1.8 2.0\n4.2 4.0',
      sampleOutput: '0.08',
      testCases: [
        { input: '3\n2.5 3.0\n1.8 2.0\n4.2 4.0', expectedOutput: '0.08', score: 20 },
        { input: '2\n1.0 1.0\n2.0 2.0', expectedOutput: '0.00', score: 20 },
        { input: '3\n0.0 1.0\n0.0 1.0\n0.0 1.0', expectedOutput: '1.00', score: 20 },
        { input: '4\n1.0 2.0\n2.0 1.0\n3.0 3.0\n4.0 4.0', expectedOutput: '0.50', score: 20 },
        { input: '2\n5.0 5.5\n6.0 6.5', expectedOutput: '0.25', score: 20 },
      ],
    },
    {
      title: 'Data Normalization (Min-Max)',
      description: 'Normalize data using min-max scaling: (x - min) / (max - min).\n\nInput: First line: n, next n lines: values\nOutput: Normalized values (one per line, rounded to 2 decimals)',
      sampleInput: '3\n10\n20\n30',
      sampleOutput: '0.00\n0.50\n1.00',
      testCases: [
        { input: '3\n10\n20\n30', expectedOutput: '0.00\n0.50\n1.00', score: 20 },
        { input: '2\n5\n15', expectedOutput: '0.00\n1.00', score: 20 },
        { input: '4\n0\n25\n50\n100', expectedOutput: '0.00\n0.25\n0.50\n1.00', score: 20 },
        { input: '3\n1\n1\n1', expectedOutput: '0.00\n0.00\n0.00', score: 20 },
        { input: '5\n10\n20\n30\n40\n50', expectedOutput: '0.00\n0.25\n0.50\n0.75\n1.00', score: 20 },
      ],
    },
    {
      title: 'K-Means Distance Calculator',
      description: 'Calculate Euclidean distance from a point to cluster centers. Return index of nearest center (0-indexed).\n\nInput: First line: point (x y), next line: k, next k lines: centers (x y)\nOutput: Index of nearest center',
      sampleInput: '2 3\n3\n1 1\n5 5\n3 3',
      sampleOutput: '2',
      testCases: [
        { input: '2 3\n3\n1 1\n5 5\n3 3', expectedOutput: '2', score: 20 },
        { input: '0 0\n2\n1 1\n-1 -1', expectedOutput: '1', score: 20 },
        { input: '5 5\n2\n0 0\n10 10', expectedOutput: '0', score: 20 },
        { input: '3 3\n1\n3 3', expectedOutput: '0', score: 20 },
        { input: '1 1\n3\n0 0\n2 2\n1 1', expectedOutput: '2', score: 20 },
      ],
    },
    {
      title: 'Accuracy Score Calculator',
      description: 'Calculate classification accuracy: (correct predictions / total) * 100.\n\nInput: First line: n, next n lines: predicted actual pairs\nOutput: Accuracy percentage (rounded to 2 decimals)',
      sampleInput: '5\n1 1\n0 0\n1 1\n0 1\n1 0',
      sampleOutput: '60.00',
      testCases: [
        { input: '5\n1 1\n0 0\n1 1\n0 1\n1 0', expectedOutput: '60.00', score: 20 },
        { input: '3\n1 1\n1 1\n1 1', expectedOutput: '100.00', score: 20 },
        { input: '4\n0 0\n0 1\n1 0\n1 1', expectedOutput: '50.00', score: 20 },
        { input: '2\n1 0\n0 1', expectedOutput: '0.00', score: 20 },
        { input: '6\n1 1\n0 0\n1 1\n0 0\n1 1\n0 0', expectedOutput: '100.00', score: 20 },
      ],
    },
    {
      title: 'Feature Correlation Calculator',
      description: 'Calculate correlation coefficient between two features. Use Pearson correlation formula.\n\nInput: First line: n, next n lines: x y pairs\nOutput: Correlation coefficient (rounded to 2 decimals)',
      sampleInput: '5\n1 2\n2 4\n3 6\n4 8\n5 10',
      sampleOutput: '1.00',
      testCases: [
        { input: '5\n1 2\n2 4\n3 6\n4 8\n5 10', expectedOutput: '1.00', score: 20 },
        { input: '3\n1 1\n2 2\n3 3', expectedOutput: '1.00', score: 20 },
        { input: '4\n1 3\n2 2\n3 1\n4 0', expectedOutput: '-1.00', score: 20 },
        { input: '3\n1 1\n2 3\n3 2', expectedOutput: '0.50', score: 20 },
        { input: '5\n1 5\n2 4\n3 3\n4 2\n5 1', expectedOutput: '-1.00', score: 20 },
      ],
    },
  ];

  await prisma.question.deleteMany({
    where: { eventId: mlEvent.id },
  });

  for (const q of mlQuestions) {
    await prisma.question.create({
      data: {
        eventId: mlEvent.id,
        title: q.title,
        description: q.description,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        testCases: q.testCases,
        correctAnswer: null,
      },
    });
  }

  console.log('✅ Added 5 Machine Learning questions');

  console.log('✨ Seeding completed!');
  console.log('\n📊 Summary:');
  console.log('   - Python Event: 5 questions');
  console.log('   - C Event: 5 questions');
  console.log('   - Java Event: 5 questions');
  console.log('   - Computer Science Fundamentals: 5 questions');
  console.log('   - Software Applications: 5 questions');
  console.log('   - Artificial Intelligence: 5 questions');
  console.log('   - Machine Learning: 5 questions');
  console.log('   - Total: 35 questions across 7 events');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

