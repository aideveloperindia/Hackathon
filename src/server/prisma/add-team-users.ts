import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Removing all existing students and master students...');

  // Delete all students first (they reference master students)
  const deletedStudents = await prisma.student.deleteMany({});
  console.log(`   Deleted ${deletedStudents.count} student accounts`);

  // Delete all master students
  const deletedMasterStudents = await prisma.masterStudent.deleteMany({});
  console.log(`   Deleted ${deletedMasterStudents.count} master student records`);

  console.log('\n✅ All existing users removed\n');

  console.log('👥 Adding team users...');

  // Team users data
  const teamUsers = [
    {
      htNo: '22271A6651',
      name: 'M.SURAJ',
      phoneNumber: '7842413888',
      branch: 'CSM',
      section: 'A',
      year: 4,
    },
    {
      htNo: '22271A6652',
      name: 'G.VAISHNAVI',
      phoneNumber: '9177577070',
      branch: 'CSM',
      section: 'A',
      year: 4,
    },
    {
      htNo: '22271A6629',
      name: 'V.RAMANJALI',
      phoneNumber: '9652950020',
      branch: 'CSM',
      section: 'A',
      year: 4,
    },
    {
      htNo: '232275A6601',
      name: 'N.VAMSHI',
      phoneNumber: '7095265242',
      branch: 'CSM',
      section: 'A',
      year: 4,
    },
  ];

  // Create master student records
  for (const user of teamUsers) {
    const masterStudent = await prisma.masterStudent.create({
      data: {
        htNo: user.htNo,
        name: user.name,
        branch: user.branch,
        section: user.section,
        year: user.year,
        phoneNumber: user.phoneNumber, // This will be added when they complete profile via Gmail
      },
    });
    console.log(`   ✅ Created master student: ${user.htNo} - ${user.name}`);
  }

  console.log(`\n✅ Successfully added ${teamUsers.length} team users`);
  console.log('\n📝 Note: These users can login with Gmail and will be automatically');
  console.log('   linked to their HT numbers when they complete their profile.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

