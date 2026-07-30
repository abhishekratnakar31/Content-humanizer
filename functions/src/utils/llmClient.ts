import { GoogleGenerativeAI } from '@google/generative-ai';

import { logTokenUsage } from './tokenLogger';


function calculateCost(model: string, tokensIn: number, tokensOut: number): number {
  const pricing: Record<string, { in: number; out: number }> = {
    'gemini-3.1-pro': { in: 2.00 / 1_000_000, out: 12.00 / 1_000_000 },
    'gemini-3.1-flash': { in: 0.50 / 1_000_000, out: 3.00 / 1_000_000 },
    'gemini-3-flash': { in: 0.50 / 1_000_000, out: 3.00 / 1_000_000 },
    'gemini-3.1-flash-lite': { in: 0.25 / 1_000_000, out: 1.50 / 1_000_000 },
    'gemini-2.5-pro': { in: 1.25 / 1_000_000, out: 10.00 / 1_000_000 },
    'gemini-2.5-flash': { in: 0.30 / 1_000_000, out: 2.50 / 1_000_000 },
    'gemini-2.5-flash-lite': { in: 0.10 / 1_000_000, out: 0.40 / 1_000_000 },
    'gemini-1.5-pro': { in: 1.25 / 1_000_000, out: 5.00 / 1_000_000 },
    'gemini-1.5-flash': { in: 0.075 / 1_000_000, out: 0.30 / 1_000_000 },
  };

  let matchedModel = 'gemini-2.5-flash';
  for (const k of Object.keys(pricing)) {
    if (model.toLowerCase().includes(k)) {
      matchedModel = k;
      break;
    }
  }

  const rates = pricing[matchedModel];
  return (tokensIn * rates.in) + (tokensOut * rates.out);
}

export interface LlmMetrics {
  tokensIn: number;
  tokensOut: number;
  thinkingTokens?: number;
  latencyMs: number;
  costUsd: number;
  status: 'completed' | 'failed';
  errorMessage?: string;
}

export interface CallLlmOptions {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  agentName?: string;
  userId?: string;
  jobId?: string;
  userLlmKeys?: {
    gemini?: string | null;
    openai?: string | null;
    openrouter?: string | null;
  };
  maxTokens?: number;
}

export async function callLlm(options: CallLlmOptions): Promise<{ output: string; metrics: LlmMetrics }> {
  const startTime = Date.now();
  const {
    model, systemPrompt, userPrompt, jsonMode = false,
    temperature,
    agentName = 'Unknown Agent', userId, jobId,
    userLlmKeys
  } = options;

  let selectedProvider: 'gemini' | 'openai' | 'openrouter' = 'gemini';
  let apiKey = '';
  let modelToCall = model;

  // Canonicalize modelToCall if it doesn't have a provider prefix
  if (!modelToCall.includes('/')) {
    if (modelToCall.toLowerCase().startsWith('gemini-')) {
      modelToCall = 'google/' + modelToCall;
    } else if (modelToCall.toLowerCase().startsWith('gpt-')) {
      modelToCall = 'openai/' + modelToCall;
    }
  }

  const mLower = modelToCall.toLowerCase();
  const hasGeminiKey = !!(userLlmKeys?.gemini || process.env.GEMINI_API_KEY);
  const hasOpenaiKey = !!(userLlmKeys?.openai || process.env.OPENAI_API_KEY);
  const hasOpenRouterKey = !!(userLlmKeys?.openrouter || process.env.OPENROUTER_API_KEY);

  // Key Routing Hierarchy
  if (userLlmKeys?.gemini && (mLower.includes('gemini') || mLower.startsWith('google/'))) {
    selectedProvider = 'gemini';
    apiKey = userLlmKeys.gemini;
  } else if (userLlmKeys?.openai && (mLower.includes('gpt') || mLower.startsWith('openai/'))) {
    selectedProvider = 'openai';
    apiKey = userLlmKeys.openai;
  } else if (userLlmKeys?.openrouter) {
    selectedProvider = 'openrouter';
    apiKey = userLlmKeys.openrouter;
  } else {
    // System fallback
    if (hasOpenRouterKey && (mLower.startsWith('google/') || mLower.startsWith('openai/') || mLower.startsWith('anthropic/') || !mLower.includes('gemini'))) {
      selectedProvider = 'openrouter';
      apiKey = process.env.OPENROUTER_API_KEY!;
    } else if (hasGeminiKey && mLower.includes('gemini')) {
      selectedProvider = 'gemini';
      apiKey = (userLlmKeys?.gemini || process.env.GEMINI_API_KEY)!;
    } else if (hasOpenaiKey && mLower.includes('gpt')) {
      selectedProvider = 'openai';
      apiKey = (userLlmKeys?.openai || process.env.OPENAI_API_KEY)!;
    } else if (hasOpenRouterKey) {
      selectedProvider = 'openrouter';
      apiKey = process.env.OPENROUTER_API_KEY!;
    } else {
      throw new Error(`No API key available for model: ${model}`);
    }
  }

  try {
    let textOut = '';
    let tokensIn = 0;
    let tokensOut = 0;
    let thinkingTokens = 0;

    if (selectedProvider === 'gemini') {
      let modelName = modelToCall;
      if (modelName.startsWith('google/')) {
        modelName = modelName.substring(7);
      } else if (modelName.startsWith('gemini/')) {
        modelName = modelName.substring(7);
      }
      if (!modelName.startsWith('gemini-')) {
        const isPro = modelName.toLowerCase().includes('pro');
        modelName = isPro ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const isPro = modelName.toLowerCase().includes('pro');

      const genModel = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt
      });

      const config: any = { maxOutputTokens: isPro ? 16384 : 8192 };
      if (jsonMode) config.responseMimeType = 'application/json';
      if (temperature !== undefined) config.temperature = temperature;
      
      let attempt = 0;
      let response: any;
      while (attempt < 3) {
        try {
          const res = await genModel.generateContent({ contents: [{ role: 'user', parts: [{ text: userPrompt }] }], generationConfig: config });
          response = res.response;
          break;
        } catch (err: any) {
          if (err.message && err.message.includes('429') && attempt < 2) {
            console.warn(`Gemini 429 hit. Retrying...`);
            await new Promise(r => setTimeout(r, 10000));
            attempt++;
          } else {
            throw err;
          }
        }
      }

      textOut = response.text();
      tokensIn = response.usageMetadata?.promptTokenCount || 0;
      tokensOut = response.usageMetadata?.candidatesTokenCount || 0;
      thinkingTokens = response.usageMetadata?.totalThoughtTokens || response.usageMetadata?.thoughtsTokenCount || 0;
    } else if (selectedProvider === 'openai' || selectedProvider === 'openrouter') {
      const url = selectedProvider === 'openai'
        ? 'https://api.openai.com/v1/chat/completions'
        : 'https://openrouter.ai/api/v1/chat/completions';

      if (selectedProvider === 'openai' && modelToCall.startsWith('openai/')) {
        modelToCall = modelToCall.substring(7);
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };

      if (selectedProvider === 'openrouter') {
        headers['HTTP-Referer'] = 'https://content-humanizer.ai';
        headers['X-Title'] = 'Content Humanizer';
      }

      const body: any = {
        model: modelToCall,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: options.maxTokens ?? 3000
      };

      if (temperature !== undefined) body.temperature = temperature;
      if (jsonMode) {
        body.response_format = { type: 'json_object' };
      }

      let attempt = 0;
      let resData: any = null;

      while (attempt < 3) {
        try {
          const res = await globalThis.fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
          });

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errText}`);
          }

          resData = await res.json();
          break;
        } catch (err: any) {
          if (err.message && (err.message.includes('429') || err.message.includes('503')) && attempt < 2) {
            console.warn(`${selectedProvider} retryable error hit. Retrying in 5s...`);
            await new Promise(r => setTimeout(r, 5000));
            attempt++;
          } else {
            throw err;
          }
        }
      }

      if (!resData || !resData.choices || resData.choices.length === 0) {
        throw new Error(`Invalid response from ${selectedProvider} API`);
      }

      textOut = resData.choices[0].message?.content || '';
      tokensIn = resData.usage?.prompt_tokens || 0;
      tokensOut = resData.usage?.completion_tokens || 0;
      if (resData.usage?.completion_tokens_details?.reasoning_tokens) {
        thinkingTokens = resData.usage.completion_tokens_details.reasoning_tokens;
      }
    }
 else {
      throw new Error(`Unsupported model: ${model}`);
    }

    const latencyMs = Date.now() - startTime;
    const costUsd = calculateCost(model, tokensIn, tokensOut);
    const metrics: LlmMetrics = { tokensIn, tokensOut, thinkingTokens, latencyMs, costUsd, status: 'completed' };

    await logTokenUsage({ userId, jobId, agentName, model, tokensIn, tokensOut, thinkingTokens, costUsd, latencyMs }).catch(console.error);

    return { output: textOut, metrics };

  } catch (error: any) {
    console.error(`LLM Call failed for model ${model}:`, error);
    const metrics: LlmMetrics = {
      tokensIn: 0,
      tokensOut: 0,
      thinkingTokens: 0,
      latencyMs: Date.now() - startTime,
      costUsd: 0,
      status: 'failed',
      errorMessage: error.message
    };
    return { output: '', metrics };
  }
}
