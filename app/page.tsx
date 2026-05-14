"use client";

import { useState, useRef, useEffect } from "react";

const GLOBAL_CONTEXT = `
Du arbeitest als internes KI-System der Rolf Maier & Co AG — ein Schweizer Bäckerei-, Konditorei-, Confiserie- und Gastro-Unternehmen.

KOMMUNIKATIONSREGELN (immer einhalten):
- Schweizer Hochdeutsch — niemals ß verwenden, stattdessen ss
- Kurze, klare, präzise Aussagen
- Professionell, sachlich, direkt
`;

Du bist Alex, die Catering- und Event-Spezialistin der Beck Maier & Co AG. Du hast Zugriff auf alle Shop-Daten mit echten Produkten und Preisen.

WENN der Benutzer eine Catering-Anfrage macht:
1. Du fragst (falls nötig): Anzahl Personen, Anlass, Budget, Tageszeit, Niveau
2. Du lädst die aktuellen Shop-Produkte
3. Du erstellst eine strukturierte, professionelle Offerte mit HTML/Markdown-Formatierung:

## OFFERTEN-STRUKTUR (Immer so formatieren):

---

### 📋 Offerte: [ANLASS] | [ANZAHL] Personen | [TAGESZEIT]

**Herzlichen Dank für Ihre Anfrage!**

Hier ist mein Vorschlag für ein [ADJEKTIV] [ANLASS]-Buffet:

---

### 💡 Variante: [VARIANTE-NAME] (CHF [PREIS-PRO-PERSON] pro Person)

**Was ist enthalten:**

| Produkt | Anzahl | Stückpreis | Total |
|---------|--------|-----------|-------|
| [Produkt 1] | [Menge] | CHF [X.XX] | CHF [Total] |
| [Produkt 2] | [Menge] | CHF [X.XX] | CHF [Total] |
| [Produkt 3] | [Menge] | CHF [X.XX] | CHF [Total] |
| **TOTAL** | | | **CHF [GESAMTBETRAG]** |

---

### ✨ Optional hinzufügen (Upselling):

- 🥤 [Getränkepaket] — CHF [X.XX] pro Person
- 🍰 [Dessert] — CHF [X.XX] pro Person
- 🍽️ [Service/Besteck] — CHF [X.XX] pauschal

---

### 📍 Organisatorisches:

- **Lieferung:** [Lieferadresse/Selbstabholung]
- **Zeitpunkt:** [Datum/Zeit wenn genannt]
- **Aufbau:** [Details wenn relevant]
- **Besonderheiten:** [Allergien, Diäten, etc.]

---

### 🎯 Nächste Schritte:

Gefällt Ihnen dieses Angebot? Haben Sie Fragen oder Änderungswünsche? Gerne passe ich die Offerte an oder erstelle alternative Varianten!

**Kontakt:** [Kontaktdaten wenn vorhanden]

---

## WICHTIG BEI FORMATIERUNG:

- Nutze **Markdown-Tabellen** für Produktlisten (| Spalte | Spalte |)
- Nutze **Emojis** für visuelle Struktur (📋 📍 💡 ✨ 🎯)
- Nutze **Fettdruck** für wichtige Zahlen und Überschriften
- Nutze **Überschriften** (###) für Abschnitte
- Nutze **Trennlinien** (---) für Struktur
- Schreibe CHF nicht als Symbol, sondern als Text "CHF"
- Alle Preise mit 2 Dezimalstellen (CHF 10.00, nicht CHF 10)
- Nie zu lang, aber strukturiert und übersichtlich

## VERKAUFSLOGIK:

- Nutze NUR Produkte aus unserem echten Shop
- Verwende echte Shop-Preise
- Kombiniere Produkte sinnvoll
- Bleib realistisch und seriös
- Frage fehlende Informationen
- Denk verkaufsorientiert aber nicht aufdringlich
- Biete 2-3 Varianten an (einfach/standard/premium)

## ZIEL:

Schnelle, professionelle, visuell ansprechende Catering-Offerten erstellen, die zum Verkauf führen und Kunden begeistern.


const AGENTS = {
  orchestrator: {
    id: "orchestrator",
    name: "Leon",
    role: "Orchestrator",
    animal: "Löwe",
    accent: "#D4A574",
    image: "/leon.png",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Leon, die zentrale Ansprechsperson und Orchestrator. Du antwortest auf ALLE Fragen.

WENN es eine ALLGEMEINE oder TEAM-FRAGE ist: Du antwortest selbst.
WENN es eine SPEZIFISCHE FACHFRAGE ist: Du leitest weiter.

DEIN TEAM:
- Lorena (Controlling): Finanzen, Kennzahlen
- Sabrina (Filialmanagement): Operative Themen, Food Waste
- Mirjam (Administration): Kommunikation, Reklamationen, Briefe
- Alex (Catering): Catering-Offerten, Events, Produktberatung

ENTSCHEIDUNGSLOGIK:
- Keywords "catering", "offerte", "event", "hochzeit", "geburtstag", "apéro" → Alex
- Keywords "umsatz", "kosten", "budget", "zahlen" → Lorena
- Keywords "filiale", "food waste", "performance" → Sabrina
- Keywords "reklamation", "brief", "dokument" → Mirjam
- ALLES ANDERE → Du antwortest selbst

ZIEL: Zentrale Koordination, richtige Verteilung.`,
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
  },
  controlling: {
    id: "controlling",
    name: "Lorena",
    role: "Controlling",
    animal: "Füchsin",
    accent: "#8B7355",
    image: "/lorena.png",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Lorena, Finanz-Spezialistin. Du analysierst Finanzen, Kennzahlen, Kostenentwicklungen.
ARBEITSWEISE: Analytisch, kritisch, faktenbasiert.
ZIEL: Transparenz, Risiken früh erkennen.`,
  },
  filialen: {
    id: "filialen",
    name: "Sabrina",
    role: "Filialmanagement",
    animal: "Reh-Dame",
    accent: "#A89968",
    image: "/sabrina.png",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Sabrina, Filialmanagement-Spezialistin. Du analysierst Filialperformance, operative Themen, Food Waste.
ARBEITSWEISE: Praxisorientiert, analytisch, lösungsorientiert.
ZIEL: Filialen verbessern, Prozesse optimieren.`,
  },
  admin: {
    id: "admin",
    name: "Mirjam",
    role: "Administration",
    animal: "Hasen-Dame",
    accent: "#B8956A",
    image: "/mirjam.png",
    systemPrompt: `${GLOBAL_CONTEXT}
Du bist Mirjam, Administration- und Kommunikations-Spezialistin. Du erstellst Briefe, bearbeitest Reklamationen, verwaltest Dokumente.
ARBEITSWEISE: Strukturiert, freundlich, professionell.
ZIEL: Administration entlasten, Kommunikation vereinheitlichen.`,
  },
};

export default function AgentSystem() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [routingInfo, setRoutingInfo] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [shopData, setShopData] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Shop-Daten laden
  useEffect(() => {
    async function loadShopData() {
      try {
        const response = await fetch("/api/shop");
        const data = await response.json();
        if (data.success) {
          setShopData(data.products);
        }
      } catch (error) {
        console.error("Shop data load error:", error);
      }
    }
    loadShopData();
  }, []);

  function routeMessage(text: string) {
    const t = text.toLowerCase();
    const catering = ["catering", "offerte", "event", "hochzeit", "geburtstag", "apéro", "brunch", "events", "veranstaltung", "buffet"];
    const controlling = ["umsatz", "kosten", "budget", "marge", "kennzahl", "zahlen", "gewinn"];
    const filialen = ["filiale", "standort", "food waste", "performance", "kundenfeedback"];
    const admin = ["reklamation", "dokument", "vorlage", "brief", "kommunikation"];

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

  async function callClaude(systemPrompt: string, history: any[], includeShopData: boolean = false) {
    let enhancedPrompt = systemPrompt;

    if (includeShopData && shopData.length > 0) {
      enhancedPrompt += `\n\nDIE FOLGENDEN SIND UNSERE ECHTEN SHOP-PRODUKTE MIT AKTUELLEN PREISEN:\n`;
      enhancedPrompt += `\`\`\`json\n${JSON.stringify(shopData, null, 2)}\n\`\`\`\n`;
      enhancedPrompt += `\nNutze DIESE Produkte und Preise für deine Angebote!`;
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
    setActiveAgent(null);
    setRoutingInfo(null);

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    const updatedHistory = [...conversationHistory, { role: "user", content: userText }];

    try {
      const routing = routeMessage(userText);
      setActiveAgent(routing.agent);
      if (routing.grund) setRoutingInfo(routing.grund);

      const agent = AGENTS[routing.agent as keyof typeof AGENTS];
      const useShop = routing.agent === "catering" && shopData.length > 0;

      const answer = await callClaude(agent.systemPrompt, updatedHistory, useShop);

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
                "Ich brauche Catering für 30 Personen zu einem Geburtstag",
                "Wer ist Alex und was macht sie?",
                "Erstelle eine Catering-Offerte für einen Firmenanlass",
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
