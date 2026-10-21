const sections = [
  {
    title: '1. Legal information',
    body: 'Cloudy runs this website, online store and related gaming services. This policy explains what information we use when you visit the website, create an account, make a purchase, submit an appeal or use the assistant.',
  },
  {
    title: '2. Account information',
    body: 'When you create an account with an email address, we use your email address and password to create the account and check your sign-in. Your password is protected and is not stored as readable text.\n\nIf you sign in with Google or Discord, we receive the name and account ID needed to recognize you. We do not receive your Google or Discord password or access to those accounts.\n\nSigning out ends your session but does not delete your account.',
  },
  {
    title: '3. Purchases and payments',
    body: 'When you make a purchase, we use your email address and the account details needed to deliver it.\n\nCheckout and payment are handled by our store and payment providers. Cloudy uses the order information needed to confirm and deliver your purchase. We do not receive your full payment card number.',
  },
  {
    title: '4. Appeals and the assistant',
    body: 'If you submit an appeal, we receive the email address, account details, answers and any evidence you enter. Cloudy staff use this information to review the appeal.\n\nIf you use the website assistant, your message and recent conversation are sent to the assistant service so it can answer. Do not include passwords or payment details in a message.',
  },
  {
    title: '5. How we use information',
    body: 'We use information to manage accounts, process and deliver purchases, review appeals and answer questions. We also use basic technical information, such as request details, to keep the website working and protect it against misuse.',
  },
  {
    title: '6. Cookies and browser storage',
    body: 'A cookie keeps you signed in. Your browser may save your basket and checkout details so you can continue later.\n\nThe assistant saves your conversation in the browser tab while the website is open. You can close and reopen the assistant without losing the chat. Closing the website tab clears the conversation.',
  },
  {
    title: '7. Service providers',
    body: 'Vercel hosts the website and stores account information. Google and Discord handle sign-in when you choose them. Store and payment providers handle checkout and payments. Separate Cloudy services handle appeals and assistant messages. These services receive the information needed for their part of the service.',
  },
  {
    title: '8. How long we keep information',
    body: 'We keep account information while your account exists. We keep purchase details for as long as needed to handle orders and payment questions, and appeal details for as long as needed to review the request.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="cloudy-terms-page">
      <div className="cloudy-terms-wrap">
        <header className="cloudy-terms-head">
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
