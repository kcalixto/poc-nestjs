import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class AuthDTO {
    @IsEmail()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}