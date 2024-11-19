import axios from "axios";
import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";
import { CompanyValidator } from "../validators/CompanyValidator";
import { Company } from "../infrastructure/dtos/Company";
import {
  getConditionBasedOnScope,
  getConditionBasedOnScopeForFilter,
  getScopeForFilter,
} from "../helpers/getUserScope";
import { ValidationError } from "yup";
import { getCompanyScope } from "../helpers/getCompanyScope";
import { checkScopeAccess } from "../helpers/checkScopeAccess";
import { CompanyInfoByCompanyUuidResponse } from "../infrastructure/dtos/CompanyInfoByCompanyUuidResponse";
import {
  CompanyInfo,
  CompanyListItem,
  CompanyListResponse,
} from "../infrastructure/dtos/CompanyListResponse";
import { weightedMomentumBasedOnCompany } from "./HealthControllet";
import { ProviderType } from "@prisma/client";

export class CompanyContoller {
  async Search(userId: number, roleUuid: string, request: any) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      const scope = await getScopeForFilter(userId);

      let whereCondition = await getCompanyScope(scope, userId);

      const company_info = await prisma.company.findMany({
        where: {
          AND: [
            {
              company_name: {
                contains: request.nextUrl.searchParams.get("q"),
                mode: "insensitive",
              },
              is_active: true,
            },
            whereCondition,
          ],
        },
      });

      return { message: StaticMessage.companyFetched, data: company_info };
    } catch (error: any) {
      throw error;
    }
  }

  async CreateCompany(roleUuid: string, body: Company) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "add_company", "create");

      await new CompanyValidator().Company(body);

      const isCompanyExist = await prisma.company.findFirst({
        where: {
          company_name: body.company_name,
        },
      });

      if (isCompanyExist) {
        throw {
          message: StaticMessage.CompanyAlreadyExist,
          data: null,
          statusCode: 404,
        };
      }

      const company = await prisma.company.create({
        data: {
          company_name: body.company_name,
        },
      });

      return {
        message: StaticMessage.CompanyCreatedSuccessfully,
        data: {
          company_info: {
            id: company.id,
            uuid: company.uuid,
            company_name: company.company_name,
          },
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getCompanyDetailByUuid(
    userId: number,
    companyUuid: string,
    roleUuid: string
  ) {
    try {
      await checkScopeAccess(roleUuid, "view_company", "read");

      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      const scope = await getScopeForFilter(userId);

      let condition = await getCompanyScope(scope, userId);

      const company: any = await prisma.company.findFirst({
        where: {
          AND: [{ uuid: companyUuid }, condition],
        },
        select: {
          id: true,
          uuid: true,
          company_name: true,
          createdAt: true,
        },
      });

      const isTokenExist = await prisma.oauth_provider_token.findFirst({
        where: {
          company_id: company?.id,
        },
        select: {
          expiry: true,
        },
        orderBy: {
          expiry: "desc",
        },
      });

      let ms365 = false;

      if (isTokenExist) {
        const givenDate = new Date(isTokenExist?.expiry);
        const currentTimestamp = new Date();
        if (givenDate > currentTimestamp) {
          ms365 = true;
        }
      }

      if (!company) {
        throw {
          statusCode: 404,
          message: StaticMessage.CompanyNotFound,
          data: null,
        };
      }

      company["ms365"] = ms365;

      return {
        message: StaticMessage.CompanyFetchedSuccessfully,
        data: {
          company_info: company,
        },
      } as CompanyInfoByCompanyUuidResponse;
    } catch (err: any) {
      throw err;
    }
  }

  async getCompanyDetailsBasedOnSearch(
    userId: number,
    companyId: number,
    roleUuid: string,
    request: any
  ) {
    try {
      await checkScopeAccess(roleUuid, "all_companies", "read");

      const searchQuery = request.nextUrl.searchParams.get("search");
      const page = Number(request.nextUrl.searchParams.get("page"));
      const limit = Number(request.nextUrl.searchParams.get("limit"));
      const offset = (page - 1) * limit;

      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      const scope = await getScopeForFilter(userId);

      let condition = await getConditionBasedOnScope(scope, userId, companyId);

      const companyDetail: any = await prisma.$queryRaw`
    SELECT
        c.id,
        c.uuid,
        c.company_name,
        CAST(COUNT(DISTINCT u.id) AS INTEGER) AS total_users,
        CAST(COUNT(DISTINCT f.id) AS INTEGER) AS total_forums,
        CAST(COALESCE(ROUND(AVG(upfhs.score)), 0) AS INTEGER) AS forum_health,
        c.is_active,
        c."createdAt"
    FROM 
        "Company" c
    LEFT JOIN 
        "User" u ON c.id = u.company_id
    LEFT JOIN 
        "user_forum" uf ON u.id = uf.user_id
    LEFT JOIN 
        "Forum" f ON f.id = uf.forum_id
    LEFT JOIN 
        "user_per_forum_health_score" upfhs ON upfhs.user_id = u.id AND upfhs.forum_id = f.id
    WHERE 
        (${!searchQuery} OR (c.company_name ILIKE '%' || ${searchQuery} || '%'))
        ${condition}
    GROUP BY 
        c.id, c.uuid, c.company_name
    LIMIT ${limit} OFFSET ${offset};`;

      const count: any =
        await prisma.$queryRaw`SELECT CAST(COUNT(*) AS INTEGER) AS total_count
      FROM (SELECT
        c.id,
        c.uuid,
        c.company_name,
        CAST(COUNT(DISTINCT u.id) AS INTEGER) AS total_users,
        CAST(COUNT(DISTINCT f.id) AS INTEGER) AS total_forums,
        CAST(COALESCE(ROUND(AVG(upfhs.score)), 0) AS INTEGER) AS forum_health,
        c.is_active,
        c."createdAt"
        FROM 
            "Company" c
        LEFT JOIN 
            "User" u ON c.id = u.company_id
        LEFT JOIN 
            "user_forum" uf ON u.id = uf.user_id
        LEFT JOIN 
            "Forum" f ON f.id = uf.forum_id
        LEFT JOIN 
            "user_per_forum_health_score" upfhs ON upfhs.user_id = u.id AND upfhs.forum_id = f.id
        WHERE 
            (${!searchQuery} OR (c.company_name ILIKE '%' || ${searchQuery} || '%'))
            ${condition}
        GROUP BY 
            c.id, c.uuid, c.company_name
        ) AS subquery`;

      const companyMap: CompanyListItem[] = await Promise.all(
        companyDetail.map(async (item: CompanyInfo) => {
          return {
            company_info: {
              uuid: item.uuid,
              company_name: item.company_name,
              total_users: item.total_users,
              total_forums: item.total_forums,
              forum_health: await weightedMomentumBasedOnCompany(item.id),
              is_active: item.is_active,
              createdAt: new Date(item.createdAt)
                .toISOString()
                .replace("T", " ")
                .substring(0, 23),
            },
          };
        })
      );

      return {
        message: StaticMessage.CompanyFetchedSuccessfullyBasedOnSearch,
        data: companyMap,
        page_meta: {
          current: page,
          total: Math.ceil(count[0].total_count / limit),
          data_per_page: limit,
        },
      } as CompanyListResponse;
    } catch (err: any) {
      throw err;
    }
  }

  async updateCompany(body: any, companyUuid: string) {
    try {
      await new CompanyValidator().UpdateCompany(body);

      const isCompanyExist = await prisma.company.findUnique({
        where: {
          uuid: companyUuid,
        },
        select: {
          id: true,
          is_active: true,
          forum: {
            select: {
              user_forum: true,
            },
          },
        },
      });

      if (!isCompanyExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.CompanyNotFound,
        };
      }

      const userForum = isCompanyExist.forum.map((item) => item.user_forum);

      const userIds = userForum.flat().map((item: any) => item.user_id);

      const { is_active } = body;

      await prisma.$transaction([
        prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { is_active, updatedAt: new Date() },
        }),
        prisma.company.update({
          data: {
            is_active,
            updatedAt: new Date(),
          },
          where: {
            uuid: companyUuid,
          },
        }),
      ]);

      const message = is_active ? "enabled" : "disabled";

      return {
        message: `Company ${message} successfully`,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async updateCompanyName(body: Company, companyUuid: string) {
    try {
      await new CompanyValidator().Company(body);

      const isCompanyExist = await prisma.company.findUnique({
        where: {
          uuid: companyUuid,
        },
      });

      if (!isCompanyExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.CompanyNotFound,
        };
      }

      const { company_name } = body;
      await prisma.company.update({
        data: {
          company_name,
          updatedAt: new Date(),
        },
        where: {
          uuid: companyUuid,
        },
      });

      return {
        message: StaticMessage.CompanyNameUpdatedSuccessfully,
        data: null,
      };
    } catch (error: any) {
      throw error;
    }
  }

  //Will be deprecated in the next release
  async addMs365Token(body: any, companyUuid: string) {
    try {
      const isCompanyExist = await prisma.company.findUnique({
        where: {
          uuid: companyUuid,
        },
      });

      if (!isCompanyExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.CompanyNotFound,
        };
      }

      const { accessToken, expiresOn, ...restData } = body;

      await prisma.oauth_provider_token.create({
        data: {
          company_id: isCompanyExist.id,
          token: accessToken,
          expiry: new Date(expiresOn),
          type: ProviderType.microsoft,
          oauth_details: JSON.stringify(restData),
        },
      });

      return {
        message: StaticMessage.ms365TokenStored,
        data: null,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async addOauthToken(body: any, companyUuid: string) {
    try {
      const isCompanyExist = await prisma.company.findUnique({
        where: {
          uuid: companyUuid,
        },
      });

      if (!isCompanyExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.CompanyNotFound,
        };
      }

      const { accessToken, expiresOn, ...restData } = body;

      await prisma.oauth_provider_token.create({
        data: {
          company_id: isCompanyExist.id,
          token: accessToken,
          expiry: new Date(expiresOn),
          type: body.type,
          oauth_details: JSON.stringify(restData),
        },
      });

      return {
        message: StaticMessage.OauthTokenStored,
        data: null,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getAllUsersFromMS365InACompany(
    companyUuid: string,
    limit: number | null,
    search: string | null
  ) {
    try {
      const company = await prisma.company.findUnique({
        where: {
          uuid: companyUuid,
        },
      });

      if (!company) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.CompanyNotFound,
        };
      }

      const ms365Token = await prisma.oauth_provider_token.findFirst({
        where: {
          company_id: company.id,
        },
        select: {
          token: true,
          expiry: true,
        },
        orderBy: {
          expiry: "desc",
        },
      });

      if (!ms365Token) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.TokenNotPresent,
        };
      }

      const tokenExpiryDate = new Date(ms365Token.expiry);

      const currentTimestamp = new Date();

      if (!(tokenExpiryDate > currentTimestamp)) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.TokenExpired,
        };
      }

      let url = `https://graph.microsoft.com/v1.0/users?$select=givenName,surname,mail,jobTitle`;

      if (limit !== null && limit !== 0) {
        url = url + `&$top=${limit}`;
      }

      if (search) {
        url = url + `&$search="displayName:${search}"&$orderBy=displayName`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${ms365Token.token}`,
          ConsistencyLevel: "eventual",
        },
      });

      return {
        message: StaticMessage.Ms365UsersFetchedSuccessfully,
        data: response.data.value.map((item: any) => ({
          first_name: item.givenName,
          last_name: item.surname,
          email: item.mail,
          job_title: item.jobTitle,
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllUsersFromOauthInACompany(
    companyUuid: string,
    limit: number | null,
    search: string | null,
    oAuthType: keyof typeof ProviderType
  ) {
    try {
      const company = await prisma.company.findUnique({
        where: { uuid: companyUuid },
      });

      if (!company) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.CompanyNotFound,
        };
      }

      const oauthToken = await prisma.oauth_provider_token.findFirst({
        where: { company_id: company.id, type: oAuthType },
        select: { token: true, expiry: true, type: true },
        orderBy: { expiry: "desc" },
      });

      if (!oauthToken) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.TokenNotPresent,
        };
      }

      const tokenExpiryDate = new Date(oauthToken.expiry);
      const currentTimestamp = new Date();

      if (!(tokenExpiryDate > currentTimestamp)) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.TokenExpired,
        };
      }

      const oauthProviders: any = {
        microsoft: {
          baseUrl: `https://graph.microsoft.com/v1.0/users?$select=givenName,surname,mail,jobTitle`,
          headers: {
            Authorization: `Bearer ${oauthToken.token}`,
            ConsistencyLevel: "eventual",
          },
          constructUrl: (baseUrl: string) => {
            let url = baseUrl;
            if (limit !== null && limit !== 0) {
              url += `&$top=${limit}`;
            }
            if (search) {
              url += `&$search="displayName:${search}"&$orderBy=displayName`;
            }
            return url;
          },
          processResponse: (data: any) =>
            data.value.map((item: any) => ({
              first_name: item.givenName,
              last_name: item.surname,
              email: item.mail,
              job_title: item.jobTitle,
            })),
        },
        google: {
          // URL and headers for Google API will be defined here
          message: "Will implement Google APIs soon...",
        },
        zoom: {
          baseUrl: `https://api.zoom.us/v2/users`,
          headers: {
            Authorization: `Bearer ${oauthToken.token}`,
          },
          constructUrl: (baseUrl: string) => {
            let url = baseUrl;
            if (limit !== null && limit !== 0) {
              url += `?page_size=${limit}`;
            }
            return url;
          },
          processResponse: (data: any) =>
            data.users.map((item: any) => ({
              first_name: item.first_name,
              last_name: item.last_name,
              email: item.email,
              job_title: item.job_title ?? null,
            })),
        },
      };

      const provider = oauthProviders[oAuthType];

      if (!provider) {
        throw {
          statusCode: 400,
          data: null,
          message: StaticMessage.InvalidOauthType,
        };
      }

      if (oAuthType === "google") {
        return {
          message: provider.message,
          data: null,
        };
      }

      const url = provider.constructUrl(provider.baseUrl);
      const response = await axios.get(url, { headers: provider.headers });
      const data = provider.processResponse(response.data);

      return {
        message: StaticMessage.Ms365UsersFetchedSuccessfully,
        data,
      };
    } catch (error) {
      throw error;
    }
  }
}
