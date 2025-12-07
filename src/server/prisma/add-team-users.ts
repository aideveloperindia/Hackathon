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

  // Create master student records and student accounts
  for (const user of teamUsers) {
    // Create or update master student
    let masterStudent = await prisma.masterStudent.findUnique({
      where: { htNo: user.htNo },
    });

    if (!masterStudent) {
      masterStudent = await prisma.masterStudent.create({
        data: {
          htNo: user.htNo,
          name: user.name,
          branch: user.branch,
          section: user.section,
          year: user.year,
          phoneNumber: user.phoneNumber,
        },
      });
      console.log(`   ✅ Created master student: ${user.htNo} - ${user.name}`);
    } else {
      // Update phone number if needed
      await prisma.masterStudent.update({
        where: { htNo: user.htNo },
        data: { phoneNumber: user.phoneNumber },
      });
      console.log(`   ✅ Updated master student: ${user.htNo} - ${user.name}`);
    }

    // Create student account if it doesn't exist
    const existingStudent = await prisma.student.findUnique({
      where: { masterStudentId: masterStudent.id },
    });

    if (!existingStudent) {
      // Create a dummy email for the student account (HT-based)
      const dummyEmail = `${user.htNo.toLowerCase()}@jits.local`;
      const passwordHash = await hashPassword(user.phoneNumber); // Use phone number as password hash (for compatibility)

      await prisma.student.create({
        data: {
          masterStudentId: masterStudent.id,
          email: dummyEmail,
          passwordHash: passwordHash,
          isEmailVerified: true, // Auto-verified for team users
          emailVerifyToken: null,
          emailVerifyExpiry: null,
        },
      });
      console.log(`   ✅ Created student account for: ${user.htNo}`);
    } else {
      console.log(`   ✅ Student account already exists for: ${user.htNo}`);
    }
  }

  console.log(`\n✅ Successfully added ${teamUsers.length} team users`);
  console.log('\n📝 These users can now login with:');
  console.log('   - Hall Ticket Number');
  console.log('   - Phone Number (as password)');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

