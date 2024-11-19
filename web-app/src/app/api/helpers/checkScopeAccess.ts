import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";

export async function checkScopeAccess(
  roleUuid: string,
  subModuleKeyword: string,
  actionKey: string
) {
  try {
    const rolePrivilege = await prisma.role_privileges.findFirst({
      where: {
        role_uuid: roleUuid,
        sub_modules: {
          keyword: subModuleKeyword,
        },
      },
      select: {
        sub_modules: {
          select: {
            uuid: true,
          },
        },
      },
    });

    if (rolePrivilege === null) {
      throw {
        statusCode: 401,
        message: StaticMessage.InvalidScopeProvided,
        data: null,
      };
    }

    const isActionExist: any =
      await prisma.$queryRaw`SELECT CAST(COUNT(*) AS INTEGER)
  FROM public."role_privileges" rp
  LEFT JOIN public."sub_modules" sub_mod ON sub_mod.keyword = ${subModuleKeyword}
  LEFT JOIN public."actions" actions ON actions.uuid = rp.action_uuid
  WHERE rp.sub_module_uuid = ${rolePrivilege?.sub_modules.uuid}
  AND actions.keyword = ${actionKey}
  AND rp.role_uuid = ${roleUuid}`;

    if (isActionExist[0].count === 0) {
      throw {
        statusCode: 401,
        message: StaticMessage.InvalidScopeProvided,
        data: null,
      };
    }
    return true;
  } catch (err: any) {
    throw err;
  }
}
