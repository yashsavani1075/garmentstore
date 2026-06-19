async function extractFiltersWithAI(message) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

Allowed categories:
Male, Female, Kids

Allowed subCategories:
Shirt, T-Shirt, Kurti, Saree, Top, Dress, Gown, Salwar Kameez, Salwar Suit, Lengha Choli

Rules:
- Do not copy examples.
- Use the user's exact message only.
- If user says shirt/shirts, subCategory must be "Shirt".
- If user says t-shirt/tshirts/tee, subCategory must be "T-Shirt".
- If user says kurti/kurtis, subCategory must be "Kurti".
- If user says saree/sarees, subCategory must be "Saree".
- If user says women/ladies/female, category must be "Female".
- If user says men/male, category must be "Male".
- If user says kids/children, category must be "Kids".
- If no gender/category is mentioned, category must be null.
- If user says cotton/silk/denim/etc, put it in fabric.
- cheap/cheapest/budget means sort is "CHEAPEST".
- expensive/premium/luxury means sort is "EXPENSIVE".
- discount/offer/sale means discountOnly true and sort "DISCOUNT".
- latest/new/newest means sort "NEWEST".
- under/below/less than 1000 means maxPrice 1000.
- above/more than 1000 means minPrice 1000.
- open/view first product means intent "VIEW_PRODUCT" and productPosition 1.
- track order/my order means intent "TRACK_ORDER".

Return JSON in this exact shape:
{
  "intent": "SEARCH_PRODUCTS",
  "productPosition": null,
  "category": null,
  "subCategory": null,
  "fabric": null,
  "color": null,
  "minPrice": null,
  "maxPrice": null,
  "discountOnly": false,
  "sort": null
}
`
        },
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.log("Groq API error:", data);
    throw new Error(data.error?.message || "Groq API failed");
  }

  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("AI did not return JSON");
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.log("AI JSON parse error:", text);

    return {
      intent: "SEARCH_PRODUCTS",
      productPosition: null,
      category: null,
      subCategory: null,
      fabric: null,
      color: null,
      minPrice: null,
      maxPrice: null,
      discountOnly: false,
      sort: null,
    };
  }
}

module.exports = extractFiltersWithAI;