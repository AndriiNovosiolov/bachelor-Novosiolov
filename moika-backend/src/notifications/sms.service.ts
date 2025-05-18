import { Injectable, Logger } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client;
  private readonly from: string;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
    );
    this.from = process.env.TWILIO_PHONE_NUMBER!;
  }

  async sendSms(to: string, body: string) {
    try {
      await this.client.messages.create({
        body,
        from: this.from,
        to,
      });
      this.logger.log(`SMS sent to ${to}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send SMS to ${to}: ${error?.message || error}`,
      );
      throw error;
    }
  }
}
