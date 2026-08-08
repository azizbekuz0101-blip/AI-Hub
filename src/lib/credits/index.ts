import { getUserCredits, deductUserCredits, recordUsageLog } from '../db';

export function checkCredits(userId: string, requiredCredits: number = 1): { hasCredits: boolean; currentCredits: number } {
  const currentCredits = getUserCredits(userId);
  return {
    hasCredits: currentCredits >= requiredCredits,
    currentCredits,
  };
}

export function recordUsage(
  userId: string,
  chatId: string | undefined,
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  inputPricePerMillion: number = 0,
  outputPricePerMillion: number = 0
): { estimatedCost: number; creditsDeducted: boolean } {
  const inputCost = (inputTokens / 1_000_000) * inputPricePerMillion;
  const outputCost = (outputTokens / 1_000_000) * outputPricePerMillion;
  const estimatedCost = inputCost + outputCost;

  // Deduct 1 credit per request for free models, or proportional credits for paid models
  const creditsToDeduct = Math.max(1, Math.ceil(estimatedCost * 100));
  const creditsDeducted = deductUserCredits(userId, creditsToDeduct);

  recordUsageLog(userId, chatId, modelId, inputTokens, outputTokens, estimatedCost);

  return {
    estimatedCost,
    creditsDeducted,
  };
}
