import About from "../../components/About";
import ChatWorkspace from "../../components/ChatWorkspace";
import Dashboard from "../../components/market/Dashboard";
import StockView from "../../components/market/StockView";
import ResearchView, {
  WatchlistView,
  AlertsView,
} from "../../components/market/ResearchView";
import AdvisorView from "../../components/advisor/AdvisorView";
import InfoPage from "../../components/InfoPage";
import { notFound } from "next/navigation";
import { PAGES } from "../../lib/navigation.mjs";
export default async function Page({ params }) {
  const { slug } = await params;
  const path = slug.join("/");
  if (path === "about") return <About />;
  if (path === "dashboard") return <Dashboard />;
  if (path.startsWith("dashboard/chat"))
    return <ChatWorkspace key={slug[2] || "new"} conversationId={slug[2]} />;
  if (slug[0] === "stock")
    return <StockView symbol={(slug[1] || "NVDA").toUpperCase()} />;
  if (
    [
      "finance-crm",
      "client-portfolios",
      "model-portfolios",
      "reports",
      "13Filings",
    ].includes(slug[0])
  )
    return <AdvisorView slug={slug[0]} cik={slug[1]} />;
  if (path === "watchlist") return <WatchlistView />;
  if (path === "alerts") return <AlertsView />;
  if (["privacy", "terms", "contact", "accessibility"].includes(path))
    return <InfoPage slug={path} />;
  if (path === "ai-bot") return <ResearchView slug="rsi-le" />;
  if (
    !PAGES.some((page) => page.href.split("?")[0] === "/" + path) &&
    path !== "what-if"
  )
    notFound();
  return <ResearchView slug={path} />;
}
