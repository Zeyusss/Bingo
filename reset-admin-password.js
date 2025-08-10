const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log("Resetting admin password...");

    const email = "mo900150@gmail.com";
    const newPassword = "mostafa";

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedAdmin = await prisma.users.update({
      where: { email: email },
      data: {
        password: hashedPassword,
      },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    console.log(
      `Password reset for admin: ${updatedAdmin.name} (${updatedAdmin.email})`
    );
    console.log(`New password: ${newPassword}`);
    console.log("\nYou can now login to the admin panel with:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
  } catch (error) {
    console.error("Error resetting password:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
