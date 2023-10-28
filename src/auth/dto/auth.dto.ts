import { IsEmail, IsNotEmpty, IsString, Max } from "class-validator"

export class AuthDTO {
    @Max(255)
    @IsEmail()
    @IsNotEmpty()
    username: string;

    @Max(64)
    @IsString()
    @IsNotEmpty()
    password: string;
}