import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    accessToken?: string;
    inviteCode?: string;
    bio?: string;
    skills?: string;
    is_pro?: boolean;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      accessToken?: string;
      inviteCode?: string;
      bio?: string;
      skills?: string;
      is_pro?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    accessToken?: string;
    inviteCode?: string;
  }
}
