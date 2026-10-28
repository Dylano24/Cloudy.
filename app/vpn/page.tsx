import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Check, ChevronRight, Globe2,
  ShieldCheck, Zap,
} from "lucide-react";
import styles from "./vpn.module.css";
import { StudioMobilePanelSync } from "@/components/service/studio-mobile-panel-sync";
import { VpnPricing } from "./vpn-pricing";
import { EarthNetwork } from "./earth-network";

export const metadata: Metadata = {
  title: "Cloudy VPN | A more considered connection",
  description: "Discover Cloudy VPN: encryption, location controls and essential connection safeguards in a considered experience.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Cloudy VPN | A more considered connection",
    description: "A clearer approach to private connections.",
  },
};

const features = [
  {
    icon: ShieldCheck,
    title: "Encrypted connections",
    description: "A VPN tunnel is the foundation. Encryption standards and supported protocols will be verified before launch.",
  },
  {
    icon: Zap,
    title: "Connection safeguards",
    description: "Planned kill switch and DNS protection designed to limit exposure when a connection changes.",
  },
  {
    icon: Globe2,
    title: "Location control",
    description: "Choose a region, view your connection status and manage your session from one clear interface.",
  },
];

const questions = [
  {
    question: "When can I subscribe?",
    answer: "Cloudy VPN is being prepared for launch. You can compare the proposed packages, but purchasing and account activation are not yet enabled.",
  },
  {
    question: "What's the difference between the plans?",
    answer: "Basic focuses on the VPN essentials, Complete includes additional privacy tools, and Ultra outlines advanced options. Final feature availability will be verified before subscriptions open.",
  },
  {
    question: "Which devices can I use?",
    answer: "Supported operating systems, simultaneous device limits, and network locations will be published once the service has been verified.",
  },
  {
    question: "Does Cloudy VPN record browsing activity?",
    answer: "Logging and retention details are not yet finalized. We will publish a verified privacy policy before accepting VPN subscriptions.",
  },
];


export default function VpnPage() {
  return (
    <div className={[styles.page, "cloudy-vpn-page"].join(" ")}>
      <StudioMobilePanelSync rootSelector=".cloudy-vpn-page"/>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}><span className={styles.redDot}/> CLOUDY VPN <span className={styles.eyebrowRule}/></div>
              <h1>Your world.<br/><span>On your terms.</span></h1>
              <p className={styles.heroLead}>
                A VPN should protect your connection, give you control over where you connect, and stay out of your way. That is the standard behind Cloudy VPN.
              </p>
              <div className={styles.heroActions}>
                <a href="#plans" className={styles.primaryButton}>Compare plans <ArrowRight size={18}/></a>
                <a href="#features" className={styles.secondaryButton}>Explore protection <ChevronRight size={17}/></a>
              </div>
              <div className={styles.heroAssurances}>
                <span><Check size={15}/> Clear connection controls</span>
                <span><Check size={15}/> Straightforward plans</span>
              </div>
            </div>
            <EarthNetwork/>
          </div>
        </div>
      </section>

      <section className={styles.features} id="features">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>THE ESSENTIALS</span>
            <h2>Protection without<br/><span>the complexity.</span></h2>
            <p>Encryption, connection safeguards and location controls. The essentials, presented clearly.</p>
          </div>
          <div className={styles.featureGrid}>
            {features.map(({icon:Icon,title,description})=>(
              <article key={title} className={[styles.featureCard,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}>
                <div className={styles.featureIcon}><Icon size={25} strokeWidth={1.65}/></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.featureSpotlight}>
        <div className={styles.container}>
          <div className={[styles.spotlightPanel,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}>
            <div className={styles.spotlightCopy}>
              <span className={styles.eyebrow}>BUILT FOR CLARITY</span>
              <h2>Every control.<br/><span>With purpose.</span></h2>
              <p>Connection status, server choice and protection settings belong in one place. No unnecessary steps, no crowded dashboard.</p>
              <a href="#plans" className={styles.inlineLink}>Explore the plans <ArrowRight size={17}/></a>
            </div>
            <div className={styles.spotlightVisual} aria-hidden="true">
              <div className={styles.spotlightGrid}/>
              <div className={styles.spotlightPathA}/>
              <div className={styles.spotlightPathB}/>
              <div className={styles.spotlightPathC}/>
              <span className={styles.spotlightPointA}/>
              <span className={styles.spotlightPointB}/>
              <span className={styles.spotlightPointC}/>
              <span className={styles.spotlightPointD}/>
              <div className={styles.spotlightHalo}/>
            </div>
          </div>
        </div>
      </section>

      <VpnPricing />

      <section className={styles.faq}>
        <div className={styles.container}>
          <div className={styles.faqGrid}>
            <div className={styles.faqIntro}>
              <span className={styles.eyebrow}>FREQUENT QUESTIONS</span>
              <h2>Know what<br/><span>you’re choosing.</span></h2>
              <p>Clear information about features, availability and how the service will work.</p>
              <Link href="/support" className={styles.inlineLink}>Contact Cloudy <ArrowRight size={17}/></Link>
            </div>
            <div className={styles.faqItems}>
              {questions.map(({question,answer})=>(
                <details key={question} className={styles.faqItem}>
                  <summary>{question}<span className={styles.faqPlus}>+</span></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.bottomCta}>
        <div className={styles.container}>
          <div className={[styles.ctaPanel,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}>
            <div className={styles.ctaAura} aria-hidden="true"/>
            <span className={styles.eyebrow}>CLOUDY VPN</span>
            <h2>Control begins<br/><span>with clarity.</span></h2>
            <p>Review the protection options and choose the level that makes sense for you.</p>
            <a href="#plans" className={styles.primaryButton}>View VPN plans <ArrowRight size={17}/></a>
          </div>
        </div>
      </section>
    </div>
  );
}
