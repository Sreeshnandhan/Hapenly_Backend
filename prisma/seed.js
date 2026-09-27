"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=seed.js.map