import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { BotUpdate } from "./bot.update";
import { SequelizeModule } from "@nestjs/sequelize";
import { Bot } from "./models/bot.model";
import { AdminService } from "./admin.service";
import { Admin } from "./models/admin.model";
import { Donation } from "./models/donation.model";
import { ButtonsService } from "./register_service/generate_location";
import { RequestPatient } from "./models/request.model";
import { AnnounceAnswer } from "./models/announce_answer";



@Module({
  imports: [
    SequelizeModule.forFeature([Bot, Donation,Admin,RequestPatient,AnnounceAnswer])],
  controllers: [],
  providers: [BotUpdate,BotService,AdminService,ButtonsService],
})
export class BotModule {}
