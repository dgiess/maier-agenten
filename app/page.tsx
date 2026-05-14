"use client";

import { useState, useRef, useEffect } from "react";
import { AVATARS_DATA } from "./avatars";

// ─── Beck Maier Color Palette ─────────────────────────────────────────────────
const COLORS = {
  primary: "#8B6F47",      // Warm brown
  accent: "#D4A574",       // Warm beige
  light: "#F5F1EB",        // Cream
  text: "#3D3D3D",         // Dark text
  border: "#D4C5B9",       // Light border
  background: "#FAFAF8",   // Off-white
};

// ─── Agent Config ─────────────────────────────────────────────────────────────

const GLOBAL_CONTEXT = `
Du arbeitest als internes KI-System der Rolf Maier & Co AG — ein Schweizer Bäckerei-, Konditorei-, Confiserie- und Gastro-Unternehmen mit Produktionsbetrieb, mehreren Verkaufsfilialen und Café-/Gastronomiebereichen.

KOMMUNIKATIONSREGELN (immer einhalten):
- Schweizer Hochdeutsch — niemals ß verwenden, stattdessen ss
- Kurze, klare, präzise Aussagen
- Keine Floskeln, kein übertriebenes KI-Sprachmuster
- Professionell, sachlich, direkt
- Konkrete Handlungsvorschläge statt vager Empfehlungen
`;

const AGENTS = {
  orchestrator: {
    id: "orchestrator",
    name: "Leon",
    role: "Orchestrator",
    animal: "Löwe",
    accent: "#D4A574",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Leon, die zentrale Steuerungs- und Koordinationsinstanz des KI-Unternehmenssystems. Du arbeitest wie ein Chief of Staff bzw. operativer Geschäftsführer des KI-Systems.

KERNAUFGABEN:
Aufgabenanalyse: Inhalt, Ziel, Priorität, Komplexität, betroffene Fachbereiche, Risiken, benötigte Informationen analysieren. Erkennen, welche Spezialisten benötigt werden, welche Reihenfolge sinnvoll ist, ob mehrere Agenten zusammenarbeiten müssen.

DELEGATIONSLOGIK — Zuständigkeiten:
→ Mirjam (Admin): Kommunikation, Reklamationen, Briefe, Organisation, Dokumente, interne Mitteilungen, Kundenantworten.
→ Lorena (Controlling): Zahlenanalysen, Kennzahlen, Kostenentwicklungen, Finanzthemen, Risikoanalysen, Filialvergleiche, betriebswirtschaftliche Fragen.
→ Sabrina (Filial): Operative Filialthemen, Standortprobleme, Food Waste, Servicequalität, Kundenfeedback, Prozessprobleme, Performance einzelner Standorte.

KOORDINATION MEHRERER AGENTEN: Bei mehreren betroffenen Bereichen koordinierst du Zusammenarbeit, priorisierst Teilaufgaben, führst Ergebnisse zusammen, erstellst eine Gesamtbeurteilung.

ARBEITSWEISE: Analytisch, strukturiert, logisch, priorisierend, unternehmerisch, effizient. Bereichsübergreifend, lösungsorientiert, wirtschaftlich und strategisch denken.

ENTSCHEIDUNGSLOGIK: Zusammenhänge erkennen, wichtige Themen priorisieren, Komplexität reduzieren, Risiken früh erkennen, bei Unklarheiten Rückfragen stellen. Pragmatische Lösungen bevorzugen, unnötige Komplexität vermeiden, effizient delegieren.

PRIORISIERUNG:
1. Kritische operative Probleme
2. Finanzielle Risiken
3. Kundenprobleme
4. Organisatorische Themen
5. Optimierungen
6. Strategische Weiterentwicklungen

ZIEL: KI-System steuern, Aufgaben effizient verteilen, Spezialwissen koordinieren, Entscheidungen vorbereiten, Komplexität reduzieren, die Geschäftsleitung entlasten.`,
  },
  controlling: {
    id: "controlling",
    name: "Lorena",
    role: "Controlling",
    animal: "Füchsin",
    accent: "#8B7355",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Lorena, der analytische Finanz- und Kennzahlen-Spezialist der Rolf Maier & Co AG. Du unterstützt die Geschäftsleitung bei betriebswirtschaftlichen Analysen, Kennzahleninterpretationen, Risikoerkennung, Kostenkontrolle, Filialvergleichen und Entscheidungsgrundlagen. Du arbeitest wie ein strukturierter Controller mit unternehmerischem Denken.

FACHKOMPETENZEN:
Finanzanalysen: Umsatzanalysen, Margenanalysen, EBITDA-Betrachtungen, Kostenentwicklungen, Warenaufwand, Personalkosten, Budgetabweichungen, Liquiditätsbetrachtungen.
Filialvergleiche: Performance-Vergleiche, Abweichungsanalysen, Trendbetrachtungen, Auffälligkeitserkennung, Wirtschaftlichkeitsvergleiche.
Controlling: Kennzahlen interpretieren, Risiken erkennen, Schwachstellen identifizieren, Verbesserungspotenziale aufzeigen, Management-Zusammenfassungen erstellen.

SCHWEIZER RECHNUNGSWESEN: Bilanzlogik, Erfolgsrechnung, Mehrwertsteuer, Vorsteuer, Transferkonten, Durchlaufkonten, Kreditkartenabrechnungen.

GASTRONOMIE- UND FILIALLOGIK: Filialstrukturen, Produktions- und Verkaufsprozesse, Take-Away vs. Café, Food Waste, Personalkostenlogik, Margenprobleme.

ARBEITSWEISE: Analytisch, kritisch, faktenbasiert, logisch, strukturiert, wirtschaftlich orientiert. Zahlen hinterfragen, Zusammenhänge erkennen, Auffälligkeiten priorisieren, unternehmerisch denken. Risiken klar benennen. Keine Fakten erfinden — bei fehlenden Informationen gezielt nachfragen oder Annahmen kennzeichnen.

ZIEL: Transparenz schaffen, Risiken früh erkennen, Entscheidungen vorbereiten, Analysen beschleunigen, die Geschäftsleitung entlasten.`,
  },
  filialen: {
    id: "filialen",
    name: "Sabrina",
    role: "Filialmanagement",
    animal: "Reh-Dame",
    accent: "#A89968",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Sabrina, Spezialistin für Filialperformance, operative Abläufe, Standortanalysen, Kundenfeedback, Prozessqualität und operative Optimierung der Rolf Maier & Co AG. Du unterstützt die Geschäftsleitung bei der Analyse und Verbesserung der einzelnen Standorte.

FACHKOMPETENZEN:
Filialanalysen: Umsatzentwicklungen, Performance-Vergleiche, Auffälligkeiten erkennen, Filialbewertungen, Standortvergleiche, Trendanalysen.
Operative Themen: Servicequalität, Wartezeiten, Kundenfeedback, Food Waste, Sortimentsprobleme, organisatorische Schwächen, Prozessprobleme.
Kundenfeedback & Bewertungen: Google-Bewertungen analysieren, Reklamationen auswerten, wiederkehrende Probleme erkennen, Stimmungsbilder erfassen, Verbesserungspotenziale ableiten.

BETRIEBLICHES VERSTÄNDNIS: Filialabläufe, Gastronomieprozesse, Verkaufsprozesse, Stosszeiten, Kundenverhalten, operative Herausforderungen, Personalthemen im Alltag.

ARBEITSWEISE: Praxisorientiert, analytisch, lösungsorientiert, strukturiert, kundenorientiert. Operativ, wirtschaftlich, effizient und pragmatisch denken. Probleme direkt benennen, Verbesserungsvorschläge liefern, operative Realität berücksichtigen. Keine Fakten erfinden, keine Theorien ohne Praxisbezug, keine unrealistischen Lösungen.

ZIEL: Filialen verbessern, Prozesse optimieren, Probleme früh erkennen, Kundenzufriedenheit erhöhen, operative Transparenz schaffen.`,
  },
  admin: {
    id: "admin",
    name: "Mirjam",
    role: "Administration",
    animal: "Hasen-Dame",
    accent: "#B8956A",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Mirjam, Spezialistin für Administration, Kommunikation, Organisation, Dokumente, Kundenanliegen und Reklamationen der Rolf Maier & Co AG. Du unterstützt die Geschäftsleitung bei administrativen und kommunikativen Aufgaben.

FACHKOMPETENZEN:
Kommunikation: Kundenantworten, Reklamationen, Briefe, Lieferantenmails, interne Kommunikation, Zusammenfassungen, Protokolle, Newsletter-Unterstützung.
Administration: Strukturierung von Informationen, Dokumentenmanagement, organisatorische Unterstützung, Aufbereitung von Informationen, Formulierungshilfe.
Kundenservice: Professionelle Antworten, lösungsorientierte Kommunikation, kundenfreundliche Formulierungen, schwierige Reklamationen.

REKLAMATIONSLOGIK: Verständnis zeigen, nicht defensiv reagieren, sachlich bleiben, lösungsorientiert antworten, professionell auftreten. Keine unnötigen Schuldeingeständnisse, keine emotionalen Diskussionen.

ARBEITSWEISE: Strukturiert, freundlich, professionell, effizient, lösungsorientiert. Kundenorientiert, organisatorisch, pragmatisch und unterstützend denken. Informationen ordnen, mitdenken, passende Formulierungen liefern. Keine Fakten erfinden, keine unrealistischen Zusagen, nicht unnötig kompliziert formulieren.

SPRACHE: Schweizer Hochdeutsch, niemals ß, klare Sprache, kurze und verständliche Sätze. Professionell, modern, freundlich, respektvoll, direkt, sachlich.

ZIEL: Administration entlasten, Kommunikation vereinheitlichen, Professionalität erhöhen, Zeit sparen, organisatorische Effizienz verbessern.`,
  },
};

// ─── Main App ─────────────────────────────────────────────────────────────────

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
    const controlling = [
      "umsatz","kosten","budget","marge","kennzahl","zahlen","food waste","gewinn","verlust","abweichung","finanzen","controlling","wirtschaftlich","einnahmen","ausgaben","rechnung","preis","tarif","analyse","ebitda","marge",
    ];
    const filialen = [
      "filiale","standort","filialen","personal","öffnungszeit","sortiment","café","produktion","mitarbeiter","schicht","verkauf","laden","geschäft","performance","kundenfeedback",
    ];
    const admin = [
      "reklamation","dokument","vorlage","brief","kommunikation","termin","organisation","ablauf","digitalisierung","prozess","email","e-mail","hallo","hilfe","schreiben","formulierung",
    ];

    const scoreC = controlling.filter((w) => t.includes(w)).length;
    const scoreF = filialen.filter((w) => t.includes(w)).length;
    const scoreA = admin.filter((w) => t.includes(w)).length;

    if (scoreC >= scoreF && scoreC >= scoreA && scoreC > 0)
      return { agent: "controlling", grund: "Finanzbezogene Anfrage → Lorena" };
    if (scoreF >= scoreC && scoreF >= scoreA && scoreF > 0)
      return { agent: "filialen", grund: "Filialbezogene Anfrage → Sabrina" };
    if (scoreA > 0)
      return { agent: "admin", grund: "Administrative Anfrage → Mirjam" };
    return { agent: "admin", grund: "Allgemeine Anfrage → Mirjam" };
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
      setRoutingInfo(routing.grund);

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
          <div style={s.logo}>🍰</div>
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
              <img
                src={AVATARS_DATA.leon}
                alt="Leon"
                style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: `4px solid ${COLORS.accent}` }}
              />
            </div>
            <div style={s.emptyTitle}>Willkommen bei Leon</div>
            <div style={s.emptySub}>
              Ich bin der Orchestrator. Ich leite Ihre Anfrage automatisch an Lorena, Sabrina oder Mirjam weiter.
            </div>
            <div style={s.exampleGrid}>
              {[
                "Wie entwickelt sich unser Food Waste diese Woche?",
                "Welche Filiale hat den tiefsten Umsatz im April?",
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
                  <img
                    src={AVATARS_DATA[ag.id]}
                    alt={ag.name}
                    style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid ${ag.accent}` }}
                  />
                  <div>
                    <span style={{ ...s.agentName, color: ag.accent }}>
                      {ag.name}
                    </span>
                    <span style={s.agentRole}> · {ag.role}</span>
                    {msg.grund && <div style={s.agentGrund}>{msg.grund}</div>}
                  </div>
                </div>
              )}
              <div style={{ ...s.assistantBubble, borderLeftColor: ag?.accent || COLORS.primary }}>
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
          const ag = activeAgent && AGENTS[activeAgent as keyof typeof AGENTS]
            ? AGENTS[activeAgent as keyof typeof AGENTS]
            : AGENTS.orchestrator;
          return (
            <div style={s.assistantRow}>
              <div style={s.agentHeader}>
                <img
                  src={AVATARS_DATA[ag.id]}
                  alt={ag.name}
                  style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid ${ag.accent}` }}
                />
                <div>
                  <span style={{ ...s.agentName, color: ag.accent }}>
                    {activeAgent ? ag.name : "Leon"}
                  </span>
                  <span style={s.agentRole}>
                    {activeAgent ? ` · ${ag.role}` : " · analysiert..."}
                  </span>
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
        <textarea
          style={s.textarea}
          placeholder="Stellen Sie Ihre Frage an das Team..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        <button
          style={{
            ...s.sendBtn,
            opacity: loading || !input.trim() ? 0.5 : 1,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            background: COLORS.primary,
          }}
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

function TeamCard({
  agent,
  isActive,
}: {
  agent: (typeof AGENTS)[keyof typeof AGENTS];
  isActive: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "12px",
        border: `2px solid ${isActive ? agent.accent : COLORS.border}`,
        background: isActive ? `${agent.accent}15` : COLORS.light,
        transform: isActive ? "scale(1.05)" : "scale(1)",
        transition: "all 0.25s ease",
        minWidth: "150px",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={AVATARS_DATA[agent.id]}
          alt={agent.name}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            objectFit: "cover",
            border: `2px solid ${agent.accent}`,
          }}
        />
        {isActive && (
          <div
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: agent.accent,
              border: `2px solid white`,
            }}
          />
        )}
      </div>
      <div>
        <div
          style={{
            fontWeight: "700",
            fontSize: "14px",
            color: isActive ? agent.accent : COLORS.text,
            transition: "color 0.2s",
          }}
        >
          {agent.name}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: COLORS.primary,
            fontFamily: "Georgia, serif",
            letterSpacing: "0.05em",
          }}
        >
          {agent.role}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: COLORS.text,
            fontStyle: "italic",
            opacity: 0.7,
          }}
        >
          {agent.animal}
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  root: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    background: COLORS.background,
    color: COLORS.text,
    fontFamily: "Georgia, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "16px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 28px",
    borderBottom: `3px solid ${COLORS.accent}`,
    background: "white",
    flexWrap: "wrap" as const,
    gap: "20px",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  logo: {
    fontSize: "48px",
    lineHeight: 1,
  },
  headerText: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2px",
  },
  headerTitle: {
    fontWeight: "700",
    fontSize: "20px",
    color: COLORS.primary,
    fontFamily: "Georgia, serif",
  },
  tagline: {
    fontSize: "12px",
    color: COLORS.accent,
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    letterSpacing: "0.1em",
  },
  headerSub: {
    fontSize: "12px",
    color: COLORS.text,
    fontFamily: "'Courier New', monospace",
    opacity: 0.6,
  },
  teamRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap" as const,
  },
  divider: {
    width: "1px",
    height: "70px",
    background: COLORS.border,
    margin: "0 8px",
  },
  memoryBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 28px",
    background: COLORS.light,
    borderBottom: `1px solid ${COLORS.border}`,
    fontSize: "13px",
    fontFamily: "'Courier New', monospace",
  },
  memoryDot: {
    width: "8px",
    height: "8px",
    background: COLORS.accent,
    borderRadius: "50%",
    display: "inline-block",
  },
  memoryText: {
    color: COLORS.text,
    opacity: 0.7,
  },
  clearBtn: {
    background: "white",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "6px",
    color: COLORS.primary,
    padding: "4px 12px",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  messages: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "32px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "28px",
  },
  empty: {
    margin: "auto",
    textAlign: "center" as const,
    maxWidth: "500px",
    padding: "40px 0",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "16px",
  },
  emptyIcon: {
    fontSize: "48px",
  },
  emptyTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: COLORS.primary,
    fontFamily: "Georgia, serif",
  },
  emptySub: {
    color: COLORS.text,
    lineHeight: "1.8",
    fontSize: "15px",
    opacity: 0.8,
  },
  exampleGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    width: "100%",
    marginTop: "16px",
  },
  example: {
    padding: "14px 18px",
    background: COLORS.light,
    border: `2px solid ${COLORS.border}`,
    borderRadius: "10px",
    cursor: "pointer",
    color: COLORS.text,
    fontSize: "14px",
    textAlign: "left" as const,
    transition: "all 0.2s",
  },
  userRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  userBubble: {
    maxWidth: "75%",
    background: COLORS.primary,
    border: "none",
    borderRadius: "16px 16px 4px 16px",
    padding: "14px 18px",
    lineHeight: "1.7",
    color: "white",
    fontSize: "15px",
  },
  assistantRow: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    maxWidth: "82%",
  },
  agentHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  agentName: {
    fontWeight: "700",
    fontSize: "15px",
    fontFamily: "Georgia, serif",
  },
  agentRole: {
    color: COLORS.text,
    fontSize: "13px",
    fontFamily: "'Courier New', monospace",
    opacity: 0.7,
  },
  agentGrund: {
    color: COLORS.text,
    fontSize: "12px",
    marginTop: "3px",
    fontStyle: "italic",
    opacity: 0.6,
  },
  assistantBubble: {
    background: COLORS.light,
    border: `2px solid ${COLORS.border}`,
    borderLeft: "4px solid",
    borderRadius: "4px 16px 16px 16px",
    padding: "14px 18px",
    lineHeight: "1.8",
    color: COLORS.text,
    fontSize: "15px",
  },
  loadingBubble: {
    background: COLORS.light,
    border: `2px solid ${COLORS.border}`,
    borderRadius: "16px",
    padding: "16px 20px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    width: "fit-content",
  },
  dot: {
    width: "8px",
    height: "8px",
    background: COLORS.accent,
    borderRadius: "50%",
    display: "inline-block",
    animation: "blink 1.2s infinite ease-in-out",
  },
  inputArea: {
    padding: "18px 28px",
    borderTop: `3px solid ${COLORS.accent}`,
    background: "white",
    display: "flex",
    gap: "14px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    background: COLORS.light,
    border: `2px solid ${COLORS.border}`,
    borderRadius: "12px",
    padding: "12px 16px",
    color: COLORS.text,
    fontSize: "16px",
    lineHeight: "1.6",
    maxHeight: "140px",
    fontFamily: "Georgia, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: "500",
  },
  sendBtn: {
    width: "48px",
    height: "48px",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "20px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    flexShrink: 0,
    cursor: "pointer",
  },
};
