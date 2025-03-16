import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Bot } from "./models/bot.model";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { InlineKeyboardButton } from "telegraf/types";
import { Op } from "sequelize";
import { adminReplyMesage, askRegionMessage, mainMessage, PhoneNumberMessages, registerMessage, startMessage } from "./language_keys/language";
import { phoneNumberKeys, registerMenuKeys, selectLangKeys } from "./language_keys/keybord";
import { generousMenuKeys, mainMenuKeys } from "./language_keys/generous.keybord";
import { BOT_NAME } from "./app.constants";
import { ButtonsService } from "./register_service/generate_location";
import { Donation } from "./models/donation.model";
import { acceptMessage, BackMain, phoneConfirmed, registeredAsGenerous, registeredAsPatient, requestDetails, requestSent } from "./language_keys/messages";
import { Admin } from "./models/admin.model";
import { RequestPatient } from "./models/request.model";
import { patientMenuKeys } from "./language_keys/patient.keybord";
import { AnnounceAnswer } from "./models/announce_answer";
import { text } from "stream/consumers";

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectModel(Donation) private readonly donationModel: typeof Donation,
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
    @InjectModel(AnnounceAnswer) private readonly announceAnswerModel: typeof AnnounceAnswer,
    @InjectModel(RequestPatient) private readonly requestPatientModel: typeof RequestPatient,
    private readonly buttonService: ButtonsService,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}

  async start(ctx: Context) {
    console.log("start");
    
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    if(!findUser){
      await this.botModel.create({
        user_id,
        first_name: ctx.from?.first_name,
        last_name: ctx.from?.last_name,
        username:ctx.from?.username,
        last_state:"first_start"
      })
      await ctx.reply(startMessage, { reply_markup: selectLangKeys });
    }else{
      if(!findUser.status){
        await ctx.reply(startMessage, { reply_markup: selectLangKeys });
      }
    }
  }


  async selectRole(ctx: Context) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    if (!findUser || !findUser.lang) {
      return await ctx.reply("Til topilmadi, iltimos qayta ro'yxatdan o'ting.");
    }
    const language = findUser.lang === 'uz' ? 'uz' : 'ru';
    await ctx.editMessageText(registerMessage[language], {
      reply_markup: registerMenuKeys[language],
    });

  }




  async seePatients(ctx: Context, page:number = 0) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
  
    if (findUser && findUser.last_state === "finish") {
      const language = findUser.lang === 'uz' ? 'uz' : 'ru';
      const patients = await this.botModel.findAll({ where: { role: "patient" } });
      const requests = await this.requestPatientModel.findAll();
  
      if (patients.length === 0) {
        await ctx.reply(language === 'uz' ? "Sabrli foydalanuvchilar topilmadi." : "Терпеливый не найдены.");
        return;
      }
  
      const monthsUz = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
      const monthsRu = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  
      let message = language === 'uz' ? "Sabrli foydalanuvchilar va ularning murojaatlari:\n" : "Терпеливый и их обращения:\n";
  
      for (let i = page; i < page + 10; i++) {
        if (patients.length < i) {
          break;
        }
        const patient = patients[i];
      
        if (patient) {
          message += `🧑 ${patient.real_name} (<code>${language === 'uz' ? "Telefon raqami:" : "номер телефона:"}</code> ${patient.phone_number})\n`;
      
          const patientRequests = requests.filter(request => request.patient_id === patient.user_id);
      
          if (patientRequests.length > 0) {
            for (const request of patientRequests) {
              const date = new Date(request.createdAt);
              const day = date.getDate();
              const month = language === 'uz' ? monthsUz[date.getMonth()] : monthsRu[date.getMonth()];
              const year = date.getFullYear();
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
      
              message += `  <b>📄 ${language === 'uz' ? "Murojaat" : "Обращение"}:</b> ${request.description} (${language === 'uz' ? "Sana" : "Дата"}: ${day}-${month}-${year} ${hours}:${minutes})\n`;
            }
          } else {
            message += `   ${language === 'uz' ? "Murojaatlar yo'q" : "Обращений нет"}\n`;
          }
      
          message += "\n";
        }
      }
      if(page+10 < patients.length && page!=0 ){

        await ctx.editMessageText(message,{
          parse_mode:"HTML",
          reply_markup: {
            inline_keyboard: [
              [{text:"Oldinga 🔜", callback_data:`view_patients_for_generous=${page+10}`}],
              [{text:"Orqaga 🔙", callback_data:`view_patients_for_generous=${page-10}`}]
            ]
          }
        });
      } else if(page+10 > patients.length && page==0 ){

        await ctx.editMessageText(message,{
          parse_mode:"HTML",
          reply_markup: {
            inline_keyboard: [
              [{text:"Oldinga 🔜", callback_data:`view_patients_for_generous=${page+10}`}],
            ]
          }
        });
      } else if(page+10 > patients.length  ){
        
        await ctx.editMessageText(message,{
          parse_mode:"HTML",
          reply_markup: {
            inline_keyboard: [
              [{text:"Orqaga 🔙", callback_data:`view_patients_for_generous=${page-10}`}]
            ]
          }
        });
      }

      await ctx.reply(BackMain[language], {
        parse_mode: "HTML",
        reply_markup: mainMenuKeys[language] 
      });
      
    } else {
      await ctx.editMessageText(startMessage, { reply_markup: selectLangKeys });
    }
  }
  

  async askReq(ctx: Context) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    if (!findUser || !findUser.lang) {
      await ctx.reply(startMessage, { reply_markup: selectLangKeys });
    }else{
      await this.requestPatientModel.create({patient_id:user_id,last_state:"description"})
      const language = findUser.lang === 'uz' ? 'uz' : 'ru';
      await ctx.editMessageText(requestDetails[language]);
    }
  }



  async closedService(ctx: Context) {
    const user_id = ctx.from?.id;
    const announceId = ctx.callbackQuery!["data"].split("_")[1]
    const announce= await this.announceAnswerModel.findByPk(announceId)
    const findUser = await this.botModel.findByPk(user_id);
    if (!findUser || !findUser.lang) {
      await ctx.reply(startMessage, { reply_markup: selectLangKeys });
    }else{
      if(announce?.last_state!=="pending"){
        await ctx.editMessageText("Allaqachon yopilgan");
        return
      }else{
        if(announce.typeAnnounce=="donation"){
          const donation= await this.donationModel.findByPk(announce.announce_id)
          const generous= await this.botModel.findOne({where:{user_id:donation?.dataValues.generous_id}})
          let messageId=donation?.messageId
          let channelId = "@muruvvat_rasmiy";
          announce.last_state="finish"
          announce.save()
          if(generous){
            const messages = `
<b>🇺🇿 O'zbekcha</b>
Kimdan:
Ismi: ${generous.dataValues.real_name}
Viloyati: ${generous.dataValues.region}
Tumani: ${generous.dataValues.district}
Nima hadya qilmoqchi? <b>${donation!.dataValues.what}</b>

Ushbu hadyani qilgan sahiyimizga minnatdorchilik bildiramiz! ❤️
Ushbu hadya o'z egasini topdi. Sahiy insonimizga minnatdorchilik bildiramiz! ❤️

<b>🇷🇺 Русский</b>
От кого:
Имя: ${generous.dataValues.real_name}
Регион: ${generous.dataValues.region}
Район: ${generous.dataValues.district}
Что хочет подарить? <b>${donation!.dataValues.what}</b>

Мы благодарим нашего щедрого дарителя! ❤️
Этот подарок нашел своего владельца. Мы благодарим нашего щедрого дарителя! ❤️
`;
await ctx.telegram.editMessageText(channelId,+messageId!, undefined, messages,{parse_mode:"HTML"});
await ctx.editMessageText("Xabar muvaffaqiyatli yangilandi!");
          }else{
            const message = `<b>🇺🇿 O'zbekcha</b>
            Hadya: <b>${donation}</b>
            Ushbu hadya o'z egasini topdi. Sahovatli insonimizga minnatdorchilik bildiramiz! ❤️
            <b>🇷🇺 Русский</b>
            Подарок: <b>${donation}</b>
            Этот подарок нашел своего владельца. Мы благодарим нашего щедрого дарителя! ❤️`;

          await ctx.telegram.editMessageText(channelId,+messageId!, undefined, message,{parse_mode:"HTML"});
          await ctx.editMessageText("Xabar muvaffaqiyatli yangilandi!");
          }
        }else if(announce.typeAnnounce=="request"){
          const requestP= await this.requestPatientModel.findByPk(announce.announce_id)
          const patient= await this.botModel.findOne({where:{user_id:requestP?.patient_id}})
          announce.last_state="finish"
          announce.save()
          let messageId=requestP?.messageId
          let channelId = "@muruvvat_rasmiy";
   
          if(patient){
            const messages = `
            <b>🇺🇿 O'zbekcha</b>
            Kimdan:
            Ismi: ${patient!.dataValues.real_name}
            Viloyati: ${patient!.dataValues.region}
            Tumani: ${patient!.dataValues.district}
            Murojaatim? <b>${requestP!.dataValues.description}</b>
            Sahovatli insonlarimizga oldindan minnatdorchilik bildiramiz! ❤️
            
            Sahiylarimiz tomonidan yordam ko'rsatildi. Kanalimiz nomidan ushbu insonga minnatdorchilik bildiramiz! ❤️
            
            <b>🇷🇺 Русский</b>
            От кого:
            Имя: ${patient!.dataValues.real_name}
            Регион: ${patient!.dataValues.region}
            Район: ${patient!.dataValues.district}
            Моя просьба? <b>${requestP!.dataValues.description}</b>
            Мы заранее благодарим наших щедрых людей! ❤️
            
            Нашими щедрыми людьми была оказана помощь. От имени нашего канала выражаем благодарность этому человеку! ❤️`

            await ctx.telegram.editMessageText(channelId,+messageId!, undefined, messages,{parse_mode:"HTML"});
          await ctx.editMessageText("Xabar muvaffaqiyatli yangilandi!");
          }else{
            const message= `<b>🇺🇿 O'zbekcha</b>
            Murojaatim? <b>${requestP!.dataValues.description}</b>
            Sahovatli insonimiz yordam ko'rsatdilar. Minnatdorchilik bildiramiz! ❤️
            <b>🇷🇺 Русский</b>
            Моя просьба? <b>${requestP!.dataValues.description}</b>
            Наш щедрый человек оказал помощь. Выражаем благодарность! ❤️`
            await ctx.telegram.editMessageText(channelId,+messageId!, undefined, message,{parse_mode:"HTML"});
            await ctx.editMessageText("Xabar muvaffaqiyatli yangilandi!");

          }

          
          

        }





      }
    }
  }


  async donationService(ctx: Context) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser?.lang === 'uz' ? 'uz' : 'ru';
    const donationId = ctx.callbackQuery!["data"].split("_")[1]
    const donation= await this.donationModel.findByPk(donationId)
    const generous = await this.botModel.findByPk(donation?.dataValues.generous_id)
    const findAdmin = await this.adminModel.findOne();

    if(!findUser||!findUser.status){
      await ctx.reply(startMessage, { reply_markup: selectLangKeys });
      return
    }
    if(!donation){
      await ctx.reply("Bunday elon topilmadi noqulaylik uchun uzur suraymiz");
      return
    }else{
      if(findUser.role!="patient"){
        await ctx.reply(registeredAsGenerous[language]);
        await ctx.reply(mainMessage[language], {
          reply_markup: generousMenuKeys[language],
        })
        return
      }

      const toAdmin = `
      🎉 Ushbu e'lon bo'yicha muhtoj odam topildi!
      🎁 Donation: 
        Hadya qiluvchi: 
          Ismi: ${generous?.dataValues.real_name}
          Viloyati: ${generous?.dataValues.region}
          Tumani: ${generous?.dataValues.district}
          Telefon raqami: <code>${generous?.dataValues.phone_number}</code>
          Username: @${generous?.dataValues.username}
          Nima hadya qilmoqchi? <b>${donation?.dataValues.what}</b>
      
      🙏 Qabul qiluvchi: 
          Ismi: ${findUser.dataValues.real_name}
           Viloyati: ${findUser?.dataValues.region}
          Tumani: ${findUser?.dataValues.district}
          Telefon raqami: <code>${findUser.dataValues.phone_number}</code>
          Username: @${findUser.dataValues.username}

      `;


           const announce_answer=     await this.announceAnswerModel.create({
        generous_id:findUser.user_id,
        patient_id:findUser?.dataValues.user_id,
        announce_text:donation.dataValues.what,
        announce_id:donation.dataValues.id,
        last_state:"pending",
        typeAnnounce:"donation"
      })

      await this.bot.telegram.sendMessage(
        String(findAdmin?.dataValues.admin_id),
        toAdmin,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "\u2705 Yopildi", callback_data: `closed_${announce_answer.id}` }
              ]
            ]
          }
        }
    );

      await ctx.editMessageText(adminReplyMesage[language])
    }
  }


  async requestService(ctx: Context) {
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser?.lang === 'uz' ? 'uz' : 'ru';
    const requestId = ctx.callbackQuery!["data"].split("_")[1]
    const require = await this.requestPatientModel.findByPk(requestId)
    const patinet = await this.botModel.findByPk(require?.dataValues.patient_id)
    const findAdmin = await this.adminModel.findOne();

    if(!findUser||!findUser.status){
      await ctx.reply(startMessage, { reply_markup: selectLangKeys });
      return
    }
    if(!require){
      await ctx.reply("Bunday elon topilmadi noqulaylik uchun uzur suraymiz");
      return
    }else{
      if(findUser.role!="generous"){
        await ctx.reply(registeredAsPatient[language]);
        await ctx.reply(mainMessage[language], {
          reply_markup: generousMenuKeys[language],
        })
        return
      }

      const toAdmin = `
      🎉ID: ${require.description} e'lon bo'yicha yordam qo'lini cho'zadigan Sahiy topildi!
      🎁 Donation: 
        Hadya qiluvchi: 
          Ismi: ${findUser?.dataValues.real_name}
          Viloyati: ${findUser?.dataValues.region}
          Tumani: ${findUser?.dataValues.district}
          Telefon raqami: <code>${findUser?.dataValues.phone_number}</code>
          Username: @${findUser?.dataValues.username}
      
      🙏 Qabul qiluvchi: 
          Ismi: ${patinet!.dataValues.real_name}
           Viloyati: ${patinet!?.dataValues.region}
          Tumani: ${patinet!?.dataValues.district}
          Telefon raqami: <code>${patinet!.dataValues.phone_number}</code>
          Username: @${patinet!.dataValues.username}
      `;

        const announce_answer=     await this.announceAnswerModel.create({
        generous_id:findUser.user_id,
        patient_id:patinet?.dataValues.user_id,
        announce_text:require.description,
        announce_id:require.id,
        last_state:"pending",
        typeAnnounce:"request"
      })

      await this.bot.telegram.sendMessage(
        String(findAdmin?.dataValues.admin_id),
        toAdmin,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "\u2705 Yopildi", callback_data: `closed_${announce_answer.id}` }
              ]
            ]
          }
        }
    );

      await ctx.editMessageText(adminReplyMesage[language])
    }
  }


  async onContactUser(ctx: Context) {
    if ("contact" in ctx.message!) {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findByPk(user_id);
      if (!user) {
        await ctx.reply("Iltimos <b>Start</b> tugmasini bosing🔘", {
          parse_mode: "HTML",
          ...Markup.keyboard(["/start"]).resize().oneTime(),
        });
      } else if (ctx.message?.contact.user_id != user_id) {
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
      } else {
        if(user.last_state=="contact"){
          const user_id = ctx.from?.id;
          const findUser = await this.botModel.findByPk(user_id);
          const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
          user.phone_number = ctx.message.contact.phone_number;
          user.last_state = "region";
          await user.save();
          const buttons = this.buttonService.generateRegionButtons(
            0,
            language,
            'region',
          );
          await ctx.reply(phoneConfirmed[language], {
            parse_mode: "HTML",
            ...Markup.removeKeyboard(),
          });

          await ctx.reply(askRegionMessage[language], {
            reply_markup: buttons,
          });

          
        }else{
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
  }

  async acceptReq(ctx: Context) {
    const findAdmin = await this.adminModel.findOne();
    const user_id = ctx.from?.id;
    const findUser = await this.botModel.findByPk(user_id);
    const language = findUser?.lang === 'uz' ? 'uz' : 'ru';
    const [, id] = (ctx.update as any).callback_query.data.split('=');
    const application = await this.requestPatientModel.findOne({
      where: { id }
    });
    application!.last_state="adminConfirm"
    application?.save()
    const patient=await this.botModel.findOne({where:{user_id:application?.dataValues.patient_id}})
    await ctx.editMessageText(requestSent[language]);
    await ctx.reply(mainMessage[language], {
      reply_markup: patientMenuKeys[language],
    });
    const chanelMesage =
      `Kimdan:\n  Ismi: ${patient?.dataValues.real_name}\n` +
      `   Viloyati: ${patient?.dataValues.region}\n` +
      `   Tumani:  ${patient?.dataValues.district}\n` +
      `   Telefon raqami  <code>${patient?.dataValues.phone_number}</code>\n` +
      `   Murojaat matni? <b>${application?.dataValues.description}</b>\n` 
      
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
                  callback_data: `Requestconfirm_${application?.id}`,
                },
                {
                  text: "📝Tahrirlash",
                  callback_data: `Requestedit_${application?.id}`,
                },
              ],
              [
                {
                  text: "❌ Bekor qilish",
                  callback_data: `Requestcancel_${application?.id}`,
                },
              ]
            ],
          },
        }
      );


  }





  async onText(ctx: Context) {
    if ("text" in ctx.message!) {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findByPk(user_id);
      const findAdmin = await this.adminModel.findOne();
      const language = user?.lang === 'uz' ? 'uz' : 'ru';
      const donation= await this.donationModel.findOne({where:{generous_id:user_id,last_state:"require"}})
      const requestPatient= await this.requestPatientModel.findOne({where:{patient_id:user_id,last_state:"description"}})
      if(user){
        if (!user ) {
          await ctx.reply(`Siz avval ro'yxatdan o'ting🛑`, {
            parse_mode: "HTML",
            ...Markup.keyboard([["/start"]]).resize(),
          });
        } else {
          if(user.last_state=="name"){
            const user_id = ctx.from?.id;
            const findUser = await this.botModel.findByPk(user_id);
            const language = findUser!.lang === 'uz' ? 'uz' : 'ru';
            user.real_name = ctx.message.text;
            user.last_state="contact"
            user.save()
            ctx.reply(PhoneNumberMessages[language], {
              reply_markup: phoneNumberKeys[language],
              parse_mode: 'HTML',
            });
            return
          }

          if(donation?.dataValues.last_state=="require" && user.last_state !="adminRes"){
            await donation.update({
              what: ctx.message.text,
              last_state: "isConfirm",
              status:"pending"
            });
            await ctx.reply(acceptMessage[language], {
          reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback('✅', `accept=${donation.id}`),
              Markup.button.callback('❌', `reject=${donation.id}`),
            ],
          ],
        },
      });
          }
  
          if(requestPatient&& user.last_state !="adminRes"){
          await requestPatient.update({
              description: ctx.message.text,
              last_state: "isConfirm"
            });
  
            await ctx.reply(acceptMessage[language], {
              reply_markup: {
              inline_keyboard: [
                [
                  Markup.button.callback('✅', `reqaccept=${requestPatient.id}`),
                  Markup.button.callback('❌', `reqreject=${requestPatient.id}`),
                ],
              ],
            },
          });
          }
          if (user.last_state == "adminRes") {
            console.log("adminga savol");
            
            const findAdmin = await this.adminModel.findOne();
            const messageToAdmin = ctx.message.text;
            user.last_state="finish"
            user.save()
            const userInfo = `
          <b>Yangi xabar!</b>
          
          👤 Ismi: ${user.dataValues.real_name}
          🆔 ID: ${user.dataValues.user_id}
          📞 Telefon: ${user.dataValues.phone_number}
          📞 Kim sifatida ro'yxatdan o'tgan: ${user.dataValues.role}
          
          📝 Xabar: ${messageToAdmin}
            `;
          
            await this.bot.telegram.sendMessage(
              String(findAdmin?.dataValues.admin_id),
              userInfo,
              {
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "📝 Javob berish",
                        callback_data: `reply_${user.dataValues.user_id}`
                      }
                    ]
                  ]
                }
              }
            );
            
    switch (user.role ) {
      case 'generous':
        if(user.last_state == "finish"){
          await ctx.reply(mainMessage[language], {
            reply_markup: generousMenuKeys[language],
          });
        }
        break;
      case 'patient':
        if(user.last_state == "finish"){

          await ctx.reply(mainMessage[language], {
            reply_markup: patientMenuKeys[language],
          });
        }
        break;
      default:
        break;
    }
          }
      }
    }

    if(findAdmin){
      if (findAdmin && findAdmin.dataValues.last_state?.startsWith("chat_")) {
        const user_id = findAdmin.dataValues.last_state.split("_")[1];
        const replyMessage = ctx.message.text;
        await this.bot.telegram.sendMessage(
          user_id,
          `👨‍💼 Admin javobi: ${replyMessage}`
        );
        findAdmin.setDataValue('last_state', 'finish'); 
        await findAdmin.save();
        await ctx.reply("Habaringiz muvaffaqiyatli yuborildi ✅");
      }
      if(findAdmin.dataValues.last_state?.startsWith("editReq_")){
        const applicationId= findAdmin.dataValues.last_state.split("_")[1]
        const application= await this.requestPatientModel.findByPk(applicationId)
        if(!application){
        await ctx.reply("Malumotlar bazasidan bunday murojaat topilmadi");
        }else{
          application.description=ctx.message.text;
          application.save()
          findAdmin.setDataValue('last_state', 'finish'); 
          findAdmin.save()
          const patient=await this.botModel.findOne({where:{user_id:application?.dataValues.patient_id}})
          const chanelMesage =
          `Kimdan:\n  Ismi: ${patient?.dataValues.real_name}\n` +
          `   Viloyati: ${patient?.dataValues.region}\n` +
          `   Tumani:  ${patient?.dataValues.district}\n` +
          `   Telefon raqami  <code>${patient?.dataValues.phone_number}</code>\n` +
          `   Murojaat matni? <b>${application?.dataValues.description}</b>\n` 
          
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
                      callback_data: `Requestconfirm_${application?.id}`,
                    },
                    {
                      text: "📝Tahrirlash",
                      callback_data: `Requestedit_${application?.id}`,
                    },
                  ],
                  [
                    {
                      text: "❌ Bekor qilish",
                      callback_data: `Requestcancel_${application?.id}`,
                    },
                  ]
                ],
              },
            }
          );
        }
      }
    }

    ctx.deleteMessage(ctx.message.message_id)
      }


    }
  }
  

  