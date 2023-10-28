import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDTO } from "./dto";
import * as argon from "argon2"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService
    ) { }

    login() {
        // find user
        
        // check password
        
        // return token
        return "login"
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