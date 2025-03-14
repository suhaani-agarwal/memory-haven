
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import GitHubProvider from "next-auth/providers/github";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { db } from "@/lib/db";
// import bcrypt from "bcrypt";



// export const authOptions = {
//   adapter: PrismaAdapter(db),
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email", placeholder: "your-email@example.com" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials.email || !credentials.password) {
//           throw new Error("Email and password are required");
//         }

//         const user = await db.user.findUnique({
//           where: { email: credentials.email },
//         });
//         // const user = { id: "1", name: "John Doe", email: credentials.email };

//         if (!user) {
//         //   throw new Error("User not found");
//         return null;
//         }

//         const passwordMatch = await bcrypt.compare(credentials.password, user.password);
//         if (!passwordMatch) {
//         //   throw new Error("Invalid password");
//         return null;
//         }

//         return user;
//       },
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//   ],
//   session: { strategy: "jwt" },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id;
//       }
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/login",
//   },
// };

// // export default NextAuth(authOptions);
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };




// // src/app/api/auth/[...nextauth]/route.js
// import NextAuth from "next-auth";
// import { authOptions } from "@/lib/authOptions";

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };


export const dynamic = "force-dynamic"; // Ensures this API is always dynamic

import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
