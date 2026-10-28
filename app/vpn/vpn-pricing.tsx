"use client";
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import studioStyles from "@/app/service/service.module.css";
import styles from "./vpn.module.css";

type Period="twoYears"|"year"|"month";
const periods:{key:Period;label:string;months:number}[]=[
  {key:"twoYears",label:"2 years",months:24},
  {key:"year",label:"1 year",months:12},
  {key:"month",label:"Monthly",months:1},
];
const tiers=[
  {
    name:"Basic",subtitle:"Connection essentials, clearly delivered.",
    prices:{twoYears:3.49,year:4.99,month:14.99},
    features:["Encrypted VPN connection","Location switching","DNS leak protection","Automatic kill switch","Multi device access"],
    details:"The core VPN package: an encrypted connection, location selection, DNS protection and a kill switch. Device and location availability depends on your service configuration.",
  },
  {
    name:"Complete",subtitle:"A wider set of privacy controls.",featured:true,
    prices:{twoYears:3.99,year:5.99,month:19.99},
    features:["All Basic features","Ad and tracker blocking","Threat and phishing protection","Split tunneling","Additional privacy settings"],
    details:"Everything in Basic, with additional controls for ads, trackers and suspicious domains. Split tunneling lets you choose which apps use the VPN.",
  },
  {
    name:"Ultra",subtitle:"Advanced tools for greater flexibility.",
    prices:{twoYears:5.99,year:8.09,month:22.89},
    features:["All Complete features","Advanced connection options","Multi hop VPN","Priority support","Additional privacy tools"],
    details:"Everything in Complete, with advanced routing and priority support. Multi hop routes traffic through more than one VPN server and may affect connection speed.",
  },
] as const;
const matrix=[
 ["Encrypted VPN tunnel","Included","Included","Included"],
 ["DNS leak protection","Included","Included","Included"],
 ["Automatic kill switch","Included","Included","Included"],
 ["Ad and tracker blocking","—","Included","Included"],
 ["Split tunneling","—","Included","Included"],
 ["Threat and phishing protection","—","Included","Included"],
 ["Multi hop VPN","—","—","Included"],
 ["Priority support","—","—","Included"],
];
const euro=(value:number)=>new Intl.NumberFormat("en-IE",{style:"currency",currency:"EUR",minimumFractionDigits:2}).format(value);
export function VpnPricing(){
 const [period,setPeriod]=useState<Period>("twoYears");
 const term=periods.find(x=>x.key===period)!;
 return (
  <section className={styles.plans} id="plans" aria-labelledby="vpn-plans-title">
   <div className={styles.container}>
    <div className={styles.sectionHeading}>
     <div className={styles.eyebrow}>CLOUDY VPN PLANS</div>
     <h2 id="vpn-plans-title">Three plans.<br/><span>Clear differences.</span></h2>
     <p>Choose your level of protection. Compare monthly rates, full subscription totals and the tools in each plan.</p>
    </div>
    <div className={styles.billingBar}>
     <div className={styles.billingIntro}><strong>Subscription duration</strong><span>Compare the same plan across different terms</span></div>
     <div className={styles.billingSwitch} role="group" aria-label="Subscription duration">
      {periods.map(item=><button key={item.key} type="button"
        aria-pressed={period===item.key}
        className={period===item.key?styles.billingActive:styles.billingOption}
        onClick={()=>setPeriod(item.key)}>{item.label}</button>)}
     </div>
    </div>
    <div className={styles.planGrid}>
     {tiers.map((tier)=>{
       const rate=tier.prices[period];
       const total=Math.round(rate*term.months*100)/100;
       const popoverId="cloudy-vpn-order-"+tier.name.toLowerCase();
       return <article key={tier.name} className={[styles.planCard,"cloudy-traced-panel","cloudy-studio-sheen-panel",("featured" in tier&&tier.featured)?styles.planFeatured:""].join(" ")}>
        <div className={styles.planTop}><span className={styles.planType}>CLOUDY VPN</span>
        {"featured" in tier&&tier.featured&&<span className={styles.featuredTag}>More privacy controls</span>}</div>
        <h3>{tier.name}</h3><p>{tier.subtitle}</p>
        <div className={styles.planRate} aria-live="polite" aria-atomic="true" aria-label={euro(rate)+" per month"}><span className={styles.planCurrency}>€</span>
         <strong>{rate.toFixed(2).replace(".",",")}</strong><span className={styles.planPer}>/ month</span>
        </div>
        <p className={styles.planBilled}>{period==="month"?"Billed monthly":euro(total)+" billed for "+term.months+" months"}</p>
        <div className={styles.planDivider}/>
        <div className={styles.planFeatureTitle}>INCLUDED IN YOUR PLAN</div>
        <ul>{tier.features.map(item=><li key={item}><Check size={16} aria-hidden="true"/>{item}</li>)}</ul>
        <details className={styles.planDetails}><summary>What’s included <ChevronDown size={15} aria-hidden="true"/></summary><p>{tier.details}</p></details>
        <div className={styles.cardBottom}>
         <button type="button" className={studioStyles.buyButton} popoverTarget={popoverId} popoverTargetAction="show" aria-label={"Buy Cloudy VPN " + tier.name}>Buy</button>
         <div className={studioStyles.orderPopover} id={popoverId} popover="auto" role="dialog" aria-labelledby={popoverId+"-title"} data-cloudy-vpn-order>
          <button type="button" className={studioStyles.close} popoverTarget={popoverId} popoverTargetAction="hide" aria-label="Close">×</button>
          <h2 id={popoverId+"-title"}>Cloudy VPN {tier.name}</h2>
          <p>{term.label} · {euro(rate)} / month</p>
          <div className={studioStyles.reviewText}>
           <p><strong>Subscription:</strong> {tier.name}</p>
           <p><strong>Duration:</strong> {term.label}</p>
           <p><strong>Billing:</strong> {period==="month"?"Monthly":euro(total)+" for "+term.months+" months"}</p>
           <p><strong>Includes:</strong> {tier.features.join(", ")}</p>
          </div>
          <div className={studioStyles.previewNotice}>
           Preview checkout. Review your selection here. This preview does not collect payments or create subscriptions.
          </div>
          <div className={studioStyles.modalActions}>
           <button type="button" className={studioStyles.secondaryButton} popoverTarget={popoverId} popoverTargetAction="hide">Close</button>
           <Link href="/support" className={studioStyles.primaryButton}>Contact Cloudy</Link>
          </div>
         </div>
        </div>
       </article>;
     })}
    </div>

    <details className={[styles.comparePanel,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}>
     <summary>Compare security and privacy tools <ChevronDown size={18}/></summary>
     <div className={styles.comparisonScroll} tabIndex={0} role="region" aria-label="Plan comparison, scroll horizontally on smaller screens"><table><caption className={styles.srOnly}>Cloudy VPN features by subscription</caption><thead><tr><th scope="col">Feature</th>{tiers.map(t=><th scope="col" key={t.name}>{t.name}</th>)}</tr></thead>
      <tbody>{matrix.map(row=><tr key={row[0]}>{row.map((value,i)=>i===0?<th scope="row" key={i}>{value}</th>:<td key={i}>{value==="—"?<span aria-label="Not included">—</span>:value}</td>)}</tr>)}</tbody>
     </table></div>
     <p className={styles.comparisonFoot}>A VPN helps protect your connection. It does not replace antivirus software or guarantee anonymity. Advanced routing and filtering can affect speed and website compatibility.</p>
    </details>
   </div>
  </section>
 );
}
