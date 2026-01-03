import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'fbelalhossain2072@gmail.com',
        pass: 'lszc hjyv kfqf dtif',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Task Manager" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: 'Your Password Reset OTP',
        html: `
          <p>Your password reset OTP is:</p>
          <h2 style="letter-spacing:4px">${otp}</h2>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn’t request this, please ignore this email.</p>
        `,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
