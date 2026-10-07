"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  ChartLineUp,
  ChatsCircle,
  Briefcase,
  Check,
  BookOpen,
  Sparkle,
} from "@phosphor-icons/react";
import { STOCKS, getDemoHistory } from "../lib/market.mjs";
export default function About() {
  const points = getDemoHistory("NVDA", "1Y");
  const values = points.map((p) => p.close ?? p.price ?? p.value);
  const min = Math.min(...values),
    max = Math.max(...values);
  const line = values
    .map(
      (v, i) =>
        `${(i * 620) / (values.length - 1)},${140 - ((v - min) / (max - min)) * 112}`,
    )
    .join(" ");
  return (
    <div className="welcome-page">
      <div className="welcome-topline">
        <span className="welcome-kicker">
          <span className="workspace-dot" />A clearer perspective on the markets
        </span>
        <span className="small-badge">LUNA TERMINAL / LOCAL PREVIEW</span>
      </div>
      <section className="welcome-hero">
        <div className="welcome-copy">
          <span className="eyebrow">RESEARCH. CONNECT. UNDERSTAND.</span>
          <h1>
            See the market
            <br />
            in a <span>new light.</span>
          </h1>
          <p>
            Your questions, your research, your next move.
            <br className="desktop-only" /> One thoughtful workspace for the
            whole picture.
          </p>
          <div className="welcome-actions">
            <Link href="/dashboard/chat" className="button primary">
              Start a conversation
              <ArrowUpRight size={18} />
            </Link>
            <Link href="/dashboard" className="button secondary">
              Explore the markets
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="welcome-proof">
            <span>
              <Check size={14} />
              Free to explore
            </span>
            <span>
              <Check size={14} />
              No account needed
            </span>
          </div>
        </div>
        <div className="welcome-preview">
          <div className="preview-head">
            <span>
              <img src="/brand/luna-mark-dark.png" alt="" />
              Your research, connected.
            </span>
            <span className="preview-dots">
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="preview-conversation">
            <span className="preview-question">
              How is NVIDIA performing against the market?
            </span>
            <div className="preview-assistant">
              <img src="/brand/luna-mark-dark.png" alt="" />
              <span>Let&apos;s look at the bigger picture.</span>
            </div>
            <Link href="/stock/NVDA" className="preview-stock">
              <div className="preview-stock-top">
                <div className="preview-stock-name">
                  <span className="nvidia-logo">N</span>
                  <span>
                    <b>NVIDIA Corporation</b>
                    <small>NVDA · NASDAQ</small>
                  </span>
                </div>
                <ArrowUpRight size={17} />
              </div>
              <div className="preview-price">
                $
                {(STOCKS.find((s) => s.symbol === "NVDA")?.price || 0).toFixed(
                  2,
                )}
                <span className="positive">
                  +{STOCKS.find((s) => s.symbol === "NVDA")?.change.toFixed(2)}%
                  <small>Illustrative session</small>
                </span>
              </div>
              <div className="preview-chart">
                <svg
                  viewBox="0 0 620 155"
                  role="img"
                  aria-label="Illustrative NVIDIA price history"
                >
                  <defs>
                    <linearGradient
                      id="welcome-area"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#1aaa8d" stopOpacity=".16" />
                      <stop offset="100%" stopColor="#1aaa8d" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[30, 70, 110, 150].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      x2="620"
                      y1={y}
                      y2={y}
                      stroke="var(--border)"
                      strokeDasharray="3 5"
                    />
                  ))}
                  <polygon
                    points={`0,155 ${line} 620,155`}
                    fill="url(#welcome-area)"
                  />
                  <polyline
                    points={line}
                    fill="none"
                    stroke="#19aa8d"
                    strokeWidth="2.3"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <div className="preview-chart-labels">
                  <span>Oct 2025</span>
                  <span>Apr 2026</span>
                  <span>Oct 2026</span>
                </div>
              </div>
              <div className="preview-card-bottom">
                <span>
                  <i />
                  NVDA
                </span>
                <span className="muted">Demo history · 1Y</span>
                <span className="preview-range">1Y</span>
              </div>
            </Link>
            <Link href="/graphs/comparison" className="preview-source">
              <ChartLineUp size={17} />
              <span>Compare with S&P 500</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="preview-footer">
            <span className="workspace-dot" />
            From a question to a clearer perspective.
          </div>
        </div>
      </section>
      <section className="welcome-tools">
        <div className="welcome-tools-heading">
          <div>
            <span className="eyebrow">BUILT FOR YOUR CURIOSITY</span>
            <h2>Every angle. One workspace.</h2>
          </div>
          <Link href="/dashboard" className="text-link">
            Explore your workspace
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="welcome-feature-grid">
          {[
            {
              icon: ChatsCircle,
              title: "An intelligent starting point",
              description:
                "Ask a question. Explore financial concepts, dated market snapshots, and your attached research.",
              href: "/dashboard/chat",
              link: "Meet Luna",
            },
            {
              icon: ChartLineUp,
              title: "The market, in context",
              description:
                "Compare companies, measure price moves, and bring sentiment and global markets into focus.",
              href: "/dashboard",
              link: "Open market dashboard",
            },
            {
              icon: Briefcase,
              title: "Research that becomes work",
              description:
                "Organize clients and portfolios. Turn your insights into editable reports and clear exports.",
              href: "/finance-crm",
              link: "Explore advisor tools",
            },
          ].map(({ icon: Icon, ...f }) => (
            <Link href={f.href} className="welcome-feature" key={f.title}>
              <span className="feature-icon">
                <Icon size={25} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
              <span className="feature-link">
                {f.link}
                <ArrowUpRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <div className="welcome-bottom">
        <span>
          <BookOpen size={16} />
          Built for research. Designed for clarity.
        </span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/accessibility">Accessibility</Link>
          <Link href="/contact">Contact</Link>
          <span>© 2026 Luna Terminal</span>
        </div>
      </div>
    </div>
  );
}
