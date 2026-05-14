"use client";

import { useState, useRef, useEffect } from "react";

const GLOBAL_CONTEXT = `
Du arbeitest als internes KI-System der Rolf Maier & Co AG — ein Schweizer Bäckerei-, Konditorei-, Confiserie- und Gastro-Unternehmen.

KOMMUNIKATIONSREGELN (immer einhalten):
- Schweizer Hochdeutsch — niemals ß verwenden, stattdessen ss
- Kurze, klare, präzise Aussagen
- Professionell, sachlich, direkt
`;

const ALEX_SYSTEM = `Du bist Alex, die Catering- und Event-Spezialistin der Beck Maier & Co AG. Du hast Zugriff auf:
1. Shop-Produkte mit echten Preisen
2. OneDrive Daten aus dem Catering-Ordner (Kundenprofile, spezielle Anfragen)

WENN Catering-Anfrage: Frag (falls nötig) Anzahl Personen, Anlass, Budget, Tageszeit, Niveau. Erstelle dann professionelle Offerte mit Markdown-Formatierung.

OFFERTEN-FORMAT:
---
📋 Offerte: [ANLASS] | [ANZAHL] Personen | [TAGESZEIT]
Herzlichen Dank für Ihre Anfrage! Hier ist mein Vorschlag:
---
💡 Variante: [NAME] (CHF [PREIS] pro Person)
Was ist enthalten:
| Produkt | Anzahl | Stückpreis | Total |
|---------|--------|-----------|-------|
| [Produkt 1] | [Menge] | CHF [X.XX] | CHF [Total] |
...
| TOTAL | | | CHF [GESAMTBETRAG] |
---
✨ Optional: 🥤 [Getränke] — CHF [X.XX], 🍰 [Dessert] — CHF [X.XX]
---
📍 Organisatorisches: Lieferung, Zeitpunkt, Aufbau, Besonderheiten
---
🎯 Nächste Schritte: Gefällt das Angebot? Gerne anpassen!
---

WICHTIG: Nutze ECHTE Shop-Produkte und Preise. Biete 2-3 Varianten. Bleib realistisch und verkaufsorientiert.`;

const LEON_SYSTEM = `${GLOBAL_CONTEXT}
Du bist Leon, zentrale Ansprechsperson und Orchestrator. Du antwortest auf ALLE Fragen.
ALLGEMEINE/TEAM-FRAGEN: Du antwortest selbst.
SPEZIFISCHE FACHFRAGEN: Du leitest weiter.

DEIN TEAM:
- Lorena (Controlling): Finanzen, Kennzahlen, Daten aus OneDrive Controlling-Ordner
- Sabrina (Filialmanagement): Operative Themen, Filial-Daten aus OneDrive
- Mirjam (Administration): Kommunikation, Vorlagen aus OneDrive Admin-Ordner
- Alex (Catering): Catering-Offerten, Shop-Daten, Kundenprofile aus OneDrive

ROUTING: catering/offerte/event → Alex | umsatz/kosten/zahlen → Lorena | filiale/food waste → Sabrina | reklamation/brief → Mirjam | SONST → du`;

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
};

const AGENTS: { [key: string]: AgentConfig } = {
  orchestrator: {
    id: "orchestrator",
    name: "Leon",
    role: "Orchestrator",
    animal: "Löwe",
    accent: "#D4A574",
    image: "/leon.png",
    systemPrompt: LEON_SYSTEM,
  },
  catering: {
    id: "catering",
    name: "Alex",
    role: "Catering & Events",
    animal: "Eichhörnchen-Dame",
    accent: "#C4A87C",
    image: "/Alex.png",
    systemPrompt: ALEX_SYSTEM,
    useShopData: true,
    useOneDrive: true,
  },
  controlling: {
    id: "controlling",
    name: "Lorena",
    role: "Controlling",
    animal: "Füchsin",
    accent: "#8B7355",
    image: "/lorena.png",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Lorena, Finanz-Spezialistin. Du analysierst Finanzen, Kennzahlen, Kostenentwicklungen mit Daten aus OneDrive.
ARBEITSWEISE: Analytisch, kritisch, faktenbasiert.
ZIEL: Transparenz, Risiken früh erkennen.`,
    useOneDrive: true,
  },
  filialen: {
    id: "filialen",
    name: "Sabrina",
    role: "Filialmanagement",
    animal: "Reh-Dame",
    accent: "#A89968",
    image: "/sabrina.png",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Sabrina, Filialmanagement-Spezialistin. Du analysierst Filialperformance, operative Themen mit Daten aus OneDrive.
ARBEITSWEISE: Praxisorientiert, analytisch, lösungsorientiert.
ZIEL: Filialen verbessern, Prozesse optimieren.`,
    useOneDrive: true,
  },
  admin: {
    id: "admin",
    name: "Mirjam",
    role: "Administration",
    animal: "Hasen-Dame",
    accent: "#B8956A",
    image: "/mirjam.png",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Mirjam, Administration- und Kommunikations-Spezialistin. Du erstellst Briefe, bearbeitest Reklamationen, verwendest Vorlagen aus OneDrive.
ARBEITSWEISE: Strukturiert, freundlich, professionell.
ZIEL: Administration entlasten, Kommunikation vereinheitlichen.`,
    useOneDrive: true,
  },
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
        if (data.success) {
          setShopData(data.products);
        }
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
        setOneDriveData((prev) => ({
          ...prev,
          [agentId]: data.files,
        }));
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
    const catering = ["catering", "offerte", "event", "hochzeit", "geburtstag", "apéro", "brunch"];
    const controlling = ["umsatz", "kosten", "budget", "marge", "kennzahl", "zahlen"];
    const filialen = ["filiale", "standort", "food waste", "performance"];
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
      enhancedPrompt += `\n\nSHOP-PRODUKTE MIT AKTUELLEN PREISEN:\n`;
      enhancedPrompt += `\`\`\`\n${JSON.stringify(shopData.slice(0, 20), null, 2)}\n\`\`\``;
    }

    if (agent?.useOneDrive && oneDriveData[agentId]) {
      enhancedPrompt += `\n\nONEDRIVE DATEN (${agentId}):\n`;
      oneDriveData[agentId].forEach((file: any) => {
        enhancedPrompt += `\n---\nDATEI: ${file.name}\n${file.content.substring(0, 1000)}\n---`;
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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answer, agent: routing.agent, grund: routing.grund },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Fehler: ${err.message}`, agent: "error" },
      ]);
    }

    setLoading(false);
    setActiveAgent(null);
    setRoutingInfo(null);
  }

  function handleClear() {
    setMessages([]);
    setConversationHistory([]);
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
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Passwort"
              style={s.loginInput}
              autoFocus
            />
            {loginError && <div style={s.loginError}>{loginError}</div>}
            <button type="submit" style={s.loginButton}>
              Anmelden
            </button>
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
            <div style={s.headerSub}>KI-Agentensystem</div>
          </div>
        </div>
        <div style={s.teamRow}>
          <TeamCard agent={AGENTS.orchestrator} isActive={loading && !activeAgent} />
          <div style={s.divider} />
          {specialists.map((a) => (
            <TeamCard key={a.id} agent={a} isActive={activeAgent === a.id} />
          ))}
          <button style={s.logoutBtn} onClick={handleLogout}>
            Abmelden
          </button>
        </div>
      </div>

      {conversationHistory.length > 0 && (
        <div style={s.memoryBar}>
          <span style={s.memoryDot} />
          <span style={s.memoryText}>{Math.floor(conversationHistory.length / 2)} Nachrichten</span>
          <button style={s.clearBtn} onClick={handleClear}>
            Neu starten
          </button>
        </div>
      )}

      <div style={s.messages}>
        {messages.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>
              <img src="/leon.png" alt="Leon" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "4px solid #D4A574" }} />
            </div>
            <div style={s.emptyTitle}>Willkommen bei Leon</div>
            <div style={s.emptySub}>Ich bin Ihre zentrale Ansprechsperson und habe Zugriff auf Shop-Daten und OneDrive-Dokumente.</div>
            <div style={s.exampleGrid}>
              {["Ich brauche Catering für 30 Personen", "Wie ist unsere aktuelle Kostenentwicklung?", "Erstelle eine Reklamationsvorlage"].map((ex) => (
                <div key={ex} style={s.example} onClick={() => setInput(ex)}>
                  {ex}
                </div>
              ))}
            </div>
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
            </div>
          );
        })}

        {loading && (() => {
          const ag = AGENTS[activeAgent || "orchestrator"];
          return (
            <div style={s.assistantRow}>
              <div style={s.agentHeader}>
                <img src={ag.image} alt={ag.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid ${ag.accent}` }} />
                <div>
                  <span style={{ ...s.agentName, color: ag.accent }}>{ag.name}</span>
                  <span style={s.agentRole}>{activeAgent !== "orchestrator" ? ` · ${ag.role}` : " · lädt Daten..."}</span>
                  {routingInfo && <div style={s.agentGrund}>{routingInfo}</div>}
                </div>
              </div>
              <div style={s.loadingBubble}>
                <span style={s.dot} /><span style={{ ...s.dot, animationDelay: "0.2s" }} /><span style={{ ...s.dot, animationDelay: "0.4s" }} />
              </div>
            </div>
          );
        })()}

        <div ref={bottomRef} />
      </div>

      <div style={s.inputArea}>
        <textarea style={s.textarea} placeholder="Stellen Sie Ihre Frage an Leon..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={2} />
        <button style={{ ...s.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }} onClick={handleSend} disabled={loading || !input.trim()}>↑</button>
      </div>
    </div>
  );
}

function TeamCard({ agent, isActive }: { agent: AgentConfig; isActive: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", border: `2px solid ${isActive ? agent.accent : "#D4C5B9"}`, background: isActive ? `${agent.accent}15` : "#F5F1EB", transform: isActive ? "scale(1.05)" : "scale(1)", transition: "all 0.25s ease", minWidth: "150px" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img src={agent.image} alt={agent.name} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `2px solid ${agent.accent}` }} />
        {isActive && <div style={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: agent.accent, border: "2px solid white" }} />}
      </div>
      <div>
        <div style={{ fontWeight: "700", fontSize: "14px", color: isActive ? agent.accent : "#3D3D3D" }}>{agent.name}</div>
        <div style={{ fontSize: "11px", color: "#8B6F47", fontFamily: "Georgia, serif" }}>{agent.role}</div>
        <div style={{ fontSize: "10px", color: "#3D3D3D", fontStyle: "italic", opacity: 0.7 }}>{agent.animal}</div>
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
  divider: { width: "1px", height: "70px", background: COLORS.border, margin: "0 8px" },
  memoryBar: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 28px", background: COLORS.light, borderBottom: `1px solid ${COLORS.border}`, fontSize: "13px" },
  memoryDot: { width: "8px", height: "8px", background: COLORS.accent, borderRadius: "50%", display: "inline-block" },
  memoryText: { color: COLORS.text, opacity: 0.7 },
  clearBtn: { background: "white", border: `1px solid ${COLORS.border}`, borderRadius: "6px", color: COLORS.primary, padding: "4px 12px", fontSize: "12px", cursor: "pointer", fontWeight: "600" },
  messages: { flex: 1, overflowY: "auto" as const, padding: "32px", display: "flex", flexDirection: "column" as const, gap: "28px" },
  empty: { margin: "auto", textAlign: "center" as const, maxWidth: "500px", padding: "40px 0", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "16px" },
  emptyIcon: { fontSize: "48px" },
  emptyTitle: { fontSize: "28px", fontWeight: "700", color: COLORS.primary },
  emptySub: { color: COLORS.text, lineHeight: "1.8", fontSize: "15px", opacity: 0.8 },
  exampleGrid: { display: "flex", flexDirection: "column" as const, gap: "10px", width: "100%", marginTop: "16px" },
  example: { padding: "14px 18px", background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: "10px", cursor: "pointer", color: COLORS.text, fontSize: "14px", textAlign: "left" as const },
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
