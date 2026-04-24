const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "anthropic/claude-haiku-4.5";
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

// ---------------------------------------------------------------------------
// Core AI caller
// ---------------------------------------------------------------------------

async function callAI(systemPrompt, userPrompt) {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Please add it to your .env file."
    );
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
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenRouter API error (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();

  if (!data.choices || !data.choices.length) {
    throw new Error("OpenRouter returned an empty response.");
  }

  return data.choices[0].message.content;
}

// ---------------------------------------------------------------------------
// Specialized AI functions
// ---------------------------------------------------------------------------

async function analyzePerformance(unitData) {
  const systemPrompt =
    "You are an expert franchise performance analyst. Given data about a franchise unit, " +
    "provide a detailed performance score (0-100), highlight strengths and weaknesses, " +
    "and offer actionable improvement recommendations. Return your analysis in structured JSON.";
  return callAI(systemPrompt, JSON.stringify(unitData));
}

async function forecastRevenue(revenueData) {
  const systemPrompt =
    "You are a revenue forecasting specialist for franchise businesses. Analyze the provided " +
    "historical revenue data and market conditions, then predict future revenue for the next " +
    "3, 6, and 12 months. Include confidence intervals and key assumptions. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(revenueData));
}

async function analyzeCompetitor(competitorData) {
  const systemPrompt =
    "You are a competitive intelligence analyst specializing in franchise markets. Perform a " +
    "deep analysis of the competitor data provided: market positioning, strengths, weaknesses, " +
    "threat level, and strategic recommendations for the franchise owner. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(competitorData));
}

async function suggestExpansion(marketData) {
  const systemPrompt =
    "You are a franchise expansion strategist. Evaluate the market data and recommend optimal " +
    "expansion locations, timing, investment requirements, and projected ROI. Rank opportunities " +
    "by attractiveness and risk. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(marketData));
}

async function optimizeStaffing(staffData) {
  const systemPrompt =
    "You are a workforce optimization expert for franchise operations. Analyze the staffing data " +
    "and provide recommendations on scheduling, hiring needs, labor cost optimization, and " +
    "productivity improvements. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(staffData));
}

async function analyzeSentiment(reviewData) {
  const systemPrompt =
    "You are a customer sentiment analysis specialist. Analyze the provided customer reviews " +
    "and feedback data. Calculate overall sentiment scores, identify recurring themes (positive " +
    "and negative), and suggest concrete actions to improve customer satisfaction. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(reviewData));
}

async function optimizeSupplyChain(supplyData) {
  const systemPrompt =
    "You are a supply chain optimization expert for franchise networks. Analyze the supply chain " +
    "data and recommend improvements for inventory management, vendor selection, cost reduction, " +
    "and delivery efficiency. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(supplyData));
}

async function recommendTraining(trainingData) {
  const systemPrompt =
    "You are a franchise training and development specialist. Based on the performance and " +
    "training data provided, recommend specific training programs, prioritize skill gaps, " +
    "estimate impact on performance, and suggest implementation timelines. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(trainingData));
}

async function optimizeMenu(menuData) {
  const systemPrompt =
    "You are a menu and product optimization consultant for franchise businesses. Analyze sales " +
    "mix, margins, customer preferences, and trends. Recommend items to promote, retire, or " +
    "introduce, with projected revenue impact. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(menuData));
}

async function auditFinancials(financialData) {
  const systemPrompt =
    "You are a financial auditor specializing in franchise operations. Perform a comprehensive " +
    "health audit of the financial data: profitability, cash flow, expense ratios, debt levels, " +
    "and red flags. Provide a financial health score and recommendations. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(financialData));
}

async function generateCampaign(campaignData) {
  const systemPrompt =
    "You are a marketing strategist for franchise businesses. Generate a complete marketing " +
    "campaign plan including target audience, channels, messaging, budget allocation, timeline, " +
    "and expected KPIs based on the provided data. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(campaignData));
}

async function checkCompliance(complianceData) {
  const systemPrompt =
    "You are a franchise compliance officer and regulatory expert. Analyze the provided data " +
    "against franchise agreement terms, local regulations, and industry standards. Identify " +
    "compliance gaps, risk levels, and corrective actions required. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(complianceData));
}

async function generateTripPlan(tripData) {
  const systemPrompt =
    "You are a franchise operations travel planner. Generate a detailed day-by-day trip plan " +
    "for visiting franchise locations, including scheduling, route optimization, meeting agendas, " +
    "estimated budgets (travel, lodging, meals), and key inspection points. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(tripData));
}

async function generateBenchmark(benchmarkData) {
  const systemPrompt =
    "You are a franchise benchmarking specialist. Generate a comprehensive benchmark report " +
    "comparing the franchise unit(s) against industry standards and peer performance. Include " +
    "KPI rankings, percentile placements, gap analysis, and improvement priorities. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(benchmarkData));
}

async function estimateValuation(valuationData) {
  const systemPrompt =
    "You are a franchise valuation expert. Estimate the current market value of the franchise " +
    "unit using multiple methods (income, market, asset-based). Provide a valuation range, " +
    "key value drivers, risk factors, and comparison to recent transactions. Return structured JSON.";
  return callAI(systemPrompt, JSON.stringify(valuationData));
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  callAI,
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
