import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';

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

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

