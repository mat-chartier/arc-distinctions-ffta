import { Archer } from "../db/archer";
import { archerRepo } from "../db/archerRepo";
import EncryptionUtils from "./encryption-utils";

class AuthorizationManager {
    private static instance: AuthorizationManager;
    private constructor() {}

    public static getInstance(): AuthorizationManager {
        if (!AuthorizationManager.instance) {
            AuthorizationManager.instance = new AuthorizationManager();
        }
        return AuthorizationManager.instance;
    }

    public async authorizeUser(bearer:string): Promise<Archer | null> {
        if (!bearer || !bearer.startsWith("Bearer ")) {
          return null;
        }
        const token = bearer.split(" ")[1];
        const userId = EncryptionUtils.decode(token);
        if (!userId) {
          return null;
        }
        return await archerRepo.getArcherById(Number(userId))
    }
}

export const authorizationManager = AuthorizationManager.getInstance();