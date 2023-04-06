import { prisma } from '@/utils/prismaClient';

import hash from '@/utils/hash';

import crypto from "crypto";

export default async function handler(req, res) {
    if (req.method === "POST") {
      //password is hashed client side and server side
      const password = hash(req.body.password);
      const email = hash(req.body.email);

      if (!password) {
        return res.status(422).json({ message: "Invalid password!", });
      }

      if (!email) {
        return res.status(422).json({ message: "Invalid email!", });
      }

      if (await prisma.user.findUnique({
        where: {
          email: email,
        },
      }) !== null) {
        return res.status(422).json({ message: "Account with this email address already exists!" });
      } 
      
      const sessionToken = crypto.randomBytes(32).toString("hex");

      await prisma.user.create({
        data: {
          email: email,
          password: password,
          sessionToken: sessionToken,
          vault: {
            create: {
              accounts: {
              },
            },
          }
        },
      })


      return res.status(200).json();
    }
}
