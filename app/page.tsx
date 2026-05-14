"use client";

import { useState, useRef, useEffect } from "react";

const GLOBAL_CONTEXT = `
Du arbeitest als internes KI-System der Rolf Maier & Co AG — ein Schweizer Bäckerei-, Konditorei-, Confiserie- und Gastro-Unternehmen.

KOMMUNIKATIONSREGELN (immer einhalten):
- Schweizer Hochdeutsch — niemals ß verwenden, stattdessen ss
- Kurze, klare, präzise Aussagen
- Professionell, sachlich, direkt
`;

const LORENA_SYSTEM = `${GLOBAL_CONTEXT}
Du bist Lorena, Finanz- und Controlling-Spezialistin. Du kannst:
1. PDFs aus OneDrive (Controlling-Ordner) analysieren
2. Kostenanalysen durchführen
3. HTML-Reports generieren mit Diagrammen und Tabellen

WENN User PDF-Analyse anfordert:
- Extrahiere Daten aus der PDF
- Analysiere Kosten, Marge, Kennzahlen
- Generiere strukturierten HTML-Report zum Download
- Gib konkrete Empfehlungen

REPORT-STRUKTUR:
- KPIs (Umsatz, Wachstum, Kosten, Marge)
- Kostenentwicklung (Tabellen)
- Finanzielle Kennzahlen
- Empfehlungen & Risiken`;

const SABRINA_SYSTEM = `${GLOBAL_CONTEXT}
Du bist Sabrina, Filialmanagement-Spezialistin. Du kannst:
1. PDFs aus OneDrive (Filialmanagement-Ordner) analysieren
2. Filial-Performance analysieren
3. HTML-Reports generieren mit Rankings und Tabellen

WENN User PDF-Analyse anfordert:
- Extrahiere Daten aus der PDF
- Analysiere Filial-Performance, Umsatz, Retouren
- Generiere strukturierten HTML-Report zum Download
- Gib konkrete Optimierungsvorschläge

REPORT-STRUKTUR:
- KPIs (Filialen, Umsatz, Retouren, Leistung)
- Top/Bottom Rankings
- Detailtabelle aller Filialen
- Optimierungsvorschläge`;

const ALEX_SYSTEM = `Du bist Alex, die Catering- und Event-Spezialistin der Beck Maier & Co AG. Du hast Zugriff auf:
1. Shop-Produkte mit echten Preisen
2. OneDrive Daten aus dem Catering-Ordner

WENN Catering-Anfrage: Frag (falls nötig) Anzahl Personen, Anlass, Budget, Tageszeit, Niveau. Erstelle dann professionelle Offerte.`;

const LEON_SYSTEM = `${GLOBAL_CONTEXT}
Du bist Leon, zentrale Ansprechsperson und Orchestrator. Du antwortest auf ALLE Fragen.
ROUTING: catering/offerte/event → Alex | kosten/controlling/analyse → Lorena | filiale/performance → Sabrina | reklamation/brief → Mirjam | SONST → du`;

type AgentConfig = {
  id: string;
  name: string;
  role: string;
  animal: string;
  accent: string;
  image: string;
  systemPrompt: string;
  useShopData?: boolean;
  useOneDrive?: boolean;
  canGenerateReports?: boolean;
  reportType?: string;
};

const AGENTS: { [key: string]: AgentConfig } = {
  orchestrator: { id: "orchestrator", name: "Leon", role: "Orchestrator", animal: "Löwe", accent: "#D4A574", image: "/leon.png", systemPrompt: LEON_SYSTEM },
  catering: { id: "catering", name: "Alex", role: "Catering & Events", animal: "Eichhörnchen-Dame", accent: "#C4A87C", image: "/Alex.png", systemPrompt: ALEX_SYSTEM, useShopData: true, useOneDrive: true },
  controlling: { id: "controlling", name: "Lorena", role: "Controlling", animal: "Füchsin", accent: "#8B7355", image: "/lorena.png", systemPrompt: LORENA_SYSTEM, useOneDrive: true, canGenerateReports: true, reportType: "controlling" },
  filialen: { id: "filialen", name: "Sabrina", role: "Filialmanagement", animal: "Reh-Dame", accent: "#A89968", image: "/sabrina.png", systemPrompt: SABRINA_SYSTEM, useOneDrive: true, canGenerateReports: true, reportType: "filialmanagement" },
  admin: { id: "admin", name: "Mirjam", role: "Administration", animal: "Hasen-Dame", accent: "#B8956A", image: "/mirjam.png", systemPrompt: `${GLOBAL_CONTEXT}Du bist Mirjam, Administration- und Kommunikations-Spezialistin.`, useOneDrive: true },
};

const CORRECT_PASSWORD = "BeckMaier2024";

export default function AgentSystem() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [routingInfo, setRoutingInfo] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [shopData, setShopData] = useState<any[]>([]);
  const [oneDriveData, setOneDriveData] = useState<{ [key: string]: any }>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!isLoggedIn) return;
    async function loadShopData() {
      try {
        const response = await fetch("/api/shop");
        const data = await response.json();
        if (data.success) setShopData(data.products);
      } catch (error) {
        console.error("Shop data error:", error);
      }
    }
    loadShopData();
  }, [isLoggedIn]);

  async function loadOneDriveData(agentId: string) {
    try {
      const response = await fetch(`/api/onedrive?agent=${agentId}`);
      const data = await response.json();
      if (data.success) {
        setOneDriveData((prev) => ({ ...prev, [agentId]: data.files }));
      }
    } catch (error) {
      console.error("OneDrive data error:", error);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loginPassword === CORRECT_PASSWORD) {
      setIsLoggedIn(true);
      setLoginPassword("");
      setLoginError("");
    } else {
      setLoginError("Passwort ist falsch. Bitte versuchen Sie es erneut.");
      setLoginPassword("");
    }
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setMessages([]);
    setConversationHistory([]);
    setLoginPassword("");
    setLoginError("");
  }

  function routeMessage(text: string) {
    const t = text.toLowerCase();
    const catering = ["catering", "offerte", "event", "hochzeit", "geburtstag", "apéro"];
    const controlling = ["umsatz", "kosten", "budget", "controlling", "analyse", "kostenanalyse", "kennzahl"];
    const filialen = ["filiale", "standort", "food waste", "performance", "filialanalyse"];
    const admin = ["reklamation", "dokument", "vorlage", "brief"];

    const scoreC = catering.filter((w) => t.includes(w)).length;
    const scoreF = controlling.filter((w) => t.includes(w)).length;
    const scoreL = filialen.filter((w) => t.includes(w)).length;
    const scoreA = admin.filter((w) => t.includes(w)).length;

    if (scoreC >= 1 && scoreC >= scoreF && scoreC >= scoreL && scoreC >= scoreA)
      return { agent: "catering", grund: "Weiterleitung zu Alex (Catering & Events)" };
    if (scoreF >= 1 && scoreF > scoreC && scoreF > scoreL && scoreF > scoreA)
      return { agent: "controlling", grund: "Weiterleitung zu Lorena (Controlling)" };
    if (scoreL >= 1 && scoreL > scoreC && scoreL > scoreF && scoreL > scoreA)
      return { agent: "filialen", grund: "Weiterleitung zu Sabrina (Filialmanagement)" };
    if (scoreA >= 1 && scoreA > scoreC && scoreA > scoreF && scoreA > scoreL)
      return { agent: "admin", grund: "Weiterleitung zu Mirjam (Administration)" };

    return { agent: "orchestrator", grund: null };
  }

  async function callClaude(systemPrompt: string, history: any[], agentId: string) {
    let enhancedPrompt = systemPrompt;
    const agent = AGENTS[agentId];

    if (agent?.useShopData && shopData.length > 0) {
      enhancedPrompt += `\n\nSHOP-PRODUKTE:\n${JSON.stringify(shopData.slice(0, 20), null, 2)}`;
    }

    if (agent?.useOneDrive && oneDriveData[agentId]) {
      enhancedPrompt += `\n\nONEDRIVE DATEIEN:\n`;
      oneDriveData[agentId].forEach((file: any) => {
        enhancedPrompt += `\n[${file.name}]: ${file.content.substring(0, 800)}\n`;
      });
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt: enhancedPrompt, messages: history }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.content;
  }

  async function generateReport(agentId: string, pdfContent: string) {
    const agent = AGENTS[agentId];
    if (!agent?.canGenerateReports) return null;

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfContent,
          reportType: agent.reportType,
          agentName: agent.name,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Report generation error:", error);
      return null;
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    const updatedHistory = [...conversationHistory, { role: "user", content: userText }];

    try {
      const routing = routeMessage(userText);
      setActiveAgent(routing.agent);
      if (routing.grund) setRoutingInfo(routing.grund);

      const agent = AGENTS[routing.agent];

      if (agent?.useOneDrive && !oneDriveData[routing.agent]) {
        await loadOneDriveData(routing.agent);
      }

      const answer = await callClaude(agent.systemPrompt, updatedHistory, routing.agent);

      setConversationHistory([...updatedHistory, { role: "assistant", content: answer }]);
      
      // Check if report should be generated
      let reportData = null;
      if (agent?.canGenerateReports && oneDriveData[routing.agent]?.length > 0) {
        const pdfContent = oneDriveData[routing.agent].map((f: any) => `${f.name}: ${f.content}`).join("\n\n");
        reportData = await generateReport(routing.agent, pdfContent);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answer, agent: routing.agent, grund: routing.grund, reportData },
      ]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Fehler: ${err.message}`, agent: "error" }]);
    }

    setLoading(false);
    setActiveAgent(null);
    setRoutingInfo(null);
  }

  function handleClear() {
    setMessages([]);
    setConversationHistory([]);
  }

  function handleDownloadReport(reportData: any) {
    const blob = new Blob([reportData.html], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = reportData.filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!isLoggedIn) {
    return (
      <div style={s.loginRoot}>
        <div style={s.loginContainer}>
          <img src="/beck-maier-logo.png" alt="Beck Maier Logo" style={{ height: 80, objectFit: "contain", marginBottom: "20px" }} />
          <div style={s.loginTitle}>Beck Maier & Co AG</div>
          <div style={s.loginSubtitle}>KI-Agentensystem</div>
          <form onSubmit={handleLogin} style={s.loginForm}>
            <label style={s.loginLabel}>Passwort eingeben:</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Passwort" style={s.loginInput} autoFocus />
            {loginError && <div style={s.loginError}>{loginError}</div>}
            <button type="submit" style={s.loginButton}>Anmelden</button>
          </form>
        </div>
      </div>
    );
  }

  const specialists = Object.values(AGENTS).filter((a) => a.id !== "orchestrator");

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={s.headerContent}>
          <img src="/beck-maier-logo.png" alt="Beck Maier Logo" style={{ height: 50, objectFit: "contain" }} />
          <div style={s.headerText}>
            <div style={s.headerTitle}>Beck Maier & Co AG</div>
            <div style={s.tagline}>Gut, Gesund, Genial</div>
            <div style={s.headerSub}>KI-Agentensystem + Reports</div>
          </div>
        </div>
        <div style={s.teamRow}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", border: `2px solid #D4C5B9`, background: "#F5F1EB", minWidth: "150px" }}>
            <img src={AGENTS.orchestrator.image} alt="Leon" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `2px solid #D4A574` }} />
            <div>
              <div style={{ fontWeight: "700", fontSize: "14px", color: "#3D3D3D" }}>{AGENTS.orchestrator.name}</div>
              <div style={{ fontSize: "11px", color: "#8B6F47" }}>{AGENTS.orchestrator.role}</div>
            </div>
          </div>
          <div style={{ width: "1px", height: "70px", background: "#D4C5B9", margin: "0 8px" }} />
          {specialists.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", border: `2px solid #D4C5B9`, background: "#F5F1EB", minWidth: "150px" }}>
              <img src={a.image} alt={a.name} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `2px solid ${a.accent}` }} />
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "#3D3D3D" }}>{a.name}</div>
                <div style={{ fontSize: "11px", color: "#8B6F47" }}>{a.role}</div>
              </div>
            </div>
          ))}
          <button style={s.logoutBtn} onClick={handleLogout}>Abmelden</button>
        </div>
      </div>

      {conversationHistory.length > 0 && (
        <div style={s.memoryBar}>
          <span style={s.memoryDot} />
          <span style={s.memoryText}>{Math.floor(conversationHistory.length / 2)} Nachrichten</span>
          <button style={s.clearBtn} onClick={handleClear}>Neu starten</button>
        </div>
      )}

      <div style={s.messages}>
        {messages.length === 0 && (
          <div style={s.empty}>
            <img src="/leon.png" alt="Leon" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "4px solid #D4A574" }} />
            <div style={s.emptyTitle}>Willkommen bei Leon</div>
            <div style={s.emptySub}>Mit OneDrive-Integration und automatischen HTML-Reports für Lorena und Sabrina.</div>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.role === "user") {
            return (
              <div key={i} style={s.userRow}>
                <div style={s.userBubble}>{msg.text}</div>
              </div>
            );
          }
          const ag = AGENTS[msg.agent];
          return (
            <div key={i} style={s.assistantRow}>
              {ag && (
                <div style={s.agentHeader}>
                  <img src={ag.image} alt={ag.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid ${ag.accent}` }} />
                  <div>
                    <span style={{ ...s.agentName, color: ag.accent }}>{ag.name}</span>
                    <span style={s.agentRole}> · {ag.role}</span>
                    {msg.grund && <div style={s.agentGrund}>{msg.grund}</div>}
                  </div>
                </div>
              )}
              <div style={{ ...s.assistantBubble, borderLeftColor: ag?.accent || "#8B6F47" }}>
                {msg.text.split("\n").map((line: string, j: number) => (
                  <span key={j}>
                    {line}
                    {j < msg.text.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </div>
              {msg.reportData && (
                <button
                  onClick={() => handleDownloadReport(msg.reportData)}
                  style={{ marginTop: "10px", padding: "8px 16px", background: ag?.accent, color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                >
                  📥 Report downloaden: {msg.reportData.filename}
                </button>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={s.assistantRow}>
            <div style={s.agentHeader}>
              <img src={AGENTS[activeAgent || "orchestrator"].image} alt="Agent" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid ${AGENTS[activeAgent || "orchestrator"].accent}` }} />
              <div>
                <span style={{ fontWeight: "700", fontSize: "15px", color: AGENTS[activeAgent || "orchestrator"].accent }}>{AGENTS[activeAgent || "orchestrator"].name}</span>
                {routingInfo && <div style={s.agentGrund}>{routingInfo}</div>}
              </div>
            </div>
            <div style={s.loadingBubble}>
              <span style={s.dot} /><span style={{ ...s.dot, animationDelay: "0.2s" }} /><span style={{ ...s.dot, animationDelay: "0.4s" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={s.inputArea}>
        <textarea style={s.textarea} placeholder="Stellen Sie Ihre Frage an Leon..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={2} />
        <button style={{ ...s.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }} onClick={handleSend} disabled={loading || !input.trim()}>↑</button>
      </div>
    </div>
  );
}

const COLORS = { primary: "#8B6F47", accent: "#D4A574", light: "#F5F1EB", text: "#3D3D3D", border: "#D4C5B9", background: "#FAFAF8" };

const s = {
  loginRoot: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: COLORS.background, fontFamily: "Georgia, serif" },
  loginContainer: { background: "white", padding: "40px 60px", borderRadius: "16px", border: `3px solid ${COLORS.accent}`, textAlign: "center" as const, maxWidth: "400px" },
  loginTitle: { fontSize: "24px", fontWeight: "700", color: COLORS.primary, marginBottom: "4px" },
  loginSubtitle: { fontSize: "14px", color: COLORS.text, marginBottom: "30px", opacity: 0.8 },
  loginForm: { display: "flex", flexDirection: "column" as const, gap: "16px" },
  loginLabel: { fontSize: "14px", color: COLORS.text, fontWeight: "600", textAlign: "left" as const },
  loginInput: { padding: "12px 14px", border: `2px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "16px", fontFamily: "Georgia, serif", color: COLORS.text, background: COLORS.light },
  loginError: { color: "#c62828", fontSize: "13px", fontWeight: "600" },
  loginButton: { padding: "12px 24px", background: COLORS.primary, color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer" },
  root: { display: "flex", flexDirection: "column" as const, height: "100vh", background: COLORS.background, color: COLORS.text, fontFamily: "Georgia, serif", fontSize: "16px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: `3px solid ${COLORS.accent}`, background: "white", flexWrap: "wrap" as const, gap: "20px" },
  headerContent: { display: "flex", alignItems: "center", gap: "16px" },
  headerText: { display: "flex", flexDirection: "column" as const, gap: "2px" },
  headerTitle: { fontWeight: "700", fontSize: "20px", color: COLORS.primary },
  tagline: { fontSize: "12px", color: COLORS.accent, fontStyle: "italic" },
  headerSub: { fontSize: "12px", color: COLORS.text, opacity: 0.6 },
  teamRow: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" as const },
  logoutBtn: { background: "white", border: `2px solid ${COLORS.border}`, borderRadius: "8px", color: COLORS.primary, padding: "8px 16px", fontSize: "12px", cursor: "pointer", fontWeight: "600" },
  memoryBar: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 28px", background: COLORS.light, borderBottom: `1px solid ${COLORS.border}`, fontSize: "13px" },
  memoryDot: { width: "8px", height: "8px", background: COLORS.accent, borderRadius: "50%", display: "inline-block" },
  memoryText: { color: COLORS.text, opacity: 0.7 },
  clearBtn: { background: "white", border: `1px solid ${COLORS.border}`, borderRadius: "6px", color: COLORS.primary, padding: "4px 12px", fontSize: "12px", cursor: "pointer", fontWeight: "600" },
  messages: { flex: 1, overflowY: "auto" as const, padding: "32px", display: "flex", flexDirection: "column" as const, gap: "28px" },
  empty: { margin: "auto", textAlign: "center" as const, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "16px" },
  emptyTitle: { fontSize: "28px", fontWeight: "700", color: COLORS.primary },
  emptySub: { color: COLORS.text, lineHeight: "1.8", fontSize: "15px", opacity: 0.8 },
  userRow: { display: "flex", justifyContent: "flex-end" },
  userBubble: { maxWidth: "75%", background: COLORS.primary, borderRadius: "16px 16px 4px 16px", padding: "14px 18px", lineHeight: "1.7", color: "white", fontSize: "15px" },
  assistantRow: { display: "flex", flexDirection: "column" as const, gap: "10px", maxWidth: "82%" },
  agentHeader: { display: "flex", alignItems: "flex-start", gap: "12px" },
  agentName: { fontWeight: "700", fontSize: "15px" },
  agentRole: { color: COLORS.text, fontSize: "13px", opacity: 0.7 },
  agentGrund: { color: COLORS.text, fontSize: "12px", marginTop: "3px", fontStyle: "italic", opacity: 0.6 },
  assistantBubble: { background: COLORS.light, border: `2px solid ${COLORS.border}`, borderLeft: "4px solid", borderRadius: "4px 16px 16px 16px", padding: "14px 18px", lineHeight: "1.8", color: COLORS.text, fontSize: "15px" },
  loadingBubble: { background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: "16px", padding: "16px 20px", display: "flex", gap: "8px", alignItems: "center", width: "fit-content" },
  dot: { width: "8px", height: "8px", background: COLORS.accent, borderRadius: "50%", display: "inline-block", animation: "blink 1.2s infinite ease-in-out" },
  inputArea: { padding: "18px 28px", borderTop: `3px solid ${COLORS.accent}`, background: "white", display: "flex", gap: "14px", alignItems: "flex-end" },
  textarea: { flex: 1, background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: "12px", padding: "12px 16px", color: COLORS.text, fontSize: "16px", lineHeight: "1.6", maxHeight: "140px" },
  sendBtn: { width: "48px", height: "48px", background: COLORS.primary, color: "white", border: "none", borderRadius: "12px", fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" },
};
