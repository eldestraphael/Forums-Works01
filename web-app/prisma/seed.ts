import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { seedCompanyUserForumData } from "./seedTables/seedCompanyUserForumData";
import { seedMcqWithOptions } from "./seedTables/seedMcqWithOptions";
import { seedACLData } from "./seedTables/seedACLData";
import { parseArgs } from "node:util";
import { seedCourseChapterData } from "./seedTables/seedCourseChapterData";
import { seedCompanyUserForNewForumData } from "./seedTables/seedCompanyUserForNewForumData";
import { seedForumCourses } from "./seedTables/seedForumCourses";
import { updatedseed } from "./seedTables/Updatedseed";
import { seedProdDefaultUser } from "./seedTables/seedProdDefaultUser";

// npx prisma db seed -- --environment develop
// npx prisma db seed -- --environment prod

const options = {
  environment: { type: "string" },
};

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options } as any);

  switch (environment) {
    case "prod":
      await seedACLData("prod");
      await seedMcqWithOptions();
      await seedProdDefaultUser();
      break;
    case "develop":
      await seedACLData("develop");
      // await seedCourseChapterData();
      await seedMcqWithOptions();
      // await seedCompanyUserForumData();
      // await seedCompanyUserForNewForumData();
      await updatedseed();
      // await seedForumCourses();
      break;
    default:
      break;
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
