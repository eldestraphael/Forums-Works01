"use client";

import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./msal";

const MsalWrapper = ({ children }: any) => {
    return (
        <MsalProvider instance={msalInstance}>
            {children}
        </MsalProvider>
    );
};

export default MsalWrapper;
