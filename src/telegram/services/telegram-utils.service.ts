import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export default class TelegramUtilsService {
  private readonly logger = new Logger(TelegramUtilsService.name);
  private readonly genericAvatarUrl = 'https://i.pravatar.cc/300?u=random';

  async getProfilePhotoUrl(): Promise<string> {
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
        if (error.response && error.response.status === 429) {
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