import Link from "next/link";
import styles from "./dashboard.module.css";

const modules = [
  { name: "Overview", description: "Server status and activity" },
  { name: "Moderation", description: "Moderation settings and audit history" },
  { name: "Automod", description: "Protection and automated rules" },
  { name: "Tickets", description: "Ticket panels and workflows" },
  { name: "Reports", description: "Report configuration and staff actions" },
  { name: "Giveaways", description: "Giveaway configuration" },
  { name: "Embed builder", description: "Design and manage Discord embeds" },
  { name: "Welcome & leave", description: "Member arrival and departure messages" },
  { name: "Economy", description: "Games and economy settings" },
  { name: "Logs", description: "Audit and event logging" },
  { name: "Automation", description: "Scheduled messages and feeds" },
  { name: "Voice channels", description: "Join-to-create configuration" },
];

export const metadata = {
  title: "Cloudy Dashboard",
  description: "Manage Cloudy Discord server settings.",
};

export default function DashboardPage() {
  return (
    <main className={`cloudy-page-shell ${styles.page}`}>
      <div className={styles.eyebrow}>CLOUDY / DASHBOARD</div>
      <h1 className={styles.heading}>Your server. <span>One dashboard.</span></h1>
      <p className={styles.intro}>A dedicated control center for Cloudy. Discord authentication and live server controls are being integrated. No bot settings can be changed from this preview.</p>
      <div className={styles.status} role="status">Preview only · Discord connection not active</div>
      <div className={styles.grid}>
        {modules.map((module) => (
          <section className={styles.card} key={module.name}>
            <div className={styles.dot} aria-hidden="true" />
            <h2>{module.name}</h2>
            <p>{module.description}</p>
            <span className={styles.soon}>Integration pending</span>
          </section>
        ))}
      </div>
      <Link href="/" className={styles.back}>Back to Cloudy Store</Link>
    </main>
  );
}
