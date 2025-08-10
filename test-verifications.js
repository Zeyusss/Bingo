const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkVerifications() {
  try {
    console.log("Checking pending verifications...");

    const pendingVerifications = await prisma.sellers.findMany({
      where: {
        OR: [
          { verificationStatus: "Pending" },
          { verificationStatus: "RequiresResubmission" },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        verificationSubmittedAt: true,
        idFrontImage: true,
        idBackImage: true,
        contractSignedImage: true,
        personalImage: true,
      },
    });

    console.log(`Found ${pendingVerifications.length} pending verifications:`);
    pendingVerifications.forEach((seller, index) => {
      console.log(`${index + 1}. ${seller.name} (${seller.email})`);
      console.log(`   Status: ${seller.verificationStatus}`);
      console.log(`   Submitted: ${seller.verificationSubmittedAt}`);
      console.log(
        `   Documents: Front ID: ${!!seller.idFrontImage}, Back ID: ${!!seller.idBackImage}, Contract: ${!!seller.contractSignedImage}, Personal: ${!!seller.personalImage}`
      );
      console.log("");
    });

    // Also check total sellers and their statuses
    const statusCounts = await prisma.sellers.groupBy({
      by: ["verificationStatus"],
      _count: {
        verificationStatus: true,
      },
    });

    console.log("Verification status counts:");
    statusCounts.forEach((status) => {
      console.log(
        `${status.verificationStatus}: ${status._count.verificationStatus}`
      );
    });
  } catch (error) {
    console.error("Error checking verifications:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVerifications();
