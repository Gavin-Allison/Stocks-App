import { Request, Response } from "express";
import { userRepository } from "../repositories/userRepository";

export class AuthController {
    /**
     * Authenticate the user by email and return the user record.
     * If the email does not exist, this will create a new user.
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ error: "Email is required" });
                return;
            }

            const user = await userRepository.upsertUser(email);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(500).json({ error: "Database error during login" });
        }
    }
}

export const authController = new AuthController();
