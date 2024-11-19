import axios from "axios";
import prisma from "@/lib/prisma";
import { StaticMessage } from "../../constants/StaticMessages";

export class ThinkficUserController {
  async migrateUserFromThinkfic(pageNumber: number, limit: number) {
    try {
      const metaItems = await prisma?.faw_thinkific_user_meta.findFirst({
        select: {
          id: true,
          thinkific_total_items: true,
        },
        orderBy: {
          id: "desc",
        },
      });

      if (metaItems === null) {
        const userMeta: any = await this.getUserFromThinkfic(pageNumber, limit);

        const matadata = await prisma.faw_thinkific_user_meta.create({
          data: {},
        });

        const { total_items } = userMeta.data.meta.pagination;
        const fetchedRecords = await this.fetchRecords(
          total_items,
          pageNumber,
          limit,
          matadata.id
        );

        await prisma.faw_thinkific_user_meta.update({
          data: {
            migrated_count: fetchedRecords,
            thinkific_total_items: fetchedRecords,
          },
          where: {
            id: matadata.id,
          },
        });

        return {
          messages: StaticMessage.FetchUsers,
          data: null,
        };
      } else {
        const userMeta: any = await this.getUserFromThinkfic(pageNumber, limit);

        const previousFinalPage = Math.ceil(
          metaItems?.thinkific_total_items! / limit
        );

        const reminderValue = metaItems?.thinkific_total_items! % limit;
        const currentPageNumber =
          reminderValue === 0 ? previousFinalPage + 1 : previousFinalPage;
        const currentItemsCount = userMeta.data.meta.pagination.total_items;

        let newMeta = await prisma.faw_thinkific_user_meta.create({
          data: {},
        });

        const fetchedRecords = await this.fetchRecords(
          currentItemsCount - metaItems?.thinkific_total_items!,
          currentPageNumber,
          limit,
          newMeta.id
        );

        await prisma.faw_thinkific_user_meta.update({
          data: {
            migrated_count: fetchedRecords,
            thinkific_total_items:
              metaItems?.thinkific_total_items! + fetchedRecords,
          },
          where: {
            id: newMeta.id,
          },
        });

        return {
          messages: StaticMessage.FetchUsers,
          data: null,
        };
      }
    } catch (err: any) {
      throw err;
    }
  }

  async fetchRecords(
    itemsCount: number,
    pageNumber: number,
    limit: number,
    thinkificMetadataId: number
  ) {
    let fetchedRecords = 0;

    let companyNullCount = 0;

    let duplicateUser = 0;

    while (fetchedRecords < itemsCount) {
      const remainingRecords = itemsCount - fetchedRecords;
      let recordsToFetch = Math.min(limit, remainingRecords);

      const userData: any = await this.getUserFromThinkfic(pageNumber, limit);

      for (let item of userData.data.items) {
        if (item.company !== null) {
          let company = await prisma.company.findFirst({
            where: {
              company_name: item.company,
            },
          });

          const existingUser = await prisma.user.findFirst({
            where: { thinkfic_user_id: item.id },
          });

          if (!existingUser) {
            const existingUserByEmail = await prisma.user.findFirst({
              where: { email: item.email },
            });
            if (!existingUserByEmail) {
              company =
                company === null
                  ? item.company !== ""
                    ? await prisma.company.create({
                        data: {
                          company_name: item.company,
                        },
                      })
                    : await this.UnknownCompany()
                  : company;

              await prisma.user.create({
                data: {
                  first_name: item.first_name,
                  last_name: item.last_name,
                  company_id: company.id,
                  email: item.email,
                  faw_thinkific_user_meta_id: thinkificMetadataId,
                  thinkfic_user_id: item.id,
                  role_uuid: (await this.getDefaultRole())?.uuid,
                },
              });
            } else {
              duplicateUser += 1;
            }
          } else {
            duplicateUser += 1;
          }
        } else {
          companyNullCount += 1;
        }
      }
      fetchedRecords += userData.data.items.length;
      pageNumber += 1;
    }

    return fetchedRecords - (companyNullCount + duplicateUser);
  }

  async getUserFromThinkfic(pageNumber: number, limit: number) {
    try {
      const userMeta: any = await axios.get(
        `https://api.thinkific.com/api/public/v1/users?page=${pageNumber}&limit=${limit}`,
        {
          headers: {
            "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
            "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
          },
        }
      );
      return userMeta;
    } catch (err: any) {
      throw err;
    }
  }

  async UnknownCompany() {
    try {
      let unknownCompany = await prisma.company.findFirst({
        where: {
          company_name: "Users Without Company",
        },
      });

      if (!unknownCompany) {
        unknownCompany = await prisma.company.create({
          data: {
            company_name: "Users Without Company",
          },
        });
      }

      return unknownCompany!;
    } catch (err: any) {
      throw err;
    }
  }

  async getDefaultRole() {
    try {
      let defaultRole = await prisma.roles.findFirst({
        where: {
          name: "Client Forum Member",
        },
      });

      return defaultRole;
    } catch (err: any) {
      throw err;
    }
  }
}
