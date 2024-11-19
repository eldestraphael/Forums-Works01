import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";

export class RolesController {
  async getAllRoles(roleUuid: string) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      const role = await prisma.roles.findUnique({
        where: {
          uuid: roleUuid,
        },
      });

      if (!role) {
        throw {
          statusCode: 404,
          message: StaticMessage.RoleNotFound,
        };
      }

      let whereCondition;

      switch (role.name) {
        case "Super Admin":
          whereCondition = {
            hierarchy: {
              in: [1, 2, 3, 4],
            },
          };
          break;
        case "Client Admin":
          whereCondition = {
            hierarchy: {
              in: [2, 3, 4],
            },
          };
          break;
        case "Client Forum Leader":
          whereCondition = {
            hierarchy: {
              in: [3, 4],
            },
          };
          break;
        case "Client Forum Member":
          whereCondition = {
            hierarchy: {
              in: [4],
            },
          };
          break;
        default:
          throw {
            statusCode: 401,
            message: StaticMessage.InvalidRoleProvided,
            data: null,
          };
      }

      const roles = await prisma.roles.findMany({
        where: whereCondition,
      });

      if (!roles) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.RolesNotFound,
        };
      }

      return {
        message: StaticMessage.RolesFetchedSuccessfully,
        data: roles,
      };
    } catch (err: any) {
      throw err;
    }
  }
}
