import Link from "next/link";
const pages = {
  privacy: {
    title: "Your research stays yours.",
    label: "Privacy",
    paragraphs: [
      "This local preview stores conversations, appearance preferences, watchlists, clients, portfolios, and report drafts in your browser. Anyone who can access this browser profile can access those records.",
      "Text attachments are sent to the local application server only for the research request. The local assistant does not send your query or private documents to a hosted model or web search service. No AWS resources are connected.",
      "Cloud identity, account synchronization, hosted models, and third-party provider integrations require separate configuration. Their data processing must be reviewed before enabling them. You can delete individual conversations in Research history; clearing site data removes the local workspace.",
    ],
  },
  terms: {
    title: "A workspace for understanding.",
    label: "Terms of use",
    paragraphs: [
      "Luna Terminal is an explanatory financial research preview. Illustrative market data, fictional clients, sample allocations, and hypothetical returns are explicitly labeled demo. They are not current quotes or recommendations.",
      "Price returns exclude dividends, fees, taxes, and cash flows unless a tool explicitly says otherwise. Reports should be reviewed before sharing. Past performance does not establish future results.",
      "This preview provides browser-local storage without account synchronization or production availability guarantees. External service integration and deployment are not enabled.",
    ],
  },
  accessibility: {
    title: "Clarity should be accessible.",
    label: "Accessibility",
    paragraphs: [
      "The terminal supports keyboard focus, labeled controls, reduced motion, responsive layouts, financial signs alongside colors, and contained scrolling for wide tables.",
      "Press Ctrl+K or Command+K to search. Press Escape to dismiss an overlay. Enter sends a chat message and Shift+Enter starts a new line. You can navigate research pages through the left menu or mobile navigation.",
      "If a chart is difficult to use with a pointer, its current prices, ranges, and important statistics are also shown as text. Exported reports retain selectable text.",
    ],
  },
  contact: {
    title: "Let’s keep the conversation going.",
    label: "Contact",
    paragraphs: [
      "This Luna Terminal preview is running locally. No support inbox, message delivery, or public contact service is configured.",
      "Project setup, feature status, and deployment prerequisites are documented in README.md and docs/ in the project workspace. For research within the application, open New Chat.",
    ],
  },
};
export default function InfoPage({ slug }) {
  const p = pages[slug];
  return (
    <article className="info-page">
      <span className="eyebrow">LUNA TERMINAL / {p.label.toUpperCase()}</span>
      <h1>{p.title}</h1>
      {p.paragraphs.map((t) => (
        <p key={t}>{t}</p>
      ))}
      <Link className="button primary" href="/dashboard/chat">
        Open New Chat ↗
      </Link>
    </article>
  );
}
