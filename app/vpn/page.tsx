import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, CircleHelp, Globe2, LockKeyhole, MonitorSmartphone, ShieldCheck, Sparkles, Wifi, Zap } from "lucide-react";
import styles from "./vpn.module.css";
import { VpnCinematicEarth } from "./vpn-cinematic";
import { StudioMobilePanelSync } from "@/components/service/studio-mobile-panel-sync";
import { VpnPricing } from "./vpn-pricing";

export const metadata: Metadata = {
  title: "Cloudy VPN | Preview",
  description: "Cloudy VPN is taking shape. Discover a premium new digital experience with a globe of connected possibilities.",
  robots: { index: false, follow: false },
  openGraph: { title: "Cloudy VPN | Preview", description: "Discover the next Cloudy digital experience." },
  twitter: { card: "summary", title: "Cloudy VPN | Preview", description: "A new Cloudy experience is taking shape." },
};

const features = [
  { icon: ShieldCheck, title: "Encrypted connections", description: "A secure VPN tunnel is the core of the Cloudy service. Supported protocols and security details will be verified before release." },
  { icon: Zap, title: "Kill switch and DNS", description: "Planned safeguards against accidental data exposure when your connection changes or unexpectedly drops." },
  { icon: Globe2, title: "Location switching", description: "A clean, straightforward experience for selecting a preferred connection location from supported regions." },
  { icon: MonitorSmartphone, title: "Extra privacy controls", description: "Proposed options such as split tunneling and tracker protection, subject to final technical verification." },
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

export default function VpnPage() {
  return (
    <div className={`${styles.page} cloudy-vpn-page`}>
      <StudioMobilePanelSync rootSelector=".cloudy-vpn-page" />
      <div className={styles.previewStrip}><span className={styles.previewDot}/> CLOUDY VPN <span className={styles.previewSep}/> Explore our subscription plans</div>
      <section className={styles.hero}>
        <VpnCinematicEarth />
        <div className={styles.heroAura} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}><span className={styles.tinyRedDot}/> CLOUDY VPN <span className={styles.eyebrowLine}/></div>
              <h1>Connection<br/><span>reimagined.</span></h1>
              <p className={styles.heroLead}>Your digital world deserves better. Powerful privacy features, effortless design and the unmistakable Cloudy experience.</p>
              <div className={styles.heroActions}>
                <a href="#experience" className={styles.primaryButton}>Discover the concept <ArrowRight size={17} /></a>
                <a href="#plans" className={styles.secondaryButton}>Explore plans <ChevronRight size={17} /></a>
              </div>
              <div className={styles.heroFoot}><div><ShieldCheck size={17}/> Privacy focused</div><span className={styles.footDivider}/><div><Sparkles size={17}/> Beautifully simple</div></div>
            </div>
            <div className={styles.heroGlobeSpace} aria-hidden="true">
              <div className={styles.globeDataLabel}>
                <span className={styles.globeDataPulse} />
                <div><strong>Global network</strong><small>City to city signals</small></div>
                <span className={styles.globeDataIndex}>CLOUDY</span>
              </div>
              <div className={styles.globeCoords}>AMSTERDAM <span>·</span> NEW YORK</div>
              <a className={styles.globeSource} href="https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/" target="_blank" rel="noreferrer">Earth imagery: NASA · Animated global routes</a>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.intro} id="experience">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div className={styles.eyebrow}>THE CLOUDY EXPERIENCE</div><h2>Made to feel<br/><span>effortless.</span></h2><p>From the first tap to your everyday routine, we are designing an experience that makes privacy tools feel effortless.</p></div>
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <article className={[styles.feature,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")} key={feature.title}>
                <div className={styles.featureTop}><span className={styles.featureIcon}><feature.icon size={24} strokeWidth={1.75}/></span><span className={styles.featureIndex}>0{index + 1}</span></div>
                <h3>{feature.title}</h3><p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.statement}>
        <div className={styles.container}><div className={[styles.statementPanel,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}>
          <div className={styles.statementGlow} aria-hidden="true"/><div className={styles.statementIcon}><Wifi size={30} strokeWidth={1.6}/></div>
          <div className={styles.statementCopy}><span className={styles.eyebrow}>CONNECTED BY DESIGN</span><h2>Your connection. <span>Your choice.</span></h2><p>Thoughtful design is just the beginning. Cloudy VPN is being developed with a focus on straightforward controls, clear information and a polished everyday experience.</p></div>
          <div className={styles.statementNumber} aria-hidden="true">VPN</div>
        </div></div>
      </section>
      <section className={styles.productStory} aria-labelledby="vpn-control-title">
        <div className={styles.container}>
          <div className={styles.storyGrid}>
            <div className={styles.storyContent}>
              <span className={styles.eyebrow}>YOUR DIGITAL SPACE</span>
              <h2 id="vpn-control-title">More control.<br/><span>Less complexity.</span></h2>
              <p>A good VPN should be easy to understand, not another complicated dashboard. We are exploring a clean control center for choosing locations and managing your experience.</p>
              <div className={styles.storyBullets}>
                <div><span><Check size={15}/></span><p><strong>Clear connection controls</strong><small>One place to see and manage your connection.</small></p></div>
                <div><span><Check size={15}/></span><p><strong>Transparent information</strong><small>No unexplained numbers or hidden promises.</small></p></div>
                <div><span><Check size={15}/></span><p><strong>Considered on every screen</strong><small>A responsive experience, designed for desktop and mobile.</small></p></div>
              </div>
            </div>
            <div className={styles.storyArt} aria-label="Conceptual desktop and mobile interface illustration">
              <div className={styles.storyAura} aria-hidden="true"/>
              <div className={[styles.storyWindow,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}>
                <div className={styles.storyWindowBar}><span>Cloudy VPN <small>· Cloudy VPN</small></span><div><i/><i/><i/></div></div>
                <div className={styles.storyWindowBody}>
                  <div className={styles.storyWindowMenu}><span>⌂</span><span>◎</span><span>⚙</span></div>
                  <div className={styles.storyWindowMain}>
                    <div className={styles.storyDashboardTitle}>Connection overview <small>VPN dashboard</small></div>
                    <div className={styles.storyMiniMap}><span className={styles.storyMiniRing}/><Globe2 size={69} strokeWidth={.7}/></div>
                    <div className={styles.storyDashboardStatus}><span className={styles.storyStatusDot}/><strong>Offline</strong><small>Design concept</small></div>
                    <div className={styles.storyDashboardLocation}><span>Example location</span><strong>Amsterdam, NL</strong></div>
                  </div>
                </div>
              </div>
              <div className={styles.storyPhone}>
                <div className={styles.storyPhoneTop}/>
                
                <span className={styles.storyPhoneName}>Cloudy VPN</span>
                <div className={styles.storyPhoneRing}><LockKeyhole size={23}/></div>
                <span className={styles.storyPhoneStatus}>Not connected</span>
                <div className={styles.storyPhonePill}>CLOUDY VPN</div>
              </div>
              <span className={styles.storyArtCaption}>CLOUDY VPN / DESKTOP & MOBILE</span>
            </div>
          </div>
        </div>
      </section>
      <VpnPricing />
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
        <div className={styles.container}><div className={[styles.bottomPanel,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}>
          <div className={styles.bottomGlow} aria-hidden="true"/><span className={styles.eyebrow}>THE NEXT CHAPTER</span>
          <h2>A new chapter <span>is coming.</span></h2>
          <p>Cloudy VPN is being prepared. Follow Cloudy for updates on its upcoming release.</p>
          <Link href="/support" className={styles.primaryButton}>Contact Cloudy <ArrowRight size={17}/></Link>
        </div></div>
      </section>
    </div>
  );
}
