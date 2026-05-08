import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  ?? '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '';
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  ?? '';

export const isEmailConfigured = () => !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  resetLink: string,
) {
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_email:   toEmail,
    user_name:  userName,
    reset_link: resetLink,
  }, PUBLIC_KEY);
}
