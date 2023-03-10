import prisma from "@/utils/prismaClient";
import crypto from "crypto";
import Cookies from "universal-cookie";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const cookies = new Cookies(req.headers.cookie);

        const sessionToken = cookies.get("sessionToken");

        if (!sessionToken) return res.status(422).json({ message: "Invalid authentication key or session token" });

        const user = await prisma.user.findUnique({
            where: {
                sessionToken: sessionToken,
            },
        });
        
        if (!user) return res.status(403).json();

        await prisma.user.update({
            where: {
                sessionToken: sessionToken,
            },
            data: {
                sessionToken: crypto.randomBytes(32).toString("hex"),
            },
        });

        return res.status(200).json();
    }
}
