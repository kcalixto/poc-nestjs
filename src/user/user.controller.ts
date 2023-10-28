import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard) // jwt middleware
@Controller('users')
export class UserController {
    constructor() { }

    @Get('me')
    getMe(@GetUser('id') id: number) {
        return { id };
    }

}
