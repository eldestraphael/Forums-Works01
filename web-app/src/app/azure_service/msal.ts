import { PublicClientApplication } from "@azure/msal-browser";

const clientId = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID;
const tenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;

if (!clientId || !tenantId) {
    throw new Error("Missing Azure AD Client ID or Tenant ID");
}

const msalConfig = {
    auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`,
        redirectUri: '/'
    },
    scopes: [ "User.ReadBasic.All", "User.Read.All" ]
};

const msalInstance = new PublicClientApplication(msalConfig);

export { msalInstance }
