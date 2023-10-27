import { Body, Controller, Post, Req } from "@nestjs/common";
import { Request } from 'express';
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() dto: any) {
        console.log({dto});
        return this.authService.login();
    }

    @Post('signup')
    async signup() {
        return this.authService.singup();
    }
}