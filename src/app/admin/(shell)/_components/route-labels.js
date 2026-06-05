/** Breadcrumb label per pathname (admin shell) */
export const ROUTE_LABELS = {
  "/admin/dashboard": "Dashboard",
  "/admin/settings": "Tournament Settings",
  "/admin/divisions": "Manage Divisions",
  "/admin/courtsetup": "Court Setup",
  "/admin/coupons": "Discounts",
  "/admin/reglist": "Players List",
  "/admin/communication": "Outreach",
  "/admin/draw": "Generate Draw",
   "/admin/publishdraw": "Publish Draw",
  "/admin/schedule": "Schedule Builder",
  "/admin/control": "Control Center",
  "/admin/checkin": "Player Check-In",
  "/admin/courts": "Court Center",
  "/admin/autopilot": "Auto-Pilot",
  "/admin/scoreentry": "Score Entry",
  "/admin/bracket": "Bracket Progression",
  "/admin/results": "Results & Prizes",
  "/admin/analytics": "Analytics & Report",
  "/admin/survey": "Player Survey",
  "/admin/audits": "Audit Log",
  "/admin/tournaments": "My Tournaments",
  "/admin/create": "Tournament Info",
};

export function labelForPath(pathname) {
  if (!pathname) return "Dashboard";
  const exact = ROUTE_LABELS[pathname];
  if (exact) return exact;
  const base = pathname.replace(/\/$/, "");
  return ROUTE_LABELS[base] || "Dashboard";
}
