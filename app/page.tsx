"use client";

import { useState, useRef, useEffect } from "react";

const GLOBAL_CONTEXT = `
Du arbeitest als internes KI-System der Rolf Maier & Co AG.
REGEL: Arbeite DIREKT mit verfügbaren Daten. Stelle KEINE unnötigen Fragen. Analysiere und liefere konkrete Ergebnisse.
SPRACHE: Schweizer Hochdeutsch, niemals ß, kurz und präzise.
`;

const LORENA_SYSTEM = `${GLOBAL_CONTEXT}
Du bist Lorena, Controlling-Spezialistin. AUFGABE:
1. Lade automatisch die neuesten Dateien aus dem Controlling-Ordner
2. Extrahiere DIREKT die Daten (KEINE Fragen stellen!)
3. Generiere sofort einen HTML-Report mit Umsatz, Kosten, Margen, Top 3 Erkenntnisse

WICHTIG: KEINE Fragen! Arbeite mit den Daten die vorhanden sind. Sei pragmatisch.`;

const SABRINA_SYSTEM = `${GLOBAL_CONTEXT}
Du bist Sabrina, Filialmanagement-Spezialistin. AUFGABE:
1. Lade automatisch die neuesten Dateien aus dem Filialmanagement-Ordner
2. Extrahiere DIREKT die Daten (KEINE Fragen stellen!)
3. Generiere sofort einen HTML-Report mit Gesamtumsatz, Top 5 Filialen, Bottom 3, Retouren, Top 3 Optimierungsvorschläge

WICHTIG: KEINE Fragen! Arbeite mit den Daten die vorhanden sind. Sei pragmatisch.`;

const ALEX_SYSTEM = `${GLOBAL_CONTEXT}
Du bist Alex, Catering-Spezialistin. AUFGABE:

PHASE 1 - ANFRAGE VERSTEHEN:
1. Der Kunde macht eine Catering-Anfrage
2. Du fragst gezielt nach: Anzahl Personen, Anlass, Budget, Datum, Niveau (einfach/standard/premium)
3. KEINE unnötigen Fragen - nur die wichtigsten 5

PHASE 2 - VARIANTEN ERSTELLEN:
1. Basierend auf den Infos: Erstelle 2-3 konkrete Varianten (EINFACH, STANDARD, PREMIUM)
2. Schreibe jede Variante strukturiert mit:
   - Name & Beschreibung
   - Produkte mit Mengen
   - Preis pro Person & Gesamtpreis
   - Besonderheiten
3. Format: **Variante 1: EINFACH**, **Variante 2: STANDARD**, **Variante 3: PREMIUM**
4. Sage dem Kunden: "Schreiben Sie 'Variante 1', 'Variante 2' oder 'Variante 3' um die HTML-Offerte zu generieren"

PHASE 3 - HTML-OFFERTE GENERIEREN:
1. Wenn Kunde "Variante X" schreibt:
2. Extrahiere die Daten aus der gewählten Variante
3. Generiere HTML-Offerte mit den exakten Produkten & Preisen
4. Zeige Download-Button

WICHTIG:
- Phase 1 & 2: Stelle Fragen und erstelle Vorschläge (normal conversational)
- Phase 3: Automatische HTML-Generierung (keine neuen Fragen)
- Nutze immer echte Shop-Preise
- Sei verkaufsorientiert aber nicht aufdringlich`;

const MIRJAM_SYSTEM = `${GLOBAL_CONTEXT}
Du bist Mirjam, Administration-Spezialistin. AUFGABE:
1. Bearbeite Reklamationen, Briefe, Dokumente
2. Erstelle professionelle Antworten basierend auf OneDrive-Vorlagen
3. Sei strukturiert, freundlich, professionell

WICHTIG: Stelle Fragen wenn nötig. Nutze die Vorlagen direkt.`;

const LEON_SYSTEM = `${GLOBAL_CONTEXT}
Du bist Leon, zentrale Ansprechsperson und Orchestrator. Du antwortest auf ALLE Fragen.

ROUTING:
- "report", "analyse", "controlling", "kosten", "kennzahl" → Lorena
- "filial", "performance", "standort", "umsatz filialen" → Sabrina
- "catering", "offerte", "event", "hochzeit", "geburtstag", "apéro", "brunch" → Alex
- "reklamation", "brief", "dokument", "vorlage", "kommunikation" → Mirjam
- SONST → Du antwortest selbst

WICHTIG: Keine Umschreibungen. Direkte Action.`;

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
  canGenerateOffers?: boolean;
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
    canGenerateOffers: true,
  },
  controlling: {
    id: "controlling",
    name: "Lorena",
    role: "Controlling",
    animal: "Füchsin",
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
    animal: "Reh-Dame",
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
    animal: "Hasen-Dame",
    accent: "#B8956A",
    image: "/mirjam.png",
    systemPrompt: MIRJAM_SYSTEM,
    useOneDrive: true,
  },
};

const CORRECT_PASSWORD = "BeckMaier2024";
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
  const [shopData, setShopData] = useState<any[]>([]);
  const [oneDriveData, setOneDriveData] = useState<{ [key: string]: any }>({});
  const [cateringVariants, setCateringVariants] = useState<any[]>([]);
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
    if (t.includes("report") || t.includes("analyse") || t.includes("controlling") || t.includes("kosten") || t.includes("kennzahl")) 
      return { agent: "controlling", grund: "Lorena generiert Report" };
    if (t.includes("filial") || t.includes("performance") || t.includes("standort") || t.includes("umsatz filialen")) 
      return { agent: "filialen", grund: "Sabrina generiert Report" };
    if (t.includes("catering") || t.includes("offerte") || t.includes("event") || t.includes("hochzeit") || t.includes("geburtstag") || t.includes("apéro") || t.includes("brunch")) 
      return { agent: "catering", grund: "Alex erstellt Offerte" };
    if (t.includes("reklamation") || t.includes("brief") || t.includes("dokument") || t.includes("vorlage")) 
      return { agent: "admin", grund: "Mirjam bearbeitet Anfrage" };
    return { agent: "orchestrator", grund: null };
  }

  async function callClaude(systemPrompt: string, history: any[], agentId: string) {
    let enhancedPrompt = systemPrompt;
    const agent = AGENTS[agentId];

    if (agent?.useOneDrive && oneDriveData[agentId]?.length > 0) {
      enhancedPrompt += `\n\nVORHANDENE DATEN AUS ONEDRIVE:\n`;
      oneDriveData[agentId].forEach((file: any) => {
        enhancedPrompt += `\n[${file.name}]:\n${file.content}\n`;
      });
      enhancedPrompt += `\nARBEITE DIREKT MIT DIESEN DATEN. STELLE KEINE UNNÖTIGEN FRAGEN!`;
    }

    if (agent?.useShopData && shopData.length > 0) {
      enhancedPrompt += `\n\nSHOP-PRODUKTE (verwende echte Preise):\n${JSON.stringify(shopData.slice(0, 15), null, 2)}`;
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

  async function generateCateringOffer(offerData: any) {
    try {
      const response = await fetch("/api/catering-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerData }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Offer generation error:", error);
      return null;
    }
  }

  function extractVariantData(userText: string): any | null {
    const text = userText.toLowerCase();
    
    // Check if user selected a variant
    if (text.includes("variante 1") || text.includes("einfach")) {
      return cateringVariants[0] || null;
    }
    if (text.includes("variante 2") || text.includes("standard")) {
      return cateringVariants[1] || null;
    }
    if (text.includes("variante 3") || text.includes("premium")) {
      return cateringVariants[2] || null;
    }
    
    return null;
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

      // Extract variants if Alex is responding and mentions Variante
      if (routing.agent === "catering" && answer.includes("Variante")) {
        const variants = [];
        const variantMatches = answer.match(/\*\*Variante \d+.*?\*\*([\s\S]*?)(?=\*\*Variante|\n\n|$)/g);
        if (variantMatches) {
          variantMatches.forEach((match, idx) => {
            variants.push({
              name: `Variante ${idx + 1}`,
              description: match.substring(0, 200),
              fullText: match,
              index: idx,
            });
          });
          setCateringVariants(variants);
        }
      }

      // Check if user selected a variant
      let offerData = null;
      const selectedVariant = extractVariantData(userText);
      if (routing.agent === "catering" && selectedVariant && cateringVariants.length > 0) {
        // Generate HTML offer based on selected variant
        const variantNumber = selectedVariant.index + 1;
        const extractedData = {
          anlass: "Catering-Veranstaltung",
          anzahlPersonen: 20,
          datum: new Date().toLocaleDateString("de-CH"),
          varianten: [
            {
              name: `Variante ${variantNumber}`,
              pricePerPerson: 25,
              items: [
                { name: "Gebäck & Brote", quantity: 1, price: 8 },
                { name: "Belag & Käse", quantity: 1, price: 12 },
                { name: "Getränke", quantity: 1, price: 5 },
              ],
              description: selectedVariant.description,
            },
          ],
          organizatorisch: { Lieferung: "Selbstabholung", Zeitpunkt: "Nach Absprache" },
        };
        offerData = await generateCateringOffer(extractedData);
      }

      setConversationHistory([...updatedHistory, { role: "assistant", content: answer }]);

      let reportData = null;
      if (agent?.canGenerateReports && oneDriveData[routing.agent]?.length > 0) {
        const pdfContent = oneDriveData[routing.agent].map((f: any) => `${f.name}: ${f.content}`).join("\n\n");
        reportData = await generateReport(routing.agent, pdfContent);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answer, agent: routing.agent, grund: routing.grund, reportData, offerData },
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
    setCateringVariants([]);
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
            <label style={{ fontSize: "14px", color: COLORS.text, fontWeight: "600", textAlign: "left" }}>Passwort eingeben:</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Passwort" style={{ padding: "12px 14px", border: `2px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "16px", fontFamily: "Georgia, serif", color: COLORS.text, background: COLORS.light }} autoFocus />
            {loginError && <div style={{ color: "#c62828", fontSize: "13px", fontWeight: "600" }}>{loginError}</div>}
            <button type="submit" style={{ padding: "12px 24px", background: COLORS.primary, color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>Anmelden</button>
          </form>
        </div>
      </div>
    );
  }

  const specialists = Object.values(AGENTS).filter((a) => a.id !== "orchestrator");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: COLORS.background, color: COLORS.text, fontFamily: "Georgia, serif", fontSize: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: `3px solid ${COLORS.accent}`, background: "white", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img src="/beck-maier-logo.png" alt="Beck Maier Logo" style={{ height: 50, objectFit: "contain" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontWeight: "700", fontSize: "20px", color: COLORS.primary }}>Beck Maier & Co AG</div>
            <div style={{ fontSize: "12px", color: COLORS.accent, fontStyle: "italic" }}>Gut, Gesund, Genial</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {specialists.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: `2px solid ${a.accent}`, background: "#F5F1EB", minWidth: "130px" }}>
              <img src={a.image} alt={a.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
              <div><div style={{ fontWeight: "700", fontSize: "12px", color: "#3D3D3D" }}>{a.name}</div><div style={{ fontSize: "9px", color: a.accent }}>{a.role}</div></div>
            </div>
          ))}
          <button onClick={handleLogout} style={{ background: "white", border: `2px solid ${COLORS.border}`, borderRadius: "8px", color: COLORS.primary, padding: "8px 14px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>Abmelden</button>
        </div>
      </div>

      {conversationHistory.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 28px", background: COLORS.light, borderBottom: `1px solid ${COLORS.border}`, fontSize: "13px" }}>
          <span style={{ width: "8px", height: "8px", background: COLORS.accent, borderRadius: "50%", display: "inline-block" }} />
          <span style={{ color: COLORS.text, opacity: 0.7 }}>{Math.floor(conversationHistory.length / 2)} Nachrichten</span>
          <button onClick={handleClear} style={{ background: "white", border: `1px solid ${COLORS.border}`, borderRadius: "6px", color: COLORS.primary, padding: "4px 12px", fontSize: "12px", cursor: "pointer", fontWeight: "600", marginLeft: "auto" }}>Neu starten</button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <img src="/leon.png" alt="Leon" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "4px solid #D4A574" }} />
            <div style={{ fontSize: "24px", fontWeight: "700", color: COLORS.primary }}>Willkommen</div>
            <div style={{ color: COLORS.text, opacity: 0.7", fontSize: "14px" }}>Fragen Sie nach: Controlling Report, Filialanalyse, Catering-Offerte, Reklamation</div>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.role === "user") {
            return (
              <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ maxWidth: "70%", background: COLORS.primary, borderRadius: "16px 16px 4px 16px", padding: "12px 16px", lineHeight: "1.6", color: "white", fontSize: "14px" }}>{msg.text}</div>
              </div>
            );
          }
          const ag = AGENTS[msg.agent];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "80%" }}>
              {ag && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={ag.image} alt={ag.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: `2px solid ${ag.accent}` }} />
                  <div>
                    <span style={{ fontWeight: "700", fontSize: "14px", color: ag.accent }}>{ag.name}</span>
                    {msg.grund && <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{msg.grund}</div>}
                  </div>
                </div>
              )}
              <div style={{ background: COLORS.light, border: `2px solid ${COLORS.border}`, borderLeft: `4px solid ${ag?.accent || COLORS.primary}`, borderRadius: "4px 16px 16px 16px", padding: "12px 16px", lineHeight: "1.7", color: COLORS.text, fontSize: "14px" }}>
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
              {msg.offerData && (
                <button onClick={() => handleDownload(msg.offerData)} style={{ marginTop: "10px", padding: "8px 14px", background: ag?.accent, color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600", alignSelf: "flex-start" }}>
                  📥 {msg.offerData.filename}
                </button>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "80%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={AGENTS[activeAgent || "orchestrator"].image} alt="Agent" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: `2px solid ${AGENTS[activeAgent || "orchestrator"].accent}` }} />
              <div>
                <span style={{ fontWeight: "700", fontSize: "14px", color: AGENTS[activeAgent || "orchestrator"].accent }}>{AGENTS[activeAgent || "orchestrator"].name}</span>
                {routingInfo && <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{routingInfo}</div>}
              </div>
            </div>
            <div style={{ background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: "16px", padding: "12px 16px", display: "flex", gap: "6px", alignItems: "center", width: "fit-content" }}>
              <span style={{ width: "6px", height: "6px", background: COLORS.accent, borderRadius: "50%", display: "inline-block", animation: "blink 1.2s infinite ease-in-out" }} />
              <span style={{ width: "6px", height: "6px", background: COLORS.accent, borderRadius: "50%", display: "inline-block", animation: "blink 1.2s infinite ease-in-out", animationDelay: "0.2s" }} />
              <span style={{ width: "6px", height: "6px", background: COLORS.accent, borderRadius: "50%", display: "inline-block", animation: "blink 1.2s infinite ease-in-out", animationDelay: "0.4s" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "18px 28px", borderTop: `3px solid ${COLORS.accent}`, background: "white", display: "flex", gap: "14px", alignItems: "flex-end" }}>
        <textarea style={{ flex: 1, background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: "12px", padding: "12px 16px", color: COLORS.text, fontSize: "14px", lineHeight: "1.5", maxHeight: "120px", fontFamily: "Georgia, serif" }} placeholder="z.B. 'Catering für 30 Personen' oder 'Variante 1' für HTML-Offerte" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={2} />
        <button style={{ width: "44px", height: "44px", background: COLORS.primary, color: "white", border: "none", borderRadius: "8px", fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", opacity: loading || !input.trim() ? 0.5 : 1 }} onClick={handleSend} disabled={loading || !input.trim()}>↑</button>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
