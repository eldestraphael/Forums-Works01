import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { StaticMessage } from "../../constants/StaticMessages";

const handler = NextAuth({
    pages: {
        signIn: '/?reason=no_auth',
        error: '/error'
      },
    session: {
        strategy: 'jwt'
    },
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                email: { label: "email", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                // Add logic here to look up the user from the credentials supplied
                const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/sign-in`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: credentials?.email,
                        password: credentials?.password,
                    }),
                });
 
                const user = await res.json();
 
                if (res.status == 200) {
                    // Any object returned will be saved in `user` property of the JWT
                    return user
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    return null
 
                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            return { ...token, ...user };
        },
 
        async session({ session, token }: any) {
        const userInfo = JSON.parse(JSON.stringify(token));
        const userUuid = userInfo?.data?.user_info?.uuid;

        const isActiveUser = await prisma.user.findUnique({
          where: {
            uuid: userUuid,
          },
          select: {
            is_active: true,
          },
        });

        if (!isActiveUser?.is_active) {
          return { errors: StaticMessage.UnAuthorizedUser, status: false };
        } else {
          session.user = token as any;
          return session;
        }
      },
    },
});
 
export { handler as GET, handler as POST };