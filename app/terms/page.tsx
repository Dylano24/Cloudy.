import Image from 'next/image';
import Link from 'next/link';

const sections = [
  {
    title: '1. Introduction',
    body: `These Terms of Service ("Terms") govern access to and use of our Discord community, Rust game servers, website, online store, and any related services operated by us (collectively referred to as the "Services").\n\nBy accessing or using our Services, you agree to be bound by these Terms. Our Discord Rules and Rust Server Rules are separate documents that define additional requirements regarding community behavior and gameplay rules. These rules form an integral part of our general operating guidelines.`,
  },
  {
    title: '2. Community Conduct',
    body: `Users must comply with our Discord Rules and Rust Server Rules available on our official platforms. Any behavior that negatively impacts the community, the operation of our Services, or the experience of other users may result in administrative action.`,
  },
  {
    title: '3. Service Availability',
    body: `Our Services are provided "as is" and according to their availability. While we make reasonable efforts to maintain reliable access to our Services, we cannot guarantee permanent and uninterrupted availability.\n\nTemporary interruptions, periods of unavailability, maintenance, or technical issues may occur, including but not limited to:\n\n• Hosting provider failures\n• Server maintenance\n• Discord outages\n• PlayStation Network or Xbox Network outages\n• Issues related to Internet infrastructure\n• Third-party service failures\n• Payment provider issues\n• Cybersecurity incidents or DDoS attacks`,
  },
  {
    title: '4. Wipes, Rollbacks and Data Loss',
    body: `Rust servers may be subject to scheduled wipes, emergency wipes, rollbacks, technical issues, or unexpected data loss. These situations may result in the loss of in-game items, bases, inventories, progression, statistics, or any other digital content.\n\nUsers acknowledge that online gaming services may experience technical limitations and that these events may occur despite reasonable measures taken to prevent them.`,
  },
  {
    title: '5. Limitation of Liability',
    body: `To the extent permitted by applicable law, we shall not be held liable for, including but not limited to:\n\n• Loss of in-game content or progression\n• Temporary service interruptions\n• Failures of our hosting provider or third-party platforms\n• Data loss\n• Indirect damages resulting from the use of our Services\n\nAt our sole discretion, and without any obligation on our part, we may decide to provide compensation, extensions, or any other goodwill gesture in exceptional circumstances. Providing compensation in one situation does not create any obligation to provide compensation in future situations.`,
  },
  {
    title: '6. Administrative Actions',
    body: `We reserve the right to take appropriate measures whenever necessary to protect our community, our Services, and our users. Depending on the circumstances, these measures may include restricting access to certain features, removing benefits obtained or used abusively, suspending access, or permanently denying access to our Services.\n\nAdministrative decisions are made based on each individual situation and remain at our reasonable discretion.`,
  },
  {
    title: '7. Changes to These Terms',
    body: `We reserve the right to modify these Terms at any time. The most recent version published on our official website or official Discord server will always be considered the applicable version. Continued use of our Services after changes to these Terms constitutes acceptance of the updated conditions.`,
  },
  {
    title: '8. Governing Law',
    body: `These Terms shall be governed and interpreted in accordance with French law. These Terms apply to all users worldwide. However, mandatory consumer protection rights provided by the applicable laws of the user's country of residence remain applicable where required by law.`,
  },
];

export default function TermsPage() {
  return (
    <main className="cloudy-terms-page">
      <div className="cloudy-terms-wrap">
        <header className="cloudy-terms-head">
          <Image src="/images/cloudy-c.svg" alt="Cloudy C" width={80} height={80} />
          <span>Cloudy Rust</span>
          <h1>Terms of Service</h1>
          <p>
            These terms apply to the Cloudy community, Rust servers, website, online store and related services.
          </p>
          <Link href="/" className="cloudy-cta-secondary">
            Back to Cloudy
          </Link>
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
