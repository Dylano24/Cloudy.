"use client";
import { useState } from "react";
import { Check, ChevronDown, ShieldCheck } from "lucide-react";
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
    name:"Basic",subtitle:"The essential VPN experience.",accent:"ESSENTIAL",
    prices:{twoYears:3.49,year:4.99,month:14.99},
    features:["Encrypted VPN connection","Location switching","DNS leak protection","Automatic kill switch","Multi device access"],
    details:"Proposed VPN features. Server locations, devices, tunneling protocols and security functions must be verified before subscriptions go on sale.",
  },
  {
    name:"Complete",subtitle:"More privacy tools in one place.",accent:"MOST POPULAR",featured:true,
    prices:{twoYears:3.99,year:5.99,month:19.99},
    features:["Everything in Basic","Ad and tracker blocking","Threat and phishing protection","Split tunneling controls","Extended privacy settings"],
    details:"Additional capabilities are a proposed service tier. Blocking, threat protection and split tunneling must be verified before the package is sold as described.",
  },
  {
    name:"Ultra",subtitle:"Our most complete vision.",accent:"ADVANCED",
    prices:{twoYears:5.99,year:8.09,month:22.89},
    features:["Everything in Complete","Advanced connection options","Multi hop VPN concept","Priority support concept","Additional privacy tools"],
    details:"Advanced features are under review. Multi hop routing, additional privacy tools and priority support have not been confirmed operational.",
  },
] as const;
const matrix=[
 ["Encrypted VPN tunnel","Targeted","Planned","Planned"],
 ["DNS leak protection","Planned","Planned","Planned"],
 ["Automatic kill switch","Planned","Planned","Planned"],
 ["Ad and tracker blocking","—","Planned","Planned"],
 ["Split tunneling","—","Planned","Planned"],
 ["Threat and phishing protection","—","Planned","Planned"],
 ["Multi hop VPN","—","—","TBC"],
 ["Priority support","—","—","Under review"],
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
     <h2 id="vpn-plans-title">One service.<br/><span>Your way.</span></h2>
     <p>Choose your plan and find the features that fit your digital life.</p>
    </div>
    <div className={styles.billingBar}>
     <div className={styles.billingIntro}><strong>Choose your term</strong><span>Choose how you subscribe</span></div>
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
        {"featured" in tier&&tier.featured&&<span className={styles.soonTag}>Most popular</span>}</div>
        <h3>{tier.name}</h3><p>{tier.subtitle}</p>
        <div className={styles.planRate} aria-label={euro(rate)+" per month"}><span className={styles.planCurrency}>€</span>
         <strong>{rate.toFixed(2).replace(".",",")}</strong><span className={styles.planPer}>/ month</span>
        </div>
        <p className={styles.planBilled}>{period==="month"?"Billed monthly":euro(total)+" billed for "+term.months+" months"}</p>
        <div className={styles.planDivider}/>
        <div className={styles.planFeatureTitle}>FEATURES</div>
        <ul>{tier.features.map(item=><li key={item}><Check size={16} aria-hidden="true"/>{item}</li>)}</ul>
        <details className={styles.planDetails}><summary>View package details <ChevronDown size={15} aria-hidden="true"/></summary><p>{tier.details}</p></details>
        <div className={styles.cardBottom}>
         <button type="button" className={studioStyles.buyButton} popoverTarget={popoverId} popoverTargetAction="show">Buy</button>
         <div className={studioStyles.orderPopover} id={popoverId} popover="auto" data-cloudy-vpn-order>
          <button type="button" className={studioStyles.close} popoverTarget={popoverId} popoverTargetAction="hide" aria-label="Close">×</button>
          <h2>Cloudy VPN {tier.name}</h2>
          <p>{term.label} · {euro(rate)} / month</p>
          <div className={studioStyles.reviewText}>
           <p><strong>Subscription:</strong> {tier.name}</p>
           <p><strong>Duration:</strong> {term.label}</p>
           <p><strong>Billing:</strong> {period==="month"?"Monthly":euro(total)+" for "+term.months+" months"}</p>
           <p><strong>Includes:</strong> {tier.features.join(", ")}</p>
          </div>
          <div className={studioStyles.previewNotice}>
           Ordering is not enabled while Cloudy VPN infrastructure and account activation are being finalized. No payment will be collected.
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
    <p className={styles.plansNote}><ShieldCheck size={16}/> Pricing and features shown for the upcoming service. Final taxes, renewal terms and technical availability will be confirmed when ordering opens.</p>
    <details className={[styles.comparePanel,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}>
     <summary>Compare plan features <ChevronDown size={18}/></summary>
     <div className={styles.comparisonScroll}><table><thead><tr><th>Feature</th>{tiers.map(t=><th key={t.name}>{t.name}</th>)}</tr></thead>
      <tbody>{matrix.map(row=><tr key={row[0]}>{row.map((value,i)=><td key={i}>{value}</td>)}</tr>)}</tbody>
     </table></div>
     <p className={styles.comparisonFoot}>Feature availability is subject to technical verification before subscriptions can be activated.</p>
    </details>
   </div>
  </section>
 );
}
