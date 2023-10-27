import { Body, Controller, ParseIntPipe, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDTO } from "./dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    async signup(@Body() dto: AuthDTO) {
        return this.authService.singup(dto);
    }

    @Post('login')
    async login() {
        return this.authService.login();
    }
}