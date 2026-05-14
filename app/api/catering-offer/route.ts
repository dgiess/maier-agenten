import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { offerData } = await request.json();

    if (!offerData) {
      return NextResponse.json(
        { error: "Missing offerData" },
        { status: 400 }
      );
    }

    const html = generateCateringOffer(offerData);

    return NextResponse.json({
      success: true,
      html,
      filename: `Catering-Offerte-${offerData.anlass}-${new Date().toISOString().split("T")[0]}.html`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function generateCateringOffer(data: any): string {
  const {
    anlass = "Catering-Veranstaltung",
    anzahlPersonen = 20,
    datum = new Date().toLocaleDateString("de-CH"),
    varianten = [],
    organisatorisch = {},
    agentName = "Alex",
  } = data;

  const totalPersonen = parseInt(anzahlPersonen) || 20;
  const timestamp = new Date().toLocaleString("de-CH");

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Catering-Offerte | Beck Maier</title>
<style>
  :root {
    --brown: #5C3D2E;
    --brown-l: #7A5545;
    --gold: #C49A3C;
    --cream: #FAF7F2;
    --cream2: #F2EDE4;
    --border: #DDD4C4;
    --text: #2C1F14;
    --text3: #9A8470;
    --green: #4A7C59;
    --white: #FFFFFF;
  }
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Lato', -apple-system, sans-serif; 
    background: var(--cream); 
    color: var(--text); 
    line-height: 1.6;
  }
  
  .header {
    background: white;
    border-bottom: 4px solid var(--gold);
    padding: 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .logo-area { display: flex; align-items: center; gap: 16px; }
  .logo-icon {
    width: 48px;
    height: 48px;
    background: var(--brown);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cream);
    font-size: 24px;
    font-weight: 700;
  }
  
  .logo-text h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--brown);
    line-height: 1;
  }
  
  .logo-text p {
    font-size: 11px;
    color: var(--gold);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 4px;
  }
  
  .header-meta {
    text-align: right;
  }
  
  .header-meta .date {
    font-size: 12px;
    color: var(--text3);
  }
  
  .header-meta .tag {
    background: var(--brown);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin-top: 8px;
    display: inline-block;
  }
  
  .gold-line { height: 2px; background: var(--gold); margin: 0; }
  
  .main { max-width: 1000px; margin: 0 auto; padding: 40px; }
  
  .title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 32px;
    font-weight: 700;
    color: var(--brown);
    margin-bottom: 8px;
  }
  
  .subtitle {
    font-size: 13px;
    color: var(--text3);
    margin-bottom: 30px;
  }
  
  .intro {
    background: white;
    border-left: 4px solid var(--gold);
    padding: 20px;
    margin-bottom: 30px;
    border-radius: 4px;
    font-size: 14px;
    color: var(--text);
    line-height: 1.8;
  }
  
  .kpi-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 30px;
  }
  
  .kpi {
    background: white;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 16px;
    text-align: center;
    border-top: 3px solid var(--gold);
  }
  
  .kpi-label {
    font-size: 10px;
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
    font-weight: 700;
  }
  
  .kpi-value {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--brown);
  }
  
  .section-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--brown);
    margin: 30px 0 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border);
  }
  
  .variant-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 20px;
    page-break-inside: avoid;
  }
  
  .variant-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .variant-name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--brown);
  }
  
  .variant-price {
    font-size: 20px;
    font-weight: 700;
    color: var(--gold);
    text-align: right;
  }
  
  .variant-price-sub {
    font-size: 11px;
    color: var(--text3);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin-bottom: 16px;
  }
  
  thead th {
    background: var(--cream2);
    padding: 10px;
    text-align: left;
    font-weight: 700;
    border-bottom: 2px solid var(--border);
    font-size: 11px;
    color: var(--text3);
    letter-spacing: 0.05em;
  }
  
  tbody td {
    padding: 10px;
    border-bottom: 1px solid #EDE7DB;
  }
  
  tbody tr:last-child { background: var(--cream2); font-weight: 700; }
  
  .text-right { text-align: right; }
  
  .info-box {
    background: var(--cream);
    border-left: 3px solid var(--gold);
    padding: 14px;
    margin-top: 16px;
    border-radius: 4px;
    font-size: 12px;
    color: var(--text);
  }
  
  .org-box {
    background: white;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .org-item {
    display: flex;
    gap: 12px;
    margin-bottom: 10px;
  }
  
  .org-item:last-child { margin-bottom: 0; }
  
  .org-label {
    font-weight: 700;
    min-width: 100px;
    color: var(--text3);
  }
  
  .org-value { color: var(--text); }
  
  .next-steps {
    background: white;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    margin-top: 30px;
  }
  
  .next-steps h3 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--brown);
    margin-bottom: 12px;
  }
  
  .footer {
    background: var(--brown);
    color: var(--cream);
    padding: 30px 40px;
    text-align: center;
    margin-top: 40px;
  }
  
  .footer h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .footer p {
    font-size: 12px;
    opacity: 0.9;
    margin: 2px 0;
  }
  
  .footer .contact {
    margin-top: 15px;
    font-size: 11px;
    opacity: 0.8;
  }
  
  @media print {
    body { background: white; }
    .header { page-break-after: avoid; }
  }
  
  @media(max-width:800px) {
    .header { flex-direction: column; }
    .header-meta { text-align: left; margin-top: 16px; }
    .kpi-strip { grid-template-columns: repeat(2, 1fr); }
  }
</style>
</head>
<body>

<div class="header">
  <div class="logo-area">
    <div class="logo-icon">🍞</div>
    <div class="logo-text">
      <h1>Beck Maier</h1>
      <p>Bäckerei · Konditorei · Confiserie</p>
    </div>
  </div>
  <div class="header-meta">
    <div class="date">Offerte vom ${timestamp.split(",")[0]}</div>
    <div class="tag">Gültig 30 Tage</div>
  </div>
</div>

<div class="gold-line"></div>

<div class="main">

  <h1 class="title">Catering-Offerte</h1>
  <div class="subtitle">${anlass} • ${totalPersonen} Personen • ${datum}</div>

  <div class="intro">
    <strong>Herzlichen Dank für Ihre Anfrage!</strong> Wir freuen uns, Sie mit unseren frischen Produkten und professionellem Service begeistern zu dürfen. Diese Offerte zeigt unsere Top-Varianten für Ihren Anlass. Gerne passen wir das Angebot nach Ihren Wünschen an.
  </div>

  <div class="kpi-strip">
    <div class="kpi">
      <div class="kpi-label">Personen</div>
      <div class="kpi-value">${totalPersonen}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Anlass</div>
      <div class="kpi-value" style="font-size: 16px;">${anlass}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Datum</div>
      <div class="kpi-value" style="font-size: 14px;">${datum}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Gültig</div>
      <div class="kpi-value" style="font-size: 16px;">30 Tage</div>
    </div>
  </div>

  <h2 class="section-title">📦 Unsere Varianten</h2>

  ${varianten.map((v: any, idx: number) => `
    <div class="variant-card">
      <div class="variant-header">
        <div>
          <div class="variant-name">Variante ${idx + 1}: ${v.name || "Standard"}</div>
        </div>
        <div class="variant-price">
          CHF ${(parseFloat(v.pricePerPerson || 0) * totalPersonen).toFixed(2)}
          <div class="variant-price-sub">à CHF ${parseFloat(v.pricePerPerson || 0).toFixed(2)}/Person</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Produkt</th>
            <th class="text-right">Menge</th>
            <th class="text-right">à CHF</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${v.items?.map((item: any) => `
            <tr>
              <td>${item.name || "Produkt"}</td>
              <td class="text-right">${item.quantity || 1}</td>
              <td class="text-right">CHF ${parseFloat(item.price || 0).toFixed(2)}</td>
              <td class="text-right">CHF ${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
            </tr>
          `).join("") || `<tr><td colspan="4" style="text-align: center; color: var(--text3);">Produkte werden nach Absprache zusammengestellt</td></tr>`}
          <tr>
            <td colspan="3" style="text-align: right;">Summe für ${totalPersonen} Personen:</td>
            <td class="text-right">CHF ${(parseFloat(v.pricePerPerson || 0) * totalPersonen).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      ${v.description ? `<div class="info-box">💡 ${v.description}</div>` : ""}
    </div>
  `).join("")}

  <h2 class="section-title">✨ Optionale Ergänzungen</h2>
  <div class="info-box">
    Gerne ergänzen wir Ihre Auswahl mit: Getränkepakete (CHF 5–12/Person), Desserts & Süssgebäck, professioneller Service, Besteck & Geschirr, Aufbau & Abbau. Fragen Sie nach individuellen Optionen!
  </div>

  ${Object.keys(organisatorisch).length > 0 ? `
    <h2 class="section-title">📍 Organisatorische Details</h2>
    <div class="org-box">
      ${Object.entries(organisatorisch).map(([key, value]: [string, any]) => `
        <div class="org-item">
          <div class="org-label">${key}:</div>
          <div class="org-value">${value}</div>
        </div>
      `).join("")}
    </div>
  ` : ""}

  <div class="next-steps">
    <h3>🎯 Nächste Schritte</h3>
    <p>Diese Offerte ist <strong>30 Tage gültig</strong>. Für Fragen, Änderungswünsche oder zur Buchung kontaktieren Sie uns:</p>
    <div class="contact">
      📞 +41 62 869 70 00<br>
      📧 catering@beck-maier.ch<br>
      🌐 www.beck-maier.ch
    </div>
  </div>

</div>

<div class="footer">
  <h2>Beck Maier & Co AG</h2>
  <p>Gut · Gesund · Genial</p>
  <div class="contact">
    Catering-Offerte • Generiert durch KI-System<br>
    www.beck-maier.ch
  </div>
</div>

</body>
</html>`;
}
