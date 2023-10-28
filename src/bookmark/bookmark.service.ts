import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDTO, EditBookmarkDTO } from './dto';

@Injectable()
export class BookmarkService {
    constructor(
        private prisma: PrismaService
    ) { }

    async getAll(userId: number) {
        const bookmarks = await this.prisma.bookmark.findMany({
            where: {
                userId
            }
        })

        return bookmarks
    }

    async getById(userId: number, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                userId,
                id: bookmarkId,
            }
        })

        console.log({ bookmark });

        if (!bookmark) throw new NotFoundException('Bookmark not found')

        return bookmark
    }

    async create(userId: number, dto: CreateBookmarkDTO) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                ...dto,
                user: {
                    connect: {
                        id: userId
                    }
                }
            }
        })

        return bookmark
    }

    async editById(userId: number, bookmarkId: number, dto: EditBookmarkDTO) {
        const bookmarkExists = await this.prisma.bookmark.findUnique({
            where: {
                userId,
                id: bookmarkId
            }
        })
        if (!bookmarkExists) throw new NotFoundException('Bookmark not found')

        const bookmark = this.prisma.bookmark.update({
            where: {
                userId,
                id: bookmarkId
            },
            data: {
                ...dto
            }
        })

        return bookmark
    }

    async deleteById(userId: number, bookmarkId: number) {
        await this.prisma.bookmark.delete({
            where: {
                userId,
                id: bookmarkId
            }
        })
    }
}
