import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, CircleHelp, Fingerprint, Globe2, Laptop, LockKeyhole, MonitorSmartphone, Shield, ShieldCheck, Smartphone, Sparkles, Wifi, Zap } from "lucide-react";
import styles from "./vpn.module.css";
import { StudioMobilePanelSync } from "@/components/service/studio-mobile-panel-sync";
import { VpnPricing } from "./vpn-pricing";

export const metadata: Metadata = {
  title: "Cloudy VPN | Private by design",
  description: "Explore Cloudy VPN: a refined privacy experience, flexible plans and clear connection controls.",
  robots: { index: false, follow: false },
  openGraph: { title: "Cloudy VPN | Private by design", description: "Discover a simpler approach to online privacy." },
};

const features = [
  { icon: ShieldCheck, title: "Privacy, without complexity", text: "A clear approach to VPN protection, with essential controls right where you need them." },
  { icon: Zap, title: "Built for everyday speed", text: "A focused interface designed to make your connection feel effortless." },
  { icon: Globe2, title: "The freedom to choose", text: "Switch between supported locations using a straightforward connection dashboard." },
];
const advantages = [
  { icon: LockKeyhole, title: "Encrypted connection", description: "An encrypted tunnel designed to help protect network traffic." },
  { icon: Wifi, title: "Connection protection", description: "Proposed network controls including a kill switch and DNS protection." },
  { icon: Fingerprint, title: "Privacy controls", description: "Simple settings, with additional filtering features planned for selected packages." },
  { icon: MonitorSmartphone, title: "Your devices, your way", description: "A clean experience intended for supported desktop and mobile devices." },
];
const faq = [
  { q: "How do I get Cloudy VPN?", a: "Cloudy VPN is being prepared for release. You can preview plan details, but payments and VPN account activation are not yet enabled." },
  { q: "Which plan should I choose?", a: "Basic covers the proposed essentials. Complete introduces additional privacy tools, while Ultra outlines advanced options. Final availability will be confirmed before sales." },
  { q: "Which devices and locations are supported?", a: "Supported operating systems, regional servers and simultaneous device limits will be announced once the infrastructure has passed technical checks." },
  { q: "Does Cloudy VPN keep activity logs?", a: "Logging, retention and privacy commitments depend on the final VPN infrastructure. A verified privacy policy will be published before the service becomes available." },
];

function AppShowcase() {
  return <div className={styles.productVisual} aria-label="Illustration of the Cloudy VPN application interface">
    <div className={styles.visualAura} aria-hidden="true"/>
    <div className={styles.visualGrid} aria-hidden="true"/>
    <div className={[styles.desktopFrame,"cloudy-traced-panel"].join(" ")}>
      <div className={styles.desktopBar}>
        <div className={styles.desktopBrand}><span className={styles.brandMark}><Shield size={16}/></span><strong>Cloudy VPN</strong></div>
        <span className={styles.desktopTag}>Desktop interface</span>
        <span className={styles.windowDots} aria-hidden="true"><i/><i/><i/></span>
      </div>
      <div className={styles.desktopBody}>
        <div className={styles.desktopSidebar} aria-hidden="true">
          <span className={styles.sidebarSelected}><Shield size={17}/></span>
          <span><Globe2 size={17}/></span><span><Wifi size={17}/></span><span><CircleHelp size={17}/></span>
        </div>
        <div className={styles.desktopContent}>
          <div className={styles.screenEyebrow}>CONNECTION OVERVIEW</div>
          <h3>Take control of your connection.</h3>
          <p>Privacy, made simple.</p>
          <div className={styles.connectionWidget}>
            <span className={styles.connectionShield}><ShieldCheck size={33} strokeWidth={1.5}/></span>
            <div><small>Connection status</small><strong>Not connected</strong><span>Example interface</span></div>
            <span className={styles.powerButton}><LockKeyhole size={17}/></span>
          </div>
          <div className={styles.locationWidget}>
            <div className={styles.locationSymbol}><Globe2 size={20}/></div>
            <div><small>Selected location</small><strong>Amsterdam, Netherlands</strong></div>
            <ChevronRight size={15} className={styles.locationArrow}/>
          </div>
          <div className={styles.dashboardFooter}><span><i/> PROTECTION DASHBOARD</span><span>DESIGN PREVIEW</span></div>
        </div>
      </div>
    </div>
    <div className={styles.phoneFrame} aria-hidden="true">
      <div className={styles.phoneNotch}/>
      <div className={styles.phoneBrand}><Shield size={16}/> Cloudy VPN</div>
      <div className={styles.phoneProtection}><ShieldCheck size={30} strokeWidth={1.5}/></div>
      <strong>Not connected</strong><small>Connection preview</small>
      <div className={styles.phoneLocation}><Globe2 size={15}/><span>Amsterdam</span><ChevronRight size={13}/></div>
      <div className={styles.phoneHomeBar}/>
    </div>
    <div className={styles.floatBadge}><span><Sparkles size={17}/></span><div><strong>Thoughtfully designed</strong><small>Simple from the first tap</small></div></div>
  </div>;
}

export default function VpnPage() {
  return <div className={[styles.page,"cloudy-vpn-page"].join(" ")}>
    <StudioMobilePanelSync rootSelector=".cloudy-vpn-page"/>
    <section className={styles.hero}><div className={styles.container}><div className={styles.heroGrid}>
      <div className={styles.heroCopy}>
        <div className={styles.eyebrow}><span className={styles.redDot}/> CLOUDY VPN <span className={styles.eyebrowRule}/></div>
        <h1>Online privacy.<br/><span>Beautifully simple.</span></h1>
        <p className={styles.heroLead}>Everything you need, nothing you don’t. Discover a more refined way to manage your digital privacy, with the look and feel of Cloudy.</p>
        <div className={styles.heroActions}><a href="#plans" className={styles.primaryButton}>Explore plans <ArrowRight size={17}/></a><a href="#features" className={styles.secondaryButton}>Discover features <ChevronRight size={16}/></a></div>
        <div className={styles.heroTrust}><span><Check size={15}/> Clear subscription choices</span><span><Check size={15}/> Privacy focused design</span></div>
      </div>
      <AppShowcase/>
    </div></div></section>

    <section className={styles.intro} id="features"><div className={styles.container}>
      <div className={styles.sectionHeading}><span className={styles.eyebrow}>WHY CLOUDY VPN</span><h2>More freedom.<br/><span>Less complexity.</span></h2><p>Powerful privacy tools should feel approachable. Cloudy VPN brings a familiar, considered experience to a more connected world.</p></div>
      <div className={styles.featureGrid}>{features.map(({icon:Icon,title,text},index)=><article key={title} className={[styles.feature,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}><div className={styles.featureTop}><span className={styles.featureIcon}><Icon size={23} strokeWidth={1.65}/></span><span className={styles.featureIndex}>0{index+1}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div>
    </div></section>

    <section className={styles.statement}><div className={styles.container}><div className={[styles.statementPanel,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}>
      <div className={styles.statementCopy}><span className={styles.eyebrow}>DESIGNED AROUND YOU</span><h2>Security should feel <span>effortless.</span></h2><p>One refined place for your connection, preferences and privacy settings. Designed to stay out of your way while keeping the details you care about within reach.</p><a href="#plans" className={styles.textLink}>Compare plans <ArrowRight size={17}/></a></div>
      <div className={styles.statementArtwork} aria-hidden="true"><span className={styles.statementRingOne}/><span className={styles.statementRingTwo}/><ShieldCheck size={85} strokeWidth={.85}/></div>
    </div></div></section>

    <section className={styles.benefits}><div className={styles.container}><div className={styles.benefitLayout}>
      <div className={styles.benefitHeading}><span className={styles.eyebrow}>EVERYDAY ESSENTIALS</span><h2>Your digital space.<br/><span>Your rules.</span></h2><p>Security and privacy capabilities proposed for Cloudy VPN. Final technical specifications will be published before subscriptions open.</p><a href="#plans" className={styles.textLink}>Find your plan <ArrowRight size={16}/></a></div>
      <div className={styles.benefitGrid}>{advantages.map(({icon:Icon,title,description})=><article key={title} className={[styles.benefit,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}><span className={styles.benefitIcon}><Icon size={22} strokeWidth={1.7}/></span><h3>{title}</h3><p>{description}</p></article>)}</div>
    </div></div></section>

    <VpnPricing/>

    <section className={styles.platforms}><div className={styles.container}><div className={[styles.platformPanel,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}>
      <div className={styles.platformCopy}><span className={styles.eyebrow}>ONE BEAUTIFUL EXPERIENCE</span><h2>At home on<br/><span>every screen.</span></h2><p>From the desk to the everyday commute, we are designing Cloudy VPN to feel consistent and easy to use wherever you connect.</p><small>Supported systems and app availability will be confirmed before launch.</small></div>
      <div className={styles.deviceArt} aria-hidden="true"><div className={styles.laptopArt}><Laptop size={130} strokeWidth={.85}/><Shield size={35}/></div><div className={styles.mobileArt}><Smartphone size={96} strokeWidth={.8}/><ShieldCheck size={25}/></div></div>
    </div></div></section>

    <section className={styles.faq}><div className={styles.container}><div className={styles.faqGrid}>
      <div className={styles.faqHeading}><span className={styles.eyebrow}>QUESTIONS & ANSWERS</span><h2>Everything<br/><span>made clear.</span></h2><p>Simple answers about plans, privacy and availability.</p><Link className={styles.textLink} href="/support">Contact support <ArrowRight size={16}/></Link></div>
      <div className={styles.faqList}>{faq.map(({q,a})=><details key={q} className={styles.faqItem}><summary>{q}<span className={styles.plus}>+</span></summary><p>{a}</p></details>)}</div>
    </div></div></section>

    <section className={styles.bottomCta}><div className={styles.container}><div className={[styles.bottomPanel,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}>
      <span className={styles.eyebrow}>DISCOVER CLOUDY VPN</span><h2>Take the next step<br/><span>toward simplicity.</span></h2><p>Compare the options and find the Cloudy VPN experience that fits you.</p><a href="#plans" className={styles.primaryButton}>View VPN plans <ArrowRight size={17}/></a>
    </div></div></section>
  </div>;
}
