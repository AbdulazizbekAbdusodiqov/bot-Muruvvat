import { ReplyKeyboardMarkup } from '@telegraf/types';
import { Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export const selectLangKeys: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback("🇺🇿 O'zbekcha", 'uz')],
    [Markup.button.callback('🇷🇺 Русский', 'ru')],
  ],
};

export const registerMenuKeys: Record<string, InlineKeyboardMarkup>  = {
  uz: {
    inline_keyboard: [
      [
        Markup.button.callback('👨 Sahiy', 'generous'),
        Markup.button.callback('👨 Sabrli', 'patient'),
      ],
    ],
  },
  ru: {
    inline_keyboard: [
      [
        Markup.button.callback('👨 Щедрый', 'generous'),
        Markup.button.callback('👨 Терпеливый', 'patient'),
      ],
    ],
  },
};

export const phoneNumberKeys: Record<string, ReplyKeyboardMarkup> = {
  uz: {
    keyboard: [[Markup.button.contactRequest('📞 Telefon raqamni yuborish')]],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
  ru: {
    keyboard: [[Markup.button.contactRequest('📞 Отправить номер телефона')]],
    resize_keyboard: true,
    one_time_keyboard: true,
  }
};
