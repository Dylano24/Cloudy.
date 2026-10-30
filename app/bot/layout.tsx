import { Space_Grotesk, Geist } from 'next/font/google';

// Font changes are intentionally scoped to /bot and its dashboard.
// Store, VPN, Home and Web solutions retain their exact current type and layout.
const cloudyHeadings = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const cloudyText = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export default function BotTypographyLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${cloudyHeadings.variable} ${cloudyText.variable}`}>{children}</div>;
}
