import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { EmailData } from '../types';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  private static async sendEmail(emailData: EmailData) {
    try {
      const info = await this.transporter.sendMail({
        from: config.smtp.from,
        to: emailData.to,
        subject: emailData.subject,
        html: this.getEmailTemplate(emailData.template, emailData.data),
      });

      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  static async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${config.frontendUrl}/verify-email/${token}`;

    await this.sendEmail({
      to: email,
      subject: 'Vérification de votre compte GROWF',
      template: 'verification',
      data: {
        verificationUrl,
        email
      }
    });
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${config.frontendUrl}/reset-password/${token}`;

    await this.sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe GROWF',
      template: 'passwordReset',
      data: {
        resetUrl,
        email
      }
    });
  }

  static async sendApplicationSubmittedEmail(email: string, programTitle: string, applicationId: string) {
    await this.sendEmail({
      to: email,
      subject: `Candidature soumise - ${programTitle}`,
      template: 'applicationSubmitted',
      data: {
        programTitle,
        applicationId,
        dashboardUrl: `${config.frontendUrl}/dashboard`
      }
    });
  }

  static async sendApplicationStatusEmail(email: string, programTitle: string, status: string, message?: string) {
    const statusText = {
      'APPROVED': 'approuvée',
      'REJECTED': 'rejetée',
      'UNDER_REVIEW': 'en cours d\'examen'
    }[status] || status;

    await this.sendEmail({
      to: email,
      subject: `Candidature ${statusText} - ${programTitle}`,
      template: 'applicationStatus',
      data: {
        programTitle,
        status: statusText,
        message,
        dashboardUrl: `${config.frontendUrl}/dashboard`
      }
    });
  }

  static async sendNewMessageEmail(email: string, programTitle: string, senderName: string) {
    await this.sendEmail({
      to: email,
      subject: `Nouveau message - ${programTitle}`,
      template: 'newMessage',
      data: {
        programTitle,
        senderName,
        dashboardUrl: `${config.frontendUrl}/dashboard`
      }
    });
  }

  private static getEmailTemplate(template: string, data: any): string {
    const baseStyles = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    `;

    const templates = {
      verification: `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>GROWF</h1>
            <h2>Vérification de votre compte</h2>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Merci de vous être inscrit sur GROWF. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
            <p><a href="${data.verificationUrl}" class="button">Vérifier mon compte</a></p>
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
            <p>${data.verificationUrl}</p>
            <p>Ce lien expire dans 24 heures.</p>
          </div>
          <div class="footer">
            <p>© 2024 GROWF. Tous droits réservés.</p>
          </div>
        </div>
      `,

      passwordReset: `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>GROWF</h1>
            <h2>Réinitialisation de mot de passe</h2>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
            <p><a href="${data.resetUrl}" class="button">Réinitialiser mon mot de passe</a></p>
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
            <p>${data.resetUrl}</p>
            <p>Ce lien expire dans 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez ce message.</p>
          </div>
          <div class="footer">
            <p>© 2024 GROWF. Tous droits réservés.</p>
          </div>
        </div>
      `,

      applicationSubmitted: `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>GROWF</h1>
            <h2>Candidature soumise</h2>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Votre candidature pour le programme <strong>"${data.programTitle}"</strong> a été soumise avec succès.</p>
            <p><strong>ID de candidature :</strong> ${data.applicationId}</p>
            <p>Vous recevrez une notification dès que votre candidature sera examinée.</p>
            <p><a href="${data.dashboardUrl}" class="button">Voir mes candidatures</a></p>
          </div>
          <div class="footer">
            <p>© 2024 GROWF. Tous droits réservés.</p>
          </div>
        </div>
      `,

      applicationStatus: `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>GROWF</h1>
            <h2>Mise à jour de candidature</h2>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Le statut de votre candidature pour le programme <strong>"${data.programTitle}"</strong> a été mis à jour.</p>
            <p><strong>Nouveau statut :</strong> ${data.status}</p>
            ${data.message ? `<p><strong>Message :</strong> ${data.message}</p>` : ''}
            <p><a href="${data.dashboardUrl}" class="button">Voir les détails</a></p>
          </div>
          <div class="footer">
            <p>© 2024 GROWF. Tous droits réservés.</p>
          </div>
        </div>
      `,

      newMessage: `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>GROWF</h1>
            <h2>Nouveau message</h2>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Vous avez reçu un nouveau message de <strong>${data.senderName}</strong> concernant votre candidature pour le programme <strong>"${data.programTitle}"</strong>.</p>
            <p><a href="${data.dashboardUrl}" class="button">Lire le message</a></p>
          </div>
          <div class="footer">
            <p>© 2024 GROWF. Tous droits réservés.</p>
          </div>
        </div>
      `
    };

    return templates[template as keyof typeof templates] || '';
  }
}