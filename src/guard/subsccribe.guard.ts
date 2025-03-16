import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Telegraf, Markup } from 'telegraf';
import { Bot } from '../bot/models/bot.model';
import { requireChanels } from '../bot/language_keys/messages';
import { joinMessage, requireMessage, subscribeMessage } from '../bot/language_keys/language';

@Injectable()
export class ChannelSubscriptionGuard implements CanActivate {
  private readonly bot: Telegraf;

  constructor(
    @InjectModel(Bot) private readonly userRepo: typeof Bot,
  ) {
    const token= process.env.BOT_TOKEN
    this.bot = new Telegraf(token!);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [ctx] = context.getArgs();
    const userId = ctx.from.id;
    
    const currentUser = await this.userRepo.findOne({
      where: { user_id: userId.toString() },
    });
    const language = currentUser?.lang === 'uz' ? 'uz' : 'ru';

    try {
      const inactiveChannels: [string, string][] = []; 

      for (const channel of requireChanels) {
        const [chatId] = channel;
        try {
          const member = await this.bot.telegram.getChatMember(chatId, userId);
          if (member.status === 'left') {
            inactiveChannels.push(channel); 
          }
        } catch (error) {
          console.log(`Error checking membership for channel ${chatId}: ${error}`);
        }
      }
      

      if (inactiveChannels.length > 0) {
        const keys: Array<ReturnType<typeof Markup.button.url | typeof Markup.button.callback>>[] = [];
        inactiveChannels.forEach((channel) => {
            keys.push([
                Markup.button.url(
                    `${joinMessage[language]}`,
                    channel[1] 
                )
            ]);
        });
    
        keys.push([
            Markup.button.callback(
                subscribeMessage[language], 
                'subscribed' 
            )
        ]);
    
        await ctx.reply(
            requireMessage[language], 
            Markup.inlineKeyboard(keys)
        );
    
        return false;
    }
    console.log('Inactive channels:', inactiveChannels);
console.log('Returning:', inactiveChannels.length === 0);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
