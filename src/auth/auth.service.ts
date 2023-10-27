import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDTO } from "./dto";
import * as argon from "argon2"

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService
    ) { }

    login(dto: AuthDTO) {
        // gen pass
        // save user
        // return token
        return "login"
    }

    singup() {
        return "signup"
    }
}