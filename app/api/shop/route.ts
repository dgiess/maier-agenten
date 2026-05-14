import { NextRequest, NextResponse } from "next/server";

// WooCommerce API Konfiguration
const SHOP_URL = "https://beck-maier.ch";
const WC_KEY = process.env.WOOCOMMERCE_KEY;
const WC_SECRET = process.env.WOOCOMMERCE_SECRET;

// Basis64 Encoding für WooCommerce
function encodeAuth(key: string, secret: string): string {
  return Buffer.from(`${key}:${secret}`).toString("base64");
}

// Shop-Daten in den Memory cachen (für 1 Stunde)
let cachedProducts: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 Stunde

async function fetchShopProducts() {
  // Wenn Cache noch gültig → verwenden
  if (
    cachedProducts &&
    Date.now() - cacheTimestamp < CACHE_DURATION
  ) {
    return cachedProducts;
  }

  try {
    const auth = encodeAuth(WC_KEY!, WC_SECRET!);

    // Alle Produkte vom Shop laden (max 100 pro Request)
    const response = await fetch(
      `${SHOP_URL}/wp-json/wc/v3/products?per_page=100&status=publish`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`WooCommerce API Error: ${response.status}`);
    }

    const products = await response.json();

    // In schönes Format transformieren
    cachedProducts = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: parseFloat(p.price),
      regularPrice: parseFloat(p.regular_price),
      salePrice: p.sale_price ? parseFloat(p.sale_price) : null,
      categories: p.categories.map((c: any) => c.name),
      images: p.images.map((img: any) => img.src),
      sku: p.sku,
      stock: p.stock_quantity,
      inStock: p.in_stock,
      attributes: p.attributes,
    }));

    cacheTimestamp = Date.now();
    return cachedProducts;
  } catch (error) {
    console.error("Shop API Error:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const products = await fetchShopProducts();
    
    return NextResponse.json({
      success: true,
      productCount: products.length,
      products: products,
      cached: Date.now() - cacheTimestamp < CACHE_DURATION,
      cacheAge: Date.now() - cacheTimestamp,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "refresh") {
      // Cache zurücksetzen
      cachedProducts = null;
      cacheTimestamp = 0;
      const products = await fetchShopProducts();
      return NextResponse.json({
        success: true,
        message: "Cache aktualisiert",
        productCount: products.length,
      });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
