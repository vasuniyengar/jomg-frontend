import { PublicThemeProvider } from "./_components/PublicThemeProvider";
import "./public-tournament.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function PublicLayout({ children }) {
  return <PublicThemeProvider>{children}</PublicThemeProvider>;
}
