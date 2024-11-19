"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

const SigninButton = () => {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <div className="flex gap-4 ">
        <p className="text-sky-600">
        </p>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}  // Add the callbackUrl here
          className="text-red-600"
        >
          Sign Out
        </button>
      </div>
    );
  }
  return (
    <Link href={"/signIn"} className="flex gap-4 ml-auto text-green-600">
      Sign In
    </Link>
  );
};

export default SigninButton;