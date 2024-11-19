import { deleteCookie } from "cookies-next";
import { signOut } from "next-auth/react";

export default function CallSignout(){
    localStorage.clear();
    deleteCookie('forum_access_token');
    deleteCookie('user_first_name');
    deleteCookie('user_last_name');
    deleteCookie('upcoming_forum_uuid');
    deleteCookie('current_forum_uuid');
    signOut({ callbackUrl: '/' });
}