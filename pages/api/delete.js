import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import Cookies from 'universal-cookie';

export default async function handler(req, res) {
    if (req.method === "POST") {
        const cookies = new Cookies(req.headers.cookie);
        
        const user = await prisma.user.findUnique({
            where: {
                sessionToken: cookies.get("sessionToken"),
            },
        });

        if (!user) return res.status(403).json({});
            
        // if the user is found in the database, we can assume that they already have a vault
        await prisma.vault.update({
            where: {
                id: req.body.vaultId,
            },
            
            data: {
                accounts: {
                    delete: {
                        id: req.body.id,
                    },
                },
            }
        });

        return res.status(200).json();
    }
}


