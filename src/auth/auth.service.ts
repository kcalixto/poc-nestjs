import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDTO } from "./dto";
import * as argon from "argon2"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        private config: ConfigService,
        private prisma: PrismaService,
        private jwt: JwtService,
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
        return this.signToken(user.id, user.username)
    }

    async signToken(
        userId: number,
        username: string,
    ): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            username,
        }

        const access_token = await this.jwt.signAsync(payload, {
            expiresIn: '1d',
            secret: (() => {
                return this.config.get<string>('JWT_SECRET')
            })(),
        })

        return { access_token }
    }


    async singup(dto: AuthDTO) {
        const hash = await argon.hash(dto.password)

        try {
            const user = await this.prisma.user.create({
                data: {
                    username: dto.username,
                    hash: hash
                },
            })

            return this.signToken(user.id, user.username)
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