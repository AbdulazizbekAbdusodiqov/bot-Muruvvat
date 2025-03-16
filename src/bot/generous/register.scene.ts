import { InjectModel } from "@nestjs/sequelize";
import { Bot } from "../models/bot.model";
import { On, Scene, SceneEnter,Ctx, Action } from "nestjs-telegraf";
import { acceptAddresMessage, askNameMessage, askRegionMessage, districtMessage, mainMessage, PhoneNumberMessages } from "../language_keys/language";
import { Context, Markup, Scenes } from "telegraf";
import { Update } from "telegraf/types";
import { ContextType } from "@nestjs/common";
import { phoneNumberKeys } from "../language_keys/keybord";
import { ButtonsService } from "../register_service/generate_location";
import { backToRegionsForGenerous, generousMenuKeys } from "../language_keys/generous.keybord";



interface MyContext extends Context {
    scene: Scenes.SceneContextScene<MyContext>;
  }
  
@Scene('registerAsGenerous')
export class RegisterAsGenerous extends Scenes.BaseScene<MyContext>  {
    constructor(
        @InjectModel(Bot) private readonly botModel: typeof Bot,
    ) {
        super('registerAsGenerous');
    }
    
   

  
  @SceneEnter()
  async onEnter(ctx: Context) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    await ctx.editMessageText(askNameMessage[language]);
  }

  @On('text')
  async textHandler(ctx: MyContext) {
    if ('text' in ctx.message!) {
      const name = ctx.message.text;
      const user_id = ctx.from?.id;
      
      await this.botModel.update(
        { real_name: name }, 
        { where: { user_id } }
      );
  
      await ctx.scene.enter('askGenerousPhone');
    }
  }
  
}

@Scene('askGenerousPhone')
export class AskGenerousPhone {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
  ) {}
  @SceneEnter()
  async onEnter(ctx: MyContext) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    await ctx.reply(PhoneNumberMessages[language], {
      reply_markup: phoneNumberKeys[language],
      parse_mode: 'HTML',
    });
  }

  @On('contact')
  async textHandler(ctx: MyContext) {
    if ('contact' in ctx.message!) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
      const contact = ctx.message.contact as { phone_number: string };
      const phone_number = contact.phone_number;
      await this.botModel.update(
        { phone_number },
        { where: { user_id} }
      );
      
      await ctx.scene.enter('askGenerousProvince');
    }
  }
}

@Scene('askGenerousProvince')
export class AskGenerousProvince {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    private readonly buttonService: ButtonsService,
  ) {}
  @SceneEnter()
  async onEnter(ctx: MyContext) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    const buttons = this.buttonService.generateRegionButtons(
      0,
      language,
      'regionForRegisterAsG',
    );
    await ctx.reply(askRegionMessage[language], {
      reply_markup: buttons,
    });
  }

  @Action(/regionForRegisterAsGPage/)
  async page(@Ctx() ctx: MyContext) {
    const user_id = ctx.from?.id;
    const [, page] = (ctx.update as any).callback_query.data.split('=');
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    const buttons = this.buttonService.generateRegionButtons(
      +page,
      language,
      'regionForRegisterAsG',
    );
    await ctx.editMessageText(askRegionMessage[language], {
      reply_markup: buttons,
    });
  }

  @Action(/regionForRegisterAsG/)
  async callbackHandler(ctx: MyContext) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    const [, region] = (ctx.update as any).callback_query.data.split('=');
    await this.botModel.update(
        { region }, 
        { where: { user_id } }
      );
    await ctx.scene.enter('askGenerousDistrict');
  }
}

@Scene('askGenerousDistrict')
export class AskGenerousDistrict {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    private readonly buttonService: ButtonsService,
  ) {}
  @SceneEnter()
  async onEnter(ctx: MyContext) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    const [, region] = (ctx.update as any).callback_query.data.split('=');
    const buttons = this.buttonService.generateDistrictButtons(
      region,
      0,
      language,
      'districtForRegisterAsG',
    );
    await ctx.editMessageText(districtMessage[language], {
      reply_markup: {
        inline_keyboard: [
          ...buttons.inline_keyboard,
          ...backToRegionsForGenerous[language].inline_keyboard,
        ],
      },
    });
  }

  @Action(/districtForRegisterAsGPage/)
  async page(@Ctx() ctx: MyContext) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    const region = findUser!.region ?? '';
    const [, page] = (ctx.update as any).callback_query.data.split('=');
    const buttons = this.buttonService.generateDistrictButtons(
      region,
      +page,
      language,
      'districtForRegisterAsG',
    );

    await ctx.editMessageText(districtMessage[language], {
      reply_markup: {
        inline_keyboard: [
          ...buttons.inline_keyboard,
          ...backToRegionsForGenerous[language].inline_keyboard,
        ],
      },
    });
  }

  @Action('backToRegForGenerous')
  async backToRegions(@Ctx() ctx: MyContext) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    await this.botModel.update(
        { region: "" }, 
        { where: { user_id } } 
      );
      
    const buttons = this.buttonService.generateRegionButtons(
      0,
      language,
      'regionForRegisterAsG',
    );
    await ctx.editMessageText(askRegionMessage[language], {
      reply_markup: buttons,
    });
  }

  @Action(/districtForRegisterAsG/)
  async callbackHandler(ctx: MyContext) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    const [, district] = (ctx.update as any).callback_query.data.split('=');
    await this.botModel.update(
        { district }, 
        { where: { user_id} } 
      );
      
    await ctx.editMessageText(acceptAddresMessage[language], {
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.callback('✅', 'accept'),
            Markup.button.callback('❌', 'reject'),
          ],
        ],
      },
    });
  }

  @Action('accept')
  async accept(@Ctx() ctx: MyContext) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
await ctx.editMessageText(
      mainMessage[language],
      {
        reply_markup: generousMenuKeys[language],
      },
    );
    await ctx.scene.leave();
  }


}
