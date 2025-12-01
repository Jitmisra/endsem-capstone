const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edustore.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@edustore.com',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@edustore.com' },
    update: {},
    create: {
      name: 'Student User',
      email: 'student@edustore.com',
      passwordHash: studentPassword,
      role: 'student',
    },
  });
  console.log('✅ Student user created:', student.email);

  // Create sample subjects for different classes
  const subjects = [
    // Class 1-5
    { name: 'English', class: 1 },
    { name: 'Mathematics', class: 1 },
    { name: 'Hindi', class: 1 },
    
    { name: 'English', class: 5 },
    { name: 'Mathematics', class: 5 },
    { name: 'Environmental Studies', class: 5 },
    
    // Class 6-8
    { name: 'English', class: 6 },
    { name: 'Mathematics', class: 6 },
    { name: 'Science', class: 6 },
    { name: 'Social Science', class: 6 },
    { name: 'Hindi', class: 6 },
    
    // Class 9-10
    { name: 'English', class: 9 },
    { name: 'Mathematics', class: 9 },
    { name: 'Science', class: 9 },
    { name: 'Social Science', class: 9 },
    { name: 'Hindi', class: 9 },
    
    { name: 'English', class: 10 },
    { name: 'Mathematics', class: 10 },
    { name: 'Science', class: 10 },
    { name: 'Social Science', class: 10 },
    { name: 'Hindi', class: 10 },
    
    // Class 11-12 (Science Stream)
    { name: 'English', class: 11 },
    { name: 'Physics', class: 11 },
    { name: 'Chemistry', class: 11 },
    { name: 'Mathematics', class: 11 },
    { name: 'Biology', class: 11 },
    
    { name: 'English', class: 12 },
    { name: 'Physics', class: 12 },
    { name: 'Chemistry', class: 12 },
    { name: 'Mathematics', class: 12 },
    { name: 'Biology', class: 12 },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: {
        name_class: {
          name: subject.name,
          class: subject.class,
        },
      },
      update: {},
      create: subject,
    });
  }
  console.log(`✅ Created ${subjects.length} subjects`);

  console.log('\n🎉 Seeding completed!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin:');
  console.log('  Email: admin@edustore.com');
  console.log('  Password: admin123');
  console.log('\nStudent:');
  console.log('  Email: student@edustore.com');
  console.log('  Password: student123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
