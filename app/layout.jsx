import "./globals.css";
import TerminalShell from "../components/TerminalShell";

export const metadata = {
  title: "Luna Terminal — Research in a new light",
  description:
    "Your market research and advisor workspace. Explore markets, ask better questions, and turn evidence into insight.",
};
const preferencesScript = `try{var p=JSON.parse(localStorage.getItem('luna.appearance')||'{}');document.documentElement.dataset.theme=p.theme||'Luna';document.documentElement.dataset.background=p.background||'none';document.documentElement.dataset.font=p.font||'InterWoff';document.documentElement.dataset.density=p.density||'Compact';document.documentElement.dataset.weight=p.weight||'Normal';document.documentElement.dataset.sidebar=p.sidebar||'Small'}catch(e){}`;
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
      </head>
      <body>
        <TerminalShell>{children}</TerminalShell>
      </body>
    </html>
  );
}
