import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InlineKeyboardMarkup } from 'telegraf/types';
import { andijanCityKeys, bukharaCityKeys, ferganaCitysKeys, jizzaxCityKeys, karakalpakstanCityKeys, namanganCityKeys, navoiCityKeys, qashqadaryaCityKeys, regionKeys, samarkandCityKeys, sirdaryoCityKeys, surxandaryaCityKeys, tashkentCitysKeys, tashkentRegionCitysKeys, xorazmCityKeys } from '../language_keys/city';
import { Markup } from 'telegraf';


@Injectable()
export class ButtonsService {
  constructor(
  ) {}
  private perPage = 5;

  private navigationLabels = {
    uz: { back: '⬅️ Orqaga', next: 'Oldinga ➡️' },
    ru: { back: '⬅️ Назад', next: 'Вперёд ➡️' }
  };

  generateRegionButtons(
    page: number,
    lang: any,
    customCallback: string,
  ): InlineKeyboardMarkup {
    const start = page * this.perPage;
    const end = start + this.perPage;
    const totalPages = Math.ceil(regionKeys[lang].length / this.perPage);

    const buttons = regionKeys[lang]
      .slice(start, end)
      .map(([text, callback]) => {
        return [Markup.button.callback(text, customCallback + '=' + callback)];
      });

      const navButtons: any[] = []; 
    if (page > 0) {
      navButtons.push(
        Markup.button.callback(
          this.navigationLabels[lang].back,
          `${customCallback}Page=${page - 1}`,
        ),
      );
    }
    if (page < totalPages - 1) {
      navButtons.push(
        Markup.button.callback(
          this.navigationLabels[lang].next,
          `${customCallback}Page=${page + 1}`,
        ),
      );
    }

    if (navButtons.length) {
      buttons.push(navButtons);
    }

    return { inline_keyboard: buttons };
  }

  generateDistrictButtons(
    region: string,
    page: number,
    lang: any,
    customCallback: string,
  ): InlineKeyboardMarkup {
    const start = page * this.perPage;
    const end = start + this.perPage;
    let totalPages: number;

    let buttons: any[][];

    switch (region) {
      case 'toshkent shahar':
        totalPages = Math.ceil(tashkentCitysKeys[lang].length / this.perPage);
        buttons = tashkentCitysKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'toshkent viloyat':
        totalPages = Math.ceil(
          tashkentRegionCitysKeys[lang].length / this.perPage,
        );
        buttons = tashkentRegionCitysKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'samarqand':
        totalPages = Math.ceil(samarkandCityKeys[lang].length / this.perPage);
        buttons = samarkandCityKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'buxoro':
        totalPages = Math.ceil(bukharaCityKeys[lang].length / this.perPage);
        buttons = bukharaCityKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'andijon':
        totalPages = Math.ceil(andijanCityKeys[lang].length / this.perPage);
        buttons = andijanCityKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'fargona':
        totalPages = Math.ceil(ferganaCitysKeys[lang].length / this.perPage);
        buttons = ferganaCitysKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'namangan':
        totalPages = Math.ceil(namanganCityKeys[lang].length / this.perPage);
        buttons = namanganCityKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'qashqadaryo':
        totalPages = Math.ceil(qashqadaryaCityKeys[lang].length / this.perPage);
        buttons = qashqadaryaCityKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'jizzax':
        totalPages = Math.ceil(jizzaxCityKeys[lang].length / this.perPage);
        buttons = jizzaxCityKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'sirdaryo':
        totalPages = Math.ceil(sirdaryoCityKeys[lang].length / this.perPage);
        buttons = sirdaryoCityKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'xorazm':
        totalPages = Math.ceil(xorazmCityKeys[lang].length / this.perPage);
        buttons = xorazmCityKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'navoiy':
        totalPages = Math.ceil(navoiCityKeys[lang].length / this.perPage);
        buttons = navoiCityKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'surxondaryo':
        totalPages = Math.ceil(surxandaryaCityKeys[lang].length / this.perPage);
        buttons = surxandaryaCityKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      case 'qoraqalpogiston':
        totalPages = Math.ceil(
          karakalpakstanCityKeys[lang].length / this.perPage,
        );
        buttons = karakalpakstanCityKeys[lang]
          .slice(start, end)
          .map(([text, callback]) => {
            return [
              Markup.button.callback(text, customCallback + '=' + callback),
            ];
          });
        break;
      default:
        break;
    }

    const navButtons: any[] = []; 
    if (page > 0) {
      navButtons.push(
        Markup.button.callback(
          this.navigationLabels[lang].back,
          `${customCallback}Page=${page - 1}`,
        ),
      );
    }
    if (page < totalPages! - 1) {
      navButtons.push(
        Markup.button.callback(
          this.navigationLabels[lang].next,
          `${customCallback}Page=${page + 1}`,
        ),
      );
    }

    if (navButtons.length) {
      buttons!.push(navButtons);
    }
    return { inline_keyboard: buttons! };
  }


}
