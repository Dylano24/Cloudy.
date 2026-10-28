import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Check, ChevronRight, Globe2,
  ShieldCheck, Zap,
} from "lucide-react";
import styles from "./vpn.module.css";
import { StudioMobilePanelSync } from "@/components/service/studio-mobile-panel-sync";
import { VpnPricing } from "./vpn-pricing";

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

function SecurityArtwork() {
  return (
    <div className={styles.securityVisual} aria-label="Abstract black and red digital security sculpture">
      <div className={styles.visualAtmosphere} aria-hidden="true"/>
      <div className={styles.visualField} aria-hidden="true"/>
      <div className={styles.visualOrbitA} aria-hidden="true"/>
      <div className={styles.visualOrbitB} aria-hidden="true"/>
      <div className={styles.visualPlinth} aria-hidden="true"/>
      <div className={styles.securityMonolith} aria-hidden="true">
        <svg viewBox="0 0 420 500" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudy-vpn-metal" x1="55" y1="0" x2="370" y2="495" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2E1A22"/><stop offset=".19" stopColor="#0A080B"/><stop offset=".48" stopColor="#30131E"/><stop offset=".71" stopColor="#09080A"/><stop offset="1" stopColor="#280C15"/>
            </linearGradient>
            <linearGradient id="cloudy-vpn-edge" x1="76" y1="51" x2="366" y2="436" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A63D54"/><stop offset=".25" stopColor="#572431"/><stop offset=".52" stopColor="#EE4263"/><stop offset=".78" stopColor="#612235"/><stop offset="1" stopColor="#CF334D"/>
            </linearGradient>
            <linearGradient id="cloudy-vpn-inner" x1="112" y1="55" x2="300" y2="405" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3A1322"/><stop offset=".43" stopColor="#10070E"/><stop offset="1" stopColor="#6A172F"/>
            </linearGradient>
            <linearGradient id="cloudy-vpn-cut" x1="176" y1="130" x2="254" y2="319" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF95A9"/><stop offset=".5" stopColor="#E63253"/><stop offset="1" stopColor="#7A102C"/>
            </linearGradient>
            <radialGradient id="cloudy-vpn-reflect" cx="0" cy="0" r="1" gradientTransform="translate(163 102) rotate(77) scale(280 210)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F14369" stopOpacity=".25"/><stop offset="1" stopColor="#E32655" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <path d="M210 22L363 86V233C363 343 303 409 210 470C117 409 57 343 57 233V86L210 22Z" fill="#090608" stroke="#491B2A" strokeWidth="8"/>
          <path d="M210 36L348 94V233C348 334 293 395 210 450C127 395 72 334 72 233V94L210 36Z" fill="url(#cloudy-vpn-metal)" stroke="url(#cloudy-vpn-edge)" strokeWidth="3"/>
          <path d="M210 58L328 108V232C328 319 283 371 210 421C137 371 92 319 92 232V108L210 58Z" fill="url(#cloudy-vpn-inner)" stroke="#783045" strokeOpacity=".7"/>
          <path d="M210 58L328 108V232C328 319 283 371 210 421C137 371 92 319 92 232V108L210 58Z" fill="url(#cloudy-vpn-reflect)"/>
          <path d="M112 124L210 83L308 124" stroke="#F27993" strokeOpacity=".29" strokeWidth="1.2"/>
          <path d="M110 248C120 328 148 357 210 398" stroke="#EB4766" strokeOpacity=".23" strokeWidth="1"/>
          <path d="M310 246C301 329 266 364 210 403" stroke="#FF9AAE" strokeOpacity=".17" strokeWidth="1"/>
          <path d="M210 115V161" stroke="#FF849B" strokeOpacity=".38" strokeWidth="2"/>
          <path d="M164 194L210 167L256 194V269L210 298L164 269V194Z" stroke="url(#cloudy-vpn-cut)" strokeWidth="2.6"/>
          <path d="M210 185L239 201V255L210 274L181 255V201L210 185Z" fill="#1D0A12" stroke="#8F2C44" strokeWidth="1.5"/>
          <path d="M210 204V254M188 229H232" stroke="#FF7D98" strokeWidth="5" strokeLinecap="square"/>
          <path d="M210 314V375" stroke="#E34564" strokeOpacity=".35" strokeWidth="1.2"/>
          <path d="M147 324L210 365L273 324" stroke="#FC8AA0" strokeOpacity=".22" strokeWidth="1"/>
          <circle cx="210" cy="229" r="85" stroke="#CC3455" strokeOpacity=".16"/>
          <circle cx="210" cy="229" r="105" stroke="#D63958" strokeOpacity=".08" strokeDasharray="2 9"/>
          <path d="M144 165L157 150M263 150L276 165M143 292L159 307M261 307L277 292" stroke="#FF8DA3" strokeOpacity=".5" strokeWidth="1.4"/>
        </svg>
      </div>
      <div className={styles.visualLowerLine} aria-hidden="true"/>
    </div>
  );
}

export default function VpnPage() {
  return (
    <div className={[styles.page, "cloudy-vpn-page"].join(" ")}>
      <StudioMobilePanelSync rootSelector=".cloudy-vpn-page"/>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}><span className={styles.redDot}/> CLOUDY VPN <span className={styles.eyebrowRule}/></div>
              <h1>Your world.<br/><span>Your privacy.</span></h1>
              <p className={styles.heroLead}>
                A different standard of digital simplicity. Discover privacy tools with a precise, effortless experience built around the way you connect.
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
            <SecurityArtwork/>
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
