import { IsEmail, IsOptional, IsString } from "class-validator";

export class EditUserDTO {
    @IsEmail()
    @IsString()
    @IsOptional()
    readonly username?: string;

    @IsString()
    @IsOptional()
    readonly firstName?: string;

    @IsString()
    @IsOptional()
    readonly lastName?: string;
}