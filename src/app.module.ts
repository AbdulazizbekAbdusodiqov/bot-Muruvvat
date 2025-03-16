import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BOT_NAME } from './bot/app.constants';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { session } from 'telegraf';



@Module({
  imports: [ 
    BotModule,
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    TelegrafModule.forRootAsync({
      botName: BOT_NAME,
      useFactory: () => ({
        token: process.env.BOT_TOKEN!,
        middlewares: [],
        include: [],
      }),
    }),
  SequelizeModule.forRoot({
    dialect: `postgres`,
    host: process.env.POSTGRES_HOST,
    username: process.env.POSTGRES_USER,
    port: Number(process.env.POSTGRES_PORT),
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    models: [],
    autoLoadModels: true,
    sync: { alter: true },
    logging: false,
  }),],
  controllers: [],
  providers: [],
})
export class AppModule {}
