import Cookies from "universal-cookie";

import prisma from "@/utils/prismaClient";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const cookies = new Cookies(req.headers.cookie);
        const sessionToken = cookies.get("sessionToken");

        if (!sessionToken) return res.status(403).json({});

        const user = await prisma.user.findUnique({
            where: {
                sessionToken: sessionToken || "none",
            },
            include: {
                vault: true,
            }
        });

        if (!user) return res.status(403).json({});

        const vault = await prisma.vault.findUnique({
            where: {
                userId: user.id,
            },
            include: {
                accounts: true,
            },
        });

        return res.status(200).json({ vault: vault });
    }
}
