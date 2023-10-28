import { IsEmail, IsNotEmpty, IsString, Length, Max } from "class-validator"

export class AuthDTO {
    @Length(1, 255)
    @IsEmail()
    @IsNotEmpty()
    username: string;

    @Length(1, 32)
    @IsString()
    @IsNotEmpty()
    password: string;
}