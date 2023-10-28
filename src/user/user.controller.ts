import { Controller, Get, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@ApiTags('users')
@UseGuards(JwtGuard) // jwt middleware
@Controller('users')
export class UserController {
    constructor() { }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    getMe(@GetUser() user: User) {
        return { user };
    }

}
