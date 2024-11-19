import fs from "fs";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { JsonCsvConvertor } from "../helpers/JsonCsvConvertor";
import { generatePassword } from "../helpers/passwordGenerator";
import { StaticMessage } from "../constants/StaticMessages";
import { EmailController } from "../helpers/emailService";
import * as bcrypt from "bcrypt";

export class UploadUserController {
  async uploadCsv(file: any) {
    let userAddedCount = 0; // Track the number of successfully added users

    try {
      if (!file) {
        throw this.createError(400, StaticMessage.FileNotUploaded);
      }

      const path = await this.saveFile(file);
      const data = await new JsonCsvConvertor().csvToJson(path);

      const role = await this.getRole("Client Forum Member");

      for (let item of data) {
        try {
          const existingUser = await this.findUserByEmail(item.email);

          if (!existingUser) {
            await this.processNewUser(item, role[0].uuid);
            userAddedCount += 1;
          } else {
            await this.linkUserToForum(existingUser, item);
          }
        } catch (innerError) {
          continue;
        }
      }

      fs.unlinkSync(path);
      return {
        message: `${userAddedCount} ${StaticMessage.CsvUploaded}`,
        data: null,
      };
    } catch (err: any) {
      err.successCount = userAddedCount;
      throw err;
    }
  }

  private async saveFile(file: any): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const path = `./uploads/${file.name}`;

    await writeFile(path, buffer).catch(() => {
      throw this.createError(400, StaticMessage.FileNotUploaded);
    });
    return path;
  }

  private async getRole(roleName: string) {
    return prisma.roles.findMany({ where: { name: roleName } });
  }

  private async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email, is_active: true },
    });
  }

  private async processNewUser(item: any, roleUuid: string) {
    const company = await this.findCompany(item.company);
    const forum = await this.findForum(company.id, item.forum);

    const userDetails = await this.buildUserDetail(item);
    const user = await this.createUserDetails(
      {
        company_id: company.id,
        ...userDetails.user,
      },
      roleUuid
    );

    if (userDetails.password) {
      await new EmailController().sendPasswordToUser(
        user.email,
        userDetails.password
      );
    }

    await prisma.user_forum.create({
      data: {
        user_id: user.id,
        forum_id: forum.id,
      },
    });
  }

  private async linkUserToForum(user: any, item: any) {
    const company = await this.findCompany(item.company);
    const forum = await this.findForum(company.id, item.forum);

    const isUserLinked = await prisma.user_forum.findFirst({
      where: { user_id: user.id, forum_id: forum.id },
    });

    await prisma.user_forum.create({
      data: {
        user_id: user.id,
        forum_id: forum.id,
      },
    });
  }

  private async findCompany(companyName: string) {
    const company = await prisma.company.findFirst({
      where: { company_name: companyName.trim(), is_active: true },
    });
    if (!company) {
      throw this.createError(404, StaticMessage.CompanyNotFound);
    }
    return company;
  }

  private async findForum(companyId: number, forumName: string) {
    const forum = await prisma.forum.findFirst({
      where: {
        forum_name: forumName.trim(),
        company_id: companyId,
        is_active: true,
      },
    });
    if (!forum) {
      throw this.createError(404, StaticMessage.ForumNotFound);
    }
    return forum;
  }

  private async createUserDetails(data: any, roleUuid: string) {
    return prisma.user.create({
      data: { ...data, role_uuid: roleUuid },
    });
  }

  private async buildUserDetail(data: any) {
    const password =
      data.password.toLowerCase() === "yes" ? generatePassword() : null;
    return {
      password: password,
      user: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: password ? await bcrypt.hash(password, 10) : null,
        phone: data.phone.length ? data.phone : null,
        job_title: data.job_title,
      },
    };
  }

  private createError(statusCode: number, message: string) {
    return { statusCode, data: null, message };
  }
}
