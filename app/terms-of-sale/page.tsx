import Link from 'next/link';

const sections = [
  {
    title: "1. Introduction",
    body: "These Store terms of sale (\"Store terms\") govern all purchases made through our online store, including digital products, subscriptions, virtual content, and any other service offered through our platform.\n\nBy making a purchase, you agree to these Store terms.",
  },
  {
    title: "2. Digital products and services",
    body: "All products available through our store are digital services provided online.\n\nThese products may include, but are not limited to:\n\nSubscriptions;\nEquipment, items, or content directly usable in game;\nDigital rewards;\nAny other virtual service or benefit related to our services.\n\nDigital products are not physical goods and do not involve the delivery of any real world items.",
  },
  {
    title: "3. Payments and Delivery",
    body: "Payments are processed through the payment providers available on our store.\n\nOnce payment has been successfully completed, the purchased digital product or service is normally delivered immediately through our Services, except in the event of a technical issue, processing error, or any other situation beyond our reasonable control.\n\nDelivery also requires that the user has correctly linked their account or provided the information necessary for the purchased service to function properly.\n\nThe user is responsible for ensuring that the information provided during the purchase is accurate.",
  },
  {
    title: "4. One time purchases",
    body: "Some products available in our store may be offered as one time purchases, requiring a single payment without automatic renewal.\n\nThese products may include, without limitation, permanent access, passes, equipment, items, or any other digital content available through our Services.\n\nOnce the purchase has been completed and the product has been delivered, the user retains access to this content according to the conditions defined at the time of purchase, except in cases where changes are necessary for technical, security, maintenance, service evolution reasons, or in cases of abuse, fraud, or violation of our Terms or Rules.\n\nA one time purchase does not constitute a subscription and does not involve recurring payments.",
  },
  {
    title: "5. Subscriptions and Cancellation",
    body: "Some products may be offered as recurring subscriptions.\n\nSubscriptions are automatically renewed according to the selected billing period unless cancelled by the user before the next renewal date.\n\nThe user may stop their subscription at any time in order to prevent future charges.\n\nStopping a subscription only applies to future renewals and does not remove benefits already granted during the remaining paid period.\n\nWe reserve the right to modify subscription prices, features, or conditions at any time.\n\nAny modification affecting an existing subscription will only apply from the next renewal period and will not affect the current paid period.\n\nThe user remains free to continue their subscription under the new conditions or cancel it before the next renewal.",
  },
  {
    title: "6. Refund policy",
    body: "All purchases made through our store concern digital services provided online.\n\nOne time purchases as well as subscriptions are delivered electronically through our Services. Once a digital product, content, virtual equipment, benefit, or access has been delivered or activated, refunds are generally not available, except where required by applicable law.\n\nBy completing a purchase, the user acknowledges that the service may begin immediately after payment and accepts that the digital nature of the product may limit the possibility of cancellation or refund.\n\nNothing in these Store Terms limits mandatory consumer rights that cannot legally be excluded.",
  },
  {
    title: "7. Fraud, Abuse and Payment disputes",
    body: "Any attempt to commit fraud, misuse the payment system, or initiate an unjustified payment dispute may result in restrictions or removal of access to our Services.\n\nPurchased benefits may be removed if they were obtained through fraud, payment abuse, or actions that violate our Terms or Rules.",
  },
  {
    title: "8. Changes to store services",
    body: "We reserve the right to modify, replace, or remove certain products, prices, subscriptions, or benefits available in our store at any time.\n\nThese changes will not affect purchases that have already been completed, unless required for legal, technical, or security reasons.",
  },
  {
    title: "9. Limitation of liability",
    body: "We shall not be held responsible for any temporary loss of access to purchased products, services, or benefits resulting from technical issues, server maintenance, game updates, platform related issues, or circumstances beyond our reasonable control.\n\nWe do not guarantee that certain features, benefits, or content will remain permanently available if changes are required for technical, operational, or security reasons.",
  }
];

export default function TermsOfSalePage() {
  return (
    <main className="cloudy-terms-page">
      <div className="cloudy-terms-wrap">
        <header className="cloudy-terms-head">
          <img src="https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif" alt="Cloudy" width={80} height={80} style={{ borderRadius: '50%', objectFit: 'cover' }} />
          <h1>Terms of sale</h1>
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

        <p className="cloudy-legal-updated">Last updated 20.03.2026 at 13h42</p>
      </div>
    </main>
  );
}
