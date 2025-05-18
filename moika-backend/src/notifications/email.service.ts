import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      text,
      html: html || text,
    };
    try {
      await sgMail.send(msg);
      this.logger.log(`Email sent to ${to}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send email to ${to}: ${error?.message || error}`,
      );
      throw error;
    }
  }
}
