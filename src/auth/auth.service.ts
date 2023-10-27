import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDTO } from "./dto";
import * as argon from "argon2"

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService
    ) { }

    login() {
        return "login"
    }

    async singup(dto: AuthDTO) {
        // gen pass
        const hash = await argon.hash(dto.password)

        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                hash: hash
            },
        })

        // temp gambetas
        delete user.hash

        // save user
        // return token
        return user
    }
}