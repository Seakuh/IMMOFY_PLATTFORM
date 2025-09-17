import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ChatbotService } from 'src/chatbot/services/chatbot.service';
import { emailTemplate } from './email-template';
import { housingRequestEmailTemplate } from './housing-request-email.template';
import { TemplateService } from './template.service';

interface MailGenerationParams {
  email: string;
  password: string;
  prompt: string;
  packageId: string;
}

interface HousingRequestMailParams {
  email: string;
  password: string;
  housingRequestId: string;
  generatedDescription: string;
  filteredData: any;
}

@Injectable()
export class MailService {
  s;
  constructor(
    private readonly mailerService: MailerService,
    private readonly chatbotService: ChatbotService,
    private readonly templateService: TemplateService,
  ) {}

  async generateMail(
    params: MailGenerationParams,
    userId: string,
  ): Promise<string> {
    const { email, password, prompt, packageId } = params;

    try {
      // 1. Generate chatbot content
      const generatedInserat = await this.chatbotService.generateInseratText({
        userId,
        prompt,
        packageId: packageId,
        email,
      });

      console.log(`[INFO] Inserat Text generated: ${generatedInserat}.`);

      // 3. Compile template with data
      const htmlContent = this.templateService.compileTemplate(emailTemplate, {
        username: email,
        password,
        chatbotLink: 'https://guruhub-ai/home-finder/chat-bot',
        inserat: generatedInserat,
      });

      return htmlContent;
    } catch (error) {
      console.error(
        `[ERROR] Failed to generate email for ${email}:`,
        error.message,
      );
      throw new Error('Failed to generate email content.');
    }
  }

  async sendMail(
    userId,
    {
      to,
      subject,
      ...mailParams
    }: {
      to: string;
      subject: string;
    } & MailGenerationParams,
  ) {
    try {
      const html = await this.generateMail(mailParams, userId);

      // E-Mail senden
      await this.mailerService.sendMail({
        to,
        subject,
        html,
      });

      console.log(`E-Mail erfolgreich an ${to} gesendet.`);
    } catch (error) {
      console.error(`Fehler beim Senden der E-Mail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send housing request confirmation email
   */
  async sendHousingRequestEmail(
    params: HousingRequestMailParams,
  ): Promise<void> {
    try {
      const {
        email,
        password,
        housingRequestId,
        generatedDescription,
        filteredData,
      } = params;

      // Compile template with housing request data
      const htmlContent = this.templateService.compileTemplate(
        housingRequestEmailTemplate,
        {
          username: email,
          password,
          housingRequestDescription: generatedDescription,
          filteredData,
          loginLink: 'https://guruhub-ai.com/home-finder/login',
          housingRequestLink: `https://guruhub-ai.com/home-finder/housing-requests/${housingRequestId}`,
        },
      );

      // Send email
      await this.mailerService.sendMail({
        to: email,
        subject: '🏠 Ihr Wohnungsgesuch wurde erfolgreich erstellt!',
        html: htmlContent,
      });

      console.log(
        `Housing request confirmation email successfully sent to ${email}`,
      );
    } catch (error) {
      console.error(
        `Error sending housing request email to ${params.email}:`,
        error.message,
      );
      throw new Error('Failed to send housing request confirmation email.');
    }
  }
}
