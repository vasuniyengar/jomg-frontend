import { PublicThemeProvider } from "./_components/PublicThemeProvider";
import "./public-tournament.css";

export default function PublicLayout({ children }) {
  return <PublicThemeProvider>{children}</PublicThemeProvider>;
}
