import emailjs from '@emailjs/browser';

export const sendActivationEmail = async (email: string, name: string, activationLink: string) => {
  try {
    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID!,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID!,
      {
        email,
        name,
        activation_link: activationLink,
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY!
    );
    console.log('Email enviado com sucesso:', response);
    return response;
  } catch (error) {
    console.error('Erro ao enviar email de ativação:', error);
    throw error;
  }
};
