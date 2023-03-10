import Cookies from "universal-cookie";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === "GET") {
        const cookies = new Cookies(req.headers.cookie);

        const sessionToken = cookies.get("sessionToken");

        if (!sessionToken) return res.status(200).json({ isLoggedIn: false });

        const user = await prisma.user.findUnique({
            where: {
                sessionToken: sessionToken,
            },
        });

        if (!user) return res.status(200).json({ isLoggedIn: false, });    

        return res.status(200).json({ isLoggedIn: true, });
    }
}
