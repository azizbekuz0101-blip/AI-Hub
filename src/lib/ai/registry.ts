import { AIModel } from './types';
import { getOpenRouterModels, SYSTEM_FREE_MODEL } from './openrouter-models';
import { MockProvider } from './providers/mock';

export async function getAvailableModels(): Promise<AIModel[]> {
  const isMockMode = process.env.MOCK_MODE === 'true';
  const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== '');

  if (isMockMode || !hasOpenRouterKey) {
    const mockProvider = new MockProvider();
    return await mockProvider.getModels();
  }

  try {
    const models = await getOpenRouterModels();
    return models;
  } catch (err) {
    console.error('Error in model registry getAvailableModels:', err);
    // Fallback to Mock models so site never crashes
    const mockProvider = new MockProvider();
    return await mockProvider.getModels();
  }
}

export { SYSTEM_FREE_MODEL };
