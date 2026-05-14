const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "anthropic/claude-3-5-sonnet-20241022";
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

// Boot-time validation warning
if (!OPENROUTER_API_KEY) {
  console.warn("[openRouterService] WARNING: OPENROUTER_API_KEY is not set. AI calls will fail.");
}

async function callAI(systemPrompt, userPrompt, options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set. Please add it to your .env file.");
  }
  const url = `${OPENROUTER_BASE_URL}/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://ai-franchise-performance-benchmarker.app",
      "X-Title": "AI Franchise Performance Benchmarker",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: typeof userPrompt === 'string' ? userPrompt : JSON.stringify(userPrompt) },
      ],
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.4,
      ...(options.tools ? { tools: options.tools, tool_choice: options.tool_choice || 'auto' } : {})
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }
  const data = await response.json();
  if (!data.choices || !data.choices.length) throw new Error("OpenRouter returned an empty response.");
  return data.choices[0].message.content;
}

// Tool-call enabled callAI returning the full message (so caller can dispatch tools)
async function callAIWithTools(systemPrompt, conversation, tools) {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not set.");
  const url = `${OPENROUTER_BASE_URL}/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://ai-franchise-performance-benchmarker.app",
      "X-Title": "AI Franchise Performance Benchmarker",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...conversation],
      tools,
      tool_choice: "auto",
      max_tokens: 4096,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }
  const data = await response.json();
  if (!data.choices || !data.choices.length) throw new Error("OpenRouter returned an empty response.");
  return data.choices[0].message;
}

const RETURN_JSON = " Return ONLY valid JSON.";

async function analyzePerformance(unitData) {
  return callAI(
    "You are an expert franchise performance analyst. Provide performance_score (0-100), strengths, weaknesses, recommendations." + RETURN_JSON,
    JSON.stringify(unitData));
}
async function forecastRevenue(revenueData) {
  return callAI(
    "You are a revenue forecasting specialist. Predict revenue for next 3, 6, 12 months with confidence intervals and assumptions." + RETURN_JSON,
    JSON.stringify(revenueData));
}
async function analyzeCompetitor(competitorData) {
  return callAI(
    "You are a competitive intelligence analyst. Provide market_positioning, strengths, weaknesses, threat_level, recommendations." + RETURN_JSON,
    JSON.stringify(competitorData));
}
async function suggestExpansion(marketData) {
  return callAI(
    "You are a franchise expansion strategist. Recommend optimal expansion locations, timing, investment, projected ROI ranked by attractiveness/risk." + RETURN_JSON,
    JSON.stringify(marketData));
}
async function optimizeStaffing(staffData) {
  return callAI(
    "You are a workforce optimization expert. Recommend scheduling, hiring needs, labor cost optimization, productivity improvements." + RETURN_JSON,
    JSON.stringify(staffData));
}
async function analyzeSentiment(reviewData) {
  return callAI(
    "You are a customer sentiment specialist. Provide sentiment_score, themes (positive/negative arrays), and concrete actions." + RETURN_JSON,
    JSON.stringify(reviewData));
}
async function optimizeSupplyChain(supplyData) {
  return callAI(
    "You are a supply chain optimization expert. Recommend inventory, vendor selection, cost reduction, delivery efficiency improvements." + RETURN_JSON,
    JSON.stringify(supplyData));
}
async function recommendTraining(trainingData) {
  return callAI(
    "You are a training/development specialist. Recommend programs, prioritise skill gaps, estimate impact, give timelines." + RETURN_JSON,
    JSON.stringify(trainingData));
}
async function optimizeMenu(menuData) {
  return callAI(
    "You are a menu optimization consultant. Recommend items to promote, retire, or introduce with revenue impact." + RETURN_JSON,
    JSON.stringify(menuData));
}
async function auditFinancials(financialData) {
  return callAI(
    "You are a financial auditor. Provide health_score, profitability, cash flow, expense ratios, debt, red_flags, recommendations." + RETURN_JSON,
    JSON.stringify(financialData));
}
async function generateCampaign(campaignData) {
  return callAI(
    "You are a marketing strategist. Generate target audience, channels, messaging, budget, timeline, KPIs." + RETURN_JSON,
    JSON.stringify(campaignData));
}
async function checkCompliance(complianceData) {
  return callAI(
    "You are a franchise compliance officer. Identify gaps, risk_level, corrective_actions." + RETURN_JSON,
    JSON.stringify(complianceData));
}
async function generateTripPlan(tripData) {
  return callAI(
    "You are a franchise operations travel planner. Day-by-day itinerary with route, agendas, budgets, inspection points." + RETURN_JSON,
    JSON.stringify(tripData));
}
async function generateBenchmark(benchmarkData) {
  return callAI(
    "You are a benchmarking specialist. KPI rankings, percentile placements, gap_analysis, improvement_priorities." + RETURN_JSON,
    JSON.stringify(benchmarkData));
}
async function estimateValuation(valuationData) {
  return callAI(
    "You are a franchise valuation expert. Use income, market, asset-based methods. Provide valuation_range_usd {low, mid, high}, key_value_drivers, risk_factors." + RETURN_JSON,
    JSON.stringify(valuationData));
}

module.exports = {
  callAI,
  callAIWithTools,
  analyzePerformance,
  forecastRevenue,
  analyzeCompetitor,
  suggestExpansion,
  optimizeStaffing,
  analyzeSentiment,
  optimizeSupplyChain,
  recommendTraining,
  optimizeMenu,
  auditFinancials,
  generateCampaign,
  checkCompliance,
  generateTripPlan,
  generateBenchmark,
  estimateValuation,
};
