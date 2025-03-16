import { Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export const patientMenuKeys: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback(`🤲 Murojat Yo'llash`, 'apply')],
      [Markup.button.callback(`📞 Admin Bilan Bog'lanish`, 'toAdmin')],
      [Markup.button.callback('⚙️ Sozlamalar', 'settings')],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🤲 Отправить заявку', 'apply')],
      [
        Markup.button.callback(
          '📞 Связаться с администратором',
          'toAdmin',
        ),
      ],
      [Markup.button.callback('⚙️ Настройки', 'settings')],
    ],
  },
};
export const backToRegionsForPatient: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Ortga qaytish', 'back_to_r_for_p')],
    ],
  },
  ru: {
    inline_keyboard: [[Markup.button.callback('🔙 Назад', 'back_to_r_for_p')]],
  }
};

export const langForPatientKeys: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback("🇺🇿 O'zbekcha", 'setUz')],
    [Markup.button.callback('🇷🇺 Русский', 'setRu')]
  ],
};
export const settingsKeysForPatient: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [
        Markup.button.callback(
          `🌐 Tilni o'zgartirish`,
          'change_lang',
        ),
      ],
    ],
  },
  ru: {
    inline_keyboard: [
      [
        Markup.button.callback(`🌐 Изменить язык`, 'change_lang'),
      ],
    ],
  },
};
export const genderForPatient: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [
        Markup.button.callback('Erkak', 'male_patient'),
        Markup.button.callback('Ayol', 'female_patient'),
      ],
    ],
  },
  ru: {
    inline_keyboard: [
      [
        Markup.button.callback('Мужчина', 'male_patient'),
        Markup.button.callback('Женщина', 'female_patient'),
      ],
    ],
  },
};

export const backToPatientMenu: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Ortga qaytish', 'back_to_menu')],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Назад', 'back_to_menu')],
    ],
  },
};

