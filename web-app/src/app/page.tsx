"use client"

import { redirect } from 'next/navigation'; 

export default function Home() {
  return (
    redirect('/sign-in')  //REDIRECTS TO  INITIAL LOAD....
  );
}