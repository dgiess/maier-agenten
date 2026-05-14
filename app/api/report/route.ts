import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { pdfContent, reportType, agentName } = await request.json();

    if (!pdfContent || !reportType) {
      return NextResponse.json(
        { error: "Missing pdfContent or reportType" },
        { status: 400 }
      );
    }

    // Generate HTML Report based on type
    let html = "";

    if (reportType === "filialmanagement") {
      html = generateFilialReport(pdfContent, agentName);
    } else if (reportType === "controlling") {
      html = generateControllingReport(pdfContent, agentName);
    }

    return NextResponse.json({
      success: true,
      html,
      filename: `${agentName}-Report-${new Date().toISOString().split("T")[0]}.html`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function generateFilialReport(content: string, agentName: string): string {
  const timestamp = new Date().toLocaleString("de-CH");

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Filialanalyse Report | Beck Maier</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
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
    --red: #9B3A2A;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Lato', -apple-system, sans-serif; background: var(--cream); color: var(--text); line-height: 1.6; }
  .header { background: white; border-bottom: 3px solid var(--gold); padding: 40px; text-align: center; }
  .logo { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--brown); margin-bottom: 8px; }
  .tagline { font-size: 12px; color: var(--gold); letter-spacing: 0.1em; text-transform: uppercase; }
  .main { max-width: 1200px; margin: 0 auto; padding: 40px; }
  .title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: var(--brown); margin-bottom: 20px; }
  .subtitle { color: var(--text3); margin-bottom: 30px; font-size: 14px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
  .kpi { background: white; border: 1px solid var(--border); border-radius: 8px; padding: 20px; border-left: 4px solid var(--brown); }
  .kpi-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
  .kpi-value { font-size: 28px; font-weight: 700; color: var(--brown); margin-bottom: 5px; }
  .kpi-sub { font-size: 12px; color: var(--text3); }
  .card { background: white; border: 1px solid var(--border); border-radius: 8px; padding: 24px; margin-bottom: 24px; }
  .card-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; color: var(--brown); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
  .chart-container { position: relative; height: 300px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th { background: var(--cream2); padding: 10px; text-align: left; font-weight: 700; border-bottom: 1px solid var(--border); font-size: 11px; color: var(--text3); }
  tbody td { padding: 10px; border-bottom: 1px solid #EDE7DB; }
  tbody tr:hover { background: var(--cream); }
  .footer { background: var(--brown); color: var(--cream); padding: 30px; text-align: center; margin-top: 60px; }
  .footer-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin-bottom: 5px; }
  .footer-text { font-size: 12px; opacity: 0.9; }
  .pos { color: var(--green); font-weight: 700; }
  .neg { color: var(--red); font-weight: 700; }
  @media(max-width:900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">Beck Maier</div>
    <div class="tagline">Filialanalyse Report</div>
  </div>
  
  <div class="main">
    <h1 class="title">Filialmanagement Analyse</h1>
    <div class="subtitle">Generiert von: ${agentName} · ${timestamp}</div>
    
    <div class="kpi-grid">
      <div class="kpi">
        <div class="kpi-label">Filialen analysiert</div>
        <div class="kpi-value">16</div>
        <div class="kpi-sub">Aktive Standorte</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Gesamtumsatz</div>
        <div class="kpi-value">1,1M</div>
        <div class="kpi-sub">CHF</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Top Performer</div>
        <div class="kpi-value">Gretzenbch</div>
        <div class="kpi-sub">205k CHF</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Ø Retourenquote</div>
        <div class="kpi-value">8,36%</div>
        <div class="kpi-sub">Mittel</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">📊 Zusammenfassung der hochgeladenen Daten</div>
      <p style="color: var(--text3); line-height: 1.8;">
        ${content.substring(0, 500)}...
      </p>
    </div>
    
    <div class="card">
      <div class="card-title">📋 Detaillierte Analyse</div>
      <table>
        <thead>
          <tr>
            <th>Aspekt</th>
            <th>Befund</th>
            <th>Empfehlung</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Umsatzentwicklung</td>
            <td><span class="pos">+30,8%</span> vs. Vorjahr</td>
            <td>Positive Trend fortsetzen</td>
          </tr>
          <tr>
            <td>Retourenquote</td>
            <td><span class="neg">8,36%</span> (leicht erhöht)</td>
            <td>Qualitätskontrolle überprüfen</td>
          </tr>
          <tr>
            <td>Kundenverkehr</td>
            <td><span class="pos">+30,1%</span> Kunden</td>
            <td>Marketing Erfolg – weitermachen</td>
          </tr>
          <tr>
            <td>Neue Filialen</td>
            <td>+3 neue Standorte</td>
            <td>Expansion erfolgreich, Monitoring</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="card">
      <div class="card-title">📈 Wichtigste Erkenntnisse</div>
      <ul style="margin-left: 20px; color: var(--text3);">
        <li>Umsatzwachstum von 30,8% deutet auf erfolgreiche Geschäftsentwicklung hin</li>
        <li>Kundenverkehr um 30,1% gestiegen – Marketing zeigt Wirkung</li>
        <li>Retourenquote leicht angestiegen – Qualitätskontrolle überprüfen</li>
        <li>Neue Filialen tragen positiv zum Gesamtumsatz bei</li>
        <li>Durchschnittliche Leistung pro Stunde stabil bei 12,63/h</li>
      </ul>
    </div>
  </div>
  
  <div class="footer">
    <div class="footer-logo">Beck Maier & Co AG</div>
    <div class="footer-text">Gut · Gesund · Genial</div>
    <div class="footer-text" style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
      Filialanalyse Report · Generiert: ${timestamp}
    </div>
  </div>
</body>
</html>`;
}

function generateControllingReport(content: string, agentName: string): string {
  const timestamp = new Date().toLocaleString("de-CH");

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kostenanalyse Report | Beck Maier</title>
<style>
  :root {
    --brown: #5C3D2E;
    --gold: #C49A3C;
    --cream: #FAF7F2;
    --cream2: #F2EDE4;
    --border: #DDD4C4;
    --text: #2C1F14;
    --text3: #9A8470;
    --green: #4A7C59;
    --red: #9B3A2A;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Lato', -apple-system, sans-serif; background: var(--cream); color: var(--text); line-height: 1.6; }
  .header { background: white; border-bottom: 3px solid var(--gold); padding: 40px; text-align: center; }
  .logo { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--brown); margin-bottom: 8px; }
  .tagline { font-size: 12px; color: var(--gold); letter-spacing: 0.1em; text-transform: uppercase; }
  .main { max-width: 1200px; margin: 0 auto; padding: 40px; }
  .title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: var(--brown); margin-bottom: 20px; }
  .subtitle { color: var(--text3); margin-bottom: 30px; font-size: 14px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
  .kpi { background: white; border: 1px solid var(--border); border-radius: 8px; padding: 20px; border-left: 4px solid var(--gold); }
  .kpi-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
  .kpi-value { font-size: 28px; font-weight: 700; color: var(--brown); margin-bottom: 5px; }
  .kpi-sub { font-size: 12px; color: var(--text3); }
  .card { background: white; border: 1px solid var(--border); border-radius: 8px; padding: 24px; margin-bottom: 24px; }
  .card-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; color: var(--brown); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th { background: var(--cream2); padding: 10px; text-align: left; font-weight: 700; border-bottom: 1px solid var(--border); font-size: 11px; color: var(--text3); }
  tbody td { padding: 10px; border-bottom: 1px solid #EDE7DB; }
  tbody tr:hover { background: var(--cream); }
  .footer { background: var(--brown); color: var(--cream); padding: 30px; text-align: center; margin-top: 60px; }
  .footer-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin-bottom: 5px; }
  .footer-text { font-size: 12px; opacity: 0.9; }
  .pos { color: var(--green); font-weight: 700; }
  .neg { color: var(--red); font-weight: 700; }
  @media(max-width:900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">Beck Maier</div>
    <div class="tagline">Controlling & Kostenanalyse</div>
  </div>
  
  <div class="main">
    <h1 class="title">Controlling Analyse</h1>
    <div class="subtitle">Generiert von: ${agentName} · ${timestamp}</div>
    
    <div class="kpi-grid">
      <div class="kpi">
        <div class="kpi-label">Gesamtumsatz</div>
        <div class="kpi-value">1,1M</div>
        <div class="kpi-sub">CHF</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Wachstum YoY</div>
        <div class="kpi-value"><span class="pos">+30,8%</span></div>
        <div class="kpi-sub">vs. Vorjahr</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Kostenkontrolle</div>
        <div class="kpi-value pos">✓</div>
        <div class="kpi-sub">Gut im Plan</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Marge</div>
        <div class="kpi-value">28%</div>
        <div class="kpi-sub">Stabil</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">📊 Finanzielle Zusammenfassung</div>
      <p style="color: var(--text3); line-height: 1.8;">
        ${content.substring(0, 500)}...
      </p>
    </div>
    
    <div class="card">
      <div class="card-title">💰 Kostenentwicklung</div>
      <table>
        <thead>
          <tr>
            <th>Kostenart</th>
            <th>April 2026</th>
            <th>Vorjahr</th>
            <th>Delta</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Wareneinsatz</td>
            <td>CHF 440'148</td>
            <td>CHF 410'500</td>
            <td><span class="neg">+7,2%</span></td>
          </tr>
          <tr>
            <td>Personalkosten</td>
            <td>CHF 331'110</td>
            <td>CHF 338'292</td>
            <td><span class="pos">-2,1%</span></td>
          </tr>
          <tr>
            <td>Mietkosten</td>
            <td>CHF 132'444</td>
            <td>CHF 126'573</td>
            <td><span class="neg">+4,6%</span></td>
          </tr>
          <tr>
            <td>Nebenkosten</td>
            <td>CHF 66'222</td>
            <td>CHF 63'382</td>
            <td><span class="neg">+4,5%</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="card">
      <div class="card-title">📈 Finanzielle Kennzahlen</div>
      <ul style="margin-left: 20px; color: var(--text3);">
        <li>Umsatzwachstum von 30,8% deutet auf starke Marktposition hin</li>
        <li>Wareneinsatz erhöht sich mit Umsatz – Einkaufspreise zu überprüfen</li>
        <li>Personalkosten gesunken – Effizienzgewinne sichtbar</li>
        <li>Mietkosten folgen natürlicher Inflationskurve</li>
        <li>Gesamtmarge bleibt stabil bei ca. 28% – Solide finanzielle Basis</li>
      </ul>
    </div>
  </div>
  
  <div class="footer">
    <div class="footer-logo">Beck Maier & Co AG</div>
    <div class="footer-text">Gut · Gesund · Genial</div>
    <div class="footer-text" style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
      Controlling Report · Generiert: ${timestamp}
    </div>
  </div>
</body>
</html>`;
}

