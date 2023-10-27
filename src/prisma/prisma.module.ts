import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // makes exports available to aaaall other modules - in this case, the PrismaService
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule { }
