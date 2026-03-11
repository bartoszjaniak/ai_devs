import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { VerifyAnswerModel } from './models/verify-answer.model';

interface VerifyPayload {
  apikey: string;
  task: 'people';
  answer: VerifyAnswerModel[];
}

@Injectable()
export class VerifyService {
  private readonly logger = new Logger(VerifyService.name);
  private readonly endpoint = 'https://hub.ag3nts.org/verify';

  constructor(private readonly configService: ConfigService) {}

  async submitPeopleAnswer(answer: VerifyAnswerModel[]): Promise<unknown> {
    const apiKey = this.configService.get<string>('COURSE_API_KEY');
    if (!apiKey) {
      throw new Error('COURSE_API_KEY is not set');
    }

    const payload: VerifyPayload = {
      apikey: apiKey,
      task: 'people',
      answer,
    };

    this.logger.log(`📤 Sending ${answer.length} records to verify endpoint`);

    const response = await axios.post(this.endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.logger.log('📬 Verify response received');

    return response.data;
  }
}
