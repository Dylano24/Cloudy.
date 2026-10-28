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
  title: "Cloudy VPN | Privacy, made simple",
  description: "Explore Cloudy VPN, refined privacy features and straightforward subscription options.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Cloudy VPN | Privacy, made simple",
    description: "A refined approach to online privacy.",
  },
};

const features = [
  {
    icon: ShieldCheck,
    title: "Secure connection",
    description: "Encrypted network protection designed around privacy and control.",
  },
  {
    icon: Zap,
    title: "Seamless experience",
    description: "A clean interface that keeps everyday connection controls uncomplicated.",
  },
  {
    icon: Globe2,
    title: "Choice and freedom",
    description: "A straightforward way to select from supported connection locations.",
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
              <h1>Your world.<br/><span>Connected.</span></h1>
              <p className={styles.heroLead}>
                Discover a new standard of digital privacy. Refined control, considered security and a seamless experience built around the way you connect.
              </p>
              <div className={styles.heroActions}>
                <a href="#plans" className={styles.primaryButton}>Explore plans <ArrowRight size={18}/></a>
                <a href="#features" className={styles.secondaryButton}>Discover more <ChevronRight size={17}/></a>
              </div>
              <div className={styles.heroAssurances}>
                <span><Check size={15}/> Clear plan choices</span>
                <span><Check size={15}/> Designed around you</span>
              </div>
            </div>
            <EarthNetwork/>
          </div>
        </div>
      </section>

      <section className={styles.features} id="features">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>THE CLOUDY EXPERIENCE</span>
            <h2>Everything you need.<br/><span>Nothing you don’t.</span></h2>
            <p>Designed to give you more control over your connection, without getting in your way.</p>
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
              <span className={styles.eyebrow}>A DIFFERENT APPROACH</span>
              <h2>Your connection.<br/><span>Reimagined.</span></h2>
              <p>Technology should work beautifully, without asking for your attention. Every element of the Cloudy VPN experience is designed to make the complex feel simple.</p>
              <a href="#plans" className={styles.inlineLink}>Compare plans <ArrowRight size={17}/></a>
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
              <span className={styles.eyebrow}>GOOD TO KNOW</span>
              <h2>Questions?<br/><span>Answers.</span></h2>
              <p>Everything you need to know before choosing a Cloudy VPN plan.</p>
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
            <span className={styles.eyebrow}>DISCOVER CLOUDY VPN</span>
            <h2>Your connection.<br/><span>Your choice.</span></h2>
            <p>Find the plan that fits your digital life.</p>
            <a href="#plans" className={styles.primaryButton}>View VPN plans <ArrowRight size={17}/></a>
          </div>
        </div>
      </section>
    </div>
  );
}
