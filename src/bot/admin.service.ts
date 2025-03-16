import { Injectable } from "@nestjs/common";
import { Bot } from "./models/bot.model";
import { InjectBot } from "nestjs-telegraf";
import {Context,Markup,Telegraf} from "telegraf"

import { InjectModel } from "@nestjs/sequelize";
import { Admin } from "./models/admin.model";
import { BOT_NAME } from "./app.constants";
import { Donation } from "./models/donation.model";
import { RequestPatient } from "./models/request.model";
import { AnnounceAnswer } from "./models/announce_answer";




@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
    @InjectModel(Donation) private readonly donationModel: typeof Donation,
    @InjectModel(RequestPatient) private readonly requestPatientModel: typeof RequestPatient,
    @InjectModel(AnnounceAnswer) private readonly announceAnswerModel: typeof AnnounceAnswer,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}

  async admin(ctx: Context) {
    const admin_id = process.env.ADMIN;
    console.log(admin_id);
    
    const send_id = ctx.from?.id;
    const findAdmin = await this.adminModel.findByPk(admin_id);
    if (admin_id != send_id) {
      await ctx.reply(
        `Siz admin emassiz. Botdan foydalanish uchun start tugmasi bosiladi`,
        {
          parse_mode: "HTML",
        }
      );
    } else {
      if (!findAdmin) {
        await this.adminModel.create({
          admin_id,
          username: ctx.from?.username,
          first_name: ctx.from?.first_name,
          last_name: ctx.from?.last_name,
          lang: ctx.from?.language_code,
        });
      }

      await ctx.reply("Assalom Alaykum Admin tog'a tizimga xush kelibsiz✅👨‍💼", {
        reply_markup: {
          keyboard: [[{ text: "Sahiylar" }, { text: "Sabrlilar" },{ text: "Mijoz arizalari" }]],
          one_time_keyboard: false,
          resize_keyboard: true,
        },
      });
    }
  }


  async adminConfirm(ctx: Context) {
    const donationId=ctx.callbackQuery!["data"].split("_")[1]
    const donation = await this.donationModel.findOne({where:{id:donationId}})
    const generous = await this.botModel.findByPk(donation?.dataValues.generous_id);
    
    if (!generous || !donation) {
      return ctx.reply("Ma'lumot topilmadi❌");
    }
  
    const language = generous.dataValues.lang === 'uz' ? 'uz' : 'ru';
  
    const messages = `
<b>🇺🇿 O'zbekcha</b>
Kimdan:
Ismi: ${generous.dataValues.real_name}
Viloyati: ${generous.dataValues.region}
Tumani: ${generous.dataValues.district}
Nima hadya qilmoqchi? <b>${donation.dataValues.what}</b>

Ushbu hadyani qilgan sahiyimizga minnatdorchilik bildiramiz! ❤️

<b>🇷🇺 Русский</b>
От кого:
Имя: ${generous.dataValues.real_name}
Регион: ${generous.dataValues.region}
Район: ${generous.dataValues.district}
Что хочет подарить? <b>${donation.dataValues.what}</b>

Мы благодарим нашего щедрого дарителя! ❤️
`;
try {
  const inlineKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('🤲 Ushbu hadyaga muhtojman', `https://t.me/muruvvat_uzbot?start=needhelp_${donation.dataValues.id}`)]
  ]);

const message=  await this.bot.telegram.sendMessage(String(process.env.CHANNEL_ID), messages, {
    parse_mode: 'HTML',
    ...inlineKeyboard,
    
  });

  const messageId = message.message_id;
  donation.messageId= String(messageId)
  donation.last_state="announce"
  donation.save()
} catch (error) {
  console.log(error);
  
}
  }
  
  async adminConfirmReq(ctx: Context) {
    const donationId=ctx.callbackQuery!["data"].split("_")[1]
    const requestP = await this.requestPatientModel.findOne({where:{id:donationId}})
    const patient = await this.botModel.findByPk(requestP?.dataValues.patient_id);
    
    if (!patient || !requestP) {
      return ctx.reply("Ma'lumot topilmadi❌");
    }

    const language = patient.dataValues.lang === 'uz' ? 'uz' : 'ru';
    const messages = `
<b>🇺🇿 O'zbekcha</b>
Kimdan:
Ismi: ${patient.dataValues.real_name}
Viloyati: ${patient.dataValues.region}
Tumani: ${patient.dataValues.district}
Murojaatim? <b>${requestP.dataValues.description}</b>
Sahovatli insonlarimizga oldindan minnatdorchilik bildiramiz! ❤️

<b>🇷🇺 Русский</b>
От кого:
Имя: ${patient.dataValues.real_name}
Регион: ${patient.dataValues.region}
Район: ${patient.dataValues.district}
Моя просьба? <b>${requestP.dataValues.description}</b>
Мы заранее благодарим наших щедрых людей! ❤️
`;




try {
  const inlineKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('🤲 Yordam qo‘lini cho‘zaman', `https://t.me/muruvvat_uzbot?start=ihelp_${requestP.dataValues.id}`)]
  ]);
 const message= await this.bot.telegram.sendMessage(String(process.env.CHANNEL_ID), messages, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
  const messageId = message.message_id;
  requestP.messageId= String(messageId)
  requestP.last_state="announce"
  requestP.save()
  
} catch (error) {
  console.log(error.message);
   
}  
  }

  async adminEditReq(ctx: Context) {
  const application_id = ctx.callbackQuery!["data"].split("_")[1]
  const requestP = await this.requestPatientModel.findOne({where:{id:application_id}})
  const admin =await this.adminModel.findOne()
  if(!admin){
    console.log("admin topilmadi");
    
  }else{
    admin!.setDataValue("last_state",`editReq_${application_id}`);
    admin.save()
    ctx.reply(`Murojaat matni:<b> ${requestP?.description} </b> Nima deb o'zgartirish kiritmoqchisiz Yozib qoldiring`,{
      parse_mode:"HTML"
    });
  }
  }


  async onListGenerous(ctx: Context) {
    const admin_id = process.env.ADMIN;
    const send_id = ctx.from?.id;
    const findAdmin = await this.adminModel.findByPk(admin_id);
    const generous_list = await this.botModel.findAll({ where: { role: "generous" } });

    if (admin_id != send_id) {
        await ctx.reply(
            `Siz admin emassiz. Botdan foydalanish uchun start tugmasi bosiladi`,
            {
                parse_mode: "HTML",
            }
        );
    } else {
        if (generous_list.length === 0) {
            await ctx.reply(`Hali saxovatli foydalanuvchilar ro'yxati bo'sh.`);
            return;
        }

        let message = "<b>Saxovatli foydalanuvchilar ro'yxati:</b>\n\n";

        generous_list.forEach((user, index) => {
            message += `${index + 1}. Ismi: <b>${user.real_name}</b>\n`;
            message += `   Username: @${user.username || 'Yo‘q'}\n`;
            message += `   Telefon: ${user.phone_number || 'Ko‘rsatilmagan'}\n\n`;
        });

        await ctx.reply(message, { parse_mode: "HTML" });
    }
}

async onListPatients(ctx: Context) {
  const admin_id = process.env.ADMIN;
  const send_id = ctx.from?.id;
  const findAdmin = await this.adminModel.findByPk(admin_id);
  const patient_list = await this.botModel.findAll({ where: { role: "patient" } });

  if (admin_id != send_id) {
      await ctx.reply(
          `Siz admin emassiz. Botdan foydalanish uchun start tugmasi bosiladi`,
          {
              parse_mode: "HTML",
          }
      );
  } else {
      if (patient_list.length === 0) {
          await ctx.reply(`Hali saxovatli foydalanuvchilar ro'yxati bo'sh.`);
          return;
      }

      let message = "<b>Saxovatli foydalanuvchilar ro'yxati:</b>\n\n";

      patient_list.forEach((user, index) => {
          message += `${index + 1}. Ismi: <b>${user.real_name}</b>\n`;
          message += `   Username: @${user.username || 'Yo‘q'}\n`;
          message += `   Telefon: ${user.phone_number || 'Ko‘rsatilmagan'}\n\n`;
      });

      await ctx.reply(message, { parse_mode: "HTML" });
  }
}


async onListApplications(ctx: Context) {
  const admin_id = process.env.ADMIN;
  const send_id = ctx.from?.id;
  const findAdmin = await this.adminModel.findByPk(admin_id);
  const announce_answers = await this.announceAnswerModel.findAll({ where: { last_state: "pending" } });

  if (admin_id != send_id) {
    await ctx.reply(`Siz admin emassiz. Botdan foydalanish uchun start tugmasi bosiladi`, {
      parse_mode: "HTML",
    });
    return;
  }

  for (const answer of announce_answers) {
    if (!answer) continue; 

    let toAdmin = "";
    if (answer.typeAnnounce === "donation") {
      const generous= await this.botModel.findByPk(answer.generous_id)
      const patient= await this.botModel.findByPk(answer.patient_id)
      toAdmin = `
      🎉 Ushbu e'lon bo'yicha muhtoj odam topildi!
      🎁 Donation: 
        Hadya qiluvchi: 
          Ismi: ${generous!.dataValues.real_name}
          Viloyati: ${generous!.dataValues.region}
          Tumani: ${generous!.dataValues.district}
          Telefon raqami: <code>${generous!.dataValues.phone_number}</code>
          Username: @${generous!.dataValues.username}
          Nima hadya qilmoqchi? <b>${answer.dataValues.announce_text}</b>
      
      🙏 Qabul qiluvchi: 
          Ismi: ${patient!.dataValues.real_name}
          Viloyati: ${patient!.dataValues.region}
          Tumani: ${patient!.dataValues.district}
          Telefon raqami: <code>${patient!.dataValues.phone_number}</code>
          Username: @${patient!.dataValues.username}
      `;
    } else if (answer.typeAnnounce === "request") {
      const generous= await this.botModel.findByPk(answer.generous_id)
      const patient= await this.botModel.findByPk(answer.patient_id)

      toAdmin = `
      🎉ID: ${answer.announce_text} e'lon bo'yicha yordam qo'lini cho'zadigan Sahiy topildi!
      🎁 Donation: 
        Hadya qiluvchi: 
          Ismi: ${generous?.dataValues.real_name}
          Viloyati: ${generous?.dataValues.region}
          Tumani: ${generous?.dataValues.district}
          Telefon raqami: <code>${generous?.dataValues.phone_number}</code>
          Username: @${generous?.dataValues.username}
      
      🙏 Qabul qiluvchi: 
          Ismi: ${patient?.dataValues.real_name}
          Viloyati: ${patient?.dataValues.region}
          Tumani: ${patient?.dataValues.district}
          Telefon raqami: <code>${patient?.dataValues.phone_number}</code>
          Username: @${patient?.dataValues.username}
      `;
    }
    if (toAdmin) {
      await this.bot.telegram.sendMessage(
        String(findAdmin?.dataValues.admin_id),
        toAdmin,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [[{ text: "✅ Yopildi", callback_data: `closed_${answer.id}` }]],
          },
        }
      );
    }
  }
}

}