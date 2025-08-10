const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function checkAdmins() {
  try {
    console.log("Checking admins...");

    const admins = await prisma.users.findMany({
      where: {
        role: "admin",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(`Found ${admins.length} admins:`);
    admins.forEach((admin, index) => {
      console.log(
        `${index + 1}. ${admin.name} (${admin.email}) - Role: ${admin.role}`
      );
    });

    if (admins.length === 0) {
      console.log("\nNo admins found. Creating a test admin...");

      const hashedPassword = await bcrypt.hash("admin123", 10);

      const newAdmin = await prisma.users.create({
        data: {
          name: "Test Admin",
          email: "admin@test.com",
          password: hashedPassword,
          role: "admin",
        },
      });

      console.log(`Created admin: ${newAdmin.name} (${newAdmin.email})`);
      console.log("Password: admin123");
    }
  } catch (error) {
    console.error("Error checking admins:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();
