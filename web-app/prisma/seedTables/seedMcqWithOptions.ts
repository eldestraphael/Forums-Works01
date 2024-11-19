import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedMcqWithOptions() {
  const data = JSON.parse(
    fs.readFileSync("./prisma/seedData/mcqWithOptions.json", "utf-8")
  );

  let mcqList: any = [];

  for (let mcq of data) {
    // Check if the MCQ already exists
    let existingMcq = await prisma.forum_health_mcqs.findUnique({
      where: { id: mcq.mcq_id },
    });

    if (existingMcq) {
      // Update the existing MCQ
      await prisma.forum_health_mcqs.update({
        where: { id: mcq.mcq_id },
        data: {
          mcq_title: mcq.mcq_title,
          mcq_description: mcq.mcq_description,
          keyword: mcq.keyword,
          is_active: true,
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      // Create a new MCQ
      await prisma.forum_health_mcqs.create({
        data: {
          id: mcq.mcq_id,
          mcq_title: mcq.mcq_title,
          mcq_description: mcq.mcq_description,
          keyword: mcq.keyword,
          is_active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }

    let mcq_option_list: any = [];

    for (let option of mcq.options) {
      // Check if the option already exists
      let existingOption = await prisma.health_mcq_options.findUnique({
        where: { id: option.mcq_option_id },
      });

      if (existingOption) {
        // Update the existing option
        await prisma.health_mcq_options.update({
          where: { id: option.mcq_option_id },
          data: {
            forum_health_mcq_id: mcq.mcq_id,
            mcq_option_description: option.mcq_option_description,
            mcq_option: option.mcq_option,
            mcq_option_value: option.mcq_option_value,
            is_active: true,
            updatedAt: new Date().toISOString(),
          },
        });
      } else {
        // Create a new option
        await prisma.health_mcq_options.create({
          data: {
            id: option.mcq_option_id,
            forum_health_mcq_id: mcq.mcq_id,
            mcq_option_description: option.mcq_option_description,
            mcq_option: option.mcq_option,
            mcq_option_value: option.mcq_option_value,
            is_active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }

      let obj = {
        mcq_option_id: option.mcq_option_id,
        mcq_option_value: option.mcq_option_value,
      };

      mcq_option_list.push(obj);
    }

    mcqList.push({
      mcq_id: mcq.mcq_id,
      mcq_option_list,
    });
  }

  fs.writeFile(
    "prisma/seedData/mcqPerOption.json",
    JSON.stringify(mcqList),
    (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
      }
    }
  );
}

// Run the seeding function
seedMcqWithOptions()
  .then(() => {
    console.log("Seeding completed.");
  })
  .catch((e) => {
    console.error("Seeding failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
