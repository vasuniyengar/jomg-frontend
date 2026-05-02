/** Sidebar phases + nav — mirrors 04-dashboard-page-4.html */
export const PHASES = [
  {
    id: "phase-1",
    num: 1,
    label: "Setup",
    sub: "Pre-tournament",
    items: [
      {
        href: "/admin/dashboard",
        icon: "🏠",
        label: "Dashboard",
        badge: { text: "3", variant: "red" },
      },
      { href: "/admin/settings", icon: "⚙️", label: "Tournament Settings" },
      { href: "/admin/divisions", icon: "🗂", label: "Manage Divisions" },
      { href: "/admin/courtsetup", icon: "🏟️", label: "Court Setup" },
      {
        comingSoon: true,
        icon: "📋",
        label: "Event Planner",
        version: "v1.01",
      },
      { href: "/admin/coupons", icon: "🏷️", label: "Discounts" },
      {
        comingSoon: true,
        icon: "👕",
        label: "Shop",
        version: "v1.01",
      },
    ],
  },
  {
    id: "phase-2",
    num: 2,
    label: "Registrations",
    sub: "Players & teams",
    items: [
      {
        href: "/admin/reglist",
        icon: "👥",
        label: "Players List",
        badge: { text: "48", variant: "default" },
      },
      {
        comingSoon: true,
        icon: "⏳",
        label: "Waitlist & Approvals",
        version: "v1.01",
      },
      { href: "/admin/communication", icon: "✉️", label: "Outreach" },
    ],
  },
  {
    id: "phase-3",
    num: 3,
    label: "Draw & Schedule",
    sub: "Before play begins",
    items: [
      { href: "/admin/draw", icon: "🎯", label: "Generate Draw" },
      { href: "/admin/schedule", icon: "📅", label: "Schedule Builder" },
    ],
  },
  {
    id: "phase-4",
    num: 4,
    label: "Live Play",
    sub: "Day-of operations",
    items: [
      {
        href: "/admin/control",
        icon: "🎮",
        label: "Control Center",
        liveDot: true,
      },
      {
        href: "/admin/checkin",
        icon: "✅",
        label: "Player Check-In",
        badge: {
          text: "94%",
          variant: "green",
          style: { background: "rgba(0,200,80,0.15)", color: "#00b84a" },
        },
      },
      { href: "/admin/courts", icon: "🏟", label: "Court Center" },
      { href: "/admin/autopilot", icon: "🛫", label: "Auto-Pilot" },
      { href: "/admin/scoreentry", icon: "📋", label: "Score Entry" },
      { href: "/admin/bracket", icon: "📊", label: "Bracket Progression" },
    ],
  },
  {
    id: "phase-5",
    num: 5,
    label: "Wrap-Up",
    sub: "Post-tournament",
    items: [
      { href: "/admin/results", icon: "🏆", label: "Results & Prizes" },
      { href: "/admin/analytics", icon: "📈", label: "Analytics & Report" },
      { href: "/admin/survey", icon: "📝", label: "Player Survey" },
      { href: "/admin/audits", icon: "🔍", label: "Audit Log" },
    ],
  },
];
