import { Body, Controller, ParseIntPipe, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDTO } from "./dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() dto: AuthDTO) {
        return this.authService.login(dto);
    }

    @Post('signup')
    async signup() {
        return this.authService.singup();
    }
}