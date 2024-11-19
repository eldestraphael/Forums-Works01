import { PrismaClient } from "@prisma/client";
let uuidv4 = require("uuid");
const prisma = new PrismaClient();

export async function seedCourseChapterData() {
  const defaultCount = 100000;
  const courseSize = 3;
  const chapterSize = 3;

  let chapterDetails = [];

  await prisma.courses.deleteMany({});

  for (let size = 1; size <= courseSize; size++) {
    await prisma.courses.create({
      data: {
        id: size + defaultCount,
        uuid: uuidv4.v4(),
        name: `Course ${size}`,
        description: `Course ${size} description`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    for (let cSize = 1; cSize <= chapterSize; cSize++) {
      let chapter = await prisma.chapters.create({
        data: {
          id: (size - 1) * chapterSize + cSize + defaultCount,
          uuid: uuidv4.v4(),
          course_id: size + defaultCount,
          name: `Course${size} Chapter${cSize}`,
          description: `Course${size} Chapter${cSize} description`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      chapterDetails.push(chapter);
    }
  }
}
