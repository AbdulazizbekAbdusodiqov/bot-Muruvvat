import { Action, Command, Ctx, Hears, InjectBot, On, Start, Update } from "nestjs-telegraf";
import {Context, Markup, Scenes, session, Telegraf} from "telegraf"
import { BotService } from "./bot.service";
import { InjectModel } from "@nestjs/sequelize";
import { Bot } from "./models/bot.model";
import { AdminService } from "./admin.service";
import { acceptAddresMessage, askNameMessage, askRegionMessage, districtMessage, langMessages, mainMessage, registerMessage, startMessage } from "./language_keys/language";
import {  selectLangKeys } from "./language_keys/keybord";
import { backToChanges, backToGenerosMenu, backToRegionsForGenerous, generousMenuKeys, repairKeys, setGenerousLangKeys, settingsForGenerous } from "./language_keys/generous.keybord";
import { patientMenuKeys } from "./language_keys/patient.keybord";
import { Admin } from "./models/admin.model";
import { BOT_NAME } from "./app.constants";
// import {  Scenes as TelegrafScenes } from "telegraf";
// import {RegisterAsGenerous} from "./generous/register.scene"
import { ButtonsService } from "./register_service/generate_location";
import { cancelButton, confirmButton, repairMessage, requestGift, requestSent, resAdmin, stuffs, sure, thankMessage } from "./language_keys/messages";
import { Donation } from "./models/donation.model";
import { RequestPatient } from "./models/request.model";
import { UseGuards } from "@nestjs/common";
import { ChannelSubscriptionGuard } from "../guard/subsccribe.guard";

interface MyContext extends Context {
    scene: Scenes.SceneContextScene<MyContext>;
}

@Update()
export class BotUpdate {
  constructor(
    private readonly botService: BotService,
    private readonly adminService: AdminService,
    private readonly buttonService: ButtonsService,
    
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
    @InjectModel(Donation) private readonly donationModel: typeof Donation,
    @InjectModel(RequestPatient) private readonly requestPatientModel: typeof RequestPatient,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<MyContext>
  ) {}

  @UseGuards(ChannelSubscriptionGuard)
  @Start()
  async onStart(@Ctx() ctx: Context) {
    const guest_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(guest_id);
    const text = ctx.text || '';
    const payload = text.split(' ')[1] || '';
    const donationId = payload.split('_')[1] || '';
    // console.log(payload);
    // console.log("test");
    // console.log(ctx);
    // console.log(ctx.text);
    
    
    if(donationId){

      if(!findUser || !findUser.role || findUser.last_state!="finish"){
        this.botService.start(ctx);
      return;
      }else {
        if(payload.startsWith("ihelp")){
          const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
          await ctx.deleteMessage(ctx.message?.message_id);
          await ctx.reply(sure[language], {
            reply_markup: {
              inline_keyboard: [
                [{ text: confirmButton[language], callback_data: `ihelpconfirm_${donationId}` }],
                [{ text: cancelButton[language], callback_data: 'ihelpcancel' }]
              ]
            }
          });
          return
        }else if(payload.startsWith("needhelp")){
          const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
          await ctx.deleteMessage(ctx.message?.message_id);
          await ctx.reply(requestGift[language], {
            reply_markup: {
              inline_keyboard: [
                [{ text: confirmButton[language], callback_data: `needhelpconfirm_${donationId}` }],
                [{ text: cancelButton[language], callback_data: 'needhelpcancel' }]
              ]
            }
          });
          return
        }

      }
    }else{
      if(findUser?.last_state == "first_start"){
        return
      }
      if (!findUser || !findUser.role || !findUser.lang) {
        this.botService.start(ctx);
        return;
      }

      if(findUser.last_state == "finish"){

        switch (findUser.role) {
          case 'generous':
            let removeKeyboard = await ctx.reply("...",{
                  reply_markup: { remove_keyboard: true }
              });
            
              setTimeout(() => {
                  ctx.deleteMessage(removeKeyboard.message_id);
              }, 500);

            await ctx.reply(mainMessage[findUser.lang], {
              reply_markup: generousMenuKeys[findUser.lang],
            });
            break;
          case 'patient':
            await ctx.reply(mainMessage[findUser.lang], {
              reply_markup: patientMenuKeys[findUser.lang],
            });
            break;
          default:
            break;
        }
    }else if(findUser.last_state == "name"){
      ctx.reply("Ismingizni kiriting:", Markup.removeKeyboard())
    }else if(findUser.last_state == "contact"){
      await ctx.reply(
        `Iltimos, <b>📞 Telefon raqamini yuborish</b> tugmasini bosing`,
        {
          parse_mode: "HTML",
          ...Markup.keyboard([
            [Markup.button.contactRequest("📞 Telefon raqamini yuborish")],
          ])
            .resize()
            .oneTime(),
        }
      );
    }
    


    }
   
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^closed_/)
  async onClosed(@Ctx() ctx: Context) {
    await this.botService.closedService(ctx);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Hears("Sahiylar")
  async onListGenerous(@Ctx() ctx: Context) {
    await this.adminService.onListGenerous(ctx);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Hears("Sabrlilar")
  async onListPatients(@Ctx() ctx: Context) {
    await this.adminService.onListPatients(ctx);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Hears("Mijoz arizalari")
  async onListApplications(@Ctx() ctx: Context) {
    await this.adminService.onListApplications(ctx);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^needhelpconfirm_/)
  async onDonation(@Ctx() ctx: Context) {
    await this.botService.donationService(ctx);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^ihelpconfirm_/)
  async onRequest(@Ctx() ctx: Context) {
    console.log("ihelp");
    
    await this.botService.requestService(ctx);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action("view_patients_for_generous")
  async onSeePatients(@Ctx() ctx: Context) {
  
    await this.botService.seePatients(ctx)
  }
  
  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^view_patients_for_generous=\d+/)
  async seePatients(@Ctx() ctx: Context) {
    const page = ctx.callbackQuery!["data"].split("=")[1]
    await this.botService.seePatients(ctx, +page)
  }
  
  
  
  
  

  @UseGuards(ChannelSubscriptionGuard)
    @Action(/^reply_/)
    async onAdminAnswer(@Ctx() ctx: Context) {
    const user_id = ctx.callbackQuery!["data"].split("_")[1]
    const findAdmin=await this.adminModel.findOne()
    findAdmin!.setDataValue("last_state",`chat_${user_id}`);
    await findAdmin!.save()
    await ctx.reply(`ID: ${user_id} userga javobingizni yozib qoldiring`);
    }


 


@UseGuards(ChannelSubscriptionGuard)
  @Action("toAdmin")
  async onContactAdmin(@Ctx() ctx: Context) {
 const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    if (!findUser || !findUser.lang) {
      await ctx.reply(startMessage, { reply_markup: selectLangKeys });
    }else{
      const language = findUser.lang === 'uz' ? 'uz' : 'ru';
      findUser.last_state="adminRes"
      findUser.save()
      await ctx.editMessageText(resAdmin[language]);
    }
  }

@UseGuards(ChannelSubscriptionGuard)
  @Action('settings')
  async settings(@Ctx() ctx: Context) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    if (findUser && findUser.last_state === "finish") {
    const language = findUser.lang === 'uz' ? 'uz' : 'ru';
      await ctx.editMessageText(mainMessage[language], {
        reply_markup: {
          inline_keyboard: [
            ...settingsForGenerous[language].inline_keyboard,
            ...backToGenerosMenu[language].inline_keyboard,
          ],
        },
      });
    }else{
      await ctx.editMessageText(startMessage, { reply_markup: selectLangKeys });

    }
  }
  @UseGuards(ChannelSubscriptionGuard)
  @Action("change_lang")
  async changeLang(@Ctx() ctx: Context) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    if (findUser && findUser.last_state === "finish") {
    const language = findUser.lang === 'uz' ? 'uz' : 'ru';
    await ctx.editMessageText(langMessages[language], {
      reply_markup: {
        inline_keyboard: [
          ...setGenerousLangKeys.inline_keyboard,
          ...backToChanges[language].inline_keyboard,
        ],
      },
    });
    }else{
      await ctx.editMessageText(startMessage, { reply_markup: selectLangKeys });
    }
    
  }




  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^setLang/)
  async setLanguage(ctx: Context) {
  
    const user_id = ctx.from?.id;
    const callbackData = ctx.callbackQuery!["data"]
  
    if (!callbackData) return;
  
    const [, lang] = callbackData.split('_'); 
  
    const findUser = await this.botModel.findByPk(user_id);
  
    if (findUser) {
      await findUser.update({ lang });
  
      const message = lang === 'uz'
        ? "Til muvaffaqiyatli o'zgartirildi!"
        : "Язык успешно изменён!";
  
      await ctx.editMessageText(message);
      await this.onBack(ctx)
    } else {
      await ctx.editMessageText(lang === 'uz' ? "Foydalanuvchi topilmadi." : "Пользователь не найден.");
    }
  }
  
@UseGuards(ChannelSubscriptionGuard)
@Hears(["🏠 Asosiy menyu",'🏠 Главное меню'])
async onBackMain(@Ctx() ctx: Context) {
  await this.onBack(ctx)
}
  @UseGuards(ChannelSubscriptionGuard)
  @Action('back_to_changes')
  async settingsBack(@Ctx() ctx: Context) {
        await this.settings(ctx)
  }


  @UseGuards(ChannelSubscriptionGuard)
  @Command("menadmin")
  async onStop(@Ctx() ctx: Context) {
    await this.adminService.admin(ctx);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(["uz", "ru"])
  async onSelectLang(@Ctx() ctx: any) {
    const guest_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(guest_id);
    const contextAction = ctx.callbackQuery!["data"];
    if (findUser && contextAction) {
      findUser.lang = contextAction;
      await findUser.save();
      this.botService.selectRole(ctx)
    } else {
      await ctx.reply(
        "Til topilmadi, iltimos qayta ro'yxatdan o'ting.\nЯзык не найден, пожалуйста, зарегистрируйтесь заново."
      );
    }
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(['generous','patient'])
  async registerGenerous(@Ctx() ctx: MyContext) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    const contextAction = ctx.callbackQuery!["data"];
    await this.botModel.update(
      { role: contextAction,last_state:"name" },
      { where: { user_id } }
    );
    await ctx.editMessageText(askNameMessage[language]);
   
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^Reapirconfirm/)
  async onConfirm(@Ctx() ctx: Context) {
    await this.adminService.adminConfirm(ctx);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^Requestconfirm/)
  async onConfirmReq(@Ctx() ctx: Context) {
    await this.adminService.adminConfirmReq(ctx);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^Requestedit_+\d+/)
  async onEditReq(@Ctx() ctx: Context) {
    await this.adminService.adminEditReq(ctx);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^Requestcancel_+\d+/)
  async onCancelReq(@Ctx() ctx: Context) {
    await this.adminService.adminCancelReq(ctx);
  }

  

  @UseGuards(ChannelSubscriptionGuard)
  @Action("back_to_menu")
  async onBack(@Ctx() ctx: Context) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    if(findUser && findUser.last_state=="finish"){
      try {
        const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
        switch (findUser.role) {
          case 'generous':
            await ctx.editMessageText(mainMessage[language], {
              reply_markup: generousMenuKeys[language],
            });
            break;
          case 'patient':
            await ctx.editMessageText(mainMessage[language], {
              reply_markup: patientMenuKeys[language],
            });
            break;
          default:
            break;
        }
      } catch (error) {
        const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
        const removedMessage =  await ctx.reply(mainMessage[language], {
          reply_markup: {
            remove_keyboard: true 
          }
        });
        await ctx.deleteMessage(removedMessage.message_id);
        switch (findUser.role) {
          case 'generous':
            await ctx.reply(mainMessage[language], {
              reply_markup: generousMenuKeys[language],
            });
            break;
          case 'patient':
            await ctx.reply(mainMessage[language], {
              reply_markup: patientMenuKeys[language],
            });
            break;
          default:
            break;
        }
      }
     
    }else{
      await ctx.editMessageText(startMessage, { reply_markup: selectLangKeys });
    }
    
  }

  @UseGuards(ChannelSubscriptionGuard)
  @On("contact")
  async onContact(@Ctx() ctx: Context) {
   this.botService.onContactUser(ctx)
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(/regionPage/)
  async page(@Ctx() ctx: Context) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    const [, page] = (ctx.update as any).callback_query.data.split('=');
    const buttons = this.buttonService.generateRegionButtons(
      +page,
      language,
      'region',
    );
    await ctx.editMessageText(askRegionMessage[language], {
      reply_markup: buttons,
    });
  }
  @UseGuards(ChannelSubscriptionGuard)
  @Action(/region=/)
  async callbackHandler(@Ctx() ctx: Context) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    const [, region] = (ctx.update as any).callback_query.data.split('=');
    await this.botModel.update(
        { region,}, 
        { where: { user_id } }
      );
      findUser!.last_state="district"
      findUser?.save()
          const buttons = this.buttonService.generateDistrictButtons(
            region,
            0,
            language,
            'district',
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

  @UseGuards(ChannelSubscriptionGuard)
  @Action('backToReg')
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
      'region',
    );
    await ctx.editMessageText(askRegionMessage[language], {
      reply_markup: buttons,
    });
  }


  @UseGuards(ChannelSubscriptionGuard)
  @Action(/districtPage/)
  async pageDistrict(@Ctx() ctx: MyContext) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    const region = findUser!.region ?? '';
    const [, page] = (ctx.update as any).callback_query.data.split('=');
    const buttons = this.buttonService.generateDistrictButtons(
      region,
      +page,
      language,
      'district',
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
  @UseGuards(ChannelSubscriptionGuard)
    @Action(/^district=/)
    async callbackHandlerDistrict(ctx: MyContext) {
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
              Markup.button.callback('❌', `reject__district`),
            ],
          ],
        },
      });
    }
    @UseGuards(ChannelSubscriptionGuard)
  @Action('accept')
  async accept(@Ctx() ctx: MyContext) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    findUser!.last_state="finish"
    findUser!.status=true
    findUser?.save()
    if(findUser?.role=="generous"){
      await ctx.editMessageText(
        mainMessage[language],
        {
          reply_markup: generousMenuKeys[language],
        },
      );
    }else if(findUser?.role=="patient"){
      await ctx.editMessageText(
        mainMessage[language],
        {
          reply_markup: patientMenuKeys[language],
        },
      );
    }
  
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action('repair')
  async repair(@Ctx() ctx: Context) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    await this.donationModel.create({generous_id:user_id, last_state:"require", whom:"istalgan odamga"} )
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    await ctx.editMessageText(stuffs[language]);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action("helpFor")
  async repairThing(@Ctx() ctx: Context) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    await this.donationModel.update(
      { last_state:"require",whom:"istalgan odamga" }, 
      { where: { generous_id:user_id} } 
    );
    await ctx.editMessageText(stuffs[language]);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(/reject__district/)
  async reject(@Ctx() ctx: Context) {
    // const [, id] = (ctx.update as any).callback_query.data.split('=');
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    await this.donationModel.destroy({ where:{id:user_id} });
    if (findUser) {
      findUser.last_state = "region";
    }
    await findUser?.save()
      const buttons = this.buttonService.generateRegionButtons(
        0,
        language,
        'region',
      );
      if (ctx.callbackQuery && 'message' in ctx.callbackQuery) {
        await ctx.deleteMessage(ctx.callbackQuery.message!.message_id);
        await ctx.reply(askRegionMessage[language], {
          reply_markup: buttons,
        });
      }

  }

  
  @UseGuards(ChannelSubscriptionGuard)
  @Action("apply")
  async onAskReq(@Ctx() ctx: Context) {

    await this.botService.askReq(ctx);
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^reqaccept/)
  async acceptReq(@Ctx() ctx: Context) {
    await this.botService.acceptReq(ctx)
  }


  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^reject=/)
  async cancelRepair(@Ctx() ctx: Context) {
    ctx.editMessageText("Bekor qilindi")
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^reqreject=/)
  async cancelReqRepair(@Ctx() ctx: Context) {
    ctx.editMessageText("Bekor qilindi")
  }
  @UseGuards(ChannelSubscriptionGuard)
  @Action(/^accept/)
  async acceptRepair(@Ctx() ctx: Context) {
    const findAdmin = await this.adminModel.findOne();
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
    const [, id] = (ctx.update as any).callback_query.data.split('=');
    const application = await this.donationModel.findOne({
      where: { id }
    });
    application!.last_state="adminConfirm"
    application?.save()
    const generous=await this.botModel.findOne({where:{user_id:application?.dataValues.generous_id}})
    await ctx.editMessageText(thankMessage[language]);
    await ctx.reply(mainMessage[language], {
      reply_markup: generousMenuKeys[language],
    });
    const chanelMesage =
      `Kimdan:\n  Ismi: ${generous?.dataValues.real_name}\n` +
      `   Viloyati: ${generous?.dataValues.region}\n` +
      `   Tumani:  ${generous?.dataValues.district}\n` +
      `   Telefon raqami  <code>${generous?.dataValues.phone_number}</code>\n` +
      `   Nima hadya qilmoqchi? <b>${application?.dataValues.what}</b>\n` +
      `\nKimga: \n      ${
        'istalgan odamga'
      }\n`;

      await this.bot.telegram.sendMessage(
        String(findAdmin?.dataValues.admin_id),
        chanelMesage,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Tasdiqlash",
                  callback_data: `Reapirconfirm_${application?.id}`,
                },
                {
                  text: "📝Tahrirlash",
                  callback_data: `Repairedit_${application?.id}`,
                },
              ],
              [
                {
                  text: "❌ Bekor qilish",
                  callback_data: `Reapircancel_${application?.id}`,
                },
              ]
            ],
          },
        }
      );
  }

  @UseGuards(ChannelSubscriptionGuard)
  @Action('subscribed')
  async subscribed(@Ctx() ctx: Context) {
    const user_id=ctx.from?.id
    const user = await this.botModel.findOne({
      where: { user_id},
    });
this.onStart(ctx)
  }


  @UseGuards(ChannelSubscriptionGuard)
  @On("text")
  async onText(@Ctx() ctx: Context) {
    await this.botService.onText(ctx);
  }


}