"use client";
import { useState } from "react";
import { Check, ChevronDown, LockKeyhole, ShieldCheck } from "lucide-react";
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
 ["Encrypted VPN tunnel","Planned","Planned","Planned"],
 ["DNS leak protection","Planned","Planned","Planned"],
 ["Automatic kill switch","Planned","Planned","Planned"],
 ["Ad and tracker blocking","—","Planned","Planned"],
 ["Split tunneling","—","Planned","Planned"],
 ["Threat and phishing protection","—","Planned","Planned"],
 ["Multi hop VPN","—","—","Under review"],
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
     <p>Explore flexible subscription concepts and proposed privacy features, built around your needs.</p>
    </div>
    <div className={styles.billingBar}>
     <div className={styles.billingIntro}><strong>Choose your term</strong><span>Illustrative Cloudy pricing</span></div>
     <div className={styles.billingSwitch} role="group" aria-label="Subscription duration">
      {periods.map(item=><button key={item.key} type="button"
        aria-pressed={period===item.key}
        className={period===item.key?styles.billingActive:styles.billingOption}
        onClick={()=>setPeriod(item.key)}>{item.label}</button>)}
     </div>
    </div>
    <div className={styles.planGrid}>
     {tiers.map((tier,i)=>{
       const rate=tier.prices[period];
       const total=Math.round(rate*term.months*100)/100;
       return <article key={tier.name} className={[styles.planCard,"cloudy-traced-panel","cloudy-studio-sheen-panel",("featured" in tier&&tier.featured)?styles.planFeatured:""].join(" ")}>
        <div className={styles.planTop}><span className={styles.planType}>{String(i+1).padStart(2,"0")} / {tier.accent}</span>
        {"featured" in tier&&tier.featured&&<span className={styles.soonTag}>Most popular</span>}</div>
        <h3>{tier.name}</h3><p>{tier.subtitle}</p>
        <div className={styles.planRate} aria-label={euro(rate)+" per month"}><span className={styles.planCurrency}>€</span>
         <strong>{rate.toFixed(2).replace(".",",")}</strong><span className={styles.planPer}>/ month</span>
        </div>
        <p className={styles.planBilled}>{period==="month"?"Billed monthly":euro(total)+" billed for "+term.months+" months"}</p>
        <div className={styles.planDivider}/>
        <div className={styles.planFeatureTitle}>PROPOSED FEATURES</div>
        <ul>{tier.features.map(item=><li key={item}><Check size={16} aria-hidden="true"/>{item}</li>)}</ul>
        <details className={styles.planDetails}><summary>View package details <ChevronDown size={15} aria-hidden="true"/></summary><p>{tier.details}</p></details>
        <div className={styles.disabledButton}>Subscriptions not open <LockKeyhole size={15}/></div>
       </article>;
     })}
    </div>
    <p className={styles.plansNote}><ShieldCheck size={16}/> Draft Cloudy prices inspired by publicly advertised VPN rates. No checkout is active. VAT, renewal prices and included services require confirmation before sale.</p>
    <details className={[styles.comparePanel,"cloudy-traced-panel","cloudy-studio-sheen-panel"].join(" ")}>
     <summary>Compare proposed plan features <ChevronDown size={18}/></summary>
     <div className={styles.comparisonScroll}><table><thead><tr><th>Feature</th>{tiers.map(t=><th key={t.name}>{t.name}</th>)}</tr></thead>
      <tbody>{matrix.map(row=><tr key={row[0]}>{row.map((value,i)=><td key={i}>{value}</td>)}</tr>)}</tbody>
     </table></div>
     <p className={styles.comparisonFoot}>All listed features are proposed. Final availability depends on technical verification of Cloudy VPN.</p>
    </details>
   </div>
  </section>
 );
}
