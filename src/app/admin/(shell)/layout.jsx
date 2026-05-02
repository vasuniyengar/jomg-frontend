import "./shell.css";
import Sidebar from "./_components/Sidebar";
import { ThemeProvider } from "./_components/ThemeProvider";
import Topbar from "./_components/Topbar";

export default function AdminShellLayout({ children }) {
  return (
    <ThemeProvider>
      <div className="app">
        <Topbar />
        <div className="body-area">
          <Sidebar />
          <main className="main">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
