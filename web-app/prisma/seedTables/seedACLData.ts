import fs from "fs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type Role = {
  name: string;
  hierarchy: number;
};

type Scope = {
  name: string;
  keyword: string;
};

type Module = {
  uuid: string;
  name: string;
  keyword: string;
  order: number;
  sub_module: SubModule[];
};

type SubModule = {
  uuid: string;
  name: string;
  keyword: string;
  order: number;
  module_uuid: string;
  redirect_url: string;
};

type Action = {
  name: string;
  keyword: string;
};

export async function seedACLData(env: string) {
  const rolePrivilegeData = JSON.parse(
    fs.readFileSync(`./prisma/seedData/privileges-${env}.json`, "utf-8")
  );
  const aclData = JSON.parse(
    fs.readFileSync(`./prisma/seedData/aclData-${env}.json`, "utf-8")
  );

  const roles = [
    { name: "Super Admin", hierarchy: 1 },
    { name: "Client Admin", hierarchy: 2 },
    { name: "Client Forum Leader", hierarchy: 3 },
    { name: "Client Forum Member", hierarchy: 4 },
  ];

  const scopes = ["Application", "Company", "Forum", "User"];

  const modules = aclData.modules;

  let subModules = aclData.sub_modules;

  const redirectURLs = aclData.redirect_urls;

  const actions = ["Read", "Create", "Delete", "Update"];

  let rolesData: Role[] = [];
  let scopeData: Scope[] = [];
  let moduleData: Module[] = [];
  let actionData: Action[] = [];

  for (const role of roles) {
    let existingRole = await prisma.roles.findFirst({
      where: { name: role.name },
    });

    let createdRole;
    if (existingRole) {
      createdRole = await prisma.roles.update({
        where: { uuid: existingRole.uuid },
        data: { hierarchy: role.hierarchy },
      });
    } else {
      createdRole = await prisma.roles.create({
        data: {
          name: role.name,
          hierarchy: role.hierarchy,
        },
      });
    }
    rolesData.push(createdRole);
  }

  for (const scopeName of scopes) {
    let existingScope = await prisma.scopes.findFirst({
      where: { name: scopeName },
    });

    let scope;
    if (existingScope) {
      scope = await prisma.scopes.update({
        where: { uuid: existingScope.uuid },
        data: { keyword: scopeName.toLowerCase() },
      });
    } else {
      scope = await prisma.scopes.create({
        data: {
          name: scopeName,
          keyword: scopeName.toLowerCase(),
        },
      });
    }
    scopeData.push(scope);
  }

  let moduleCnt = 1;
  let subModuleCnt = 1;
  for (const item of modules) {
    let moduleName = Object.keys(item)[0];
    let existingModule = await prisma.modules.findFirst({
      where: { name: moduleName },
    });

    let module: any;
    if (existingModule) {
      module = await prisma.modules.update({
        where: { uuid: existingModule.uuid },
        data: { order: moduleCnt },
      });
    } else {
      module = await prisma.modules.create({
        data: {
          name: moduleName,
          keyword: moduleName.toLowerCase(),
          order: moduleCnt,
        },
      });
    }
    moduleCnt += 1;
    module["sub_module"] = [];
    for (const subModuleName of item[moduleName]) {
      let existingSubModule = await prisma.sub_modules.findFirst({
        where: { name: subModules[subModuleName] },
      });

      let subModule;
      if (existingSubModule) {
        subModule = await prisma.sub_modules.update({
          where: { uuid: existingSubModule.uuid },
          data: {
            order: subModuleCnt,
            module_uuid: module.uuid,
            redirect_url: redirectURLs.find((obj: any) =>
              obj.hasOwnProperty(subModuleName)
            )[subModuleName],
          },
        });
      } else {
        subModule = await prisma.sub_modules.create({
          data: {
            name: subModules[subModuleName],
            keyword: subModuleName,
            order: subModuleCnt,
            module_uuid: module.uuid,
            redirect_url: redirectURLs.find((obj: any) =>
              obj.hasOwnProperty(subModuleName)
            )[subModuleName],
          },
        });
      }
      subModuleCnt += 1;
      module["sub_module"].push(subModule);
    }
    moduleData.push(module);
  }

  for (const actionName of actions) {
    let existingAction = await prisma.actions.findFirst({
      where: { name: actionName },
    });

    let action;
    if (existingAction) {
      action = await prisma.actions.update({
        where: { uuid: existingAction.uuid },
        data: { keyword: actionName.toLowerCase() },
      });
    } else {
      action = await prisma.actions.create({
        data: {
          name: actionName,
          keyword: actionName.toLowerCase(),
        },
      });
    }
    actionData.push(action);
  }

  let arr = [];
  for (const roleName in rolePrivilegeData) {
    const roleData = rolePrivilegeData[roleName];
    const scopeName = roleData.scope;

    for (const moduleName in roleData.module) {
      const modules = roleData.module[moduleName];

      for (const subModuleName in modules) {
        const actionList = modules[subModuleName];
        const subModuleKeyword = subModuleName;

        const role: any = rolesData.find((role) => role.name === roleName);
        const scope: any = scopeData.find(
          (scope) => scope.keyword.toLowerCase() === scopeName.toLowerCase()
        );
        const module = moduleData.find(
          (module) => module.keyword.toLowerCase() === moduleName.toLowerCase()
        );
        const subModule = module?.sub_module.find(
          (subModule: any) =>
            subModule.keyword.toLowerCase() === subModuleKeyword.toLowerCase()
        );
        const actions = actionList.map((actionName: any) =>
          actionData.find(
            (action) =>
              action.keyword.toLowerCase() === actionName.toLowerCase()
          )
        );

        for (let action of actions) {
          arr.push({
            role_uuid: role.name,
            scope_uuid: scope.name,
            module_uuid: module?.name,
            sub_module_uuid: subModule?.name!,
            action_uuid: action.name,
          });

          const existingRecord = await prisma.role_privileges.findFirst({
            where: {
              role_uuid: role.uuid,
              scope_uuid: scope.uuid,
              module_uuid: module?.uuid,
              sub_module_uuid: subModule?.uuid,
              action_uuid: action.uuid,
            },
          });

          if (existingRecord) {
            await prisma.role_privileges.update({
              where: { uuid: existingRecord.uuid },
              data: {
                role_uuid: role.uuid,
                scope_uuid: scope.uuid,
                module_uuid: module?.uuid,
                sub_module_uuid: subModule?.uuid,
                action_uuid: action.uuid,
              },
            });
          } else {
            await prisma.role_privileges.create({
              data: {
                role_uuid: role.uuid,
                scope_uuid: scope.uuid,
                module_uuid: module?.uuid!,
                sub_module_uuid: subModule?.uuid!,
                action_uuid: action.uuid,
              },
            });
          }
        }
      }
    }
  }
}
