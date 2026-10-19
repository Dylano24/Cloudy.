const sections = [
  {
    title: '1. Legal information',
    body: 'Cloudy runs this website, online store and related gaming services. This policy explains what information we use and why.',
  },
  {
    title: '2. Information we collect',
    body: 'When you create an account, we collect your email address and password. We use your password only to protect your account and check your sign-in.\n\nIf you sign in with Google or Discord, we receive the name and account ID needed to recognize you. We do not receive your Google or Discord password or access to those accounts.\n\nWhen you make a purchase, we collect the details needed to deliver it.',
  },
  {
    title: '3. How we use information',
    body: 'We use your information to manage your account, process orders and deliver purchases to the right account. We also use it to answer account or order questions and protect the store against misuse.',
  },
  {
    title: '4. Cookies and browser storage',
    body: 'A cookie keeps you signed in. Your browser may save your basket and checkout details so you can continue later.',
  },
  {
    title: '5. Service providers',
    body: 'Vercel hosts the website and stores account information. Google and Discord handle sign-in when you choose them. The payment provider handles payments. Each provider receives only the information needed for its service.',
  },
  {
    title: '6. How long we keep your information',
    body: 'We keep your account information while your account exists. We keep purchase details as long as needed to handle your order.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="cloudy-terms-page">
      <div className="cloudy-terms-wrap">
        <header className="cloudy-terms-head">
          <img
            src="https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif"
            alt="Cloudy"
            width={80}
            height={80}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
          <h1>Privacy policy</h1>
        </header>

        <div className="cloudy-terms-list">
          {sections.map(section => (
            <section className="cloudy-term-card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
