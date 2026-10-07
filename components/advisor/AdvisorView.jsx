"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowRight,
  ArrowSquareOut,
  Briefcase,
  CalendarBlank,
  CaretRight,
  ChartPieSlice,
  Check,
  CopySimple,
  DownloadSimple,
  Eye,
  EyeSlash,
  FileText,
  FloppyDisk,
  MagnifyingGlass,
  NotePencil,
  PencilSimple,
  Plus,
  Trash,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import {
  ADVISOR_STORAGE_KEY,
  DEMO_FILING_HOLDINGS,
  DEMO_MANAGERS,
  DEMO_NOTIONAL,
  REPORT_DISCLOSURE,
  REPORT_TEMPLATES,
  REPORT_TYPES,
  RISKS,
  STAGES,
  buildReportPdf,
  clientsCsv,
  createDemoWorkspace,
  createReport,
  layoutReport,
  newId,
  parseHoldings,
  portfolioAllocation,
  portfolioCsv,
  readWorkspace,
  reportCsv,
  reportRows,
  saveWorkspaceRecord,
  toCsv,
  validateClient,
  validatePortfolio,
} from "../../lib/advisor.mjs";
import "./advisor.css";

const usd = (value) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
const niceDate = (value) =>
  value
    ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not scheduled";
const colors = [
  "#2769ae",
  "#7e9fd0",
  "#52a599",
  "#bfaa75",
  "#9386b4",
  "#75909a",
  "#c38990",
];
function download(content, name, type = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function filename(value) {
  return value.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 80);
}

function useAdvisorWorkspace() {
  const [workspace, setWorkspace] = useState(createDemoWorkspace);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const load = () => {
      try {
        setWorkspace(readWorkspace(window.localStorage));
        setError("");
      } catch (e) {
        setError(e.message);
      }
      setReady(true);
    };
    load();
    const changed = (event) => {
      if (event.key === ADVISOR_STORAGE_KEY) {
        load();
        setNotice("The local workspace was updated in another tab.");
      }
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, []);
  function commit(collection, record) {
    try {
      if (!ready)
        throw new Error(
          "The local workspace is still loading. Try again in a moment.",
        );
      const validated =
        collection === "clients"
          ? validateClient(record)
          : collection === "portfolios"
            ? validatePortfolio(record)
            : record;
      const result = saveWorkspaceRecord(
        window.localStorage,
        collection,
        validated,
        record.revision ?? 0,
        workspace,
      );
      commit.error = "";
      setWorkspace(result.workspace);
      setNotice(
        `${collection === "templates" ? "Template" : collection === "reports" ? "Report" : collection === "clients" ? "Client" : "Portfolio"} saved in this browser.`,
      );
      setError("");
      return result.record;
    } catch (e) {
      commit.error =
        e.message ||
        "Browser storage is unavailable. The record was not saved.";
      setError(commit.error);
      return null;
    }
  }
  return { workspace, commit, notice, setNotice, error, ready };
}

function IconButton({ label, children, ...props }) {
  return (
    <button
      type="button"
      className="advisor-icon-button"
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}
function Search({ value, onChange, placeholder = "Search..." }) {
  return (
    <label className="advisor-search">
      <MagnifyingGlass size={16} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </label>
  );
}
function Badge({ children, kind = "" }) {
  return (
    <span
      className={`advisor-badge ${kind ? `advisor-badge-${kind.toLowerCase()}` : ""}`}
    >
      {children}
    </span>
  );
}
function Empty({ icon: Icon = FileText, title, children, action }) {
  return (
    <div className="advisor-empty">
      <Icon size={32} weight="light" />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
function PageHeader({
  eyebrow = "Advisor workspace",
  title,
  description,
  actions,
}) {
  return (
    <div className="advisor-page-header">
      <div>
        <div className="advisor-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="advisor-header-actions">{actions}</div>
    </div>
  );
}
function LocalNotice() {
  return (
    <div className="advisor-local-note">
      <span className="advisor-status-dot" />
      Local demo{" "}
      <span>
        Fictional starter records · Changes are saved only in this browser
      </span>
    </div>
  );
}
function Dialog({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
  drawer = false,
}) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.querySelector("input, select, textarea, button")?.focus();
    const keydown = (event) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key === "Tab") {
        const items = Array.from(
          dialog.querySelectorAll(
            'button, input, select, textarea, a[href], [tabindex="0"]',
          ),
        ).filter((item) => !item.disabled && item.offsetParent !== null);
        if (!items.length) {
          event.preventDefault();
          return;
        }
        if (event.shiftKey && document.activeElement === items[0]) {
          event.preventDefault();
          items.at(-1).focus();
        } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
          event.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <div
      className={`advisor-overlay ${drawer ? "advisor-overlay-drawer" : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        className={`advisor-dialog ${wide ? "advisor-dialog-wide" : ""} ${drawer ? "advisor-drawer" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="advisor-dialog-title"
      >
        <div className="advisor-dialog-header">
          <div>
            <h2 id="advisor-dialog-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <IconButton label="Close dialog" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

function ClientEditor({ client, portfolios, onSave, onClose }) {
  const [draft, setDraft] = useState(() =>
    structuredClone(
      client ?? {
        id: newId("client"),
        revision: 0,
        name: "",
        email: "",
        phone: "",
        advisor: "Jordan Ellis",
        stage: "Prospect",
        risk: "Moderate",
        nextReview: "",
        lastContact: "",
        notes: "",
        portfolioIds: [],
      },
    ),
  );
  const [error, setError] = useState("");
  const field = (key, value) => setDraft({ ...draft, [key]: value });
  function submit(e) {
    e.preventDefault();
    try {
      const item = validateClient(draft);
      if (onSave(item)) onClose();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <Dialog
      title={client ? "Client details" : "Add a client"}
      subtitle="Keep the people behind each portfolio in view."
      onClose={onClose}
      drawer
    >
      <form className="advisor-form" onSubmit={submit}>
        <div className="advisor-form-body">
          <div className="advisor-form-section-title">Personal details</div>
          <label>
            Client / household name
            <input
              required
              maxLength={120}
              value={draft.name}
              onChange={(e) => field("name", e.target.value)}
              placeholder="e.g. Alex Bennett"
            />
          </label>
          <div className="advisor-form-grid">
            <label>
              Email address
              <input
                type="email"
                value={draft.email}
                onChange={(e) => field("email", e.target.value)}
              />
            </label>
            <label>
              Phone
              <input
                type="tel"
                value={draft.phone}
                onChange={(e) => field("phone", e.target.value)}
              />
            </label>
          </div>
          <label>
            Assigned advisor
            <input
              value={draft.advisor}
              onChange={(e) => field("advisor", e.target.value)}
              maxLength={80}
            />
          </label>
          <div className="advisor-form-section-title">
            Relationship & planning
          </div>
          <div className="advisor-form-grid">
            <label>
              Stage
              <select
                value={draft.stage}
                onChange={(e) => field("stage", e.target.value)}
              >
                {STAGES.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </label>
            <label>
              Risk profile
              <select
                value={draft.risk}
                onChange={(e) => field("risk", e.target.value)}
              >
                {RISKS.map((risk) => (
                  <option key={risk}>{risk}</option>
                ))}
              </select>
            </label>
            <label>
              Next review
              <input
                type="date"
                value={draft.nextReview}
                onChange={(e) => field("nextReview", e.target.value)}
              />
            </label>
            <label>
              Last contact
              <input
                type="date"
                value={draft.lastContact}
                onChange={(e) => field("lastContact", e.target.value)}
              />
            </label>
          </div>
          <label>
            Notes
            <textarea
              aria-label="Notes"
              rows={5}
              value={draft.notes}
              onChange={(e) => field("notes", e.target.value)}
              maxLength={12000}
              placeholder="Objectives, conversations, and next steps..."
            />
          </label>
          <fieldset className="advisor-checkbox-list">
            <legend>Linked portfolios</legend>
            {portfolios
              .filter((p) => p.kind === "client")
              .map((p) => (
                <label key={p.id}>
                  <input
                    type="checkbox"
                    checked={draft.portfolioIds.includes(p.id)}
                    onChange={(e) =>
                      field(
                        "portfolioIds",
                        e.target.checked
                          ? [...draft.portfolioIds, p.id]
                          : draft.portfolioIds.filter((id) => id !== p.id),
                      )
                    }
                  />
                  {p.name}
                </label>
              ))}
          </fieldset>
          {error && (
            <p className="advisor-form-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="advisor-form-footer">
          <button type="button" className="advisor-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="advisor-button advisor-button-primary"
            type="submit"
          >
            <Check size={15} />
            Save client
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function FinanceCrm({ store }) {
  const { workspace, commit } = store;
  const [tab, setTab] = useState("Clients");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("All stages");
  const [risk, setRisk] = useState("All risks");
  const [sort, setSort] = useState("name");
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);
  const clients = workspace.clients
    .filter(
      (c) =>
        `${c.name} ${c.email} ${c.advisor}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (stage === "All stages" || c.stage === stage) &&
        (risk === "All risks" || c.risk === risk),
    )
    .toSorted((a, b) =>
      sort === "review"
        ? (a.nextReview || "9999").localeCompare(b.nextReview || "9999")
        : sort === "value"
          ? b.portfolioIds.length - a.portfolioIds.length
          : a.name.localeCompare(b.name),
    );
  const exportClients = () =>
    download(
      clientsCsv(
        selected.length
          ? workspace.clients.filter((c) => selected.includes(c.id))
          : clients,
      ),
      "luna-clients.csv",
    );
  return (
    <>
      <PageHeader
        title="Finance CRM"
        description="Your relationships, portfolios, and next conversations. All in one place."
        actions={
          <>
            <button className="advisor-button" onClick={exportClients}>
              <DownloadSimple size={15} />
              Export CSV
            </button>
            <button
              className="advisor-button advisor-button-primary"
              onClick={() => setEditing({})}
            >
              <Plus size={16} />
              Add client
            </button>
          </>
        }
      />
      <div className="advisor-stat-row">
        {[
          {
            label: "Total clients",
            value: workspace.clients.length,
            icon: UsersThree,
          },
          {
            label: "Active relationships",
            value: workspace.clients.filter((c) => c.stage === "Active").length,
            icon: Briefcase,
          },
          {
            label: "Upcoming reviews",
            value: workspace.clients.filter((c) => c.nextReview).length,
            icon: CalendarBlank,
          },
          {
            label: "Linked portfolios",
            value: workspace.clients.reduce(
              (sum, c) => sum + c.portfolioIds.length,
              0,
            ),
            icon: ChartPieSlice,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div className="advisor-stat" key={label}>
            <span>{label}</span>
            <strong>
              {value}
              <Icon size={22} weight="light" />
            </strong>
            <small>Fictional demo workspace</small>
          </div>
        ))}
      </div>
      <div className="advisor-panel">
        <div
          className="advisor-tabs"
          role="tablist"
          aria-label="Advisor workstation"
        >
          {["Clients", "Portfolios", "Strategies", "Reviews"].map((item) => (
            <button
              role="tab"
              aria-selected={tab === item}
              key={item}
              onClick={() => setTab(item)}
              className={tab === item ? "active" : ""}
            >
              {item}
              {item === "Clients" && <span>{workspace.clients.length}</span>}
            </button>
          ))}
        </div>
        {tab === "Clients" && (
          <>
            <div className="advisor-table-toolbar">
              <Search
                value={query}
                onChange={setQuery}
                placeholder="Search clients, email, or advisor"
              />
              <div className="advisor-toolbar-selects">
                <select
                  aria-label="Filter client stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                >
                  <option>All stages</option>
                  {STAGES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  aria-label="Filter client risk"
                  value={risk}
                  onChange={(e) => setRisk(e.target.value)}
                >
                  <option>All risks</option>
                  {RISKS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <select
                  aria-label="Sort clients"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="name">Name A–Z</option>
                  <option value="review">Next review</option>
                  <option value="value">Portfolio count</option>
                </select>
              </div>
            </div>
            <div className="advisor-stage-strip">
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStage(stage === s ? "All stages" : s)}
                  className={stage === s ? "selected" : ""}
                >
                  <span className={`advisor-stage-dot ${s.toLowerCase()}`} />
                  {s}
                  <b>{workspace.clients.filter((c) => c.stage === s).length}</b>
                </button>
              ))}
            </div>
            <div className="advisor-table-scroll">
              <table className="advisor-table advisor-client-table">
                <thead>
                  <tr>
                    <th className="advisor-checkbox-col">
                      <input
                        type="checkbox"
                        aria-label="Select all filtered clients"
                        checked={
                          clients.length > 0 &&
                          clients.every((c) => selected.includes(c.id))
                        }
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [
                                  ...new Set([
                                    ...selected,
                                    ...clients.map((c) => c.id),
                                  ]),
                                ]
                              : selected.filter(
                                  (id) => !clients.some((c) => c.id === id),
                                ),
                          )
                        }
                      />
                    </th>
                    <th>Client / household</th>
                    <th>Stage</th>
                    <th>Risk profile</th>
                    <th>Portfolios</th>
                    <th>Next review</th>
                    <th>Advisor</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, i) => (
                    <tr key={client.id}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${client.name}`}
                          checked={selected.includes(client.id)}
                          onChange={(e) =>
                            setSelected(
                              e.target.checked
                                ? [...selected, client.id]
                                : selected.filter((id) => id !== client.id),
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="advisor-client-name"
                          onClick={() => setEditing(client)}
                        >
                          <span
                            className="advisor-avatar"
                            style={{
                              "--avatar-color": colors[i % colors.length],
                            }}
                          >
                            {client.name
                              .split(" ")
                              .filter((w) => /^[A-Z]/.test(w))
                              .slice(0, 2)
                              .map((w) => w[0])
                              .join("")}
                          </span>
                          <span>
                            <strong>{client.name}</strong>
                            <small>{client.email}</small>
                          </span>
                        </button>
                      </td>
                      <td>
                        <Badge kind={client.stage}>{client.stage}</Badge>
                      </td>
                      <td>
                        <span className="advisor-risk">
                          <span
                            className={`advisor-risk-bars ${client.risk.toLowerCase()}`}
                          >
                            <i />
                            <i />
                            <i />
                            <i />
                          </span>
                          {client.risk}
                        </span>
                      </td>
                      <td>
                        {client.portfolioIds.length ? (
                          <Link
                            href="/client-portfolios"
                            className="advisor-text-link"
                          >
                            {client.portfolioIds.length} portfolio
                            {client.portfolioIds.length > 1 ? "s" : ""}
                          </Link>
                        ) : (
                          <span className="advisor-muted">—</span>
                        )}
                      </td>
                      <td>{niceDate(client.nextReview)}</td>
                      <td>{client.advisor}</td>
                      <td>
                        <IconButton
                          label={`Edit ${client.name}`}
                          onClick={() => setEditing(client)}
                        >
                          <NotePencil size={17} />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!clients.length && (
              <Empty title="No clients match these filters" icon={UsersThree}>
                Try another search or clear a filter.
              </Empty>
            )}
            <div className="advisor-table-footer">
              <span>
                {selected.length ? `${selected.length} selected · ` : ""}
                {clients.length} of {workspace.clients.length} clients
              </span>
              <span>Local browser records</span>
            </div>
          </>
        )}
        {tab === "Portfolios" && (
          <div className="advisor-embedded">
            <PortfolioList store={store} kind="client" embedded />
          </div>
        )}
        {tab === "Strategies" && (
          <div className="advisor-embedded">
            <PortfolioList store={store} kind="model" embedded />
          </div>
        )}
        {tab === "Reviews" && (
          <div className="advisor-review-list">
            <div className="advisor-review-heading">
              <h3>Upcoming client reviews</h3>
              <p>
                Schedule a date in client details. No invitations or reminders
                are sent.
              </p>
            </div>
            {workspace.clients
              .filter((c) => c.nextReview)
              .toSorted((a, b) => a.nextReview.localeCompare(b.nextReview))
              .map((client) => (
                <button
                  className="advisor-review"
                  key={client.id}
                  onClick={() => setEditing(client)}
                >
                  <span className="advisor-review-date">
                    <b>{new Date(`${client.nextReview}T12:00:00`).getDate()}</b>
                    <small>
                      {new Date(
                        `${client.nextReview}T12:00:00`,
                      ).toLocaleDateString("en-US", { month: "short" })}
                    </small>
                  </span>
                  <span>
                    <strong>{client.name}</strong>
                    <small>
                      {client.advisor} · {client.risk} ·{" "}
                      {client.portfolioIds.length} linked portfolio
                      {client.portfolioIds.length !== 1 ? "s" : ""}
                    </small>
                  </span>
                  <span className="advisor-review-tag">
                    Review details
                    <CaretRight size={15} />
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>
      {editing && (
        <ClientEditor
          client={editing.id ? editing : null}
          portfolios={workspace.portfolios}
          onSave={(record) => {
            const result = commit("clients", record);
            if (!result) throw new Error(commit.error);
            return result;
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function AllocationWheel({ portfolio, small = false }) {
  const { rows, cashWeight, valued } = portfolioAllocation(portfolio);
  const groups = [];
  for (const row of rows) {
    const group = groups.find((g) => g.label === row.assetClass);
    if (group) group.weight += row.allocation || 0;
    else groups.push({ label: row.assetClass, weight: row.allocation || 0 });
  }
  if (cashWeight > 0.00001)
    groups.push({ label: "Unallocated cash", weight: cashWeight });
  let start = 0;
  const stops = groups
    .map((group, i) => {
      const end = start + group.weight;
      const stop = `${colors[i % colors.length]} ${start}% ${end}%`;
      start = end;
      return stop;
    })
    .join(",");
  return (
    <div
      className={`advisor-allocation ${small ? "advisor-allocation-small" : ""}`}
    >
      <div
        className="advisor-donut"
        role="img"
        aria-label={
          valued
            ? groups.map((g) => `${g.label} ${g.weight.toFixed(1)}%`).join(", ")
            : "Allocation unavailable without market prices"
        }
        style={{
          background: valued ? `conic-gradient(${stops})` : "var(--border)",
        }}
      >
        <div>
          <strong>{valued ? "100%" : "—"}</strong>
          <span>{valued ? "allocation" : "no prices"}</span>
        </div>
      </div>
      <div className="advisor-allocation-legend">
        {groups.map((group, i) => (
          <div key={group.label}>
            <span>
              <i style={{ background: colors[i % colors.length] }} />
              {group.label}
            </span>
            <b>{valued ? `${group.weight.toFixed(1)}%` : "—"}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioEditor({ portfolio, kind, clients, onSave, onClose }) {
  const [draft, setDraft] = useState(() =>
    structuredClone(
      portfolio ?? {
        id: newId("portfolio"),
        revision: 0,
        name: "",
        kind,
        clientId: "",
        mode: "weights",
        lastOpened: new Date().toISOString().slice(0, 10),
        holdings: [
          { symbol: "", name: "", weight: "", assetClass: "US equity" },
        ],
      },
    ),
  );
  const [error, setError] = useState("");
  const [paste, setPaste] = useState("");
  const [showImport, setShowImport] = useState(false);
  const allocationTotal =
    draft.mode === "weights"
      ? draft.holdings.reduce((sum, h) => sum + (Number(h.weight) || 0), 0)
      : null;
  const inputField = draft.mode === "shares" ? "shares" : "weight";
  const edit = (index, key, value) =>
    setDraft({
      ...draft,
      holdings: draft.holdings.map((h, i) =>
        i === index ? { ...h, [key]: value } : h,
      ),
    });
  function importText(text) {
    try {
      setDraft({ ...draft, holdings: parseHoldings(text, draft.mode) });
      setError("");
      setShowImport(false);
    } catch (e) {
      setError(e.message);
    }
  }
  async function importFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1000000)
      return setError("Select a CSV or text file smaller than 1 MB.");
    if (!/\.(csv|txt|tsv)$/i.test(file.name))
      return setError(
        "Import CSV, TSV, or text. PDF extraction and OCR are not available in this local demo.",
      );
    try {
      importText(await file.text());
    } catch {
      setError("The file could not be read. Try pasting its holdings.");
    }
    e.target.value = "";
  }
  function submit(e) {
    e.preventDefault();
    try {
      const valid = validatePortfolio(draft);
      if (
        onSave({ ...valid, lastOpened: new Date().toISOString().slice(0, 10) })
      )
        onClose();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <Dialog
      title={
        portfolio
          ? "Portfolio workspace"
          : `New ${kind === "model" ? "model" : "client"} portfolio`
      }
      subtitle="An allocation with a purpose. Add holdings, then explore the balance."
      onClose={onClose}
      wide
    >
      <form className="advisor-form" onSubmit={submit}>
        <div className="advisor-form-body">
          <div className="advisor-form-grid">
            <label>
              Portfolio name
              <input
                required
                value={draft.name}
                maxLength={120}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Long-term balanced"
              />
            </label>
            {kind === "client" ? (
              <label>
                Client association
                <select
                  value={draft.clientId || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, clientId: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {clients.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label>
                Allocation type
                <input value="Reusable model portfolio" disabled />
              </label>
            )}
          </div>
          <div className="advisor-holdings-toolbar">
            <div className="advisor-segmented">
              {["weights", "shares"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={draft.mode === mode ? "active" : ""}
                  onClick={() => setDraft({ ...draft, mode })}
                >
                  {mode === "weights" ? "Weights (%)" : "Shares"}
                </button>
              ))}
            </div>
            <div>
              <button
                type="button"
                className="advisor-button advisor-button-small"
                onClick={() => setShowImport(!showImport)}
              >
                Paste holdings
              </button>
              <label className="advisor-button advisor-button-small advisor-file-button">
                <DownloadSimple size={14} />
                Import CSV
                <input
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={importFile}
                />
              </label>
            </div>
          </div>
          {showImport && (
            <div className="advisor-import">
              <label>
                Paste CSV or tab-separated rows
                <textarea
                  rows={4}
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                  placeholder={
                    draft.mode === "weights"
                      ? "Symbol,Weight (%)\nVTI,60\nBND,40"
                      : "Symbol,Shares\nAAPL,25\nMSFT,10"
                  }
                />
              </label>
              <button
                type="button"
                className="advisor-button"
                onClick={() => importText(paste)}
              >
                Import these rows
              </button>
              <small>
                Import replaces the current draft holdings after validation.
              </small>
            </div>
          )}
          <div className="advisor-table-scroll">
            <table className="advisor-table advisor-holdings-editor">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Display name</th>
                  <th>{draft.mode === "weights" ? "Weight (%)" : "Shares"}</th>
                  <th>Asset class</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {draft.holdings.map((h, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        aria-label={`Holding ${index + 1} ticker`}
                        value={h.symbol}
                        onChange={(e) =>
                          edit(index, "symbol", e.target.value.toUpperCase())
                        }
                        placeholder="VTI"
                        maxLength={15}
                        list="advisor-tickers"
                      />
                    </td>
                    <td>
                      <input
                        aria-label={`Holding ${index + 1} name`}
                        value={h.name}
                        onChange={(e) => edit(index, "name", e.target.value)}
                        placeholder="Security name"
                        maxLength={120}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0.000001"
                        step="any"
                        aria-label={`Holding ${index + 1} ${inputField}`}
                        value={h[inputField] ?? ""}
                        onChange={(e) =>
                          edit(index, inputField, e.target.value)
                        }
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <select
                        aria-label={`Holding ${index + 1} asset class`}
                        value={h.assetClass}
                        onChange={(e) =>
                          edit(index, "assetClass", e.target.value)
                        }
                      >
                        {[
                          "US equity",
                          "International equity",
                          "Fixed income",
                          "Cash equivalents",
                          "Alternatives",
                          "Unclassified",
                        ].map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <IconButton
                        label={`Remove holding ${index + 1}`}
                        disabled={draft.holdings.length === 1}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            holdings: draft.holdings.filter(
                              (_, i) => i !== index,
                            ),
                          })
                        }
                      >
                        <X size={15} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <datalist id="advisor-tickers">
            {[
              "VTI",
              "VXUS",
              "BND",
              "SGOV",
              "SPY",
              "QQQ",
              "AAPL",
              "MSFT",
              "NVDA",
              "GLD",
              "TLT",
              "IEF",
            ].map((symbol) => (
              <option key={symbol} value={symbol} />
            ))}
          </datalist>
          <div className="advisor-holdings-total">
            <button
              type="button"
              className="advisor-text-button"
              disabled={draft.holdings.length >= 200}
              onClick={() =>
                setDraft({
                  ...draft,
                  holdings: [
                    ...draft.holdings,
                    {
                      symbol: "",
                      name: "",
                      [inputField]: "",
                      assetClass: "Unclassified",
                    },
                  ],
                })
              }
            >
              <Plus size={15} />
              Add holding
            </button>
            {draft.mode === "weights" && (
              <span className={allocationTotal > 100 ? "advisor-negative" : ""}>
                <b>{allocationTotal.toFixed(2)}%</b> allocated ·{" "}
                {Math.max(0, 100 - allocationTotal).toFixed(2)}% cash
              </span>
            )}
          </div>
          <div className="advisor-portfolio-summary">
            <AllocationWheel portfolio={draft} />
            <div>
              <h3>
                {draft.mode === "weights"
                  ? "$100,000 illustrative notional"
                  : "Share-based holdings"}
              </h3>
              <p>
                {draft.mode === "weights"
                  ? "The value preview uses a fictional notional. Unallocated weight is retained as cash. These figures are not account assets."
                  : "Shares are saved as entered. Allocation and value remain unavailable until a market-price provider is connected."}
              </p>
              <p>
                Performance, fees, taxes, dividends, and rebalancing are not
                included.
              </p>
            </div>
          </div>
          {error && (
            <p className="advisor-form-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="advisor-form-footer">
          <button type="button" className="advisor-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="advisor-button advisor-button-primary"
            type="submit"
          >
            <FloppyDisk size={15} />
            Save portfolio
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function PortfolioList({ store, kind = "client", embedded = false }) {
  const { workspace, commit } = store;
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState([]);
  const [reportFlow, setReportFlow] = useState(false);
  const [report, setReport] = useState(null);
  const items = workspace.portfolios.filter(
    (p) =>
      p.kind === kind && p.name.toLowerCase().includes(query.toLowerCase()),
  );
  const exportItems = () => {
    const rows = (
      selected.length
        ? workspace.portfolios.filter((p) => selected.includes(p.id))
        : items
    ).flatMap((p) =>
      portfolioAllocation(p).rows.map((h) => [
        p.name,
        h.symbol,
        h.name,
        h.weight ?? "",
        h.shares ?? "",
        h.assetClass,
        "Local demo",
      ]),
    );
    download(
      toCsv(
        [
          "Portfolio",
          "Symbol",
          "Name",
          "Weight (%)",
          "Shares",
          "Asset class",
          "Data state",
        ],
        rows,
      ),
      `luna-${kind}-portfolios.csv`,
    );
  };
  const actions = (
    <>
      <button className="advisor-button" onClick={exportItems}>
        <DownloadSimple size={15} />
        Download
      </button>
      <button className="advisor-button" onClick={() => setReportFlow(true)}>
        <FileText size={15} />
        Create Report
      </button>
      <button
        className="advisor-button advisor-button-primary"
        onClick={() => setEditing({})}
      >
        <Plus size={16} />
        Add New
      </button>
    </>
  );
  const save = (draft) => {
    const result = commit("portfolios", draft);
    if (!result) throw new Error(commit.error);
    return result;
  };
  return (
    <>
      {!embedded && (
        <PageHeader
          title={kind === "client" ? "Client Portfolios" : "Model Portfolios"}
          description={
            kind === "client"
              ? "Bring each client’s holdings into a clear, connected research workspace."
              : "Build reusable allocations and explore the balance behind a strategy."
          }
          actions={actions}
        />
      )}
      <div className={embedded ? "" : "advisor-panel"}>
        <div className="advisor-table-toolbar">
          <Search
            value={query}
            onChange={setQuery}
            placeholder={
              kind === "client"
                ? "Search client portfolios"
                : "Search model portfolios"
            }
          />
          {embedded ? (
            <div className="advisor-header-actions">{actions}</div>
          ) : (
            <span className="advisor-muted">
              {items.length} saved portfolios
            </span>
          )}
        </div>
        <div className="advisor-table-scroll">
          <table className="advisor-table advisor-portfolio-table">
            <thead>
              <tr>
                <th className="advisor-checkbox-col">
                  <input
                    type="checkbox"
                    aria-label="Select all portfolios"
                    checked={
                      items.length > 0 &&
                      items.every((p) => selected.includes(p.id))
                    }
                    onChange={(e) =>
                      setSelected(
                        e.target.checked ? items.map((p) => p.id) : [],
                      )
                    }
                  />
                </th>
                <th>Portfolio name</th>
                <th>Holdings</th>
                <th>Illustrative value</th>
                <th>Last edited</th>
                <th>MTD</th>
                <th>YTD</th>
                <th>1Y</th>
                <th>3Y CAGR</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${p.name}`}
                      checked={selected.includes(p.id)}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, p.id]
                            : selected.filter((id) => id !== p.id),
                        )
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="advisor-portfolio-name"
                      onClick={() => setEditing(p)}
                    >
                      <span className="advisor-portfolio-icon">
                        <ChartPieSlice size={19} />
                      </span>
                      <span>
                        <strong>{p.name}</strong>
                        <small>
                          {kind === "model"
                            ? "Model allocation"
                            : (workspace.clients.find(
                                (c) => c.id === p.clientId,
                              )?.name ?? "Unassigned client")}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>{p.holdings.length}</td>
                  <td className="advisor-numeric">
                    {p.mode === "weights" ? usd(DEMO_NOTIONAL) : "Unavailable"}
                  </td>
                  <td>{niceDate(p.lastOpened)}</td>
                  {["MTD", "YTD", "1Y", "3Y"].map((label) => (
                    <td
                      className="advisor-numeric advisor-muted"
                      key={label}
                      title={`${label} return unavailable without historical market prices`}
                    >
                      —
                    </td>
                  ))}
                  <td>
                    <div className="advisor-row-actions">
                      <IconButton
                        label={`Download ${p.name}`}
                        onClick={() =>
                          download(portfolioCsv(p), `${filename(p.name)}.csv`)
                        }
                      >
                        <DownloadSimple size={16} />
                      </IconButton>
                      {kind === "model" && (
                        <IconButton
                          label={`Duplicate ${p.name}`}
                          onClick={() =>
                            setEditing({
                              ...structuredClone(p),
                              id: newId("model"),
                              revision: 0,
                              name: `${p.name} copy`,
                            })
                          }
                        >
                          <CopySimple size={16} />
                        </IconButton>
                      )}
                      <IconButton
                        label={`Edit ${p.name}`}
                        onClick={() => setEditing(p)}
                      >
                        <NotePencil size={16} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!items.length && (
          <Empty title="Your next allocation starts here" icon={ChartPieSlice}>
            Add holdings manually or import a CSV to create a portfolio.
          </Empty>
        )}
        <div className="advisor-table-footer">
          <span>
            {selected.length ? `${selected.length} selected · ` : ""}
            {items.length} portfolios
          </span>
          <span>Returns unavailable · Values are illustrative</span>
        </div>
      </div>
      {!embedded && (
        <div className="advisor-explainer">
          <ChartPieSlice size={21} />
          <div>
            <strong>A clear view of your allocation</strong>
            <p>
              Weights use a $100,000 fictional notional per portfolio.
              Share-based holdings require market prices for valuation.
              Unallocated weights are held as cash.
            </p>
          </div>
        </div>
      )}
      {editing && (
        <PortfolioEditor
          portfolio={editing.id ? editing : null}
          kind={kind}
          clients={workspace.clients}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}{" "}
      {reportFlow && (
        <ReportChooser
          workspace={workspace}
          initialIds={
            selected.length ? selected : items.slice(0, 1).map((p) => p.id)
          }
          onClose={() => setReportFlow(false)}
          onCreate={(draft) => {
            setReport(draft);
            setReportFlow(false);
          }}
        />
      )}
      {report && (
        <ReportBuilder
          initial={report}
          store={store}
          onClose={() => setReport(null)}
        />
      )}
    </>
  );
}

function ReportChooser({ workspace, onCreate, onClose, initialIds = [] }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("Standard");
  const [template, setTemplate] = useState("Overview Summary Report");
  const [selected, setSelected] = useState(initialIds.slice(0, 2));
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("Portfolio Overview");
  const [client, setClient] = useState("");
  const [preparedBy, setPreparedBy] = useState("Jordan Ellis");
  const [range, setRange] = useState("Current allocation");
  const [error, setError] = useState("");
  const max = type === "Comparison" ? 5 : 2;
  const templates = [
    ...REPORT_TEMPLATES.map((name) => ({ id: name, name })),
    ...workspace.templates.filter((t) => t.type === type),
  ];
  function create() {
    try {
      const savedTemplate = workspace.templates.find((t) => t.id === template);
      const draft = createReport({
        type,
        template: savedTemplate ? "Overview Summary Report" : template,
        portfolioIds: selected,
        title,
        client,
        preparedBy,
        dateRange: range,
      });
      if (savedTemplate) {
        draft.pages = structuredClone(savedTemplate.pages).map((p) => ({
          ...p,
          id: newId("page"),
        }));
        draft.accent = savedTemplate.accent;
        draft.topHoldings = savedTemplate.topHoldings;
      }
      onCreate(draft);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <Dialog
      title={
        [
          "Create a report",
          "Choose a starting point",
          "Select portfolios",
          "Make it yours",
        ][step]
      }
      subtitle={
        [
          "From research to a conversation worth having.",
          "Start with a layout, then tailor every page.",
          `Choose up to ${max} saved client or model portfolios.`,
          "Add the details that make your report personal.",
        ][step]
      }
      onClose={onClose}
      wide
    >
      <div className="advisor-report-flow">
        <div className="advisor-flow-steps">
          {["Type", "Template", "Portfolios", "Details"].map((item, i) => (
            <span
              className={step === i ? "active" : step > i ? "complete" : ""}
              key={item}
            >
              <b>{step > i ? <Check size={12} /> : i + 1}</b>
              {item}
            </span>
          ))}
        </div>
        {step === 0 && (
          <div className="advisor-report-type-grid">
            {REPORT_TYPES.map((t, i) => (
              <button
                key={t}
                className={`advisor-report-type ${type === t ? "selected" : ""}`}
                onClick={() => {
                  setType(t);
                  setSelected(selected.slice(0, t === "Comparison" ? 5 : 2));
                }}
              >
                <span className={`advisor-report-thumbnail type-${i}`}>
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <strong>{t}</strong>
                <p>
                  {i === 0
                    ? "A complete portfolio story, from allocation to holdings."
                    : i === 1
                      ? "Key insights in a focused, concise summary."
                      : "Bring up to five portfolios together for a clear comparison."}
                </p>
                <span className="advisor-radio">{type === t && <span />}</span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="advisor-report-template-grid">
            {templates.map((t, i) => (
              <button
                className={`advisor-template-choice ${template === t.id ? "selected" : ""}`}
                key={t.id}
                onClick={() => setTemplate(t.id)}
              >
                <div className={`advisor-template-preview template-${i}`}>
                  <div>LUNA TERMINAL</div>
                  <strong>
                    {t.name === "Blank" ? "Your story starts here" : t.name}
                  </strong>
                  <span />
                  <span />
                  <span />
                </div>
                <strong>{t.name}</strong>
                <small>
                  {t.id === t.name
                    ? "Luna starting template"
                    : "Saved in this browser"}
                </small>
                {template === t.id && (
                  <span className="advisor-template-check">
                    <Check size={14} />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <>
            <Search
              value={query}
              onChange={setQuery}
              placeholder="Search your portfolios"
            />
            <div className="advisor-portfolio-choices">
              {workspace.portfolios
                .filter((p) =>
                  p.name.toLowerCase().includes(query.toLowerCase()),
                )
                .map((p) => (
                  <label
                    key={p.id}
                    className={selected.includes(p.id) ? "selected" : ""}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      disabled={
                        !selected.includes(p.id) && selected.length >= max
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, p.id]
                            : selected.filter((id) => id !== p.id),
                        )
                      }
                    />
                    <span className="advisor-portfolio-icon">
                      <ChartPieSlice size={20} />
                    </span>
                    <span>
                      <strong>{p.name}</strong>
                      <small>
                        {p.kind === "model"
                          ? "Model portfolio"
                          : "Client portfolio"}{" "}
                        · {p.holdings.length} holdings
                      </small>
                    </span>
                    <Badge>{p.mode === "weights" ? "Weights" : "Shares"}</Badge>
                  </label>
                ))}
            </div>
            <p className="advisor-selection-count">
              {selected.length} of {max} selected · Saved browser portfolios
            </p>
          </>
        )}
        {step === 3 && (
          <div className="advisor-form-grid advisor-report-details">
            <label className="advisor-span-2">
              Report title
              <input
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              Prepared for
              <select
                value={client}
                onChange={(e) => setClient(e.target.value)}
              >
                <option value="">General portfolio research</option>
                {workspace.clients.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label>
              Prepared by
              <input
                maxLength={80}
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
              />
            </label>
            <label className="advisor-span-2">
              Reporting period
              <select value={range} onChange={(e) => setRange(e.target.value)}>
                <option>Current allocation</option>
                <option>Year to date — performance unavailable</option>
                <option>Last 12 months — performance unavailable</option>
              </select>
            </label>
            <div className="advisor-span-2 advisor-summary-line">
              <FileText size={19} />
              {type} · {selected.length} portfolio
              {selected.length !== 1 ? "s" : ""} ·{" "}
              {templates.find((t) => t.id === template)?.name}
            </div>
          </div>
        )}
        {error && (
          <p className="advisor-form-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="advisor-form-footer">
        <button
          className="advisor-button"
          onClick={() => (step ? setStep(step - 1) : onClose())}
        >
          {step ? "Back" : "Cancel"}
        </button>
        <button
          className="advisor-button advisor-button-primary"
          disabled={step === 2 && !selected.length}
          onClick={() => (step < 3 ? setStep(step + 1) : create())}
        >
          {step === 3 ? "Open report builder" : "Continue"}
          <ArrowRight size={15} />
        </button>
      </div>
    </Dialog>
  );
}

function ReportPreview({
  report,
  section,
  portfolios,
  pageIndex = 0,
  pageCount = 1,
}) {
  const selectedPortfolios = report.portfolioIds
    .map((id) => portfolios.find((p) => p.id === id))
    .filter(Boolean);
  return (
    <article
      className="advisor-report-paper"
      style={{ "--report-accent": report.accent }}
    >
      <header>
        <span>LUNA TERMINAL</span>
        <small>LOCAL DEMO</small>
      </header>
      <h1>{report.title}</h1>
      <div className="advisor-paper-meta">
        {report.client || "Portfolio research"}
        <span>Prepared by {report.preparedBy}</span>
        <span>{report.dateRange}</span>
      </div>
      <hr />
      <h2>{section.title}</h2>
      <p className="advisor-paper-editorial">{section.textLines.join(" ")}</p>
      {["overview", "allocation"].includes(section.kind) && (
        <div className="advisor-paper-allocations">
          {selectedPortfolios.map((p) => (
            <div key={p.id}>
              <h3>{p.name}</h3>
              <AllocationWheel portfolio={p} small />
            </div>
          ))}
        </div>
      )}
      {section.rows.length > 0 && (
        <table className="advisor-paper-table">
          <thead>
            <tr>
              <th>Holding / portfolio</th>
              <th>Allocation</th>
              <th>Illustrative value</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, i) => (
              <tr key={`${row.symbol}-${i}`}>
                <td>
                  <strong>{row.symbol}</strong> {row.name}
                  <small>{row.portfolio}</small>
                </td>
                <td>
                  {row.allocation == null
                    ? "Unavailable"
                    : `${row.allocation.toFixed(2)}%`}
                </td>
                <td>{usd(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <footer>
        <p>{REPORT_DISCLOSURE}</p>
        <span>
          {pageIndex + 1} / {pageCount}
        </span>
      </footer>
    </article>
  );
}

function ReportBuilder({ initial, store, onClose }) {
  const [report, setReport] = useState(() => structuredClone(initial));
  const [tab, setTab] = useState("Pages");
  const [pageId, setPageId] = useState(initial.pages[0]?.id);
  const [continuation, setContinuation] = useState(0);
  const [editing, setEditing] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const dragId = useRef(null);
  const builderRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    builderRef.current?.querySelector("button")?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    const keydown = (event) => {
      if (templateModal) return;
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const items = Array.from(
          builderRef.current.querySelectorAll(
            "button, input, select, textarea",
          ),
        ).filter((item) => !item.disabled && item.offsetParent !== null);
        if (event.shiftKey && document.activeElement === items[0]) {
          event.preventDefault();
          items.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
          event.preventDefault();
          items[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [onClose, templateModal]);
  const layout = useMemo(() => {
    try {
      return layoutReport(report, store.workspace.portfolios);
    } catch {
      return [];
    }
  }, [report, store.workspace.portfolios]);
  const current = report.pages.find((p) => p.id === pageId) ?? report.pages[0];
  const matching = layout.filter((p) => p.sourceId === current?.id);
  const section = matching[Math.min(continuation, matching.length - 1)];
  const patchPage = (patch) =>
    setReport({
      ...report,
      pages: report.pages.map((p) =>
        p.id === current.id ? { ...p, ...patch } : p,
      ),
    });
  function move(id, delta) {
    const pages = [...report.pages];
    const from = pages.findIndex((p) => p.id === id);
    const to = from + delta;
    if (to < 0 || to >= pages.length) return;
    [pages[from], pages[to]] = [pages[to], pages[from]];
    setReport({ ...report, pages });
  }
  function save() {
    const result = store.commit("reports", report);
    if (result) {
      setReport(result);
      setMessage("Report saved in this browser.");
      setError("");
    } else setError(store.commit.error || "Report was not saved.");
  }
  async function exportPdf() {
    if (exporting) return;
    setExporting(true);
    try {
      const bytes = await buildReportPdf(report, store.workspace.portfolios);
      download(bytes, `${filename(report.title)}.pdf`, "application/pdf");
      setMessage(
        `PDF exported with ${layout.length} page${layout.length === 1 ? "" : "s"}.`,
      );
      setError("");
    } catch (e) {
      setError(
        e.message ||
          "PDF export failed. You can retry without losing your draft.",
      );
    } finally {
      setExporting(false);
    }
  }
  function saveTemplate(e) {
    e.preventDefault();
    if (!templateName.trim()) return;
    const saved = store.commit("templates", {
      id: newId("template"),
      revision: 0,
      name: templateName.trim(),
      type: report.type,
      pages: structuredClone(report.pages),
      accent: report.accent,
      topHoldings: report.topHoldings,
    });
    if (saved) {
      setTemplateModal(false);
      setMessage(
        "Template saved in this browser. Choose it when creating your next report.",
      );
      setTemplateError("");
    } else setTemplateError(store.commit.error || "Template was not saved.");
  }
  const update = (field, value) => setReport({ ...report, [field]: value });
  return (
    <section
      ref={builderRef}
      className="advisor-builder"
      role="dialog"
      aria-modal="true"
      aria-label="Report builder"
    >
      <header className="advisor-builder-header">
        <div>
          <IconButton label="Close report builder" onClick={onClose}>
            <X size={20} />
          </IconButton>
          <span className="advisor-builder-title">
            <strong>{report.title}</strong>
            <small>{report.type} report · Local browser draft</small>
          </span>
        </div>
        <div>
          <button
            className="advisor-button"
            onClick={() => setTemplateModal(true)}
          >
            <CopySimple size={15} />
            Save as Template
          </button>
          <button
            className="advisor-button"
            onClick={() =>
              download(
                reportCsv(report, store.workspace.portfolios),
                `${filename(report.title)}.csv`,
              )
            }
          >
            <DownloadSimple size={15} />
            CSV
          </button>
          <button
            className="advisor-button"
            onClick={exportPdf}
            disabled={exporting}
          >
            <DownloadSimple size={15} />
            {exporting ? "Exporting..." : "Export PDF"}
          </button>
          <button
            className="advisor-button advisor-button-primary"
            onClick={save}
          >
            <FloppyDisk size={15} />
            Save Report
          </button>
        </div>
      </header>
      <div className="advisor-builder-body">
        <aside className="advisor-builder-rail">
          <div
            className="advisor-tabs"
            role="tablist"
            aria-label="Report controls"
          >
            {["Pages", "Details", "Style"].map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "Pages" && (
            <>
              <div className="advisor-page-rail-heading">
                <span>{report.pages.length} pages</span>
                <button
                  className="advisor-text-button"
                  onClick={() => {
                    const id = newId("page");
                    setReport({
                      ...report,
                      pages: [
                        ...report.pages,
                        {
                          id,
                          kind: "notes",
                          title: "Custom research",
                          text: "Add a new insight to your report.",
                          visible: true,
                          custom: true,
                        },
                      ],
                    });
                    setPageId(id);
                    setContinuation(0);
                  }}
                >
                  <Plus size={14} />
                  Add page
                </button>
              </div>
              <div className="advisor-page-list">
                {report.pages.map((p, i) => (
                  <div
                    key={p.id}
                    className={`advisor-page-choice ${p.id === pageId ? "selected" : ""} ${!p.visible ? "hidden" : ""}`}
                    draggable
                    onDragStart={() => {
                      dragId.current = p.id;
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const pages = [...report.pages];
                      const from = pages.findIndex(
                        (item) => item.id === dragId.current,
                      );
                      if (from < 0 || from === i) return;
                      const [moved] = pages.splice(from, 1);
                      pages.splice(i, 0, moved);
                      setReport({ ...report, pages });
                    }}
                  >
                    <button
                      className="advisor-page-select"
                      onClick={() => {
                        setPageId(p.id);
                        setContinuation(0);
                        setEditing(false);
                      }}
                    >
                      <span className="advisor-mini-page">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span>
                        <strong>{p.title}</strong>
                        <small>
                          Page {i + 1} · {p.kind}
                        </small>
                      </span>
                    </button>
                    <div className="advisor-page-options">
                      <IconButton
                        label={`Move ${p.title} up`}
                        onClick={() => move(p.id, -1)}
                        disabled={i === 0}
                      >
                        <ArrowUp size={13} />
                      </IconButton>
                      <IconButton
                        label={`Move ${p.title} down`}
                        onClick={() => move(p.id, 1)}
                        disabled={i === report.pages.length - 1}
                      >
                        <ArrowDown size={13} />
                      </IconButton>
                      <IconButton
                        label={`${p.visible ? "Hide" : "Show"} ${p.title}`}
                        onClick={() =>
                          setReport({
                            ...report,
                            pages: report.pages.map((item) =>
                              item.id === p.id
                                ? { ...item, visible: !item.visible }
                                : item,
                            ),
                          })
                        }
                      >
                        {p.visible ? <Eye size={14} /> : <EyeSlash size={14} />}
                      </IconButton>
                      {p.custom && (
                        <IconButton
                          label={`Remove ${p.title}`}
                          onClick={() => {
                            const pages = report.pages.filter(
                              (item) => item.id !== p.id,
                            );
                            setReport({ ...report, pages });
                            if (pageId === p.id) setPageId(pages[0]?.id);
                          }}
                        >
                          <Trash size={13} />
                        </IconButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="advisor-rail-hint">
                Drag pages to reorder, or use the arrow buttons. Hidden pages
                are excluded from the PDF.
              </div>
            </>
          )}
          {tab === "Details" && (
            <div className="advisor-builder-fields">
              <label>
                Report title
                <input
                  maxLength={120}
                  value={report.title}
                  onChange={(e) => update("title", e.target.value)}
                />
              </label>
              <label>
                Prepared for
                <input
                  maxLength={120}
                  value={report.client}
                  onChange={(e) => update("client", e.target.value)}
                />
              </label>
              <label>
                Prepared by
                <input
                  maxLength={80}
                  value={report.preparedBy}
                  onChange={(e) => update("preparedBy", e.target.value)}
                />
              </label>
              <label>
                Reporting period
                <input
                  maxLength={100}
                  value={report.dateRange}
                  onChange={(e) => update("dateRange", e.target.value)}
                />
              </label>
              <label>
                Top holdings shown
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={report.topHoldings}
                  onChange={(e) =>
                    update(
                      "topHoldings",
                      Math.min(200, Math.max(1, Number(e.target.value) || 1)),
                    )
                  }
                />
              </label>
              <div className="advisor-rail-hint">
                Market returns and expense metrics are unavailable. Exports use
                your entered holdings and the illustrative notional.
              </div>
            </div>
          )}
          {tab === "Style" && (
            <div className="advisor-builder-fields">
              <h3>Accent color</h3>
              <div className="advisor-color-choices">
                {[
                  "#1b5faa",
                  "#081d4c",
                  "#527568",
                  "#8f7358",
                  "#776398",
                  "#b26c58",
                ].map((c) => (
                  <button
                    key={c}
                    style={{ background: c }}
                    className={report.accent === c ? "selected" : ""}
                    aria-label={`Use accent ${c}`}
                    onClick={() => update("accent", c)}
                  >
                    {report.accent === c && <Check size={17} />}
                  </button>
                ))}
              </div>
              <label>
                Custom accent
                <input
                  type="color"
                  value={report.accent}
                  onChange={(e) => update("accent", e.target.value)}
                />
              </label>
              <div className="advisor-style-spec">
                <strong>Landscape · 842 × 595</strong>
                <span>Searchable vector PDF</span>
                <span>Helvetica typography</span>
                <span>Fictional data disclosure on every page</span>
              </div>
            </div>
          )}
        </aside>
        <main className="advisor-builder-preview">
          <div className="advisor-preview-toolbar">
            <span>
              {section
                ? `${layout.findIndex((s) => s === section) + 1} of ${layout.length} export pages`
                : "Page hidden"}
            </span>
            <div>
              {matching.length > 1 && (
                <select
                  aria-label="Continuation page"
                  value={Math.min(continuation, matching.length - 1)}
                  onChange={(e) => setContinuation(Number(e.target.value))}
                >
                  {matching.map((_, i) => (
                    <option key={i} value={i}>
                      Part {i + 1} of {matching.length}
                    </option>
                  ))}
                </select>
              )}
              <button
                className="advisor-button advisor-button-small"
                disabled={!current}
                onClick={() => setEditing(!editing)}
              >
                <PencilSimple size={14} />
                {editing ? "Done editing" : "Edit Page"}
              </button>
            </div>
          </div>
          {editing && current && (
            <div className="advisor-inline-editor">
              <label>
                Page heading
                <input
                  value={current.title}
                  maxLength={120}
                  onChange={(e) => patchPage({ title: e.target.value })}
                />
              </label>
              <label>
                Editorial content
                <textarea
                  aria-label="Editorial content"
                  rows={3}
                  maxLength={16000}
                  value={current.text}
                  onChange={(e) => patchPage({ text: e.target.value })}
                />
              </label>
            </div>
          )}
          {section ? (
            <div className="advisor-paper-container">
              <ReportPreview
                report={report}
                section={section}
                portfolios={store.workspace.portfolios}
                pageIndex={layout.findIndex((s) => s === section)}
                pageCount={layout.length}
              />
            </div>
          ) : (
            <Empty
              title={
                current?.visible === false
                  ? "This page is hidden"
                  : "No visible report pages"
              }
            >
              Show a page using the eye control to include it in your export.
            </Empty>
          )}
          <div className="advisor-builder-status" aria-live="polite">
            {error ? (
              <span className="advisor-negative">{error}</span>
            ) : (
              message ||
              "Live preview · Edits are saved when you select Save Report"
            )}
          </div>
        </main>
      </div>
      {templateModal && (
        <Dialog
          title="Save as a template"
          subtitle="Reuse this page structure and style in your next report."
          onClose={() => setTemplateModal(false)}
        >
          <form onSubmit={saveTemplate} className="advisor-form">
            <div className="advisor-form-body">
              <label>
                Template name
                <input
                  required
                  maxLength={100}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Quarterly client review"
                />
              </label>
              <p className="advisor-muted">
                Portfolio and client selections are not included in templates.
              </p>
              {templateError && (
                <p className="advisor-form-error" role="alert">
                  {templateError}
                </p>
              )}
            </div>
            <div className="advisor-form-footer">
              <button
                className="advisor-button"
                type="button"
                onClick={() => setTemplateModal(false)}
              >
                Cancel
              </button>
              <button
                className="advisor-button advisor-button-primary"
                type="submit"
              >
                Save template
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </section>
  );
}

function ReportsView({ store }) {
  const [query, setQuery] = useState("");
  const [flow, setFlow] = useState(false);
  const [builder, setBuilder] = useState(null);
  const reports = store.workspace.reports.filter((r) =>
    `${r.title} ${r.client}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Reports"
        description="Turn a portfolio into a clear story. Create, tailor, and share your research."
        actions={
          <button
            className="advisor-button advisor-button-primary"
            onClick={() => setFlow(true)}
          >
            <Plus size={16} />
            Create Report
          </button>
        }
      />
      <div className="advisor-report-welcome">
        <div>
          <span className="advisor-eyebrow">
            Built for your next conversation
          </span>
          <h2>Insight, beautifully presented.</h2>
          <p>
            Start with an overview, a one pager, or a side-by-side comparison.
            Make every page your own.
          </p>
          <button className="advisor-button" onClick={() => setFlow(true)}>
            Explore templates
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="advisor-welcome-pages">
          <div className="advisor-welcome-page">
            <span>LUNA TERMINAL</span>
            <strong>Portfolio overview</strong>
            <div className="advisor-welcome-chart" />
            <i />
            <i />
            <i />
          </div>
          <div className="advisor-welcome-page rear">
            <span>LUNA TERMINAL</span>
            <strong>Asset allocation</strong>
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
      <div className="advisor-panel">
        <div className="advisor-table-toolbar">
          <div>
            <h3 className="advisor-panel-title">
              Saved reports <Badge>{store.workspace.reports.length}</Badge>
            </h3>
          </div>
          <Search
            value={query}
            onChange={setQuery}
            placeholder="Search reports"
          />
        </div>
        {reports.length ? (
          <div className="advisor-table-scroll">
            <table className="advisor-table">
              <thead>
                <tr>
                  <th>Report name</th>
                  <th>Type</th>
                  <th>Prepared for</th>
                  <th>Portfolios</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <button
                        className="advisor-report-name"
                        onClick={() => setBuilder(r)}
                      >
                        <FileText size={19} />
                        <strong>{r.title}</strong>
                      </button>
                    </td>
                    <td>
                      <Badge>{r.type}</Badge>
                    </td>
                    <td>{r.client || "General research"}</td>
                    <td>{r.portfolioIds.length}</td>
                    <td>{niceDate(r.createdAt)}</td>
                    <td>
                      <IconButton
                        label={`Open ${r.title}`}
                        onClick={() => setBuilder(r)}
                      >
                        <PencilSimple size={16} />
                      </IconButton>
                      <IconButton
                        label={`Export ${r.title} as CSV`}
                        onClick={() =>
                          download(
                            reportCsv(r, store.workspace.portfolios),
                            `${filename(r.title)}.csv`,
                          )
                        }
                      >
                        <DownloadSimple size={16} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={
              query
                ? "No matching reports"
                : "A new perspective, ready to share"
            }
          >
            Your saved reports will appear here. Start with a template and your
            selected portfolios.
            <br />
            Reports are stored locally in this browser.
            <button
              className="advisor-text-button"
              onClick={() => setFlow(true)}
            >
              Create your first report
              <ArrowRight size={14} />
            </button>
          </Empty>
        )}
        <div className="advisor-table-footer">
          <span>
            {store.workspace.templates.length} custom template
            {store.workspace.templates.length !== 1 ? "s" : ""} available
          </span>
          <span>PDF & CSV export</span>
        </div>
      </div>
      {flow && (
        <ReportChooser
          workspace={store.workspace}
          onClose={() => setFlow(false)}
          onCreate={(draft) => {
            setBuilder(draft);
            setFlow(false);
          }}
        />
      )}
      {builder && (
        <ReportBuilder
          initial={builder}
          store={store}
          onClose={() => setBuilder(null)}
        />
      )}
    </>
  );
}

function FilingsView({ cik }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(
    cik ? (DEMO_MANAGERS.find((m) => m.cik === cik) ?? DEMO_MANAGERS[0]) : null,
  );
  const [tab, setTab] = useState("Holdings");
  const managers = DEMO_MANAGERS.filter((m) =>
    `${m.name} ${m.manager}`.toLowerCase().includes(query.toLowerCase()),
  );
  const holdings =
    selected?.cik === DEMO_MANAGERS[0].cik ? DEMO_FILING_HOLDINGS : [];
  return (
    <>
      <PageHeader
        eyebrow="Institutional research"
        title={selected ? selected.name : "13F Filings"}
        description={
          selected
            ? "Reported holdings, allocation context, and a view into institutional positioning."
            : "Explore the portfolios behind the world’s most followed investors."
        }
        actions={
          <a
            className="advisor-button"
            href="https://www.sec.gov/edgar/search/"
            target="_blank"
            rel="noreferrer"
          >
            SEC EDGAR
            <ArrowSquareOut size={15} />
          </a>
        }
      />
      <div className="advisor-filings-disclosure">
        <CalendarBlank size={20} />
        <div>
          <strong>
            Illustrative snapshot · Reporting period: June 30, 2026
          </strong>
          <p>
            All values shown below are fictional demo data, not actual SEC
            holdings. Form 13F may be filed up to 45 days after quarter-end. It
            covers specified securities and does not provide a complete or
            current portfolio.
          </p>
        </div>
        <Badge>Demo</Badge>
      </div>
      {!selected ? (
        <>
          <div className="advisor-filings-toolbar">
            <Search
              value={query}
              onChange={setQuery}
              placeholder="Search managers or investors"
            />
            <span className="advisor-muted">
              4 featured manager identities · Fictional figures
            </span>
          </div>
          <div className="advisor-manager-grid">
            {managers.map((m) => (
              <button
                className="advisor-manager-card"
                key={m.cik}
                onClick={() => setSelected(m)}
              >
                <div className="advisor-manager-top">
                  <span style={{ background: m.color }}>{m.initials}</span>
                  <div>
                    <h3>{m.name}</h3>
                    <p>{m.manager}</p>
                  </div>
                  <CaretRight size={18} />
                </div>
                <div className="advisor-manager-stats">
                  <div>
                    <span>Illustrative value</span>
                    <strong>${m.value.toFixed(1)}B</strong>
                  </div>
                  <div>
                    <span>Positions</span>
                    <strong>{m.holdings}</strong>
                  </div>
                </div>
                <div className="advisor-manager-footer">
                  <span>
                    Largest position <b>{m.largest}</b>
                  </span>
                  <Badge>Q2 2026 · Demo</Badge>
                </div>
              </button>
            ))}
          </div>
          <div className="advisor-explainer">
            <FileText size={22} />
            <div>
              <strong>Looking back to look ahead</strong>
              <p>
                Institutional filings are a dated source of evidence. Verify the
                filing date, amendments, coverage, and reporting period before
                drawing conclusions. This local view has no SEC ingestion
                connection.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <button
            className="advisor-text-button advisor-back-link"
            onClick={() => setSelected(null)}
          >
            ← All managers
          </button>
          <div className="advisor-stat-row">
            <div className="advisor-stat">
              <span>Illustrative reported value</span>
              <strong>${selected.value.toFixed(1)}B</strong>
              <small>Fictional Q2 2026 figure</small>
            </div>
            <div className="advisor-stat">
              <span>Reported positions</span>
              <strong>{selected.holdings}</strong>
              <small>Demo count</small>
            </div>
            <div className="advisor-stat">
              <span>Reporting date</span>
              <strong className="advisor-stat-date">Jun 30, 2026</strong>
              <small>Quarter end · Q2 2026</small>
            </div>
            <div className="advisor-stat">
              <span>Source connection</span>
              <strong className="advisor-stat-date">Demo only</strong>
              <small>Actual filing not retrieved</small>
            </div>
          </div>
          <div className="advisor-panel">
            <div className="advisor-tabs">
              {["Holdings", "Coverage & source"].map((t) => (
                <button
                  key={t}
                  className={tab === t ? "active" : ""}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {tab === "Holdings" &&
              (holdings.length ? (
                <>
                  <div className="advisor-table-toolbar">
                    <h3 className="advisor-panel-title">
                      Illustrative top positions
                    </h3>
                    <button
                      className="advisor-button advisor-button-small"
                      onClick={() =>
                        download(
                          toCsv(
                            [
                              "Symbol",
                              "Name",
                              "Sector",
                              "Weight (%)",
                              "Illustrative value (USD B)",
                              "Demo change",
                            ],
                            holdings.map((h) => [
                              h.symbol,
                              h.name,
                              h.sector,
                              h.weight,
                              h.value,
                              h.action,
                            ]),
                          ),
                          "luna-demo-13f-holdings.csv",
                        )
                      }
                    >
                      <DownloadSimple size={14} />
                      CSV
                    </button>
                  </div>
                  <div className="advisor-table-scroll">
                    <table className="advisor-table">
                      <thead>
                        <tr>
                          <th>Security</th>
                          <th>Sector</th>
                          <th>Illustrative value</th>
                          <th>Portfolio weight</th>
                          <th>Demo change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((h) => (
                          <tr key={h.symbol}>
                            <td>
                              <Link
                                className="advisor-security"
                                href={`/stock/${h.symbol}`}
                              >
                                <b>{h.symbol}</b>
                                <span>{h.name}</span>
                              </Link>
                            </td>
                            <td>{h.sector}</td>
                            <td className="advisor-numeric">
                              ${h.value.toFixed(2)}B
                            </td>
                            <td>
                              <span className="advisor-weight-bar">
                                <i style={{ width: `${h.weight * 2}%` }} />
                                {h.weight.toFixed(1)}%
                              </span>
                            </td>
                            <td>
                              <Badge
                                kind={
                                  h.action === "Added"
                                    ? "active"
                                    : h.action === "Reduced"
                                      ? "prospect"
                                      : ""
                                }
                              >
                                {h.action}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="advisor-table-footer">
                    <span>
                      6 fictional top positions · Not a complete portfolio
                    </span>
                    <span>No live SEC feed connected</span>
                  </div>
                </>
              ) : (
                <Empty title="Holdings are unavailable" icon={Briefcase}>
                  A dated SEC filing has not been retrieved for this manager.
                  Use the official SEC company page to research reported
                  positions.
                </Empty>
              ))}
            {tab === "Coverage & source" && (
              <div className="advisor-source-detail">
                <h3>Read the filing in context</h3>
                <p>
                  Form 13F reports certain long positions held at the end of a
                  calendar quarter. Short positions, cash, many bonds, and other
                  investments may be excluded. Reported positions can change
                  before publication.
                </p>
                <dl>
                  <div>
                    <dt>Manager CIK</dt>
                    <dd>{selected.cik}</dd>
                  </div>
                  <div>
                    <dt>Displayed period</dt>
                    <dd>Q2 2026 · Illustrative only</dd>
                  </div>
                  <div>
                    <dt>Filing date</dt>
                    <dd>Not retrieved</dd>
                  </div>
                  <div>
                    <dt>Observation state</dt>
                    <dd>Fictional demo values</dd>
                  </div>
                </dl>
                <a
                  className="advisor-button"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.sec.gov/edgar/browse/?CIK=${selected.cik}`}
                >
                  Open SEC manager page
                  <ArrowSquareOut size={15} />
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default function AdvisorView({ slug = "finance-crm", cik }) {
  const store = useAdvisorWorkspace();
  const normalized = String(slug).toLowerCase();
  return (
    <div className="advisor-root">
      <LocalNotice />
      {store.error && (
        <div className="advisor-global-error" role="alert">
          {store.error}
        </div>
      )}
      {store.notice && (
        <div className="advisor-global-notice" role="status">
          <Check size={14} />
          {store.notice}
          <button
            aria-label="Dismiss workspace message"
            onClick={() => store.setNotice("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {normalized === "finance-crm" ? (
        <FinanceCrm store={store} />
      ) : normalized === "client-portfolios" ? (
        <PortfolioList store={store} kind="client" />
      ) : normalized === "model-portfolios" ? (
        <PortfolioList store={store} kind="model" />
      ) : normalized === "reports" ? (
        <ReportsView store={store} />
      ) : (
        <FilingsView cik={cik} />
      )}
    </div>
  );
}
