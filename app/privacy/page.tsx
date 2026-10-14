import Link from 'next/link';

const sections = [
  ['Information used for sign-in', 'When you choose Google or Discord sign-in, the selected provider authenticates you. Cloudy receives your provider account ID and display name to identify your signed-in account. Cloudy does not receive your Google or Discord password. Google sign-in requests only openid and profile; Discord sign-in requests only identify.'],
  ['How the information is used', 'Cloudy uses your account ID, display name and provider to sign you in and display your account information. The sign-in integration does not request access to your private messages, contacts or files, and does not use your profile information for advertising.'],
  ['Cookies and retention', 'The website stores a signed session cookie containing your provider account ID, display name and provider. The cookie expires after seven days, or is removed from your browser when you log off. Temporary sign-in cookies expire after ten minutes. The current account implementation does not create a separate persistent profile database.'],
  ['Service providers', 'Google or Discord processes the authentication according to its own privacy policies. The website is hosted on Vercel, which processes requests needed to run the website. Technical hosting logs may contain request information, such as an IP address. This notice does not promise a particular retention period for those providers’ own records.'],
  ['Your choices', 'You can log off, clear the site’s cookies, or revoke the website’s access through your Google or Discord account settings. You can contact Cloudy support with a request concerning the personal information processed by Cloudy.'],
  ['Other website features', 'This notice describes account sign-in. Purchases, payments and appeal submissions involve additional information you choose to provide and the services used to process those requests. Contact Cloudy support for information about those records.'],
] as const;

export default function PrivacyPage() {
  return <div className="cloudy-terms-page">
    <div className="cloudy-terms-wrap">
      <header className="cloudy-terms-head">
        <h1>Privacy notice</h1>
        <p>Cloudy account sign-in</p>
      </header>
      <div className="cloudy-terms-list">
        <section className="cloudy-term-card"><p>Cloudy operates the account sign-in on this website. For questions about your account data or a privacy request, contact Cloudy through the <Link href="/support" className="underline">Support page</Link>.</p></section>
        {sections.map(([title, body]) => <section className="cloudy-term-card" key={title}><h2>{title}</h2><p>{body}</p></section>)}
      </div>
    </div>
  </div>;
}
