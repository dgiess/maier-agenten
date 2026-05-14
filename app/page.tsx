"use client";

import { useState, useRef, useEffect } from "react";

const GLOBAL_CONTEXT = `
Du arbeitest als internes KI-System der Rolf Maier & Co AG — ein Schweizer Bäckerei-, Konditorei-, Confiserie- und Gastro-Unternehmen mit Produktionsbetrieb, mehreren Verkaufsfilialen und Café-/Gastronomiebereichen.

KOMMUNIKATIONSREGELN (immer einhalten):
- Schweizer Hochdeutsch — niemals ß verwenden, stattdessen ss
- Kurze, klare, präzise Aussagen
- Keine Floskeln, kein übertriebenes KI-Sprachmuster
- Professionell, sachlich, direkt
- Konkrete Handlungsvorschläge statt vager Empfehlungen
`;

const LEON_SYSTEM = `${GLOBAL_CONTEXT}
Du bist Leon, die zentrale Ansprechsperson und Orchestrator des KI-Unternehmenssystems. Du antwortest auf ALLE Fragen.

WENN es eine ALLGEMEINE oder TEAM-FRAGE ist:
- "Wer ist Lorena?" → Du antwortest selbst: "Lorena ist unsere Controlling-Spezialistin. Sie analysiert Finanzen, Kennzahlen, Kostenentwicklungen..."
- "Was macht Sabrina?" → Du antwortest: "Sabrina ist für Filialmanagement zuständig. Sie analysiert operative Themen, Food Waste..."
- "Was sind eure Skills?" → Du antwortest mit Übersicht aller 4 Agenten
- "Wie funktioniert das System?" → Du erklärst die Architektur
- "Hallo" / "Guten Tag" → Du begrüsst freundlich
- "Wer bist du?" → Du stellst dich vor

WENN es eine SPEZIFISCHE FACHFRAGE ist:
- "Analysier unseren Food Waste" → Du antwortest: "Das ist eine operative Frage für Sabrina. Ich leite dich weiter: Sabrina, bitte analysiere..."
- "Erstell eine Reklamationsvorlage" → Du antwortest: "Das ist für Mirjam. Ich verbinde dich: Mirjam, erstelle bitte..."
- "Wie ist unsere Kostenentwicklung?" → Du antwortest: "Das analysiert Lorena. Lorena, bitte analysiere die Kostenentwicklung..."
- "Was ist mit den Umsatzzahlen?" → Zu Lorena
- "Performance einer Filiale?" → Zu Sabrina

DEIN TEAM:
- Lorena (Controlling): Finanzen, Kennzahlen, Kostenentwicklungen, Umsatzanalysen, EBITDA, Filialvergleiche
- Sabrina (Filialmanagement): Operative Themen, Food Waste, Servicequalität, Kundenfeedback, Performance
- Mirjam (Administration): Kommunikation, Reklamationen, Briefe, Dokumente, Kundenanliegen

ENTSCHEIDUNGSLOGIK:
- Keywords wie "umsatz", "kosten", "budget", "marge", "zahlen", "finanzen" → Lorena
- Keywords wie "filiale", "standort", "food waste", "performance", "kundenfeedback" → Sabrina
- Keywords wie "reklamation", "brief", "dokument", "kommunikation", "schreiben" → Mirjam
- ALLES ANDERE → Du antwortest selbst

WICHTIG: Du bist die Ansprechsperson. Nur wenn SPEZIFISCHE FACHFRAGEN kommen, leitest du weiter. Bei Unklarheit → selbst antworten.

ZIEL: Zentrale Koordination, Team entlasten, Fragen richtig verteilen.`;

const AGENTS = {
  orchestrator: {
    id: "orchestrator",
    name: "Leon",
    role: "Orchestrator",
    animal: "Löwe",
    accent: "#D4A574",
    image: "/leon.png",
    systemPrompt: LEON_SYSTEM,
  },
  controlling: {
    id: "controlling",
    name: "Lorena",
    role: "Controlling",
    animal: "Füchsin",
    accent: "#8B7355",
    image: "/lorena.png",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Lorena, der analytische Finanz- und Kennzahlen-Spezialist. Du unterstützt bei betriebswirtschaftlichen Analysen, Kennzahleninterpretationen, Risikoerkennung, Kostenkontrolle, Filialvergleichen.

FACHKOMPETENZEN:
Finanzanalysen: Umsatzanalysen, Margenanalysen, EBITDA, Kostenentwicklungen, Warenaufwand, Personalkosten
Filialvergleiche: Performance-Vergleiche, Abweichungsanalysen, Trendbetrachtungen
Schweizer Rechnungswesen: Bilanzlogik, Erfolgsrechnung, Mehrwertsteuer, Vorsteuer
Gastronomie-Logik: Filialstrukturen, Take-Away vs. Café, Food Waste, Margenprobleme

ARBEITSWEISE: Analytisch, kritisch, faktenbasiert, wirtschaftlich orientiert. Zahlen hinterfragen, Risiken klar benennen.

ZIEL: Transparenz schaffen, Risiken früh erkennen, Entscheidungen vorbereiten.`,
  },
  filialen: {
    id: "filialen",
    name: "Sabrina",
    role: "Filialmanagement",
    animal: "Reh-Dame",
    accent: "#A89968",
    image: "/sabrina.png",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Sabrina, Spezialistin für Filialperformance, operative Abläufe, Standortanalysen, Kundenfeedback.

FACHKOMPETENZEN:
Filialanalysen: Umsatzentwicklungen, Performance-Vergleiche, Filialbewertungen
Operative Themen: Servicequalität, Wartezeiten, Kundenfeedback, Food Waste, Sortimentsprobleme
Kundenfeedback: Google-Bewertungen analysieren, Reklamationen auswerten, Stimmungsbilder erfassen

ARBEITSWEISE: Praxisorientiert, analytisch, lösungsorientiert, kundenorientiert. Operativ, wirtschaftlich, pragmatisch.

ZIEL: Filialen verbessern, Prozesse optimieren, Kundenzufriedenheit erhöhen.`,
  },
  admin: {
    id: "admin",
    name: "Mirjam",
    role: "Administration",
    animal: "Hasen-Dame",
    accent: "#B8956A",
    image: "/mirjam.png",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Mirjam, Spezialistin für Administration, Kommunikation, Organisation, Dokumente, Kundenanliegen.

FACHKOMPETENZEN:
Kommunikation: Kundenantworten, Reklamationen, Briefe, Lieferantenmails, interne Kommunikation
Administration: Dokumentenmanagement, organisatorische Unterstützung, Aufbereitung von Informationen
Kundenservice: Professionelle Antworten, lösungsorientierte Kommunikation, kundenfreundlich

REKLAMATIONSLOGIK: Verständnis zeigen, sachlich bleiben, lösungsorientiert antworten. Keine Schuldeingeständnisse.

SPRACHE: Schweizer Hochdeutsch, niemals ß, klare Sprache, kurze und verständliche Sätze.

ZIEL: Administration entlasten, Kommunikation vereinheitlichen, Professionalität erhöhen.`,
  },
};

export default function AgentSystem() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [routingInfo, setRoutingInfo] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function routeMessage(text: string) {
    const t = text.toLowerCase();
    const controlling = ["umsatz","kosten","budget","marge","kennzahl","zahlen","gewinn","verlust","abweichung","finanzen","controlling","wirtschaftlich","einnahmen","ausgaben","rechnung","preis","tarif","analyse","ebitda"];
    const filialen = ["filiale","standort","filialen","personal","öffnungszeit","sortiment","café","produktion","mitarbeiter","schicht","verkauf","laden","geschäft","performance","kundenfeedback","food waste"];
    const admin = ["reklamation","dokument","vorlage","brief","kommunikation","termin","organisation","ablauf","digitalisierung","prozess","email","e-mail","schreiben","formulierung"];

    const scoreC = controlling.filter((w) => t.includes(w)).length;
    const scoreF = filialen.filter((w) => t.includes(w)).length;
    const scoreA = admin.filter((w) => t.includes(w)).length;

    // Nur weiterleiten wenn MINDESTENS 1 Keyword gefunden wird
    if (scoreC >= 1 && scoreC > scoreF && scoreC > scoreA)
      return { agent: "controlling", shouldRoute: true, grund: "Weiterleitung zu Lorena (Controlling)" };
    if (scoreF >= 1 && scoreF > scoreC && scoreF > scoreA)
      return { agent: "filialen", shouldRoute: true, grund: "Weiterleitung zu Sabrina (Filialmanagement)" };
    if (scoreA >= 1 && scoreA > scoreC && scoreA > scoreF)
      return { agent: "admin", shouldRoute: true, grund: "Weiterleitung zu Mirjam (Administration)" };
    
    // ALLES ANDERE → Leon antwortet
    return { agent: "orchestrator", shouldRoute: false, grund: null };
  }

  async function callClaude(systemPrompt: string, history: any[]) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, messages: history }),
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
    setActiveAgent(null);
    setRoutingInfo(null);

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    const updatedHistory = [...conversationHistory, { role: "user", content: userText }];

    try {
      const routing = routeMessage(userText);
      setActiveAgent(routing.agent);
      if (routing.grund) setRoutingInfo(routing.grund);

      const agent = AGENTS[routing.agent as keyof typeof AGENTS];
      const answer = await callClaude(agent.systemPrompt, updatedHistory);

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

  const specialists = Object.values(AGENTS).filter((a) => a.id !== "orchestrator");

  return (
    <div style={s.root}>
      {/* Header */}
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
        </div>
      </div>

      {/* Memory bar */}
      {conversationHistory.length > 0 && (
        <div style={s.memoryBar}>
          <span style={s.memoryDot} />
          <span style={s.memoryText}>
            {Math.floor(conversationHistory.length / 2)} Nachrichten im Gedächtnis
          </span>
          <button style={s.clearBtn} onClick={handleClear}>
            Neu starten
          </button>
        </div>
      )}

      {/* Messages */}
      <div style={s.messages}>
        {messages.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>
              <img src="/leon.png" alt="Leon" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "4px solid #D4A574" }} />
            </div>
            <div style={s.emptyTitle}>Willkommen bei Leon</div>
            <div style={s.emptySub}>
              Ich bin Ihre zentrale Ansprechsperson. Ich beantwortete Ihre Fragen direkt oder leite Sie an das spezialisierte Team weiter.
            </div>
            <div style={s.exampleGrid}>
              {[
                "Wer ist Lorena und was macht sie?",
                "Wie entwickelt sich unser Food Waste diese Woche?",
                "Kannst du eine Reklamationsvorlage erstellen?",
              ].map((ex) => (
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
          const ag = msg.agent && AGENTS[msg.agent as keyof typeof AGENTS];
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
          const ag = activeAgent && AGENTS[activeAgent as keyof typeof AGENTS] ? AGENTS[activeAgent as keyof typeof AGENTS] : AGENTS.orchestrator;
          return (
            <div style={s.assistantRow}>
              <div style={s.agentHeader}>
                <img src={ag.image} alt={ag.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid ${ag.accent}` }} />
                <div>
                  <span style={{ ...s.agentName, color: ag.accent }}>{ag.name}</span>
                  <span style={s.agentRole}>{activeAgent !== "orchestrator" ? ` · ${ag.role}` : " · analysiert..."}</span>
                  {routingInfo && <div style={s.agentGrund}>{routingInfo}</div>}
                </div>
              </div>
              <div style={s.loadingBubble}>
                <span style={s.dot} />
                <span style={{ ...s.dot, animationDelay: "0.2s" }} />
                <span style={{ ...s.dot, animationDelay: "0.4s" }} />
              </div>
            </div>
          );
        })()}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={s.inputArea}>
        <textarea style={s.textarea} placeholder="Stellen Sie Ihre Frage an Leon..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={2} />
        <button style={{ ...s.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1, cursor: loading || !input.trim() ? "not-allowed" : "pointer" }} onClick={handleSend} disabled={loading || !input.trim()}>
          ↑
        </button>
      </div>
    </div>
  );
}

function TeamCard({ agent, isActive }: { agent: (typeof AGENTS)[keyof typeof AGENTS]; isActive: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", border: `2px solid ${isActive ? agent.accent : "#D4C5B9"}`, background: isActive ? `${agent.accent}15` : "#F5F1EB", transform: isActive ? "scale(1.05)" : "scale(1)", transition: "all 0.25s ease", minWidth: "150px" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img src={agent.image} alt={agent.name} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `2px solid ${agent.accent}` }} />
        {isActive && <div style={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: agent.accent, border: "2px solid white" }} />}
      </div>
      <div>
        <div style={{ fontWeight: "700", fontSize: "14px", color: isActive ? agent.accent : "#3D3D3D", transition: "color 0.2s" }}>{agent.name}</div>
        <div style={{ fontSize: "11px", color: "#8B6F47", fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}>{agent.role}</div>
        <div style={{ fontSize: "10px", color: "#3D3D3D", fontStyle: "italic", opacity: 0.7 }}>{agent.animal}</div>
      </div>
    </div>
  );
}

// Styles mit Beck Maier Design
const COLORS = {
  primary: "#8B6F47",
  accent: "#D4A574",
  light: "#F5F1EB",
  text: "#3D3D3D",
  border: "#D4C5B9",
  background: "#FAFAF8",
};

const s = {
  root: { display: "flex", flexDirection: "column" as const, height: "100vh", background: COLORS.background, color: COLORS.text, fontFamily: "Georgia, 'Crimson Text', serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "16px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: `3px solid ${COLORS.accent}`, background: "white", flexWrap: "wrap" as const, gap: "20px" },
  headerContent: { display: "flex", alignItems: "center", gap: "16px" },
  headerText: { display: "flex", flexDirection: "column" as const, gap: "2px" },
  headerTitle: { fontWeight: "700", fontSize: "20px", color: COLORS.primary, fontFamily: "Georgia, serif" },
  tagline: { fontSize: "12px", color: COLORS.accent, fontFamily: "Georgia, serif", fontStyle: "italic", letterSpacing: "0.1em" },
  headerSub: { fontSize: "12px", color: COLORS.text, fontFamily: "'Courier New', monospace", opacity: 0.6 },
  teamRow: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" as const },
  divider: { width: "1px", height: "70px", background: COLORS.border, margin: "0 8px" },
  memoryBar: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 28px", background: COLORS.light, borderBottom: `1px solid ${COLORS.border}`, fontSize: "13px", fontFamily: "'Courier New', monospace" },
  memoryDot: { width: "8px", height: "8px", background: COLORS.accent, borderRadius: "50%", display: "inline-block" },
  memoryText: { color: COLORS.text, opacity: 0.7 },
  clearBtn: { background: "white", border: `1px solid ${COLORS.border}`, borderRadius: "6px", color: COLORS.primary, padding: "4px 12px", fontSize: "12px", cursor: "pointer", fontFamily: "'Courier New', monospace", fontWeight: "600", transition: "all 0.2s" },
  messages: { flex: 1, overflowY: "auto" as const, padding: "32px", display: "flex", flexDirection: "column" as const, gap: "28px" },
  empty: { margin: "auto", textAlign: "center" as const, maxWidth: "500px", padding: "40px 0", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "16px" },
  emptyIcon: { fontSize: "48px" },
  emptyTitle: { fontSize: "28px", fontWeight: "700", color: COLORS.primary, fontFamily: "Georgia, serif" },
  emptySub: { color: COLORS.text, lineHeight: "1.8", fontSize: "15px", opacity: 0.8 },
  exampleGrid: { display: "flex", flexDirection: "column" as const, gap: "10px", width: "100%", marginTop: "16px" },
  example: { padding: "14px 18px", background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: "10px", cursor: "pointer", color: COLORS.text, fontSize: "14px", textAlign: "left" as const, transition: "all 0.2s" },
  userRow: { display: "flex", justifyContent: "flex-end" },
  userBubble: { maxWidth: "75%", background: COLORS.primary, border: "none", borderRadius: "16px 16px 4px 16px", padding: "14px 18px", lineHeight: "1.7", color: "white", fontSize: "15px" },
  assistantRow: { display: "flex", flexDirection: "column" as const, gap: "10px", maxWidth: "82%" },
  agentHeader: { display: "flex", alignItems: "flex-start", gap: "12px" },
  agentName: { fontWeight: "700", fontSize: "15px", fontFamily: "Georgia, serif" },
  agentRole: { color: COLORS.text, fontSize: "13px", fontFamily: "'Courier New', monospace", opacity: 0.7 },
  agentGrund: { color: COLORS.text, fontSize: "12px", marginTop: "3px", fontStyle: "italic", opacity: 0.6 },
  assistantBubble: { background: COLORS.light, border: `2px solid ${COLORS.border}`, borderLeft: "4px solid", borderRadius: "4px 16px 16px 16px", padding: "14px 18px", lineHeight: "1.8", color: COLORS.text, fontSize: "15px" },
  loadingBubble: { background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: "16px", padding: "16px 20px", display: "flex", gap: "8px", alignItems: "center", width: "fit-content" },
  dot: { width: "8px", height: "8px", background: COLORS.accent, borderRadius: "50%", display: "inline-block", animation: "blink 1.2s infinite ease-in-out" },
  inputArea: { padding: "18px 28px", borderTop: `3px solid ${COLORS.accent}`, background: "white", display: "flex", gap: "14px", alignItems: "flex-end" },
  textarea: { flex: 1, background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: "12px", padding: "12px 16px", color: COLORS.text, fontSize: "16px", lineHeight: "1.6", maxHeight: "140px", fontFamily: "Georgia, serif", fontWeight: "500" },
  sendBtn: { width: "48px", height: "48px", background: COLORS.primary, color: "white", border: "none", borderRadius: "12px", fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0, cursor: "pointer" },
};
