import hash from "@/utils/hash";

import crypto from "crypto";

import { prisma } from "@/utils/prismaClient";

export default async function handler(req, res) {
    if (req.method === "POST") {
        //data hashed on client and server for privacy and security
        const email = hash(req.body.email);
        const password = hash(req.body.password);
        
        if (!email) return res.status(422).json({ message: "No email" });
        if (!password) return res.status(422).json({ message: "No password" });

        const user = await prisma.user.findFirst({
            where: {
                email: email,
                password: password,
            },
        });

        if (user === null) return res.status(200).json({ isPasswordCorrect: false, });

        const sessionToken = crypto.randomBytes(32).toString("hex");

        await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                sessionToken: sessionToken,
            },
        })

        return res.status(200).json({ isPasswordCorrect: true, sessionToken: sessionToken, });
    }
}
