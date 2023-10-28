import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDTO } from "./dto";
import * as argon from "argon2"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService
    ) { }

    async login(dto: AuthDTO) {
        // find user
        const user = await this.prisma.user.findUnique({
            where: {
                username: dto.username
            }
        })
        if (!user)
            throw new ForbiddenException(
                "Invalid credentials",
            )

        // check password
        const pwMatches = await argon.verify(user.hash, dto.password)
        if (!pwMatches)
            throw new ForbiddenException(
                "Invalid credentials",
            )

        // return token
        delete user.hash
        return user
    }

    async singup(dto: AuthDTO) {
        // gen pass
        const hash = await argon.hash(dto.password)

        try {
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
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') { // Prisma have custom error codes
                    throw new Error("Username already exists")
                }
            }

            throw error
        }
    }
}