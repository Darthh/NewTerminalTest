"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  Plus,
  MagnifyingGlass,
  ChartLineUp,
  Briefcase,
  CaretDown,
  CaretRight,
  SidebarSimple,
  GlobeHemisphereWest,
  List,
  X,
  GearSix,
  Bell,
  BookmarkSimple,
  CalendarBlank,
  Lightning,
  Users,
  ArrowSquareOut,
  ClockCounterClockwise,
  Trash,
  PencilSimple,
  Check,
  Sun,
  SquaresFour,
  ChatsCircle,
  FileText,
} from "@phosphor-icons/react";
import { GROUPS } from "../lib/navigation.mjs";
import {
  STOCKS,
  DEFAULT_WATCHLIST,
  WATCHLIST_KEY,
  normalizeWatchlist,
} from "../lib/market.mjs";
import { readChats, writeChats } from "../lib/chat-storage.mjs";

const themeNames = [
  "Luna",
  "Sepia",
  "Lavender",
  "Padres",
  "Dark",
  "Midnight",
  "Ocean",
  "Bloomberg",
  "Ume",
  "Halloween",
];
const defaults = {
  theme: "Luna",
  background: "none",
  font: "InterWoff",
  density: "Compact",
  weight: "Normal",
  sidebar: "Small",
};
const groupIcons = [
  Briefcase,
  ChartLineUp,
  MagnifyingGlass,
  GlobeHemisphereWest,
];
const utilities = [
  { label: "Profile", icon: Users },
  { label: "Upcoming events", icon: CalendarBlank },
  { label: "Most popular stocks", icon: ChartLineUp },
  { label: "My watchlist", icon: BookmarkSimple },
  { label: "Market movers", icon: Lightning },
  { label: "Notifications", icon: Bell },
];
export default function TerminalShell({ children }) {
  const pathname = usePathname(),
    router = useRouter();
  const [collapsed, setCollapsed] = useState(false),
    [mobile, setMobile] = useState(false),
    [expanded, setExpanded] = useState([
      "Advisor Tools",
      "Graphs",
      "Research tools",
    ]);
  const [appearance, setAppearance] = useState(false),
    [prefs, setPrefs] = useState(defaults),
    [flyout, setFlyout] = useState(null),
    [history, setHistory] = useState(false),
    [chats, setChats] = useState([]),
    [historyQuery, setHistoryQuery] = useState("");
  const [query, setQuery] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [cursor, setCursor] = useState(0),
    [command, setCommand] = useState(false);
  const [watchlist, setWatchlist] = useState([]),
    [watchlistError, setWatchlistError] = useState(false);
  const inputRef = useRef(null),
    overlayRef = useRef(null),
    returnFocus = useRef(null);
  useEffect(() => {
    try {
      setPrefs({
        ...defaults,
        ...JSON.parse(localStorage.getItem("luna.appearance") || "{}"),
      });
      setCollapsed(localStorage.getItem("luna.sidebar.collapsed") === "true");
      const groups = JSON.parse(
        localStorage.getItem("luna.sidebar.groups") || "null",
      );
      if (Array.isArray(groups))
        setExpanded(
          groups.filter((label) =>
            GROUPS.some((group) => group.label === label),
          ),
        );
    } catch {}
    setChats(readChats());
    const update = () => setChats(readChats());
    window.addEventListener("luna-chats", update);
    return () => window.removeEventListener("luna-chats", update);
  }, []);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setAppearance(false);
        setFlyout(null);
        setHistory(false);
        setCommand(false);
        setMobile(false);
        setSearchOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommand(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    setMobile(false);
    setSearchOpen(false);
    setCommand(false);
    if (new URLSearchParams(window.location.search).get("history") === "1")
      setHistory(true);
  }, [pathname]);
  useEffect(() => {
    const closeSearch = (event) => {
      if (!event.target.closest?.(".ticker-search")) setSearchOpen(false);
    };
    document.addEventListener("pointerdown", closeSearch);
    return () => document.removeEventListener("pointerdown", closeSearch);
  }, []);
  useEffect(() => {
    if (flyout !== "My watchlist") return;
    const refresh = () => {
      try {
        const value = localStorage.getItem(WATCHLIST_KEY);
        setWatchlist(
          normalizeWatchlist(
            value === null ? DEFAULT_WATCHLIST : JSON.parse(value),
          ),
        );
        setWatchlistError(false);
      } catch {
        setWatchlist([]);
        setWatchlistError(true);
      }
    };
    refresh();
    window.addEventListener("luna-storage-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("luna-storage-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [flyout]);
  const hasOverlay = appearance || history || command || flyout !== null;
  useEffect(() => {
    if (!hasOverlay) return;
    returnFocus.current = document.activeElement;
    const first = overlayRef.current?.querySelector("input,button,select,a");
    first?.focus();
    const trap = (e) => {
      if (e.key !== "Tab") return;
      const items = overlayRef.current?.querySelectorAll(
        "button,input,select,textarea,a[href]",
      );
      if (!items?.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      returnFocus.current?.focus();
    };
  }, [hasOverlay]);
  const results = STOCKS.filter((s) =>
    `${s.symbol} ${s.name}`.toLowerCase().includes(query.toLowerCase()),
  ).slice(0, 7);
  const utilityStocks =
    flyout === "My watchlist"
      ? watchlist
          .map((item) => STOCKS.find((stock) => stock.symbol === item.symbol))
          .filter(Boolean)
      : [...STOCKS]
          .sort((a, b) =>
            flyout === "Market movers"
              ? Math.abs(b.change) - Math.abs(a.change)
              : b.marketCap - a.marketCap,
          )
          .slice(0, 6);
  function changePreference(key, value) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    Object.entries(next).forEach(
      ([key, value]) => (document.documentElement.dataset[key] = value),
    );
    try {
      localStorage.setItem("luna.appearance", JSON.stringify(next));
    } catch {}
  }
  function toggleGroup(label) {
    const next = expanded.includes(label)
      ? expanded.filter((s) => s !== label)
      : [...expanded, label];
    setExpanded(next);
    try {
      localStorage.setItem("luna.sidebar.groups", JSON.stringify(next));
    } catch {}
  }
  function toggleSidebar() {
    setCollapsed(!collapsed);
    try {
      localStorage.setItem("luna.sidebar.collapsed", String(!collapsed));
    } catch {}
  }
  function selectStock(symbol) {
    router.push("/stock/" + symbol);
    setQuery("");
    setSearchOpen(false);
    setCommand(false);
  }
  function removeChat(id) {
    writeChats(chats.filter((c) => c.id !== id));
    if (pathname.endsWith("/" + id)) router.push("/dashboard/chat");
  }
  function renameChat(chat) {
    const name = window.prompt("Conversation name", chat.title);
    if (name?.trim())
      writeChats(
        chats.map((c) =>
          c.id === chat.id ? { ...c, title: name.trim().slice(0, 100) } : c,
        ),
      );
  }
  const currentLabel =
    pathname === "/about"
      ? "Welcome"
      : pathname.startsWith("/dashboard/chat")
        ? "New Chat"
        : pathname === "/dashboard"
          ? "Market dashboard"
          : GROUPS.flatMap((g) => g.entries).find((e) => e.href === pathname)
              ?.label || "Research workspace";
  function searchBox(isCommand = false) {
    return (
      <div className={"ticker-search " + (isCommand ? "command-search" : "")}>
        <MagnifyingGlass size={17} />
        <input
          ref={isCommand ? undefined : inputRef}
          aria-label="Search stocks and companies"
          value={query}
          onFocus={() => setSearchOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
            setSearchOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setCursor(Math.min(cursor + 1, results.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setCursor(Math.max(cursor - 1, 0));
            }
            if (e.key === "Enter" && results[cursor]) {
              e.preventDefault();
              selectStock(results[cursor].symbol);
            }
          }}
          placeholder="Search stocks, companies, and more"
          autoComplete="off"
        />
        <kbd>⌘ K</kbd>
        {(searchOpen || isCommand) && query && (
          <div
            className="search-results"
            role="listbox"
            aria-label="Matching securities"
          >
            {results.length ? (
              results.map((s, i) => (
                <button
                  key={s.symbol}
                  role="option"
                  aria-selected={i === cursor}
                  className={i === cursor ? "selected" : ""}
                  onClick={() => selectStock(s.symbol)}
                >
                  <span className="symbol-badge">{s.symbol[0]}</span>
                  <span>
                    <b>{s.symbol}</b>
                    <small>{s.name}</small>
                  </span>
                  <span className="search-price">${s.price.toFixed(2)}</span>
                  <ArrowSquareOut size={14} />
                </button>
              ))
            ) : (
              <div className="no-results">No matching demo securities.</div>
            )}
            <div className="search-caption">
              Illustrative securities · Enter to open
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div
      className={
        "terminal " +
        (collapsed ? "nav-collapsed" : "") +
        (mobile ? " mobile-nav-open" : "")
      }
    >
      <a className="skip-link" href="#main-content">
        Skip to workspace
      </a>
      <header className="topbar">
        <button
          className="mobile-menu icon-button"
          aria-label="Open navigation"
          onClick={() => setMobile(!mobile)}
        >
          <List size={23} />
        </button>
        <Link href="/about" className="brand" aria-label="Luna Terminal home">
          <img src="/brand/luna-mark-light.png" alt="" />
          <span>
            Luna<span className="brand-terminal"> Terminal</span>
          </span>
        </Link>
        {searchBox()}
        <div className="topbar-right">
          <Link href="/about" className="header-about">
            About
          </Link>
          <button
            className="icon-button"
            aria-label="Appearance settings"
            onClick={() => setAppearance(!appearance)}
          >
            <Sun size={19} />
          </button>
          <span className="header-divider" />
          <button
            className="workspace-account"
            onClick={() => setFlyout("Profile")}
          >
            <span className="account-name">Local workspace</span>
            <span className="avatar">L</span>
            <CaretDown size={12} />
          </button>
        </div>
      </header>
      {mobile && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className="left-nav" aria-label="Main navigation">
        <div className="nav-workspace">
          <span>
            <span className="workspace-dot" />
            My workspace
          </span>
          <button
            className="icon-button"
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            onClick={toggleSidebar}
          >
            <SidebarSimple size={18} />
          </button>
        </div>
        <div className="primary-nav">
          <Link
            className={
              "nav-item " + (pathname === "/dashboard" ? "active" : "")
            }
            href="/dashboard"
          >
            <House size={18} />
            <span>Market dashboard</span>
          </Link>
          <Link
            className={
              "nav-item new-chat-link " +
              (pathname.startsWith("/dashboard/chat") ? "active" : "")
            }
            href="/dashboard/chat"
            onClick={() => window.dispatchEvent(new Event("luna-new-chat"))}
          >
            <Plus size={18} />
            <span>New Chat</span>
            <kbd>↵</kbd>
          </Link>
        </div>
        <div className="nav-scroll">
          {GROUPS.filter((g) => g.label !== "Personal workspace").map(
            (group, index) => {
              const Icon = groupIcons[index] || SquaresFour;
              return (
                <div className="nav-group" key={group.label}>
                  <button
                    className="nav-group-heading"
                    onClick={() => {
                      if (collapsed) toggleSidebar();
                      toggleGroup(group.label);
                    }}
                    aria-expanded={expanded.includes(group.label)}
                  >
                    <Icon size={16} />
                    <span>{group.label}</span>
                    <CaretDown
                      size={12}
                      className={
                        expanded.includes(group.label) ? "" : "rotated"
                      }
                    />
                  </button>
                  {expanded.includes(group.label) && (
                    <div className="nav-group-entries">
                      {group.entries.map((item) => (
                        <Link
                          key={item.label + item.href}
                          href={item.href}
                          className={
                            "nav-subitem " +
                            (pathname === item.href ? "active" : "")
                          }
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            },
          )}
          <div className="nav-group personal-group">
            <span className="nav-section-label">YOUR WORKSPACE</span>
            <Link
              className={
                "nav-item " + (pathname === "/watchlist" ? "active" : "")
              }
              href="/watchlist"
            >
              <BookmarkSimple size={17} />
              <span>My watchlist</span>
            </Link>
            <Link
              className={"nav-item " + (pathname === "/alerts" ? "active" : "")}
              href="/alerts"
            >
              <Bell size={17} />
              <span>Alerts</span>
            </Link>
          </div>
          <div className="recent-chats">
            <button
              className="nav-section-label history-label"
              onClick={() => setHistory(true)}
            >
              <span>RECENT CONVERSATIONS</span>
              <MagnifyingGlass size={12} />
            </button>
            {chats.slice(0, 5).map((chat) => (
              <Link
                key={chat.id}
                href={"/dashboard/chat/" + chat.id}
                className="recent-chat"
              >
                <ChatsCircle size={14} />
                <span>{chat.title}</span>
              </Link>
            ))}
            {!chats.length && (
              <small className="history-empty">
                Your research starts here.
              </small>
            )}
            <button
              className="nav-item history-button"
              onClick={() => setHistory(true)}
            >
              <ClockCounterClockwise size={17} />
              <span>View all history</span>
            </button>
          </div>
        </div>
        <div className="nav-bottom">
          <div className="local-status">
            <span className="workspace-dot" />
            <span>Local demo workspace</span>
            <span className="version">v1.0</span>
          </div>
          <button className="nav-item" onClick={() => setAppearance(true)}>
            <GearSix size={17} />
            <span>Settings & appearance</span>
          </button>
        </div>
      </aside>
      <div className="main-frame">
        <div className="workspace-breadcrumb">
          <div>
            <span>Workspace</span>
            <CaretRight size={11} />
            <b>{currentLabel}</b>
          </div>
          <div className="demo-status">
            <span className="demo-dot" />
            Demo environment
            <span className="breadcrumb-divider" />{" "}
            <span className="desktop-only">All times in ET</span>
          </div>
        </div>
        <main id="main-content">{children}</main>
      </div>
      <aside className="utility-rail" aria-label="Workspace utilities">
        {utilities.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={"icon-button " + (flyout === label ? "active" : "")}
            aria-label={label}
            title={label}
            onClick={() => setFlyout(flyout === label ? null : label)}
          >
            <Icon size={19} />
            {label === "Notifications" && <span className="notification-dot" />}
          </button>
        ))}
        <div className="utility-spacer" />
        <button
          className="icon-button"
          title="Appearance"
          aria-label="Appearance"
          onClick={() => setAppearance(true)}
        >
          <GearSix size={19} />
        </button>
      </aside>
      {hasOverlay && (
        <div
          className="overlay-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setAppearance(false);
              setFlyout(null);
              setHistory(false);
              setCommand(false);
            }
          }}
        >
          {appearance ? (
            <section
              ref={overlayRef}
              className="appearance-panel overlay-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="appearance-title"
            >
              <div className="overlay-heading">
                <div>
                  <span className="eyebrow">MAKE IT YOURS</span>
                  <h2 id="appearance-title">Appearance</h2>
                </div>
                <button
                  className="icon-button"
                  aria-label="Close appearance"
                  onClick={() => setAppearance(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <p className="muted">A workspace that feels like you.</p>
              <label className="control-label">Theme</label>
              <div className="theme-grid">
                {themeNames.map((name) => (
                  <button
                    className={
                      "theme-option " + (prefs.theme === name ? "selected" : "")
                    }
                    key={name}
                    onClick={() => changePreference("theme", name)}
                  >
                    <span
                      className={"theme-swatch theme-" + name.toLowerCase()}
                    />
                    <span>{name}</span>
                    {prefs.theme === name && <Check size={13} />}
                  </button>
                ))}
              </div>
              {[
                [
                  "Background",
                  "background",
                  [
                    "none",
                    "dots",
                    "constellations",
                    "rain",
                    "synapse",
                    "flow field",
                    "petals",
                    "sparkles",
                    "embers",
                    "haunted night",
                  ],
                ],
                ["Font", "font", ["InterWoff", "Sans", "Mono", "Serif"]],
                ["Density", "density", ["Compact", "Comfortable", "Spacious"]],
                ["Weight", "weight", ["Normal", "Bold"]],
                ["Sidebar size", "sidebar", ["Small", "Medium", "Large"]],
              ].map(([label, key, options]) => (
                <label className="preference-row" key={key}>
                  <span>{label}</span>
                  <select
                    value={prefs[key]}
                    onChange={(e) => changePreference(key, e.target.value)}
                  >
                    {options.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
              ))}
              <div className="appearance-foot">
                Preferences are saved in this browser.
              </div>
            </section>
          ) : history ? (
            <section
              ref={overlayRef}
              className="history-panel overlay-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="history-title"
            >
              <div className="overlay-heading">
                <h2 id="history-title">Research history</h2>
                <button
                  className="icon-button"
                  aria-label="Close history"
                  onClick={() => setHistory(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="field-with-icon">
                <MagnifyingGlass size={18} />
                <input
                  value={historyQuery}
                  onChange={(e) => setHistoryQuery(e.target.value)}
                  placeholder="Search conversations"
                  aria-label="Search conversations"
                />
              </div>
              <div className="history-list">
                {chats
                  .filter((c) =>
                    (c.title + " " + c.messages.map((m) => m.content).join(" "))
                      .toLowerCase()
                      .includes(historyQuery.toLowerCase()),
                  )
                  .map((chat) => (
                    <div className="history-row" key={chat.id}>
                      <ChatsCircle size={18} />
                      <Link
                        href={"/dashboard/chat/" + chat.id}
                        onClick={() => setHistory(false)}
                      >
                        <b>{chat.title}</b>
                        <small>
                          {new Date(chat.updatedAt).toLocaleDateString()} ·{" "}
                          {chat.messages.length} messages
                        </small>
                      </Link>
                      <button
                        className="icon-button"
                        aria-label={"Rename " + chat.title}
                        onClick={() => renameChat(chat)}
                      >
                        <PencilSimple size={17} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={"Delete " + chat.title}
                        onClick={() => removeChat(chat.id)}
                      >
                        <Trash size={17} />
                      </button>
                    </div>
                  ))}
                {!chats.length && (
                  <div className="empty-state">
                    <ChatsCircle size={32} />
                    <h3>A fresh start.</h3>
                    <p>Your conversations will appear here.</p>
                  </div>
                )}
              </div>
              <small className="muted">
                Saved in this browser. Account synchronization requires
                configuration.
              </small>
            </section>
          ) : command ? (
            <section
              ref={overlayRef}
              className="command-panel overlay-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Search terminal"
            >
              <div className="overlay-heading">
                <h2>Find your next insight</h2>
                <button
                  className="icon-button"
                  aria-label="Close search"
                  onClick={() => setCommand(false)}
                >
                  <X size={20} />
                </button>
              </div>
              {searchBox(true)}
              <div className="command-links">
                {GROUPS.flatMap((g) => g.entries)
                  .filter((e) =>
                    e.label.toLowerCase().includes(query.toLowerCase()),
                  )
                  .slice(0, 8)
                  .map((e) => (
                    <Link key={e.label + e.href} href={e.href}>
                      <MagnifyingGlass size={16} />
                      {e.label}
                      <ArrowSquareOut size={14} />
                    </Link>
                  ))}
              </div>
            </section>
          ) : (
            <section
              ref={overlayRef}
              className="utility-flyout overlay-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="utility-title"
            >
              <div className="overlay-heading">
                <h2 id="utility-title">{flyout}</h2>
                <button
                  className="icon-button"
                  aria-label="Close panel"
                  onClick={() => setFlyout(null)}
                >
                  <X size={20} />
                </button>
              </div>
              {flyout === "Profile" ? (
                <>
                  <div className="profile-intro">
                    <span className="avatar large">L</span>
                    <div>
                      <h3>Local workspace</h3>
                      <p className="muted">
                        Your personal research, in this browser.
                      </p>
                    </div>
                  </div>
                  <div className="subtle-box">
                    <b>Explore freely.</b>
                    <p>
                      This preview saves conversations and advisor drafts
                      locally. Cloud accounts and synchronization are not
                      connected.
                    </p>
                  </div>
                  <button
                    className="button secondary full-width"
                    onClick={() => {
                      setFlyout(null);
                      setAppearance(true);
                    }}
                  >
                    <GearSix size={17} />
                    Personalize workspace
                  </button>
                </>
              ) : flyout === "Notifications" ? (
                <div className="empty-state">
                  <Bell size={34} />
                  <h3>You&apos;re all caught up.</h3>
                  <p>Scheduled alerts and delivery require configuration.</p>
                  <Link
                    className="button primary"
                    href="/alerts"
                    onClick={() => setFlyout(null)}
                  >
                    Create an alert
                  </Link>
                </div>
              ) : flyout === "Upcoming events" ? (
                <>
                  <span className="small-badge">Illustrative calendar</span>
                  {[
                    "Consumer Price Index",
                    "FOMC meeting",
                    "Q3 earnings season",
                  ].map((e, i) => (
                    <div className="utility-event" key={e}>
                      <span className="date-tile">
                        <small>OCT</small>
                        <b>{14 + i * 7}</b>
                      </span>
                      <div>
                        <b>{e}</b>
                        <small>8:30 AM ET · Demo</small>
                      </div>
                    </div>
                  ))}
                  <Link
                    href="/earnings-calendar"
                    className="text-link"
                    onClick={() => setFlyout(null)}
                  >
                    Open calendar <CaretRight />
                  </Link>
                </>
              ) : (
                <>
                  <span className="small-badge">
                    {flyout === "My watchlist"
                      ? "Your browser watchlist · Demo quotes"
                      : "Demo market snapshot"}
                  </span>
                  {flyout === "Most popular stocks" && (
                    <p className="muted">
                      Popularity data is unavailable. Sorted by illustrative
                      market cap.
                    </p>
                  )}
                  {flyout === "Market movers" && (
                    <p className="muted">
                      Largest absolute daily percentage moves in the sample.
                    </p>
                  )}
                  {flyout === "My watchlist" && !utilityStocks.length && (
                    <p className="muted">
                      {watchlistError
                        ? "Browser watchlist storage is unavailable."
                        : "Your watchlist is empty. Add a company in the watchlist workspace."}
                    </p>
                  )}
                  {utilityStocks.map((s) => (
                    <Link
                      key={s.symbol}
                      href={"/stock/" + s.symbol}
                      className="utility-stock"
                      onClick={() => setFlyout(null)}
                    >
                      <span className="symbol-badge">{s.symbol[0]}</span>
                      <span>
                        <b>{s.symbol}</b>
                        <small>{s.name}</small>
                      </span>
                      <span>
                        <b>${s.price.toFixed(2)}</b>
                        <small
                          className={s.change >= 0 ? "positive" : "negative"}
                        >
                          {s.change >= 0 ? "+" : ""}
                          {s.change.toFixed(2)}%
                        </small>
                      </span>
                    </Link>
                  ))}
                  <Link
                    href={
                      flyout === "My watchlist"
                        ? "/watchlist"
                        : flyout === "Most popular stocks"
                          ? "/market-cap"
                          : "/market-movers"
                    }
                    className="text-link"
                    onClick={() => setFlyout(null)}
                  >
                    Open workspace <CaretRight />
                  </Link>
                </>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
