import { products, type Product } from "@/data/products";

export type MarketplaceIntent = "price" | "website" | "needs_human";
export type MarketplaceLanguage = "en" | "es" | "ko";
export type MarketplaceAction = "auto_reply" | "ask_sunjae";

export interface MarketplaceMessageContext {
  senderId?: string;
  senderName?: string;
  listingTitle?: string;
  messageId?: string;
}

export interface MarketplaceDecision {
  action: MarketplaceAction;
  intent: MarketplaceIntent;
  language: MarketplaceLanguage;
  reply?: string;
  source: "deterministic_rules" | "llm_classifier_local_facts" | "sunjae_escalation";
  confidence: "high" | "medium" | "low";
  matchedProducts?: Array<{ slug: string; name: string; variants: Array<{ label: string; price: number }> }>;
  sunjaeMessageKo?: string;
  customerMessage: string;
  context: MarketplaceMessageContext;
}

const WEBSITE_URL = process.env.DIPSPRINKLE_WEBSITE_URL || process.env.NEXT_PUBLIC_URL || "https://dipsprinkle.com";

const PRICE_WORDS = {
  en: ["price", "prices", "cost", "how much", "rate", "rates", "$"],
  es: ["precio", "precios", "cuánto", "cuanto", "cuesta", "costo", "vale"],
  ko: ["가격", "얼마", "비용", "금액"],
};

const WEBSITE_WORDS = {
  en: ["website", "web site", "site", "link", "order online", "menu", "catalog"],
  es: ["página", "pagina", "sitio", "website", "link", "enlace", "catálogo", "catalogo", "pedido"],
  ko: ["웹사이트", "사이트", "링크", "주문", "메뉴"],
};

const PRODUCT_ALIASES: Record<string, string[]> = {
  cakepop: ["cakepop", "cake pop", "cake pops", "케이크팝", "paleta", "paletas"],
  cake: ["cake", "cakes", "케이크", "pastel", "pasteles"],
  strawberry: ["strawberry", "strawberries", "딸기", "fresa", "fresas"],
  cupcake: ["cupcake", "cupcakes", "컵케이크"],
};

function includesAny(message: string, words: string[]): boolean {
  const lower = message.toLowerCase();
  return words.some((word) => lower.includes(word));
}

export function detectLanguage(message: string): MarketplaceLanguage {
  if (/[\uac00-\ud7af]/.test(message)) return "ko";
  if (includesAny(message, [...PRICE_WORDS.es, ...WEBSITE_WORDS.es])) return "es";
  return "en";
}

export function deterministicIntent(message: string): { intent: MarketplaceIntent; confidence: "high" | "medium" | "low" } {
  if (includesAny(message, Object.values(PRICE_WORDS).flat())) return { intent: "price", confidence: "high" };
  if (includesAny(message, Object.values(WEBSITE_WORDS).flat())) return { intent: "website", confidence: "high" };
  return { intent: "needs_human", confidence: "low" };
}

function visibleProducts(): Product[] {
  return products.filter((product) => !product.hidden);
}

function matchProducts(message: string): Product[] {
  const lower = message.toLowerCase();
  const requestedKeys = Object.entries(PRODUCT_ALIASES)
    .filter(([, aliases]) => aliases.some((alias) => lower.includes(alias)))
    .map(([key]) => key);
  const visible = visibleProducts();
  if (requestedKeys.length === 0) {
    return visible.filter((product) => /cake\s*pop|cakepop/i.test(`${product.slug} ${product.name}`));
  }
  const matches = visible.filter((product) => {
    const haystack = `${product.slug} ${product.name}`.toLowerCase();
    return requestedKeys.some((key) => PRODUCT_ALIASES[key].some((alias) => haystack.includes(alias)));
  });
  return matches.length ? matches : visible.slice(0, 5);
}

function money(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

function priceLines(matched: Product[]): string[] {
  return matched.slice(0, 5).map((product) => {
    const variants = product.variants.slice(0, 3).map((variant) => `${variant.label}: ${money(variant.price)}`).join(", ");
    return `${product.name} — ${variants}`;
  });
}

function websiteReply(language: MarketplaceLanguage): string {
  if (language === "es") return `¡Hola! Puedes ver el menú, precios y enviar tu pedido aquí: ${WEBSITE_URL} 😊`;
  if (language === "ko") return `안녕하세요! 메뉴, 가격, 주문은 웹사이트에서 확인하실 수 있어요: ${WEBSITE_URL} 😊`;
  return `Hi! You can see the menu, prices, and place an order here: ${WEBSITE_URL} 😊`;
}

function priceReply(language: MarketplaceLanguage, matched: Product[]): string {
  const lines = priceLines(matched).map((line) => `- ${line}`).join("\n");
  if (language === "es") return `¡Hola! Estos son los precios actuales:\n${lines}\nPuedes ver más opciones o pedir aquí: ${WEBSITE_URL}`;
  if (language === "ko") return `안녕하세요! 현재 가격은 아래와 같아요:\n${lines}\n더 많은 옵션과 주문은 웹사이트에서 확인해주세요: ${WEBSITE_URL}`;
  return `Hi! Current pricing is:\n${lines}\nYou can see more options or order here: ${WEBSITE_URL}`;
}

function sunjaeMessageKo(message: string, context: MarketplaceMessageContext, language: MarketplaceLanguage): string {
  return [
    "Sunjae, 아래 Facebook Marketplace 고객 질문에 답변이 필요해요.",
    "한국어로 답장해주면 영어 고객 답변으로 번역해서 보낼게요.",
    `고객 언어: ${language}`,
    `고객/PSID: ${context.senderName || context.senderId || "unknown"}`,
    `광고: ${context.listingTitle || "unknown"}`,
    `질문: ${message}`,
  ].join("\n");
}

export async function classifyWithOptionalLlm(message: string): Promise<{ intent: MarketplaceIntent; confidence: "medium" | "low"; used: boolean }> {
  if (process.env.FB_MARKETPLACE_USE_LLM !== "1" || !process.env.OPENAI_API_KEY) {
    return { intent: "needs_human", confidence: "low", used: false };
  }
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.FB_MARKETPLACE_LLM_MODEL || "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Classify a bakery Facebook Marketplace customer message. Return JSON only: {\"intent\":\"price|website|needs_human\",\"confidence\":\"medium|low\"}. Use price only when they ask about cost/pricing. Use website only when they ask for website/menu/order link. Otherwise needs_human. Do not answer the customer.",
          },
          { role: "user", content: message.slice(0, 1000) },
        ],
      }),
    });
    if (!response.ok) return { intent: "needs_human", confidence: "low", used: true };
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const parsed = JSON.parse(payload.choices?.[0]?.message?.content || "{}");
    if (["price", "website", "needs_human"].includes(parsed.intent)) {
      return { intent: parsed.intent, confidence: parsed.confidence === "medium" ? "medium" : "low", used: true };
    }
  } catch {
    return { intent: "needs_human", confidence: "low", used: true };
  }
  return { intent: "needs_human", confidence: "low", used: true };
}

export async function decideMarketplaceReply(message: string, context: MarketplaceMessageContext = {}): Promise<MarketplaceDecision> {
  const language = detectLanguage(message);
  const deterministic = deterministicIntent(message);
  let intent = deterministic.intent;
  let confidence = deterministic.confidence;
  let source: MarketplaceDecision["source"] = "deterministic_rules";

  if (intent === "needs_human") {
    const llm = await classifyWithOptionalLlm(message);
    if (llm.used && llm.intent !== "needs_human") {
      intent = llm.intent;
      confidence = llm.confidence;
      source = "llm_classifier_local_facts";
    }
  }

  if (intent === "website") {
    return { action: "auto_reply", intent, language, reply: websiteReply(language), source, confidence, customerMessage: message, context };
  }
  if (intent === "price") {
    const matched = matchProducts(message);
    return {
      action: "auto_reply",
      intent,
      language,
      reply: priceReply(language, matched),
      source,
      confidence,
      matchedProducts: matched.slice(0, 5).map((product) => ({
        slug: product.slug,
        name: product.name,
        variants: product.variants.slice(0, 3).map((variant) => ({ label: variant.label, price: variant.price })),
      })),
      customerMessage: message,
      context,
    };
  }

  return {
    action: "ask_sunjae",
    intent: "needs_human",
    language,
    source: "sunjae_escalation",
    confidence: "low",
    sunjaeMessageKo: sunjaeMessageKo(message, context, language),
    customerMessage: message,
    context,
  };
}
