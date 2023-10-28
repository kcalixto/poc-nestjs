import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { EditUserDTO } from './dto';
import { UserService } from './user.service';

@ApiTags('users')
@UseGuards(JwtGuard) // jwt middleware
@Controller('users')
export class UserController {
    constructor(
        private userService: UserService
    ) { }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    getMe(@GetUser() user: User) {
        return { user };
    }

    @Patch()
    @HttpCode(HttpStatus.OK)
    editUser(@GetUser('id') userId: number, @Body() dto: EditUserDTO) {
        return this.userService.editUser(userId, dto);
    }

}
