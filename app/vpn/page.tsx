import type { Metadata } from "next";
import {
  ArrowRight, Check, ChevronRight, Globe2,
  ShieldCheck, Zap,
} from "lucide-react";
import styles from "./vpn.module.css";
import studioStyles from "@/app/service/service.module.css";
import { VpnPanelMotion } from "./vpn-motion";
import { VpnPricing } from "./vpn-pricing";
import { EarthNetwork } from "./earth-network";

export const metadata: Metadata = {
  title: "Cloudy VPN | Your connection. Your control.",
  description: "Explore Cloudy VPN plans, connection protection and privacy controls. Compare Basic, Complete and Ultra.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Cloudy VPN | Your connection. Your control.",
    description: "VPN protection with clear plans and practical privacy controls.",
  },
};

const features = [
  {
    icon: ShieldCheck,
    title: "Encrypted connections",
    description: "A VPN encrypts traffic between your device and the VPN server, helping protect it from others on the same network.",
  },
  {
    icon: Zap,
    title: "Connection safeguards",
    description: "A kill switch blocks internet traffic if the VPN disconnects. DNS protection keeps website lookups inside the VPN tunnel.",
  },
  {
    icon: Globe2,
    title: "Location control",
    description: "A VPN routes your connection through another location. Websites see the VPN server’s IP address instead of your network’s IP.",
  },
];

const questions = [
  {
    question: "How do I choose a plan?",
    answer: "Choose Basic for the connection essentials, Complete for additional privacy controls, or Ultra for advanced routing options. Select a billing period to see the monthly rate and the full subscription total before reviewing your order.",
  },
  {
    question: "What's the difference between the plans?",
    answer: "Basic covers the core connection. Complete adds tools such as tracker blocking and split tunneling. Ultra adds advanced connection options. The comparison below the plans shows the package differences.",
  },
  {
    question: "What does a VPN protect?",
    answer: "A VPN protects the connection between your device and its server and changes the IP address websites see. It does not make you anonymous to accounts you sign into or replace software updates, strong passwords and careful browsing.",
  },
  {
    question: "What is split tunneling?",
    answer: "Split tunneling lets you choose which apps use the VPN and which use your regular connection. Traffic excluded from the VPN does not receive the VPN tunnel’s protection.",
  },
];


export default function VpnPage() {
  return (
    <div className={[styles.page, "cloudy-vpn-page"].join(" ")}>
      <VpnPanelMotion/>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>Cloudy VPN</div>
              <h1>Your world.<br/><span>On your terms.</span></h1>
              <p className={styles.heroLead}>
                Take control of your connection. Explore encrypted browsing, location choice and privacy tools in three straightforward Cloudy VPN plans.
              </p>
              <div className={styles.heroActions}>
                <a href="#plans" className={styles.primaryButton}>Compare plans <ArrowRight size={18}/></a>
                <a href="#features" className={styles.secondaryButton}>Explore protection <ChevronRight size={17}/></a>
              </div>
              <div className={styles.heroAssurances}>
                <span><Check size={15}/> Connection protection</span>
                <span><Check size={15}/> Three levels of privacy</span>
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
            <h2>Understand your<br/><span>protection.</span></h2>
            <p>Know what happens between your device and the internet. Start with the three foundations of a VPN connection.</p>
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
              <span className={styles.eyebrow}>HOW A VPN WORKS</span>
              <h2>Your connection.<br/><span>A private route.</span></h2>
              <p>Your traffic travels through an encrypted tunnel to a VPN server before reaching the internet. The tunnel protects this part of the journey; the websites you use and accounts you sign into still matter.</p>
              <a href="#plans" className={styles.inlineLink}>Explore the plans <ArrowRight size={17}/></a>
            </div>
            <div className={styles.connectionDiagram} aria-label="Connection path: your device, encrypted VPN tunnel, VPN server">
              <div className={styles.diagramHeading}><ShieldCheck size={18}/><span>Inside the VPN tunnel</span></div>
              <div className={styles.tunnelPath}>
                <div><span className={styles.diagramNode} aria-hidden="true"><svg viewBox="0 0 48 34" width="46" height="33" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                  <rect x="3" y="5" width="27" height="19" rx="2"/>
                  <path d="M3 24 1 28a1 1 0 0 0 1 1h29M12 27h8"/>
                  <rect x="34" y="11" width="12" height="21" rx="2.2"/>
                  <path d="M38 14h4M39 29h2"/>
                </svg></span><strong>Your device</strong><small>Traffic enters the tunnel</small></div>
                <span className={styles.tunnelLine} aria-hidden="true"/>
                <div><span className={styles.diagramNode}><Globe2 size={25}/></span><strong>VPN server</strong><small>Your public IP changes</small></div>
              </div>
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
              <p>Clear answers about plans, connection protection and privacy controls.</p>
            </div>
            <div className={[studioStyles.faqList,styles.faqItems].join(" ")}>
              {questions.map(({question,answer})=>(
                <details key={question} className={studioStyles.faqItem}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
