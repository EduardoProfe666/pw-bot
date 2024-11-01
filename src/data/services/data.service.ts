import { Injectable } from '@nestjs/common';

@Injectable()
export default class DataService {
  constructor() {}

  // Professor Data
  public readonly PROFESSOR_NAME = 'Eduardo Alejandro González Martell';
  public readonly PROFESSOR_USERNAME = 'eduardoProfe666';

  // General Config
  public readonly BOT_NAME = 'PW Bot G-31';
  public readonly SUBJECT_NAME = 'Programación Web';
  public readonly GROUP_NUMBER = '31';
  public readonly TELEGRAM_BOT_ENABLED = true;
  public readonly LANGUAGE = 'es';
  public readonly UNAUTHORIZED_USERNAME = (name: string) => `
      Hola ${name}, no sé quién eres, pero sí sé 2 cosas de ti 😠:\n
      1. No eres del grupo 31 🫵.
      2. Sé donde vives 📍... Ya te tengo bien localizado 🙂
      `;

  // Telegram Bot Chat Responses
  // Commands
  public readonly START_COMMAND = (name: string) =>
    `Hola ${name}, estoy aquí para ayudarte 😊. Presiona los botones de abajo para saber más 👇. ¿Qué deseas hacer hoy?`;
  public readonly HELP_COMMAND = (name: string) =>
    `Hola ${name}, te lo dije hace un ratico pero bueno 🙄... Parece que somos un poco retrasad... digo olvidadiz@s 🥴. Presiona los botones de abajo para saber más 👇.`;

  // Buttons

}
