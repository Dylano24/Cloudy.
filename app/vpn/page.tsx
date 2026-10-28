import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, CircleHelp, Globe2, LockKeyhole, MonitorSmartphone, ShieldCheck, Sparkles, Wifi, Zap } from "lucide-react";
import styles from "./vpn.module.css";

export const metadata: Metadata = {
  title: "Cloudy VPN | Preview",
  description: "Explore the Cloudy VPN concept, planned features and upcoming subscription options.",
  robots: { index: false, follow: false },
};

const features = [
  { icon: ShieldCheck, title: "Privacy minded", description: "A connection experience designed around clarity, control and transparency." },
  { icon: Zap, title: "Effortless experience", description: "A simple interface intended to make connecting feel natural and quick." },
  { icon: Globe2, title: "Worldwide ambitions", description: "We are exploring network coverage and locations for the future service." },
  { icon: MonitorSmartphone, title: "Made for your devices", description: "Supported platforms and device limits will be confirmed before release." },
];

const steps = [
  { number: "01", title: "Choose a plan", description: "Select an option that suits you when subscriptions become available." },
  { number: "02", title: "Set up your connection", description: "Follow the instructions for your supported device." },
  { number: "03", title: "Stay in control", description: "Manage your preferences and connection from one place." },
];

const questions = [
  { question: "Can I purchase Cloudy VPN today?", answer: "Not yet. This is a design preview. Subscriptions and checkout remain disabled until the service and its terms are ready." },
  { question: "How much will it cost?", answer: "Monthly and yearly subscriptions are being considered. Prices have not been announced and no payments can be taken from this page." },
  { question: "What countries and devices will be supported?", answer: "Server locations, compatible platforms and the number of simultaneous devices will be published after technical verification." },
  { question: "Does Cloudy VPN keep connection logs?", answer: "We will only make specific privacy, logging and security commitments after the underlying VPN infrastructure and policies have been verified." },
];

function GlobeArtwork() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.orbitOne} /><div className={styles.orbitTwo} /><div className={styles.orbitThree} />
      <div className={styles.halo} />
      <div className={styles.planet}><div className={styles.planetGrid} /><div className={styles.planetShade} /><div className={styles.planetShine} /></div>
      <span className={styles.pinOne}><i /></span><span className={styles.pinTwo}><i /></span><span className={styles.pinThree}><i /></span>
      <div className={styles.connectionCard}><span className={styles.connectionIcon}><LockKeyhole size={15}/></span><div><strong>Cloudy VPN</strong><small>Made for what comes next</small></div><span className={styles.connectionPulse} /></div>
      <div className={styles.globeMark}>C</div>
    </div>
  );
}

export default function VpnPage() {
  return (
    <div className={styles.page}>
      <div className={styles.previewStrip}><span className={styles.previewDot}/> EARLY CONCEPT PREVIEW <span className={styles.previewSep}/> Not yet available for purchase</div>
      <section className={styles.hero}>
        <div className={styles.heroAura} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}><span className={styles.tinyRedDot}/> INTRODUCING CLOUDY VPN <span className={styles.eyebrowLine}/></div>
              <h1>Your world.<br/><span>Your connection.</span></h1>
              <p className={styles.heroLead}>A new way to stay connected is taking shape. The simplicity you expect, with the distinctive attention to detail behind Cloudy.</p>
              <div className={styles.heroActions}>
                <a href="#experience" className={styles.primaryButton}>Discover Cloudy VPN <ArrowRight size={17} /></a>
                <a href="#plans" className={styles.secondaryButton}>Explore plans <ChevronRight size={17} /></a>
              </div>
              <div className={styles.heroFoot}><div><ShieldCheck size={17}/> Designed with privacy in mind</div><span className={styles.footDivider}/><div><Sparkles size={17}/> Preview release</div></div>
            </div>
            <GlobeArtwork />
          </div>
        </div>
      </section>
      <section className={styles.intro} id="experience">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div className={styles.eyebrow}>THE CLOUDY EXPERIENCE</div><h2>Stay connected.<br/><span>Stay in control.</span></h2><p>Built to feel effortless. Every detail considered, every step made simpler. Here is the vision behind Cloudy VPN.</p></div>
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <article className={styles.feature} key={feature.title}>
                <div className={styles.featureTop}><span className={styles.featureIcon}><feature.icon size={24} strokeWidth={1.75}/></span><span className={styles.featureIndex}>0{index + 1}</span></div>
                <h3>{feature.title}</h3><p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.statement}>
        <div className={styles.container}><div className={styles.statementPanel}>
          <div className={styles.statementGlow} aria-hidden="true"/><div className={styles.statementIcon}><Wifi size={30} strokeWidth={1.6}/></div>
          <div className={styles.statementCopy}><span className={styles.eyebrow}>CONNECTED BY DESIGN</span><h2>Built for a more <span>connected</span> world.</h2><p>Cloudy VPN will bring familiar Cloudy design to a new digital service. Transparent details and verified capabilities will come before launch.</p></div>
          <div className={styles.statementNumber} aria-hidden="true">VPN</div>
        </div></div>
      </section>
      <section className={styles.plans} id="plans">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div className={styles.eyebrow}>CLOUDY VPN PLANS</div><h2>Simple choices.<br/><span>More freedom.</span></h2><p>We're preparing flexible subscription options. Final pricing and included features will be revealed before launch.</p></div>
          <div className={styles.planGrid}>
            <article className={styles.planCard}>
              <div className={styles.planTop}><span className={styles.planType}>01 / FLEXIBLE</span><span className={styles.soonTag}>Coming soon</span></div>
              <h3>Monthly</h3><p>Freedom to choose month by month.</p>
              <div className={styles.price}>Price to be announced</div><div className={styles.planDivider}/>
              <ul><li><Check size={15}/> Flexible subscription concept</li><li><Check size={15}/> Planned straightforward setup</li><li><Check size={15}/> Feature details to follow</li></ul>
              <div className={styles.disabledButton}>Not available yet <LockKeyhole size={15}/></div>
            </article>
            <article className={styles.planCard + " " + styles.planFeatured}>
              <div className={styles.featuredGlow} aria-hidden="true"/><div className={styles.planTop}><span className={styles.planType}>02 / LONG TERM</span><span className={styles.soonTag}>Coming soon</span></div>
              <h3>Yearly</h3><p>For those planning to stay connected.</p>
              <div className={styles.price}>Price to be announced</div><div className={styles.planDivider}/>
              <ul><li><Check size={15}/> Annual subscription concept</li><li><Check size={15}/> One simple membership</li><li><Check size={15}/> Feature details to follow</li></ul>
              <div className={styles.disabledButton}>Not available yet <LockKeyhole size={15}/></div>
            </article>
          </div>
          <p className={styles.plansNote}><CircleHelp size={15}/> These are design concepts, not offers for sale. No VPN subscriptions are active on this page.</p>
        </div>
      </section>
      <section className={styles.steps}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div className={styles.eyebrow}>SIMPLE FROM THE START</div><h2>Your connection.<br/><span>Made simple.</span></h2><p>An early look at the customer journey we want to create.</p></div>
          <div className={styles.stepGrid}>{steps.map(step => <article className={styles.step} key={step.number}><span>{step.number}</span><div className={styles.stepLine}/><h3>{step.title}</h3><p>{step.description}</p></article>)}</div>
        </div>
      </section>
      <section className={styles.faq}>
        <div className={styles.container}><div className={styles.faqGrid}>
          <div className={styles.faqHeading}><span className={styles.eyebrow}>GOOD TO KNOW</span><h2>Questions?<br/><span>We've got answers.</span></h2><p>Cloudy VPN is still in development. Here's what you need to know before launch.</p><Link href="/support" className={styles.faqLink}>Visit support <ArrowRight size={16}/></Link></div>
          <div className={styles.faqList}>{questions.map(({question, answer}) => <details key={question} className={styles.faqItem}><summary>{question}<span className={styles.plus}>+</span></summary><p>{answer}</p></details>)}</div>
        </div></div>
      </section>
      <section className={styles.bottomCta}>
        <div className={styles.container}><div className={styles.bottomPanel}>
          <div className={styles.bottomGlow} aria-hidden="true"/><span className={styles.eyebrow}>THE NEXT CHAPTER</span>
          <h2>The future is <span>connecting.</span></h2>
          <p>Cloudy VPN is being prepared. Follow Cloudy for updates on its upcoming release.</p>
          <Link href="/support" className={styles.primaryButton}>Contact Cloudy <ArrowRight size={17}/></Link>
        </div></div>
      </section>
    </div>
  );
}
