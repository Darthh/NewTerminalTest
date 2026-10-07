"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUp,
  ArrowUpRight,
  Paperclip,
  Globe,
  MagnifyingGlass,
  ChartLineUp,
  Briefcase,
  CaretDown,
  X,
  Stop,
  FileText,
  Plus,
  Check,
  Copy,
  ArrowClockwise,
  Sparkle,
  BookOpen,
} from "@phosphor-icons/react";
import { QuoteCard } from "./market/StockView";
import { readChats, saveChat } from "../lib/chat-storage.mjs";
import { STOCKS } from "../lib/market.mjs";

const suggestions = [
  [
    "Market perspective",
    "What is market sentiment today? Include the observation date, the previous reading, and the main indicators.",
    "/dashboard",
    "What’s moving the market?",
  ],
  [
    "Company research",
    "Compare NVDA and SPY over the last year, show their percentage changes, and open the relevant chart tools.",
    "/graphs/comparison",
    "Put NVIDIA in perspective.",
  ],
  [
    "Advisor workspace",
    "Create a draft client report from my selected model portfolio, explain its assumptions, and prepare PDF and CSV exports.",
    "/reports",
    "Turn research into a client report.",
  ],
  [
    "Market perspective",
    "Explain how the Fear & Greed Index works, what its seven indicators measure, and what its limitations are.",
    "/dashboard",
    "Decode market sentiment.",
  ],
  [
    "Company research",
    "Show AMD’s quote and dated price history, and explain how to compare it with NVIDIA.",
    "/stock/AMD",
    "Explore the semiconductor story.",
  ],
  [
    "Advisor workspace",
    "Where can I review Berkshire Hathaway’s latest reported holdings, and what quarter do those filings cover?",
    "/13Filings",
    "Follow the institutional perspective.",
  ],
  [
    "Market perspective",
    "Compare US sector performance and identify which sectors lead in the illustrative dataset.",
    "/us-sectors",
    "Find the market’s strongest sectors.",
  ],
  [
    "Company research",
    "Explain price-to-earnings ratios and why two technology companies can have different valuation multiples.",
    "/chart-metrics",
    "Understand what a valuation tells you.",
  ],
  [
    "Advisor workspace",
    "Help me review the assumptions of a balanced 60/40 portfolio before creating a client proposal.",
    "/model-portfolios",
    "Build a balanced perspective.",
  ],
  [
    "Market perspective",
    "What is the difference between a price return and a total return? Explain what dividends change.",
    "/portfolio-comparison",
    "Look beyond the headline return.",
  ],
  [
    "Company research",
    "Open Apple’s stock research page and show where I can measure a price move over a selected interval.",
    "/stock/AAPL",
    "Get a closer look at Apple.",
  ],
  [
    "Advisor workspace",
    "Summarize the documents I attached, cite the relevant pages or chunks, and identify missing information.",
    "/dashboard/chat",
    "Connect the dots in your documents.",
  ],
  [
    "Market perspective",
    "Explain why Treasury yields and equity valuations sometimes move in opposite directions.",
    "/global-yields",
    "Understand the rates conversation.",
  ],
  [
    "Company research",
    "Show Microsoft’s research view and explain the difference between revenue growth and earnings growth.",
    "/stock/MSFT",
    "Explore Microsoft’s fundamentals.",
  ],
  [
    "Advisor workspace",
    "Where can I organize a new client, set their risk profile, and schedule a portfolio review?",
    "/finance-crm",
    "Make room for your next client.",
  ],
  [
    "Market perspective",
    "Find a research view for global equity markets and explain currency risk for a US investor.",
    "/global-markets",
    "See the bigger global picture.",
  ],
  [
    "Company research",
    "Help me find technology companies in the stock screener and explain market capitalization.",
    "/screener",
    "Find your next research question.",
  ],
  [
    "Advisor workspace",
    "Explain how portfolio weights are validated and show where I can create a reusable model portfolio.",
    "/model-portfolios",
    "Start with a thoughtful allocation.",
  ],
  [
    "Market perspective",
    "What does market breadth tell us that the S&P 500 price alone may not show?",
    "/dashboard",
    "Look underneath the index.",
  ],
  [
    "Company research",
    "Compare Amazon and Alphabet in the company comparison tool and explain the limits of demo data.",
    "/graphs/comparison",
    "Compare two different growth stories.",
  ],
  [
    "Advisor workspace",
    "Help me prepare a review checklist for a client portfolio, including allocation and concentration risk.",
    "/client-portfolios",
    "Prepare for a better client review.",
  ],
  [
    "Market perspective",
    "Explain the VIX, implied volatility, and why a high reading is not a directional forecast.",
    "/chart-metrics",
    "Make sense of volatility.",
  ],
  [
    "Company research",
    "Show Tesla’s price history and explain how drag-to-measure calculates percentage change.",
    "/stock/TSLA",
    "Measure a move, in context.",
  ],
  [
    "Advisor workspace",
    "Where can I create a One Pager report, choose its pages, and export a PDF?",
    "/reports",
    "Make the essentials shareable.",
  ],
  [
    "Market perspective",
    "Find the earnings calendar and explain the difference between estimates and reported earnings.",
    "/earnings-calendar",
    "Get ready for earnings season.",
  ],
  [
    "Company research",
    "Explain what a supply-chain relationship means and where I can explore company connections.",
    "/supply-chain",
    "See how companies connect.",
  ],
  [
    "Advisor workspace",
    "Help me set a price alert and explain what is required before automatic notifications can be delivered.",
    "/alerts",
    "Keep your next research trigger close.",
  ],
  [
    "Market perspective",
    "Explain how correlation differs from causation when comparing two market price series.",
    "/regression-analysis",
    "Ask better questions of the data.",
  ],
  [
    "Company research",
    "Find the largest companies by market capitalization and open the NVIDIA stock research page.",
    "/market-cap",
    "Explore the market’s heavyweights.",
  ],
  [
    "Advisor workspace",
    "Explain the disclosure lag of 13F filings and why reported holdings are not a real-time portfolio.",
    "/13Filings",
    "Read institutional filings thoughtfully.",
  ],
  [
    "Market perspective",
    "Where can I explore country ETFs and compare their dated price returns?",
    "/country-etfs",
    "Research beyond borders.",
  ],
  [
    "Company research",
    "Explain RSI and how a strategy simulation differs from a live trading signal.",
    "/rsi-le",
    "Put technical signals in perspective.",
  ],
  [
    "Advisor workspace",
    "Help me create a watchlist of NVDA, AMD, and MSFT for future research.",
    "/watchlist",
    "Keep the companies you follow close.",
  ],
];
const icons = [Globe, ChartLineUp, Briefcase];
function TextContent({ text }) {
  return text
    .split("\n\n")
    .map((p, i) => (
      <p key={i}>
        {p
          .split(/(\*\*[^*]+\*\*)/)
          .map((part, j) =>
            part.startsWith("**") ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              part
            ),
          )}
      </p>
    ));
}
export default function ChatWorkspace({ conversationId }) {
  const pathname = usePathname();
  const [chat, setChat] = useState(null),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [storageError, setStorageError] = useState(false),
    [attachments, setAttachments] = useState([]),
    [web, setWeb] = useState(false),
    [modelMenu, setModelMenu] = useState(false),
    [suggestionIndex, setSuggestionIndex] = useState(0),
    [interacting, setInteracting] = useState(false),
    [copyStatus, setCopyStatus] = useState("");
  const controller = useRef(null),
    chatRef = useRef(null),
    fileRef = useRef(null),
    endRef = useRef(null),
    textareaRef = useRef(null);
  useEffect(() => {
    const initialPrompt = new URLSearchParams(window.location.search).get(
      "prompt",
    );
    if (initialPrompt && !conversationId)
      setInput(initialPrompt.slice(0, 8000));
    if (conversationId) {
      const saved = readChats().find((c) => c.id === conversationId);
      if (saved) {
        saved.messages = saved.messages.map((m) =>
          m.status === "streaming"
            ? {
                ...m,
                status: "interrupted",
                content:
                  m.content ||
                  "This response was interrupted. Your question is saved.",
              }
            : m,
        );
        setChat(saved);
        chatRef.current = saved;
      } else
        setError(
          "This conversation is not available in this browser. Start a new chat.",
        );
    }
    return () => {
      controller.current?.abort();
      controller.current = null;
    };
  }, [conversationId]);
  const resetChat = useCallback((fromUrl = false) => {
    controller.current?.abort();
    controller.current = null;
    chatRef.current = null;
    setChat(null);
    setBusy(false);
    setError("");
    setAttachments([]);
    setInput(
      fromUrl
        ? new URLSearchParams(window.location.search)
            .get("prompt")
            ?.slice(0, 8000) || ""
        : "",
    );
  }, []);
  useEffect(() => {
    if (pathname === "/dashboard/chat") resetChat(true);
  }, [pathname, resetChat]);
  useEffect(() => {
    const fresh = () => resetChat();
    window.addEventListener("luna-new-chat", fresh);
    return () => window.removeEventListener("luna-new-chat", fresh);
  }, [resetChat]);
  useEffect(() => {
    if (chat || interacting || input) return;
    const t = setInterval(
      () => setSuggestionIndex((i) => (i + 3) % suggestions.length),
      15000,
    );
    return () => clearInterval(t);
  }, [chat, interacting, input]);
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "end",
    });
  }, [chat?.messages?.length]);
  useEffect(() => {
    const dismiss = (event) => {
      if (
        event.key === "Escape" ||
        (event.type === "pointerdown" &&
          !event.target.closest(".composer-model-area"))
      )
        setModelMenu(false);
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, []);
  function persist(value) {
    chatRef.current = value;
    setChat({ ...value });
    if (!saveChat(value)) setStorageError(true);
  }
  async function addFiles(e) {
    setError("");
    const files = [...e.target.files];
    if (files.length + attachments.length > 8) {
      setError("Choose up to eight attachments.");
      return;
    }
    const next = [];
    for (const file of files) {
      if (file.size > 4 * 1024 * 1024) {
        setError(`${file.name} exceeds the 4 MB upload limit.`);
        continue;
      }
      if (!/\.(txt|md)$/i.test(file.name)) {
        setError(
          "This local preview supports TXT and Markdown. PDF, image, and audio extraction require configuration.",
        );
        continue;
      }
      const text = await file.text();
      if (new TextEncoder().encode(text).length > 180 * 1024) {
        setError(`${file.name} exceeds the 180 KB extracted-text limit.`);
        continue;
      }
      next.push({ name: file.name, text });
    }
    setAttachments((a) => [...a, ...next]);
    e.target.value = "";
  }
  async function send(message = input) {
    if (busy || controller.current || !message.trim()) return;
    setInput("");
    setError("");
    setBusy(true);
    setModelMenu(false);
    let value = chatRef.current || {
      id: crypto.randomUUID(),
      title: message.slice(0, 64),
      createdAt: new Date().toISOString(),
      messages: [],
    };
    value = {
      ...value,
      updatedAt: new Date().toISOString(),
      messages: [
        ...value.messages,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: message,
          attachments: attachments.map((a) => a.name),
        },
      ],
    };
    persist(value);
    if (!conversationId)
      window.history.replaceState(null, "", "/dashboard/chat/" + value.id);
    const requestAttachments = attachments;
    setAttachments([]);
    const answer = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      stocks: [],
      sources: [],
      status: "streaming",
    };
    value = { ...value, messages: [...value.messages, answer] };
    persist(value);
    const aborter = new AbortController();
    controller.current = aborter;
    const isCurrent = () =>
      controller.current === aborter && chatRef.current?.id === value.id;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: value.messages
            .slice(0, -2)
            .slice(-12)
            .map((m) => ({ role: m.role, content: m.content })),
          attachments: requestAttachments,
          webSearch: web,
          model: "local-research",
        }),
        signal: aborter.signal,
      });
      if (!response.ok) {
        let body;
        try {
          body = await response.json();
        } catch {}
        throw new Error(
          body?.error || `Research request failed (${response.status}).`,
        );
      }
      if (!response.body)
        throw new Error("A response stream was not available.");
      const reader = response.body.getReader(),
        decoder = new TextDecoder();
      let buffer = "";
      const event = (e) => {
        if (!isCurrent()) return;
        if (e.type === "token") answer.content += e.text;
        if (e.type === "stock" && !answer.stocks.includes(e.symbol))
          answer.stocks.push(e.symbol);
        if (e.type === "sources") answer.sources = e.sources;
        if (e.type === "error") throw new Error(e.message);
        if (e.type === "done") {
          answer.status = "complete";
          answer.model = e.model;
        }
        persist({
          ...chatRef.current,
          messages: chatRef.current.messages.map((m) =>
            m.id === answer.id ? { ...answer } : m,
          ),
          updatedAt: new Date().toISOString(),
        });
      };
      while (true) {
        const { value: chunk, done } = await reader.read();
        buffer += decoder.decode(chunk || new Uint8Array(), { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (line.trim()) event(JSON.parse(line));
        }
        if (done) {
          if (buffer.trim()) event(JSON.parse(buffer));
          break;
        }
      }
      if (answer.status === "streaming") {
        answer.status = "interrupted";
        if (isCurrent())
          setError(
            "The response ended before completion. Your question and partial response are saved.",
          );
      }
    } catch (e) {
      answer.status = e.name === "AbortError" ? "interrupted" : "failed";
      if (!answer.content)
        answer.content =
          e.name === "AbortError"
            ? "Response stopped. Your question is saved."
            : "The research request could not be completed. Your question is saved; you can try again.";
      if (isCurrent()) {
        if (requestAttachments.length) setAttachments(requestAttachments);
        if (e.name !== "AbortError") setError(e.message);
      }
    } finally {
      if (isCurrent()) {
        persist({
          ...chatRef.current,
          messages: chatRef.current.messages.map((m) =>
            m.id === answer.id ? { ...answer } : m,
          ),
        });
        setBusy(false);
        controller.current = null;
        textareaRef.current?.focus();
      }
    }
  }
  async function copy(message) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopyStatus(message.id);
      setTimeout(() => setCopyStatus(""), 1500);
    } catch {
      setError(
        "Clipboard access is unavailable. Select the response text to copy it.",
      );
    }
  }
  const active = !!chat?.messages.length;
  return (
    <div className={"chat-workspace " + (active ? "has-conversation" : "")}>
      <div className="chat-page-toolbar">
        <span>
          <Sparkle size={15} />
          Luna research assistant
        </span>
        <div>
          <span className="small-badge">Local research</span>
          {active && (
            <Link
              className="icon-button"
              href="/dashboard/chat"
              aria-label="Start new chat"
              onClick={() => window.dispatchEvent(new Event("luna-new-chat"))}
            >
              <Plus size={18} />
            </Link>
          )}
        </div>
      </div>
      {active ? (
        <div className="conversation-column">
          {chat.messages.map((message) => (
            <article
              key={message.id}
              className={"chat-message " + message.role}
            >
              <div className="message-avatar">
                {message.role === "assistant" ? (
                  <img src="/brand/luna-mark-dark.png" alt="Luna" />
                ) : (
                  <span>You</span>
                )}
              </div>
              <div className="message-body">
                <div className="message-label">
                  {message.role === "assistant" ? "Luna" : "You"}
                  {message.role === "assistant" && <span>Local research</span>}
                </div>
                <TextContent text={message.content} />
                {message.attachments?.length > 0 && (
                  <div className="message-attachments">
                    {message.attachments.map((n) => (
                      <span key={n}>
                        <FileText size={14} />
                        {n}
                      </span>
                    ))}
                  </div>
                )}
                {message.stocks?.map((symbol) => (
                  <QuoteCard key={symbol} symbol={symbol} />
                ))}
                {message.sources?.length > 0 && (
                  <div className="chat-sources">
                    <span className="control-label">
                      SOURCES & FURTHER READING
                    </span>
                    {message.sources.map((source, i) => (
                      <a
                        key={source.url || i}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>{i + 1}</span>
                        {source.title}
                        <ArrowUpRight size={13} />
                      </a>
                    ))}
                  </div>
                )}
                {message.role === "assistant" && message.content && (
                  <div className="message-actions">
                    <button
                      className="icon-button"
                      aria-label="Copy response"
                      onClick={() => copy(message)}
                    >
                      {copyStatus === message.id ? (
                        <Check size={15} />
                      ) : (
                        <Copy size={15} />
                      )}
                    </button>
                    {["failed", "interrupted"].includes(message.status) && (
                      <button
                        className="text-button"
                        disabled={busy}
                        onClick={() => {
                          const index = chat.messages.findIndex(
                            (m) => m.id === message.id,
                          );
                          const original = chat.messages[index - 1];
                          if (
                            original?.attachments?.length &&
                            !attachments.length
                          ) {
                            setError(
                              "Reattach your documents before retrying this research request.",
                            );
                            return;
                          }
                          send(original?.content || "Try again");
                        }}
                      >
                        <ArrowClockwise size={14} />
                        Try again
                      </button>
                    )}
                    <small>
                      {message.status === "interrupted"
                        ? "Stopped"
                        : message.status === "failed"
                          ? "Response unavailable"
                          : message.status === "streaming"
                            ? "Researching…"
                            : "Browser-local conversation"}
                    </small>
                  </div>
                )}
                {busy &&
                  message.id === chat.messages.at(-1)?.id &&
                  !message.content && (
                    <span className="thinking-dots" aria-label="Researching">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
              </div>
            </article>
          ))}
          <div ref={endRef} />
        </div>
      ) : (
        <div className="chat-empty">
          <div className="chat-greeting">
            <div className="chat-greeting-mark">
              <img src="/brand/luna-mark-dark.png" alt="" />
            </div>
            <h1>
              {
                [
                  "See the market in a new light.",
                  "Markets move, Luna illuminates",
                  "Your next insight starts here.",
                ][Math.floor(suggestionIndex / 3) % 3]
              }
            </h1>
            <p>A little curiosity. A clearer perspective.</p>
          </div>
        </div>
      )}
      <div className={"composer-area " + (!active ? "empty-composer" : "")}>
        <form
          className="chat-composer"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          {attachments.length > 0 && (
            <div className="attachment-chips">
              {attachments.map((a, i) => (
                <span key={i}>
                  <FileText size={15} />
                  {a.name}
                  <button
                    type="button"
                    aria-label={"Remove " + a.name}
                    onClick={() =>
                      setAttachments((v) => v.filter((_, j) => i !== j))
                    }
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            maxLength={8000}
            rows={2}
            aria-label="Message Luna"
            placeholder={
              active ? "Send a Message" : "How can I help you today?"
            }
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                send();
              }
            }}
          />
          <div className="composer-controls">
            <div>
              <input
                type="file"
                ref={fileRef}
                accept=".txt,.md"
                multiple
                hidden
                onChange={addFiles}
              />
              <button
                type="button"
                className="icon-button attachment-button"
                aria-label="Attach documents"
                title="TXT / Markdown · 4 MB · up to 8 files"
                onClick={() => fileRef.current.click()}
              >
                <Paperclip size={20} />
              </button>
              <button
                type="button"
                className={"composer-option " + (web ? "selected" : "")}
                aria-pressed={web}
                onClick={() => setWeb(!web)}
              >
                <Globe size={16} />
                <span>Web search</span>
              </button>
            </div>
            <div className="composer-model-area">
              <button
                type="button"
                className="composer-model"
                aria-expanded={modelMenu}
                onClick={() => setModelMenu(!modelMenu)}
              >
                Local research
                <CaretDown size={12} />
              </button>
              {modelMenu && (
                <div className="model-menu">
                  <b>Research model</b>
                  <button type="button" onClick={() => setModelMenu(false)}>
                    <span>
                      Local research
                      <small>Deterministic tools · Available</small>
                    </span>
                    <Check size={16} />
                  </button>
                  <div>
                    <span>
                      Hosted models
                      <small>Claude / Nova require configuration.</small>
                    </span>
                  </div>
                </div>
              )}
              {busy ? (
                <button
                  type="button"
                  className="send-button"
                  aria-label="Stop response"
                  onClick={() => controller.current?.abort()}
                >
                  <Stop size={16} weight="fill" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="send-button"
                  disabled={!input.trim()}
                  aria-label="Send message"
                >
                  <ArrowUp size={20} weight="bold" />
                </button>
              )}
            </div>
          </div>
        </form>
        {web && (
          <div className="composer-notice">
            Web search is not configured. Local research remains available.
          </div>
        )}
        {error && (
          <div className="inline-error" role="alert">
            {error}
            <button
              className="icon-button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              <X size={14} />
            </button>
          </div>
        )}
        {storageError && (
          <div className="inline-error" role="alert">
            Browser storage is unavailable. This conversation will not survive a
            reload.
          </div>
        )}
        {!active && (
          <div
            className="suggestion-grid"
            onMouseEnter={() => setInteracting(true)}
            onMouseLeave={() => setInteracting(false)}
            onFocus={() => setInteracting(true)}
            onBlur={() => setInteracting(false)}
          >
            {[0, 1, 2].map((offset) => {
              const s =
                  suggestions[(suggestionIndex + offset) % suggestions.length],
                Icon = icons[offset];
              return (
                <div className="suggestion-card" key={s[1]}>
                  <button
                    className="suggestion-main"
                    onClick={() => send(s[1])}
                  >
                    <span className="suggestion-category">
                      <Icon size={15} />
                      {s[0]}
                    </span>
                    <span className="suggestion-title">{s[3]}</span>
                  </button>
                  <Link
                    className="suggestion-tool"
                    href={s[2]}
                    aria-label={"Open related tool for " + s[0]}
                  >
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        <div className="composer-disclaimer">
          {active
            ? "Luna can make mistakes. Review sources and report assumptions."
            : "Built for curiosity. Grounded in context."}
          <span>
            {active
              ? "Local research · Demo market data"
              : "Market data in this preview is illustrative."}
          </span>
        </div>
      </div>
      {!active && (
        <div className="chat-market-context">
          <div className="chat-market-heading">
            <span>
              <ChartLineUp size={15} />A glance at the market
            </span>
            <Link href="/dashboard">
              Open dashboard
              <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="chat-market-items">
            {STOCKS.filter((s) =>
              ["SPY", "QQQ", "NVDA", "AAPL"].includes(s.symbol),
            ).map((s) => (
              <Link href={"/stock/" + s.symbol} key={s.symbol}>
                <span>
                  <b>{s.symbol}</b>
                  <small>{s.name}</small>
                </span>
                <span>
                  <b>${s.price.toFixed(2)}</b>
                  <small className={s.change >= 0 ? "positive" : "negative"}>
                    {s.change >= 0 ? "+" : ""}
                    {s.change.toFixed(2)}%
                  </small>
                </span>
              </Link>
            ))}
          </div>
          <small className="chat-snapshot-label">
            Illustrative snapshot · 06 Oct 2026
          </small>
        </div>
      )}
    </div>
  );
}
