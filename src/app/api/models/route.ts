import { NextResponse } from 'next/server';
import { getAvailableModels } from '@/lib/ai/registry';

export async function GET() {
  try {
    const models = await getAvailableModels();
    return NextResponse.json({
      success: true,
      models,
      count: models.length,
    });
  } catch (error) {
    console.error('API Error in GET /api/models:', error);
    // Return fallback system model gracefully
    return NextResponse.json(
      {
        success: true,
        models: [
          {
            id: 'openrouter-free',
            name: 'Free AI',
            provider: 'openrouter',
            modelId: 'openrouter/free',
            description: 'Automatically selects an available free AI model.',
            category: 'Recommended',
            enabled: true,
            isFree: true,
            isSystemModel: true,
            supportsStreaming: true,
            supportsVision: true,
            supportsFiles: false,
            supportsTools: false,
            contextLength: 128000,
            inputPrice: 0,
            outputPrice: 0,
          },
        ],
        fallback: true,
      },
      { status: 200 }
    );
  }
}
