import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from 'src/auth/decorator';
import { CreateBookmarkDTO, EditBookmarkDTO } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
    constructor(
        private bookmarkService: BookmarkService
    ) { }

    @Get('')
    @HttpCode(HttpStatus.OK)
    getAll(
        @GetUser('id') userId: number,
    ) {
        return this.bookmarkService.getAll(userId)
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    getById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number
    ) {
        return this.bookmarkService.getById(userId, bookmarkId)
    }

    @Post('')
    @HttpCode(HttpStatus.CREATED)
    create(
        @GetUser('id') userId: number,
        @Body() dto: CreateBookmarkDTO,
    ) {
        return this.bookmarkService.create(userId, dto)
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    editById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
        @Body() dto: EditBookmarkDTO,
    ) {
        return this.bookmarkService.editById(userId, bookmarkId, dto)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number
    ) {
        return this.bookmarkService.deleteById(userId, bookmarkId)
    }
}
