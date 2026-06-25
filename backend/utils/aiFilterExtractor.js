async function extractFiltersWithAI(message) {
  const fallback = {
    intent: "INVALID_PROMPT",
    productPosition: null,
    category: null,
    subCategory: null,
    fabric: null,
    color: null,
    size: null,
    minPrice: null,
    maxPrice: null,
    discountOnly: false,
    sort: null,
    searchTerm: null,
  };

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are a strict JSON filter extractor for a garment store.

Return ONLY JSON.

Allowed intents:
SEARCH_PRODUCTS
VIEW_PRODUCT
TRACK_ORDER
RESET
RAG_QUERY
INVALID_PROMPT

Allowed categories:
Male, Female, Kids

Allowed subCategories:
Shirt, T-Shirt, Kurti, Saree, Top, Dress, Gown, Salwar Kameez, Salwar Suit, Lengha Choli

Rules:
- Do not copy examples.
- Use the user's exact message only.

IMPORTANT INTENT RULES:

Use intent = "RAG_QUERY" when user asks for advice, guidance, recommendation, styling help, or informational questions.

Examples:
- "what should i wear for wedding" => RAG_QUERY
- "suggest me a wear for wedding" => RAG_QUERY
- "what is good for summer" => RAG_QUERY
- "which fabric is good for office" => RAG_QUERY
- "what should I wear in daily use" => RAG_QUERY

Use intent = "SEARCH_PRODUCTS" only when user clearly wants to see/buy/list products.

Examples:
- "show wedding dresses" => SEARCH_PRODUCTS
- "show silk sarees" => SEARCH_PRODUCTS
- "show cotton shirts" => SEARCH_PRODUCTS
- "find red kurtis" => SEARCH_PRODUCTS
- "show products for wedding" => SEARCH_PRODUCTS

Never guess subCategory like Dress unless user clearly mentions dress.

IMPORTANT:
- Store/help questions must be "RAG_QUERY", not "INVALID_PROMPT".
- If user asks about return policy, refund, exchange, shipping, delivery, payment, checkout, size guide, account, cart, order help, fabric guidance, outfit guidance, store information, or general shopping help, set intent to "RAG_QUERY".

INTENT RULE:

Classify by user purpose, not exact words.

Use RAG_QUERY when the user wants:
- advice
- styling guidance
- fashion information
- comparison
- recommendation without asking to show products

Use SEARCH_PRODUCTS when the user wants:
- show products
- find products
- list products
- buy products
- search products
- filter products

SUBCATEGORY RULE:

Only use subCategory when the user explicitly mentions one of the allowed subcategories.

Do not convert occasion/style words into subCategory.

Occasion/style words include wedding, party, office, festival, summer, daily, formal, casual, traditional.

These are not subCategory.

Invalid prompt rule:
- If the user's message is random gibberish, meaningless text, or completely unrelated to clothes, shopping, garments, store policy, return, refund, exchange, shipping, delivery, payment, size guide, account, cart, checkout, or order help, set intent to "INVALID_PROMPT".

- If the user says "reset", "clear", "clear memory", or similar, set intent to "RESET".
- If user says shirt/shirts, subCategory must be "Shirt".
- If user says t-shirt/tshirts/tee, subCategory must be "T-Shirt".
- If user says kurti/kurtis, subCategory must be "Kurti".
- If user says saree/sarees, subCategory must be "Saree".
- If user says women/ladies/female, category must be "Female".
- If user says men/male, category must be "Male".
- If user says kids/children, category must be "Kids".
- If no gender/category is mentioned, category must be null.
- If user says cotton/silk/denim/linen/polyester/wool/rayon, put it in fabric.
- For color, extract ONLY the single base color word.
- Allowed searchTerms are ONLY: wedding, party, summer, winter, casual.
- cheap/cheapest/budget means sort is "CHEAPEST".
- expensive/premium/luxury means sort is "EXPENSIVE".
- discount/offer/sale means discountOnly true and sort "DISCOUNT".
- latest/new/newest means sort "NEWEST".
- under/below/less than 1000 means maxPrice 1000.
- above/more than 1000 means minPrice 1000.
- open/view first product means intent "VIEW_PRODUCT" and productPosition 1.
- open/view second product means intent "VIEW_PRODUCT" and productPosition 2.
- open/view third product means intent "VIEW_PRODUCT" and productPosition 3.
- track order/my order means intent "TRACK_ORDER".
- If user says size like XS, S, M, L, XL, XXL, 3XL, extract it into size.

Normalize sizes:
small = "S"
medium = "M"
large = "L"
extra large = "XL"
double xl / 2xl = "XXL"
triple xl / 3xl = "3XL"

Return JSON in this exact shape:
{
  "intent": "SEARCH_PRODUCTS",
  "productPosition": null,
  "category": null,
  "subCategory": null,
  "fabric": null,
  "color": null,
  "size": null,
  "minPrice": null,
  "maxPrice": null,
  "discountOnly": false,
  "sort": null,
  "searchTerm": null
}
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.log("Groq API error:", data);
    return fallback;
  }

  const text = data.choices?.[0]?.message?.content;

  if (!text) return fallback;

  try {
    return JSON.parse(text);
  } catch (error) {
    console.log("AI JSON parse error:", text);
    return fallback;
  }
}

module.exports = extractFiltersWithAI;
