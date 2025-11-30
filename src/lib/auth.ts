import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        const user = await prisma.staffUser.findUnique({
          where: { email: credentials.email },
          include: {
            staffRoles: {
              include: {
                role: true,
              },
            },
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        if (user.status !== "ACTIVE") {
          throw new Error("บัญชีถูกระงับการใช้งาน");
        }

        const isPasswordValid = await compare(credentials.password, user.passwordHash);
        if (!isPasswordValid) {
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        // Update last login
        await prisma.staffUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          roles: user.staffRoles.map((sr: { role: { code: string } }) => sr.role.code),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as { roles: string[] }).roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
