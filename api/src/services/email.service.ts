import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { AppError } from '../utils/app-error';

let transporter: Transporter | null = null;

export class EmailService {
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    const mailer = getTransporter();

    try {
      await mailer.sendMail({
        from: env.email.from,
        to: email,
        subject: 'Redefinicao de senha',
        text: `Acesse o link para redefinir sua senha: ${resetLink}`,
        html: `
          <p>Recebemos um pedido para redefinir sua senha.</p>
          <p>
            Para continuar, acesse o link abaixo:
            <a href="${resetLink}">${resetLink}</a>
          </p>
          <p>Se voce nao solicitou a redefinicao, pode ignorar este e-mail.</p>
        `,
      });
    } catch {
      throw new AppError('Nao foi possivel enviar o e-mail de redefinicao.', 500);
    }
  }
}

function getTransporter(): Transporter {
  if (!env.email.host || !env.email.user || !env.email.password || !env.email.from) {
    throw new AppError('Configuracao de e-mail incompleta.', 500);
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465,
      auth: {
        user: env.email.user,
        pass: env.email.password,
      },
    });
  }

  return transporter;
}
