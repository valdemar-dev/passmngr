import Cookies from "universal-cookie";

import { prisma } from "@/utils/prismaClient";

export default async function handler(req, res) { 
    if (req.method === "POST") {
        const cookies = new Cookies(req.headers.cookie);
        const sessionToken = cookies.get("sessionToken");

        const user = await prisma.user.findUnique({
            where: {
                sessionToken: sessionToken || "none",
            },
            include: {
                vault: true,
            }
        });

        if (!user) return res.status(403).json({});

        const service = req.body.service;
        const link = req.body.link;
        const password = req.body.password;
        const email = req.body.email;
        const username = req.body.username;
        const iv = req.body.iv;
        
        await prisma.vault.update({
            where: {
                userId: user.id,
            },
            data: {
                accounts: {
                    create: {
                        service: service,
                        link: link,
                        password: password,
                        email: email,
                        username: username,
                        iv: iv,
                    }, 
                },    
            },
        });

        return res.status(200).json({});
    }
}
