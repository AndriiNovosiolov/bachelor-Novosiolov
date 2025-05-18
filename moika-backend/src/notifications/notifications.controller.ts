import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  @Post('test-email')
  @ApiOperation({ summary: 'Send test email via SendGrid' })
  @ApiResponse({ status: 200, description: 'Email sent' })
  async sendTestEmail(
    @Body() body: { to: string; subject: string; text: string; html?: string },
  ) {
    await this.emailService.sendEmail(
      body.to,
      body.subject,
      body.text,
      body.html,
    );
    return { message: 'Email sent' };
  }

  @Post('test-sms')
  @ApiOperation({ summary: 'Send test SMS via Twilio' })
  @ApiResponse({ status: 200, description: 'SMS sent' })
  async sendTestSms(@Body() body: { to: string; text: string }) {
    await this.smsService.sendSms(body.to, body.text);
    return { message: 'SMS sent' };
  }
}
