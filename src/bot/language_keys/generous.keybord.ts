import { Markup } from 'telegraf';
import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from '@telegraf/types';

export const generousMenuKeys: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [
        Markup.button.callback('🤲 Muruvat Qilish', 'repair'),
        Markup.button.callback(
          `👀 Sabrlilarni ko'rish`,
          'view_patients_for_generous',
        ),
      ],
      [
        Markup.button.callback(
          `📞 Admin Bilan Bog'lanish`,
          'toAdmin',
        ),
      ],
      [Markup.button.callback('⚙️ Sozlamalar', 'settings')],
    ],
  },
  ru: {
    inline_keyboard: [
      [
        Markup.button.callback('🤲 Быть щедрым', 'repair'),
        Markup.button.callback(
          '👀 Посмотреть пациентов',
          'view_patients_for_generous',
        ),
      ],
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

export const repairKeys: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('👤 Istalgan odamga', 'helpFor')],
      [Markup.button.callback('🔙 Ortga qaytish', 'back_to_menu')],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('👤 Любому человеку', 'helpFor')],
      [Markup.button.callback('🔙 Назад', 'back_to_menu')],
    ],
  },
};

export const mainMenuKeys: Record<string, ReplyKeyboardMarkup> = {
  uz: {
    keyboard: [
      ['🏠 Asosiy menyu']
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  },
  ru: {
    keyboard: [
      ['🏠 Главное меню']
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  }
};


export const viewPatientsKeys: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [
        Markup.button.callback('👥 Barcha Sabrlilar', 'all_patients'),
        Markup.button.callback(
          `📍 Hudud Bo'yicha`,
          'patient_by_region_for_generous',
        ),
      ],
      [
        Markup.button.callback(
          `👫 Jins va Yoshi bo'yicha`,
          'patient_by_gender_age',
        ),
      ],
    ],
  },
  ru: {
    inline_keyboard: [
      [
        Markup.button.callback('👥 Все пациенты', 'all_patients'),
        Markup.button.callback(
          '📍 По региону',
          'patient_by_region_for_generous',
        ),
      ],
      [
        Markup.button.callback(
          '👫 По полу и возрасту',
          'patient_by_gender_age',
        ),
      ],
      [Markup.button.callback('🔙 Назад', 'back_to_menu')],
    ],
  },
};

export const backToViewPatients: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Ortga qaytish', 'back_to_view_patents')],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Назад', 'back_to_view_patents')],
    ],
}
};

export const backToGenerosMenu: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Ortga qaytish', 'back_to_menu')],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Назад', 'back_to_menu')],
    ],
  }
};

export const backToChanges: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Ortga qaytish', 'back_to_changes')],
    ],
  },
  ru: {
    inline_keyboard: [[Markup.button.callback('🔙 Назад', 'back_to_changes')]],
  },
  en: {
    inline_keyboard: [[Markup.button.callback('🔙 Back', 'back_to_changes')]],
  },
};

export const ageKeys: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [
        Markup.button.callback('3 yoshgacha', 'age_0_3'),
        Markup.button.callback('3 - 6 yosh', 'age_3_6'),
      ],
      [
        Markup.button.callback('6 - 9 yosh', 'age_6_9'),
        Markup.button.callback('9 - 12 yosh', 'age_9_12'),
      ],
      [
        Markup.button.callback('12 - 15 yosh', 'age_12_15'),
        Markup.button.callback('15 dan yuqori', 'age_15_100'),
      ],
    ],
  },
  ru: {
    inline_keyboard: [
      [
        Markup.button.callback('До 3 лет', 'age_0_3'),
        Markup.button.callback('3 - 6 лет', 'age_3_6'),
      ],
      [
        Markup.button.callback('6 - 9 лет', 'age_6_9'),
        Markup.button.callback('9 - 12 лет', 'age_9_12'),
      ],
      [
        Markup.button.callback('12 - 15 лет', 'age_12_15'),
        Markup.button.callback('Старше 15', 'age_15_100'),
      ],
    ],
  },
  
};

export const genderForAgeKeys: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [
        Markup.button.callback('Erkak', 'genderForAge_male'),
        Markup.button.callback('Ayol', 'genderForAge_female'),
      ],
    ],
  },
  ru: {
    inline_keyboard: [
      [
        Markup.button.callback('Мужчина', 'genderForAge_male'),
        Markup.button.callback('Женщина', 'genderForAge_female'),
      ],
    ],
  }
};

export const genderForSizeKeys: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [
        Markup.button.callback('Erkak', 'genderForSize_male'),
        Markup.button.callback('Ayol', 'genderForSize_female'),
      ],
    ],
  },
  ru: {
    inline_keyboard: [
      [
        Markup.button.callback('Мужчина', 'genderForSize_male'),
        Markup.button.callback('Женщина', 'genderForSize_female'),
      ],
    ],
  }
};

export const backToGendersForAge: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Ortga qaytish', 'backToGenderForAge')],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Назад', 'backToGenderForAge')],
    ],
  },
};

export const backToGendersForSize: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Ortga qaytish', 'backToGenderForSize')],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Назад', 'backToGenderForSize')],
    ],
  },
};

export const backToAges: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Ortga qaytish', 'backToAgeForGenerous')],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Назад', 'backToAgeForGenerous')],
    ],
  }
};

export const backToS: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Ortga qaytish', 'backToSizeForGenerous')],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Назад', 'backToSizeForGenerous')],
    ],
  },
};

export const setGenerousLangKeys: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback("🇺🇿 O'zbekcha", 'setLang_uz')],
    [Markup.button.callback('🇷🇺 Русский', 'setLang_ru')],
  ],
};

export const backToDistrictsForGenerous: Record<string, InlineKeyboardMarkup> =
  {
    uz: {
      inline_keyboard: [
        [Markup.button.callback('🔙 Ortga qaytish', 'backToDist')],
      ],
    },
    ru: {
      inline_keyboard: [
        [Markup.button.callback('🔙 Назад', 'backToDist')],
      ],
    },
  };

export const backToRegionsForGenerous: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Ortga qaytish', 'backToReg')],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Назад', 'backToReg')],
    ],
  },
};

export const settingsForGenerous: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [
        Markup.button.callback(`🌐 Tilni o'zgartirish`, 'change_lang'),
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

export const backToPatientsListFromRegion: Record<
  string,
  InlineKeyboardMarkup
> = {
  uz: {
    inline_keyboard: [
      [
        Markup.button.callback(
          '🔙 Ortga qaytish',
          'backToPatientsListFromRegion',
        ),
      ],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Назад', 'backToPatientsListFromRegion')],
    ],
  },
};

export const backToPatientsListFromGenderAge: Record<
  string,
  InlineKeyboardMarkup
> = {
  uz: {
    inline_keyboard: [
      [
        Markup.button.callback(
          '🔙 Ortga qaytish',
          'backToPatientsListFromGenderAge',
        ),
      ],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Назад', 'backToPatientsListFromGenderAge')],
    ],
  },
};

export const backToPatientsListFromGenderSize: Record<
  string,
  InlineKeyboardMarkup
> = {
  uz: {
    inline_keyboard: [
      [
        Markup.button.callback(
          '🔙 Ortga qaytish',
          'backToPatientsListFromGenderSize',
        ),
      ],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Назад', 'backToPatientsListFromGenderSize')],
    ],
  },
};

export const backToPatientsListFromAll: Record<string, InlineKeyboardMarkup> = {
  uz: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Ortga qaytish', 'backToPatientsListFromAll')],
    ],
  },
  ru: {
    inline_keyboard: [
      [Markup.button.callback('🔙 Назад', 'backToPatientsListFromAll')],
    ],
  },
};
