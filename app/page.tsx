"use client";
import { useState, useRef, useEffect } from "react";

const ALEX_SYSTEM = `Du bist Alex, Catering- und Event-Spezialistin der Beck Maier & Co AG.

PRODUKT-KATEGORIEN:
- BROTE: Brot, Vollkornbrot, Spessbrot, Feinbrot, Baguette, Ciabatta
- SANDWICHE & BELEGTE: Sandwiche mit Schinken/Käse/Gemüse, Belegte Brote, Wraps
- PARTYBROTE: Farcis (Quiche/Fleisch/Gemüse), Hartkäse-Röllchen
- SNACKS: Salzstangen, Nussgebäck, Käsegebäck, Apérogebäck, Oliven, Nüsse
- SÜSSES: Gâteaux, Petit Fours, Macarons, Éclair, Tartelettes, Kokosbusserl
- GETRÄNKE: Kaffee, Tee, Säfte, Mineralwasser, Bier, Wein

ANLÄSSE:
APÉRO: Salzstangen (10%) + Käsegebäck (15%) + Belegte Brote (25%) + Partybrote (30%) + Petit Fours (15%) + Getränke → CHF 28-35/Person
GEBURTSTAG: Belegte Brote (30%) + Partygebäck (25%) + Gâteau (25%) + Süsses (15%) + Getränke (5%) → CHF 25-40/Person
GESCHÄFTSESSEN: Hochwertige Belegte (35%) + Partybrote (35%) + Salat (20%) + Petit Fours (10%) → CHF 35-50/Person
HOCHZEIT: Komplette Menü-Auswahl + Warme Speisen + Premium-Getränke → CHF 45-70/Person

WORKFLOW:

PHASE 1 - INFORMATIONEN SAMMELN:
Stelle diese 5 Fragen (freundlich, nacheinander):
1. Wie viele Personen?
2. Welcher Anlass? (Apéro/Geburtstag/Geschäftsessen/Hochzeit/Sonstiges)
3. Welches Datum/Uhrzeit?
4. Budget/Preisvorstellung pro Person?
5. Niveau? (Einfach/Standard/Premium)

PHASE 2 - VARIANTEN ERSTELLEN:
Erstelle 3 konkrete Varianten mit Tabelle:

**Variante 1: EINFACH** (CHF 22/Person)
**Variante 2: STANDARD** (CHF 32/Person)
**Variante 3: PREMIUM** (CHF 42/Person)

| Produkt | Menge | à CHF | Total |

Dann sag: "Schreiben Sie 'Variante 1', 'Variante 2' oder 'Variante 3' um die HTML-Offerte zu generieren"

PHASE 3 - HTML-OFFERTE GENERIEREN:
ABSOLUT WICHTIG:
- Wenn Kunde "Variante X" schreibt, antworte NUR mit: "Ihre HTML-Offerte wird generiert..."
- KEINE JSON, KEINE CODE-BLÖCKE, KEINE MARKDOWN im Chat!
- Der JSON wird im Hintergrund verarbeitet
- Das System zeigt automatisch den Download-Button

Die Offerte wird als schöne HTML-Datei zum Download angeboten.`;

const LORENA_SYSTEM = `Du bist Lorena, Controlling-Spezialistin. Lade OneDrive-Dateien automatisch. Generiere HTML-Report (KEINE Fragen!)`;

const SABRINA_SYSTEM = `Du bist Sabrina, Filialmanagement-Spezialistin. Lade OneDrive-Dateien automatisch. Generiere HTML-Report (KEINE Fragen!)`;

const MIRJAM_SYSTEM = `Du bist Mirjam, Administration-Spezialistin. Bearbeite Reklamationen und Briefe.`;

const LEON_SYSTEM = `Du bist Leon, zentrale Ansprechsperson. ROUTING: report/controlling → Lorena | filial → Sabrina | catering/event → Alex | reklamation → Mirjam | SONST → du`;

type AgentConfig = {
  id: string;
  name: string;
  role: string;
  accent: string;
  image: string;
  systemPrompt: string;
  useShopData?: boolean;
  useOneDrive?: boolean;
  canGenerateReports?: boolean;
  reportType?: string;
};

const AGENTS: Record<string, AgentConfig> = {
  orchestrator: {
    id: "orchestrator",
    name: "Leon",
    role: "Orchestrator",
    accent: "#D4A574",
    image: "/leon.png",
    systemPrompt: LEON_SYSTEM,
  },
  catering: {
    id: "catering",
    name: "Alex",
    role: "Catering & Events",
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
    accent: "#8B7355",
    image: "/lorena.png",
    systemPrompt: LORENA_SYSTEM,
    useOneDrive: true,
    canGenerateReports: true,
    reportType: "controlling",
  },
  filialen: {
    id: "filialen",
    name: "Sabrina",
    role: "Filialmanagement",
    accent: "#A89968",
    image: "/sabrina.png",
    systemPrompt: SABRINA_SYSTEM,
    useOneDrive: true,
    canGenerateReports: true,
    reportType: "filialmanagement",
  },
  admin: {
    id: "admin",
    name: "Mirjam",
    role: "Administration",
    accent: "#B8956A",
    image: "/mirjam.png",
    systemPrompt: MIRJAM_SYSTEM,
    useOneDrive: true,
  },
};

const COLORS = {
  primary: "#8B6F47",
  accent: "#D4A574",
  light: "#F5F1EB",
  text: "#3D3D3D",
  border: "#D4C5B9",
  background: "#FAFAF8",
};

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
  const [currentChatAgent, setCurrentChatAgent] = useState<string | null>(null);
  const [shopData, setShopData] = useState<any[]>([]);
  const [oneDriveData, setOneDriveData] = useState<Record<string, any>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const res = await fetch("/api/shop");
        const data = await res.json();
        if (data.success) setShopData(data.products);
      } catch (e) {
        console.error("Shop error:", e);
      }
    })();
  }, [isLoggedIn]);

  async function loadOneDriveData(agentId: string) {
    try {
      const res = await fetch(`/api/onedrive?agent=${agentId}`);
      const data = await res.json();
      if (data.success) {
        setOneDriveData((prev) => ({ ...prev, [agentId]: data.files }));
      }
    } catch (e) {
      console.error("OneDrive error:", e);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loginPassword === "BeckMaier2024") {
      setIsLoggedIn(true);
      setLoginPassword("");
      setLoginError("");
    } else {
      setLoginError("Passwort ist falsch.");
      setLoginPassword("");
    }
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setMessages([]);
    setConversationHistory([]);
    setCurrentChatAgent(null);
  }

  function routeMessage(text: string, existingAgent: string | null) {
    const t = text.toLowerCase();
    
    if (existingAgent && existingAgent !== "orchestrator") {
      return { agent: existingAgent, grund: null };
    }

    if (t.includes("catering") || t.includes("event") || t.includes("hochzeit") || t.includes("geburtstag") || t.includes("apéro") || t.includes("party")) {
      return { agent: "catering", grund: "Alex erstellt Offerte" };
    }
    
    if (t.includes("report") || t.includes("controlling") || t.includes("analyse")) {
      return { agent: "controlling", grund: "Lorena generiert Report" };
    }
    if (t.includes("filial") || t.includes("performance")) {
      return { agent: "filialen", grund: "Sabrina generiert Report" };
    }
    if (t.includes("reklamation") || t.includes("brief")) {
      return { agent: "admin", grund: "Mirjam bearbeitet Anfrage" };
    }
    
    return { agent: "orchestrator", grund: null };
  }

  async function callClaude(systemPrompt: string, history: any[], agentId: string) {
    let enhancedPrompt = systemPrompt;
    const agent = AGENTS[agentId];

    if (agent?.useOneDrive && oneDriveData[agentId]?.length > 0) {
      enhancedPrompt += `\n\nONEDRIVE DATEN:\n`;
      oneDriveData[agentId].forEach((file: any) => {
        enhancedPrompt += `[${file.name}]: ${file.content}\n`;
      });
    }

    if (agent?.useShopData && shopData.length > 0) {
      enhancedPrompt += `\n\nSHOP-PRODUKTE:\n${JSON.stringify(shopData.slice(0, 15), null, 2)}`;
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt: enhancedPrompt, messages: history }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.content;
  }

  async function generateReport(agentId: string, pdfContent: string) {
    const agent = AGENTS[agentId];
    if (!agent?.canGenerateReports) return null;
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfContent,
          reportType: agent.reportType,
          agentName: agent.name,
        }),
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.error("Report error:", e);
      return null;
    }
  }

  async function generateCateringOffer(offerData: any) {
    try {
      const res = await fetch("/api/catering-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerData }),
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.error("Offer error:", e);
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
      const routing = routeMessage(userText, currentChatAgent);
      const selectedAgent = routing.agent;
      
      setActiveAgent(selectedAgent);
      if (routing.grund) setRoutingInfo(routing.grund);
      setCurrentChatAgent(selectedAgent);

      const agent = AGENTS[selectedAgent];

      if (agent?.useOneDrive && !oneDriveData[selectedAgent]) {
        await loadOneDriveData(selectedAgent);
      }

      const answer = await callClaude(agent.systemPrompt, updatedHistory, selectedAgent);
      setConversationHistory([...updatedHistory, { role: "assistant", content: answer }]);

      let reportData = null;
      let offerData = null;

      if (selectedAgent === "catering" && answer.includes("{")) {
        try {
          const jsonMatch = answer.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const offerDataObj = JSON.parse(jsonMatch[0]);
            offerData = await generateCateringOffer(offerDataObj);
          }
        } catch (e) {
          console.error("JSON parse error:", e);
        }
      }

      if (agent?.canGenerateReports && oneDriveData[selectedAgent]?.length > 0) {
        const pdfContent = oneDriveData[selectedAgent].map((f: any) => `${f.name}: ${f.content}`).join("\n\n");
        reportData = await generateReport(selectedAgent, pdfContent);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answer, agent: selectedAgent, grund: routing.grund, reportData, offerData },
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
    setCurrentChatAgent(null);
  }

  function handleDownload(data: any) {
    const blob = new Blob([data.html], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.filename;
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: COLORS.background, fontFamily: "Georgia, serif", padding: "16px" }}>
        <div style={{ background: "white", padding: "32px 24px", borderRadius: "16px", border: `3px solid ${COLORS.accent}`, textAlign: "center", maxWidth: "100%", width: "100%", maxWidth: "400px" }}>
          <img src="/beck-maier-logo.png" alt="Beck Maier Logo" style={{ height: 60, objectFit: "contain", marginBottom: "16px" }} />
          <div style={{ fontSize: "20px", fontWeight: "700", color: COLORS.primary, marginBottom: "4px" }}>Beck Maier & Co AG</div>
          <div style={{ fontSize: "12px", color: COLORS.text, marginBottom: "24px", opacity: 0.8 }}>KI-Agentensystem</div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ fontSize: "13px", color: COLORS.text, fontWeight: "600", textAlign: "left" }}>Passwort:</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Passwort" style={{ padding: "12px 14px", border: `2px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "16px", fontFamily: "Georgia, serif", color: COLORS.text, background: COLORS.light }} autoFocus />
            {loginError && <div style={{ color: "#c62828", fontSize: "12px", fontWeight: "600" }}>{loginError}</div>}
            <button type="submit" style={{ padding: "12px 24px", background: COLORS.primary, color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>Anmelden</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: COLORS.background, color: COLORS.text, fontFamily: "Georgia, serif" }}>
      {/* HEADER */}
      <div style={{ padding: "12px 16px", borderBottom: `3px solid ${COLORS.accent}`, background: "white", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
          <img src="/beck-maier-logo.png" alt="Beck Maier Logo" style={{ height: 40, objectFit: "contain", flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: "700", fontSize: "14px", color: COLORS.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Beck Maier</div>
            <div style={{ fontSize: "10px", color: COLORS.accent }}>Gut, Gesund, Genial</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: "white", border: `2px solid ${COLORS.border}`, borderRadius: "6px", color: COLORS.primary, padding: "6px 10px", fontSize: "11px", cursor: "pointer", fontWeight: "600", flexShrink: 0 }}>Abmelden</button>
      </div>

      {/* AGENT PILLS - Mobile Scroll */}
      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${COLORS.border}`, background: "white", overflowX: "auto", display: "flex", gap: "8px", WebkitOverflowScrolling: "touch" }}>
        {Object.values(AGENTS).filter((a) => a.id !== "orchestrator").map((a) => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "6px", border: `1.5px solid ${a.accent}`, background: "#F5F1EB", whiteSpace: "nowrap", flexShrink: 0 }}>
            <img src={a.image} alt={a.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: "700", fontSize: "11px", color: "#3D3D3D" }}>{a.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MEMORY BAR */}
      {conversationHistory.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: COLORS.light, borderBottom: `1px solid ${COLORS.border}`, fontSize: "12px" }}>
          <span style={{ width: "6px", height: "6px", background: COLORS.accent, borderRadius: "50%", flexShrink: 0 }} />
          <span style={{ color: COLORS.text, opacity: 0.7, flex: 1, minWidth: 0 }}>{Math.floor(conversationHistory.length / 2)} Nachrichten</span>
          <button onClick={handleClear} style={{ background: "white", border: `1px solid ${COLORS.border}`, borderRadius: "6px", color: COLORS.primary, padding: "3px 10px", fontSize: "11px", cursor: "pointer", fontWeight: "600", flexShrink: 0 }}>Neu</button>
        </div>
      )}

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: "12px", WebkitOverflowScrolling: "touch" }}>
        {messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <img src="/leon.png" alt="Leon" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #D4A574" }} />
            <div style={{ fontSize: "18px", fontWeight: "700", color: COLORS.primary }}>Willkommen</div>
            <div style={{ color: COLORS.text, opacity: 0.7, fontSize: "12px", lineHeight: "1.6" }}>Controlling, Filialanalyse, Catering-Offerte, Reklamation</div>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.role === "user") {
            return (
              <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ maxWidth: "85%", background: COLORS.primary, borderRadius: "16px 16px 4px 16px", padding: "10px 12px", color: "white", fontSize: "13px", lineHeight: "1.5" }}>{msg.text}</div>
              </div>
            );
          }
          const ag = AGENTS[msg.agent];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "95%" }}>
              {ag && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img src={ag.image} alt={ag.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: `2px solid ${ag.accent}`, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: "700", fontSize: "13px", color: ag.accent }}>{ag.name}</span>
                    {msg.grund && <div style={{ fontSize: "10px", color: "#888", marginTop: "1px" }}>{msg.grund}</div>}
                  </div>
                </div>
              )}
              <div style={{ background: COLORS.light, border: `2px solid ${COLORS.border}`, borderLeft: `4px solid ${ag?.accent || COLORS.primary}`, borderRadius: "4px 16px 16px 16px", padding: "10px 12px", color: COLORS.text, fontSize: "13px", lineHeight: "1.6" }}>
                {msg.text.split("\n").map((line: string, j: number) => (
                  <span key={j}>
                    {line}
                    {j < msg.text.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </div>
              {msg.reportData && (
                <button onClick={() => handleDownload(msg.reportData)} style={{ marginTop: "6px", padding: "8px 12px", background: ag?.accent, color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600", alignSelf: "flex-start" }}>
                  📥 {msg.reportData.filename}
                </button>
              )}
              {msg.offerData && (
                <button onClick={() => handleDownload(msg.offerData)} style={{ marginTop: "6px", padding: "8px 12px", background: ag?.accent, color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600", alignSelf: "flex-start" }}>
                  📥 {msg.offerData.filename}
                </button>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "95%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img src={AGENTS[activeAgent || "orchestrator"].image} alt="Agent" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: `2px solid ${AGENTS[activeAgent || "orchestrator"].accent}`, flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: "700", fontSize: "13px", color: AGENTS[activeAgent || "orchestrator"].accent }}>{AGENTS[activeAgent || "orchestrator"].name}</span>
                {routingInfo && <div style={{ fontSize: "10px", color: "#888", marginTop: "1px" }}>{routingInfo}</div>}
              </div>
            </div>
            <div style={{ background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: "16px", padding: "10px 12px", display: "flex", gap: "4px" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: "5px", height: "5px", background: COLORS.accent, borderRadius: "50%", animation: `blink 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s`, flexShrink: 0 }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ padding: "12px", borderTop: `3px solid ${COLORS.accent}`, background: "white", display: "flex", gap: "8px", alignItems: "flex-end" }}>
        <textarea style={{ flex: 1, background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: "8px", padding: "10px 12px", color: COLORS.text, fontSize: "14px", fontFamily: "Georgia, serif", maxHeight: "100px", minHeight: "40px", resize: "none" }} placeholder="Nachricht..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} />
        <button style={{ width: "40px", height: "40px", background: COLORS.primary, color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: loading || !input.trim() ? 0.5 : 1, flexShrink: 0 }} onClick={handleSend} disabled={loading || !input.trim()}>↑</button>
      </div>

      <style>{`@keyframes blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}
