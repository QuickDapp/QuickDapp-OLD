import Mailgen from 'mailgen';
import { serverConfig } from '@/config/server';

// Configure mailgen by setting a theme and your product info
const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'QuickDapp',
    link: serverConfig.NEXT_PUBLIC_BASE_URL,
  },
});

export interface EmailContent {
  html: string;
  text: string;
}

export const generateEmail = (params: Mailgen.Content): EmailContent => {
  const html = mailGenerator.generate(params);
  const text = mailGenerator.generatePlaintext(params);

  return {
    html,
    text,
  };
};
