import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class TelegramUtilsService {
  private readonly logger = new Logger(TelegramUtilsService.name);
  private readonly genericAvatarUrl = 'https://i.pravatar.cc/300?u=random';
  private readonly telegramApiUrl: string;

  constructor(private readonly configService: ConfigService) {
    const botToken = this.configService.get<string>('TELEGRAM_TOKEN');
    this.telegramApiUrl = `https://api.telegram.org/bot${botToken}`;
  }

  async getProfilePhotoUrl(userIdTelegram: string | null): Promise<string> {
    if (!userIdTelegram) {
      this.logger.log('userIdTelegram is NULL, assigning random avatar');
      return this.getRandPhotoUrl();
    }

    try {
      const photoUrl = await this.fetchTelegramProfilePhoto(userIdTelegram);

      if (!photoUrl) {
        this.logger.warn(
          `User ${userIdTelegram} has no profile photo, assigning random avatar`,
        );
        return this.getRandPhotoUrl();
      }

      return photoUrl;
    } catch (error) {
      this.logger.error(
        `Error fetching Telegram profile photo for user ${userIdTelegram}`,
        error,
      );
      return this.getRandPhotoUrl();
    }
  }

  private async fetchTelegramProfilePhoto(userIdTelegram: string): Promise<string | null> {
    try {
      const response = await axios.post(`${this.telegramApiUrl}/getUserProfilePhotos`, {
        user_id: userIdTelegram,
      });

      const photos = response.data.result?.photos;
      if (photos && photos.length > 0) {
        const fileId = photos[0][0].file_id; // ID de la primera foto
        return this.getTelegramFileUrl(fileId);
      }

      return null; // No hay fotos disponibles
    } catch (error) {
      this.logger.error(
        `Error fetching profile photos for user ${userIdTelegram}`,
        error,
      );
      throw error;
    }
  }

  private async getTelegramFileUrl(fileId: string): Promise<string> {
    try {
      const response = await axios.post(`${this.telegramApiUrl}/getFile`, {
        file_id: fileId,
      });

      const filePath = response.data.result?.file_path;
      if (filePath) {
        return `https://api.telegram.org/file/bot${this.configService.get<string>('TELEGRAM_TOKEN')}/${filePath}`;
      }

      throw new Error('File path not found in Telegram response');
    } catch (error) {
      this.logger.error(`Error getting file URL for file_id ${fileId}`, error);
      throw error;
    }
  }

  async getRandPhotoUrl(): Promise<string> {
    try {
      return await this.fetchRandomAvatar();
    } catch (error) {
      this.logger.error('Error getting random avatar', error);
      return this.genericAvatarUrl;
    }
  }

  private async fetchRandomAvatar(): Promise<string> {
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await axios.get('https://api.randomuser.me/');
        return response.data.results[0].picture.large;
      } catch (error) {
        if (error.response?.status === 429) {
          this.logger.warn('Rate limit exceeded, retrying...');
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          this.logger.error('Error fetching random avatar', error);
          throw error;
        }
      }
    }

    throw new Error('Max retries reached');
  }
}
