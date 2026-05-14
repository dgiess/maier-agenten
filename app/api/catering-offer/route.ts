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
      filename: `Catering-Offerte-${offerData.anlass || "Event"}-${new Date().toISOString().split("T")[0]}.html`,
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
    kunde = {},
    variante = {},
    organizatorisch = {},
  } = data;

  const totalPersonen = parseInt(anzahlPersonen) || 20;
  const timestamp = new Date().toLocaleString("de-CH");
  const pricePerPerson = parseFloat(variante.pricePerPerson) || 25;
  const totalPrice = pricePerPerson * totalPersonen;

  // Generiere Produkttabelle aus Items
  const productRows = (variante.items || [])
    .map((item: any) => {
      const itemTotal = (parseFloat(item.einzelpreis || item.price) || 0) * (parseInt(item.menge || item.quantity) || 1);
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">
            <strong>${item.produktname || item.name || "Produkt"}</strong><br/>
            <small style="color: #666;">${item.artikelnummer ? `Art.Nr: ${item.artikelnummer}` : ""}</small>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.menge || item.quantity || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">CHF ${(parseFloat(item.einzelpreis || item.price) || 0).toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;"><strong>CHF ${itemTotal.toFixed(2)}</strong></td>
        </tr>
      `;
    })
    .join("");

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
  }
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: 'Georgia', serif;
    background: white;
    color: var(--text);
    line-height: 1.6;
    padding: 40px;
    max-width: 900px;
    margin: 0 auto;
  }
  
  .header {
    border-bottom: 3px solid var(--gold);
    padding-bottom: 30px;
    margin-bottom: 40px;
  }
  
  .logo {
    font-family: 'Georgia', serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--brown);
    margin-bottom: 4px;
  }
  
  .tagline {
    font-size: 12px;
    color: var(--gold);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  
  .offerte-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 30px;
    font-size: 13px;
  }
  
  .info-item {
    background: var(--cream);
    padding: 15px;
    border-radius: 6px;
    border-left: 3px solid var(--gold);
  }
  
  .info-label {
    font-size: 11px;
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 6px;
  }
  
  .info-value {
    font-size: 16px;
    font-weight: 700;
    color: var(--brown);
  }
  
  h1 {
    font-family: 'Georgia', serif;
    font-size: 32px;
    font-weight: 700;
    color: var(--brown);
    margin-bottom: 10px;
  }
  
  h2 {
    font-family: 'Georgia', serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--brown);
    margin: 30px 0 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--border);
  }
  
  .variante-header {
    background: var(--cream2);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .variante-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--brown);
  }
  
  .variante-price {
    font-size: 24px;
    font-weight: 700;
    color: var(--gold);
    text-align: right;
  }
  
  .variante-price-sub {
    font-size: 12px;
    color: var(--text3);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
    background: white;
  }
  
  thead th {
    background: var(--brown);
    color: white;
    padding: 12px;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .total-row {
    background: var(--cream2);
    font-weight: 700;
    font-size: 14px;
  }
  
  .total-row td {
    padding: 15px 12px;
    border-top: 2px solid var(--gold);
    border-bottom: 2px solid var(--gold);
  }
  
  .kunde-box {
    background: var(--cream);
    padding: 20px;
    border-radius: 8px;
    border-left: 3px solid var(--gold);
    margin-bottom: 30px;
  }
  
  .kunde-box h3 {
    font-size: 14px;
    font-weight: 700;
    color: var(--brown);
    margin-bottom: 12px;
  }
  
  .kunde-info {
    font-size: 13px;
    color: var(--text);
    line-height: 1.8;
  }
  
  .notes {
    background: var(--cream);
    padding: 20px;
    border-radius: 8px;
    border-left: 3px solid var(--gold);
    font-size: 13px;
    color: var(--text);
    line-height: 1.8;
    margin-bottom: 30px;
  }
  
  .footer {
    background: var(--brown);
    color: white;
    padding: 30px;
    text-align: center;
    margin-top: 40px;
    border-radius: 8px;
  }
  
  .footer h3 {
    font-family: 'Georgia', serif;
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  .footer p {
    font-size: 12px;
    opacity: 0.9;
    margin: 4px 0;
  }
  
  .validity {
    background: var(--cream);
    padding: 15px;
    border-radius: 6px;
    border-left: 3px solid var(--gold);
    margin-bottom: 30px;
    font-size: 13px;
  }
  
  @media print {
    body { padding: 20px; }
  }
</style>
</head>
<body>

<div class="header">
  <div class="logo">🥐 Beck Maier & Co AG</div>
  <div class="tagline">Bäckerei · Konditorei · Catering</div>
</div>

<h1>Catering-Offerte</h1>

<div class="offerte-info">
  <div class="info-item">
    <div class="info-label">Anlass</div>
    <div class="info-value">${anlass}</div>
  </div>
  <div class="info-item">
    <div class="info-label">Personen</div>
    <div class="info-value">${totalPersonen}</div>
  </div>
  <div class="info-item">
    <div class="info-label">Datum</div>
    <div class="info-value">${datum}</div>
  </div>
  <div class="info-item">
    <div class="info-label">Gültig</div>
    <div class="info-value">30 Tage</div>
  </div>
</div>

${kunde.name ? `
<div class="kunde-box">
  <h3>👤 Kundenangaben</h3>
  <div class="kunde-info">
    ${kunde.name ? `<strong>${kunde.name}</strong><br/>` : ""}
    ${kunde.adresse ? `${kunde.adresse}<br/>` : ""}
    ${kunde.telefon ? `📞 ${kunde.telefon}<br/>` : ""}
    ${kunde.email ? `📧 ${kunde.email}` : ""}
  </div>
</div>
` : ""}

<h2>📦 Menü-Zusammenstellung</h2>

<div class="variante-header">
  <div>
    <div class="variante-title">${variante.name || "Variante"}</div>
  </div>
  <div style="text-align: right;">
    <div class="variante-price">CHF ${totalPrice.toFixed(2)}</div>
    <div class="variante-price-sub">à CHF ${pricePerPerson.toFixed(2)}/Person</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Produkt & Artikelnummer</th>
      <th style="text-align: center; width: 80px;">Menge</th>
      <th style="text-align: right; width: 100px;">Einzelpreis</th>
      <th style="text-align: right; width: 100px;">Total</th>
    </tr>
  </thead>
  <tbody>
    ${productRows}
    <tr class="total-row">
      <td colspan="3" style="text-align: right;">Gesamttotal für ${totalPersonen} Personen:</td>
      <td style="text-align: right;">CHF ${totalPrice.toFixed(2)}</td>
    </tr>
  </tbody>
</table>

<div class="notes">
  <strong>💡 Hinweise:</strong><br/>
  Alle Preise verstehen sich inklusive Mehrwertsteuer. Lieferung und Aufbau können separat vereinbart werden. 
  Gerne passen wir die Zusammenstellung nach Ihren individuellen Wünschen an.
</div>

${organizatorisch.lieferung || organizatorisch.zeitpunkt ? `
<div class="validity">
  <strong>📍 Organisatorisches:</strong><br/>
  ${organizatorisch.lieferung ? `Lieferung: ${organizatorisch.lieferung}<br/>` : ""}
  ${organizatorisch.zeitpunkt ? `Zeitpunkt: ${organizatorisch.zeitpunkt}` : ""}
</div>
` : ""}

<div class="validity">
  <strong>⏰ Gültigkeitsdauer:</strong> Diese Offerte ist 30 Tage gültig. 
  Für Fragen, Änderungswünsche oder zur Buchung kontaktieren Sie uns bitte.
</div>

<div class="footer">
  <h3>Beck Maier & Co AG</h3>
  <p>Gut · Gesund · Genial</p>
  <p style="margin-top: 15px; font-size: 11px;">📞 +41 62 869 70 00</p>
  <p style="font-size: 11px;">📧 catering@beck-maier.ch</p>
  <p style="font-size: 11px;">🌐 www.beck-maier.ch</p>
</div>

</body>
</html>`;
}
