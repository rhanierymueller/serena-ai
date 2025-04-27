import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendActivationEmail(email: string, name: string, activationLink: string) {
  await transporter.sendMail({
    from: `"Avylia AI" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Ative sua conta - Avylia AI",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
        <h2>Bem-vindo(a), ${name}!</h2>
        <p style="font-size: 16px;">Sua conta foi criada com sucesso! Clique abaixo para ativá-la:</p>
        <a href="${activationLink}" target="_blank" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #6DAEDB; color: white; text-decoration: none; border-radius: 5px;">Ativar minha conta</a>
        <p style="margin-top: 20px; font-size: 12px; color: #999;">Se não foi você, ignore este e-mail.</p>
      </div>
    `,
  });
}

export async function sendResetPasswordEmail(email: string, name: string, resetLink: string) {
  await transporter.sendMail({
    from: `"Avylia AI" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Redefinir sua senha - Avylia AI",
    html: `
      <div style="background-color: #0d0d0d; color: #ffffff; font-family: Arial, sans-serif; padding: 40px 20px; text-align: center;">
        <h1 style="color: #6DAEDB; margin-bottom: 24px;">Redefinir Senha</h1>
        <p style="font-size: 16px; margin-bottom: 32px;">Olá, <strong>${name}</strong>!</p>
        <p style="font-size: 16px; margin-bottom: 32px;">
          Recebemos uma solicitação para redefinir sua senha. <br /> 
          Clique no botão abaixo para continuar:
        </p>
        <a href="${resetLink}" target="_blank" 
          style="display: inline-block; padding: 14px 28px; background-color: #6DAEDB; color: #0d0d0d; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 16px;">
          Redefinir Senha
        </a>
        <p style="margin-top: 40px; font-size: 14px; color: #bbbbbb;">
          Se você não solicitou a redefinição de senha, ignore este e-mail.<br />
          Este link expira em breve por segurança.
        </p>
      </div>
    `,
  });
}

