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

APÉRO (Stehreception): Salzstangen (10%) + Käsegebäck (15%) + Belegte Brote (25%) + Partybrote (30%) + Petit Fours (15%) + Getränke
→ CHF 28-35/Person

GEBURTSTAG: Belegte Brote (30%) + Partygebäck (25%) + Gâteau (25%) + Süsses (15%) + Getränke (5%)
→ CHF 25-40/Person

GESCHÄFTSESSEN: Hochwertige Belegte (35%) + Partybrote (35%) + Salat (20%) + Petit Fours (10%)
→ CHF 35-50/Person

HOCHZEIT: Komplette Menü-Auswahl + Warme Speisen + Premium-Getränke
→ CHF 45-70/Person

WORKFLOW:
PHASE 1: Stelle diese 5 Fragen (freundlich, nacheinander):
1. Wie viele Personen?
2. Welcher Anlass? (Apéro/Geburtstag/Geschäftsessen/Hochzeit/Sonstiges)
3. Welches Datum/Uhrzeit?
4. Budget/Preisvorstellung pro Person?
5. Niveau? (Einfach/Standard/Premium)

PHASE 2: Erstelle 3 konkrete MENÜ-VARIANTEN mit:
**Variante 1: EINFACH** (z.B. CHF 22/Person)
**Variante 2: STANDARD** (z.B. CHF 32/Person)
**Variante 3: PREMIUM** (z.B. CHF 42/Person)

Jede mit Produkten, Mengen, Preisen, Gesamtbetrag.
Format: | Produkt | Menge | à CHF | Total |

PHASE 3: Wenn Kunde "Variante 1/2/3" schreibt → HTML-Offerte generieren

WICHTIG:
✅ REALISTISCHE MENGEN (nicht nur Brote!)
✅ Apéro = Snacks + Belegte + Partybrote + Süsses (NICHT NUR BROTE!)
✅ Getränke IMMER mitrechnen (min 0.25-0.5L/Person)
✅ Preise REALISTISCH
✅ Keine langen Erklärungen`;

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
    
    // WENN BEREITS EIN AGENT AKTIV IST: Bleib bei diesem Agent!
    if (existingAgent && existingAgent !== "orchestrator") {
      return { agent: existingAgent, grund: null };
    }

    // NEUE ANFRAGE: Route zur richtigen Person
    if (t.includes("report") || t.includes("controlling") || t.includes("analyse"))
      return { agent: "controlling", grund: "Lorena generiert Report" };
    if (t.includes("filial") || t.includes("performance"))
      return { agent: "filialen", grund: "Sabrina generiert Report" };
    if (t.includes("catering") || t.includes("event") || t.includes("hochzeit") || t.includes("geburtstag") || t.includes("apéro"))
      return { agent: "catering", grund: "Alex erstellt Offerte" };
    if (t.includes("reklamation") || t.includes("brief"))
      return { agent: "admin", grund: "Mirjam bearbeitet Anfrage" };
    
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

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    const updatedHistory = [...conversationHistory, { role: "user", content: userText }];

    try {
      // WICHTIG: Übergebe currentChatAgent zum Routing
      const routing = routeMessage(userText, currentChatAgent);
      const selectedAgent = routing.agent;
      
      setActiveAgent(selectedAgent);
      if (routing.grund) setRoutingInfo(routing.grund);
      
      // Speichere den aktiven Agent für zukünftige Nachrichten
      setCurrentChatAgent(selectedAgent);

      const agent = AGENTS[selectedAgent];

      if (agent?.useOneDrive && !oneDriveData[selectedAgent]) {
        await loadOneDriveData(selectedAgent);
      }

      const answer = await callClaude(agent.systemPrompt, updatedHistory, selectedAgent);
      setConversationHistory([...updatedHistory, { role: "assistant", content: answer }]);

      let reportData = null;
      if (agent?.canGenerateReports && oneDriveData[selectedAgent]?.length > 0) {
        const pdfContent = oneDriveData[selectedAgent].map((f: any) => `${f.name}: ${f.content}`).join("\n\n");
        reportData = await generateReport(selectedAgent, pdfContent);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answer, agent: selectedAgent, grund: routing.grund, reportData },
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: COLORS.background, fontFamily: "Georgia, serif" }}>
        <div style={{ background: "white", padding: "40px 60px", borderRadius: "16px", border: `3px solid ${COLORS.accent}`, textAlign: "center", maxWidth: "400px" }}>
          <img src="/beck-maier-logo.png" alt="Beck Maier Logo" style={{ height: 80, objectFit: "contain", marginBottom: "20px" }} />
          <div style={{ fontSize: "24px", fontWeight: "700", color: COLORS.primary, marginBottom: "4px" }}>Beck Maier & Co AG</div>
          <div style={{ fontSize: "14px", color: COLORS.text, marginBottom: "30px", opacity: 0.8 }}>KI-Agentensystem</div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ fontSize: "14px", color: COLORS.text, fontWeight: "600", textAlign: "left" }}>Passwort:</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Passwort" style={{ padding: "12px 14px", border: `2px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "16px", fontFamily: "Georgia, serif", color: COLORS.text, background: COLORS.light }} autoFocus />
            {loginError && <div style={{ color: "#c62828", fontSize: "13px", fontWeight: "600" }}>{loginError}</div>}
            <button type="submit" style={{ padding: "12px 24px", background: COLORS.primary, color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>Anmelden</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: COLORS.background, color: COLORS.text, fontFamily: "Georgia, serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: `3px solid ${COLORS.accent}`, background: "white", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img src="/beck-maier-logo.png" alt="Beck Maier Logo" style={{ height: 50, objectFit: "contain" }} />
          <div>
            <div style={{ fontWeight: "700", fontSize: "20px", color: COLORS.primary }}>Beck Maier & Co AG</div>
            <div style={{ fontSize: "12px", color: COLORS.accent }}>Gut, Gesund, Genial</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {Object.values(AGENTS).filter((a) => a.id !== "orchestrator").map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", border: `2px solid ${a.accent}`, background: "#F5F1EB" }}>
              <img src={a.image} alt={a.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
              <div>
                <div style={{ fontWeight: "700", fontSize: "12px", color: "#3D3D3D" }}>{a.name}</div>
                <div style={{ fontSize: "9px", color: a.accent }}>{a.role}</div>
              </div>
            </div>
          ))}
          <button onClick={handleLogout} style={{ background: "white", border: `2px solid ${COLORS.border}`, borderRadius: "8px", color: COLORS.primary, padding: "8px 14px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>Abmelden</button>
        </div>
      </div>

      {conversationHistory.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 28px", background: COLORS.light, borderBottom: `1px solid ${COLORS.border}` }}>
          <span style={{ width: "8px", height: "8px", background: COLORS.accent, borderRadius: "50%" }} />
          <span style={{ color: COLORS.text, opacity: 0.7, fontSize: "13px" }}>{Math.floor(conversationHistory.length / 2)} Nachrichten</span>
          <button onClick={handleClear} style={{ background: "white", border: `1px solid ${COLORS.border}`, borderRadius: "6px", color: COLORS.primary, padding: "4px 12px", fontSize: "12px", cursor: "pointer", fontWeight: "600", marginLeft: "auto" }}>Neu starten</button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <img src="/leon.png" alt="Leon" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "4px solid #D4A574" }} />
            <div style={{ fontSize: "24px", fontWeight: "700", color: COLORS.primary }}>Willkommen</div>
            <div style={{ color: COLORS.text, opacity: 0.7, fontSize: "14px" }}>Controlling Report, Filialanalyse, Catering-Offerte, Reklamation</div>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.role === "user") {
            return (
              <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ maxWidth: "70%", background: COLORS.primary, borderRadius: "16px 16px 4px 16px", padding: "12px 16px", color: "white", fontSize: "14px" }}>{msg.text}</div>
              </div>
            );
          }
          const ag = AGENTS[msg.agent];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "80%" }}>
              {ag && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={ag.image} alt={ag.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: `2px solid ${ag.accent}` }} />
                  <div>
                    <span style={{ fontWeight: "700", fontSize: "14px", color: ag.accent }}>{ag.name}</span>
                    {msg.grund && <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{msg.grund}</div>}
                  </div>
                </div>
              )}
              <div style={{ background: COLORS.light, border: `2px solid ${COLORS.border}`, borderLeft: `4px solid ${ag?.accent || COLORS.primary}`, borderRadius: "4px 16px 16px 16px", padding: "12px 16px", color: COLORS.text, fontSize: "14px", lineHeight: "1.7" }}>
                {msg.text.split("\n").map((line: string, j: number) => (
                  <span key={j}>
                    {line}
                    {j < msg.text.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </div>
              {msg.reportData && (
                <button onClick={() => handleDownload(msg.reportData)} style={{ marginTop: "10px", padding: "8px 14px", background: ag?.accent, color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600", alignSelf: "flex-start" }}>
                  📥 {msg.reportData.filename}
                </button>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "80%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={AGENTS[activeAgent || "orchestrator"].image} alt="Agent" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: `2px solid ${AGENTS[activeAgent || "orchestrator"].accent}` }} />
              <div>
                <span style={{ fontWeight: "700", fontSize: "14px", color: AGENTS[activeAgent || "orchestrator"].accent }}>{AGENTS[activeAgent || "orchestrator"].name}</span>
                {routingInfo && <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{routingInfo}</div>}
              </div>
            </div>
            <div style={{ background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: "16px", padding: "12px 16px", display: "flex", gap: "6px" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: "6px", height: "6px", background: COLORS.accent, borderRadius: "50%", animation: `blink 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "18px 28px", borderTop: `3px solid ${COLORS.accent}`, background: "white", display: "flex", gap: "14px", alignItems: "flex-end" }}>
        <textarea style={{ flex: 1, background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: "12px", padding: "12px 16px", color: COLORS.text, fontSize: "14px", fontFamily: "Georgia, serif", maxHeight: "120px" }} placeholder="z.B. 'Catering für 30 Personen' oder 'Apéro'" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={2} />
        <button style={{ width: "44px", height: "44px", background: COLORS.primary, color: "white", border: "none", borderRadius: "8px", fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: loading || !input.trim() ? 0.5 : 1 }} onClick={handleSend} disabled={loading || !input.trim()}>↑</button>
      </div>

      <style>{`@keyframes blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}
