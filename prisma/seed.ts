import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    "Art Workshop",
    "Dance",
    "Food Festival",
    "Mud Pot Event",
    "Tech Meetup",
    "Strangers Meetup",
    "Standup Comedy",
    "Cinema",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
      },
    });
  }

  console.log("Categories seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
