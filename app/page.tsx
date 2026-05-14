"use client";

import { useState, useRef, useEffect } from "react";

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
    accent: "#e8c84a",
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
    accent: "#4fc3f7",
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
    accent: "#b39ddb",
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
    accent: "#81c784",
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

  // Orchestrator: regelbasiertes Routing
  function routeMessage(text: string) {
    const t = text.toLowerCase();
    const controlling = [
      "umsatz",
      "kosten",
      "budget",
      "marge",
      "kennzahl",
      "zahlen",
      "food waste",
      "gewinn",
      "verlust",
      "abweichung",
      "finanzen",
      "controlling",
      "wirtschaftlich",
      "einnahmen",
      "ausgaben",
      "rechnung",
      "preis",
      "tarif",
      "analyse",
      "ebitda",
    ];
    const filialen = [
      "filiale",
      "standort",
      "filialen",
      "personal",
      "öffnungszeit",
      "sortiment",
      "café",
      "produktion",
      "mitarbeiter",
      "schicht",
      "verkauf",
      "laden",
      "geschäft",
      "performance",
      "kundenfeedback",
    ];
    const admin = [
      "reklamation",
      "dokument",
      "vorlage",
      "brief",
      "kommunikation",
      "termin",
      "organisation",
      "ablauf",
      "digitalisierung",
      "prozess",
      "email",
      "e-mail",
      "hallo",
      "hilfe",
      "schreiben",
      "formulierung",
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
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: userText },
    ];

    try {
      const routing = routeMessage(userText);
      setActiveAgent(routing.agent);
      setRoutingInfo(routing.grund);

      const agent = AGENTS[routing.agent as keyof typeof AGENTS];
      const answer = await callClaude(agent.systemPrompt, updatedHistory);

      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: answer },
      ]);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: answer,
          agent: routing.agent,
          grund: routing.grund,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Fehler: ${err.message}`,
          agent: "error",
        },
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

  const specialists = Object.values(AGENTS).filter(
    (a) => a.id !== "orchestrator"
  );

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logo}>RM</div>
          <div>
            <div style={s.headerTitle}>Rolf Maier & Co AG</div>
            <div style={s.headerSub}>KI-Agentensystem</div>
          </div>
        </div>
        <div style={s.teamRow}>
          <TeamCard
            agent={AGENTS.orchestrator}
            isActive={loading && !activeAgent}
          />
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
            {Math.floor(conversationHistory.length / 2)} Nachrichten im
            Gedächtnis
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
                src="/leon.png"
                alt="Leon"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div style={s.emptyTitle}>Guten Tag, ich bin Leon.</div>
            <div style={s.emptySub}>
              Ich leite Ihre Anfrage automatisch an Lorena, Sabrina oder
              Mirjam weiter.
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
          const ag =
            msg.agent && AGENTS[msg.agent as keyof typeof AGENTS];
          return (
            <div key={i} style={s.assistantRow}>
              {ag && (
                <div style={s.agentHeader}>
                  <img
                    src={getAgentImage(ag.id)}
                    alt={ag.name}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <span
                      style={{
                        ...s.agentName,
                        color: ag.accent,
                      }}
                    >
                      {ag.name}
                    </span>
                    <span style={s.agentRole}> · {ag.role}</span>
                    {msg.grund && <div style={s.agentGrund}>{msg.grund}</div>}
                  </div>
                </div>
              )}
              <div
                style={{
                  ...s.assistantBubble,
                  borderLeftColor: ag?.accent || "#555",
                }}
              >
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
          const ag =
            activeAgent && AGENTS[activeAgent as keyof typeof AGENTS]
              ? AGENTS[activeAgent as keyof typeof AGENTS]
              : AGENTS.orchestrator;
          return (
            <div style={s.assistantRow}>
              <div style={s.agentHeader}>
                <img
                  src={getAgentImage(ag.id)}
                  alt={ag.name}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <span
                    style={{
                      ...s.agentName,
                      color: ag.accent,
                    }}
                  >
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
          placeholder="Ihre Frage an das Team..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          style={{
            ...s.sendBtn,
            opacity: loading || !input.trim() ? 0.4 : 1,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
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
        gap: "9px",
        padding: "8px 12px",
        borderRadius: "12px",
        border: "1px solid",
        borderColor: isActive ? agent.accent : "#1e1e1e",
        background: isActive ? `${agent.accent}12` : "#111",
        transform: isActive ? "translateY(-2px)" : "none",
        boxShadow: isActive ? `0 4px 18px ${agent.accent}20` : "none",
        transition: "all 0.25s ease",
        minWidth: "130px",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={`/${agent.id}.png`}
          alt={agent.name}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            objectFit: "cover",
            border: isActive ? `2px solid ${agent.accent}` : "2px solid #1e1e1e",
            transition: "border-color 0.25s ease",
          }}
        />
        {isActive && (
          <div
            style={{
              position: "absolute",
              bottom: 1,
              right: 1,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: agent.accent,
              border: "2px solid #0d0d0d",
            }}
          />
        )}
      </div>
      <div>
        <div
          style={{
            fontWeight: "600",
            fontSize: "13px",
            color: isActive ? agent.accent : "#bbb",
            transition: "color 0.2s",
          }}
        >
          {agent.name}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#444",
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.03em",
          }}
        >
          {agent.role}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#2e2e2e",
            fontStyle: "italic",
          }}
        >
          {agent.animal}
        </div>
      </div>
    </div>
  );
}

// Styles
const s = {
  root: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    background: "#0d0d0d",
    color: "#e8e8e8",
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: "14px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #1a1a1a",
    background: "#0f0f0f",
    flexWrap: "wrap" as const,
    gap: "12px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logo: {
    width: "36px",
    height: "36px",
    background: "#e8c84a",
    color: "#0d0d0d",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "13px",
  },
  headerTitle: {
    fontWeight: "600",
    fontSize: "15px",
  },
  headerSub: {
    fontSize: "11px",
    color: "#555",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  teamRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap" as const,
  },
  divider: {
    width: "1px",
    height: "52px",
    background: "#1e1e1e",
    margin: "0 4px",
  },
  memoryBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "5px 20px",
    background: "#0a0a0a",
    borderBottom: "1px solid #141414",
    fontSize: "11px",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  memoryDot: {
    width: "6px",
    height: "6px",
    background: "#e8c84a",
    borderRadius: "50%",
    display: "inline-block",
  },
  memoryText: {
    color: "#3a3a3a",
  },
  clearBtn: {
    background: "transparent",
    border: "1px solid #1e1e1e",
    borderRadius: "4px",
    color: "#3a3a3a",
    padding: "2px 8px",
    fontSize: "10px",
    cursor: "pointer",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  messages: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  empty: {
    margin: "auto",
    textAlign: "center" as const,
    maxWidth: "440px",
    padding: "32px 0",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "12px",
  },
  emptyIcon: {
    fontSize: "48px",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#ddd",
  },
  emptySub: {
    color: "#555",
    lineHeight: "1.6",
    fontSize: "13px",
  },
  exampleGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    width: "100%",
    marginTop: "8px",
  },
  example: {
    padding: "10px 14px",
    background: "#141414",
    border: "1px solid #1e1e1e",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#666",
    fontSize: "12px",
    textAlign: "left" as const,
  },
  userRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  userBubble: {
    maxWidth: "70%",
    background: "#1a1a1a",
    border: "1px solid #222",
    borderRadius: "14px 14px 2px 14px",
    padding: "10px 14px",
    lineHeight: "1.6",
    color: "#ddd",
  },
  assistantRow: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    maxWidth: "82%",
  },
  agentHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  agentName: {
    fontWeight: "600",
    fontSize: "13px",
  },
  agentRole: {
    color: "#444",
    fontSize: "12px",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  agentGrund: {
    color: "#333",
    fontSize: "11px",
    marginTop: "2px",
    fontStyle: "italic" as const,
  },
  assistantBubble: {
    background: "#111",
    border: "1px solid #1a1a1a",
    borderLeft: "3px solid",
    borderRadius: "2px 14px 14px 14px",
    padding: "12px 16px",
    lineHeight: "1.75",
    color: "#ccc",
  },
  loadingBubble: {
    background: "#111",
    border: "1px solid #1a1a1a",
    borderRadius: "14px",
    padding: "14px 18px",
    display: "flex",
    gap: "5px",
    alignItems: "center",
    width: "fit-content",
  },
  dot: {
    width: "6px",
    height: "6px",
    background: "#333",
    borderRadius: "50%",
    display: "inline-block",
    animation: "blink 1.2s infinite ease-in-out",
  },
  inputArea: {
    padding: "14px 20px",
    borderTop: "1px solid #1a1a1a",
    background: "#0f0f0f",
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    background: "#141414",
    border: "1px solid #1e1e1e",
    borderRadius: "12px",
    padding: "10px 14px",
    color: "#ddd",
    fontSize: "14px",
    lineHeight: "1.5",
    maxHeight: "120px",
  },
  sendBtn: {
    width: "40px",
    height: "40px",
    background: "#e8c84a",
    color: "#0d0d0d",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s",
    flexShrink: 0,
  },
};
