// Script to verify and clean up test events
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const admin = await prisma.admin.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!admin) {
      console.log('No admin found');
      return;
    }

    console.log(`Admin: ${admin.email}\n`);

    // Delete events with date suffixes
    const deleted = await prisma.event.deleteMany({
      where: {
        title: { contains: '- Test 2026-01-18' },
        createdByAdminId: admin.id,
      },
    });
    console.log(`✅ Deleted ${deleted.count} duplicate events with date suffixes\n`);

    // Get all draft events
    const drafts = await prisma.event.findMany({
      where: {
        status: 'DRAFT',
        createdByAdminId: admin.id,
      },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
        questions: {
          select: {
            title: true,
            correctAnswer: true,
          },
          take: 3,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('📋 DRAFT Events in Database:');
    console.log('='.repeat(60));
    drafts.forEach((e, i) => {
      console.log(`\n${i + 1}. ${e.title}`);
      console.log(`   Language: ${e.language}`);
      console.log(`   Questions: ${e._count.questions}`);
      console.log(`   Created: ${e.createdAt.toISOString()}`);
      if (e.questions.length > 0) {
        console.log(`   Sample Questions:`);
        e.questions.forEach((q) => {
          console.log(`     - ${q.title} (Correct Answer: ${q.correctAnswer || 'N/A'})`);
        });
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Total DRAFT events: ${drafts.length}`);
    console.log('\n💡 If events are not showing in dashboard:');
    console.log('   1. Refresh the browser (Ctrl+F5 or Cmd+Shift+R)');
    console.log('   2. Check browser console for errors');
    console.log('   3. Verify you are logged in as the correct admin');
  } catch (error: any) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
