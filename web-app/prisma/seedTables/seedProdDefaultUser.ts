import { AssetType, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import * as bcrypt from "bcrypt";

export async function seedProdDefaultUser() {
  try {
    let password = await bcrypt.hash(process.env.NEXTAUTH_SECRET!, 10);
    const role = await prisma.roles.findFirst({
      where: {
        name: "Super Admin",
      },
      select: {
        uuid: true,
      },
    });

    let existingCompany = await prisma.company.findFirst({
      where: { company_name: "Forums@Work" },
    });

    if (existingCompany) {
      await prisma.company.update({
        where: {
          id: existingCompany.id,
        },
        data: {
          company_name: "Forums@Work",
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      existingCompany = await prisma.company.create({
        data: {
          company_name: "Forums@Work",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }

    let existingUser = await prisma.user.findFirst({
      where: { email: "tech@forumsatwork.com" },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: password,
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      existingUser = await prisma.user.create({
        data: {
          first_name: "Philip",
          last_name: "Moses",
          email: "tech@forumsatwork.com",
          password: password,
          company_id: existingCompany.id,
          phone: "19191919199",
          job_title: "Tech Support",
          role_uuid: role?.uuid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  } catch (err: any) {
    throw err;
  }
}
