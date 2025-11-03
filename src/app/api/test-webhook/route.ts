import { NextRequest, NextResponse } from 'next/server';
import { crawlInstagramUrl, InstagramCrawlError, InstagramCrawlResult } from '@/lib/backend/instagram-crawler';
import { getVideoDuration, VideoDurationResult } from '@/lib/backend/video-duration';
import { transcribeVideo, TranscriptionResult } from '@/lib/backend/video-transcription';
import { searchEntityWithSerp, searchWithSerp, SerpSearchResult } from '@/lib/backend/serp-search';
import { searchInstagramReels } from '@/lib/api';
import { findBestMatch, FindMatchResult } from '@/lib/matching';
import { Entity, MatchedResult } from '@/lib/store';
import { extractEntities, convertWebhookOutputToLLMInput, EntityExtractionResult, LLMInput } from '@/lib/backend/entity-extraction';

export interface WebhookOutput {
  result?: {
    title: string | null;
    videoUrl: string | null;
    videoDuration?: number | null;
    videoTranscription?: string;
    bestMatch: {
      title: string | null;
      videoUrl: string | null;
      author: string | null;
    } | null;
    entities?: Entity[];
  };
  debug?: {
    searchResults: SerpSearchResult[] | null;
    bestMatch: FindMatchResult | null;
    bestMatchInstagramCrawlResult: InstagramCrawlResult | null;
    entityExtractionResult?: EntityExtractionResult;
  };
}

export interface TestWebhookRespose {
  success: boolean;
  result: WebhookOutput;
  instagramCrawlResult: InstagramCrawlResult;
}

interface WebhookData {
  title: string | null;
  videoUrl: string | null;
}

const processWebhook = async (webhookData: WebhookData) => {
  // If there's a video url, get the duration and the transcribe
  let videoDurationResult: VideoDurationResult | null = null;
  let audioTranscriptionResult: TranscriptionResult | null = null;
  if (webhookData.videoUrl) {
    videoDurationResult = await getVideoDuration(webhookData.videoUrl);
    audioTranscriptionResult = await transcribeVideo(webhookData.videoUrl);
  }

  // Search for Instagram reels based on title or audio transcription
  let searchResults: SerpSearchResult[] = [];
  const title = webhookData.title ? webhookData.title : null
  const audioTranscription = (audioTranscriptionResult && audioTranscriptionResult.transcription) ? audioTranscriptionResult.transcription : null

  const searchString: string | null = title || audioTranscription || null
  if (searchString) {
    const results = await searchWithSerp(searchString);
    searchResults = results.results || [];
  }

  // Find the best match based on the video duration
  let bestMatch: FindMatchResult | null = null;
  if (searchResults.length > 0) {
    bestMatch = await findBestMatch(searchResults, videoDurationResult?.duration || null);
  }

  // If there is a best match, then crawl the match on instagram
  let bestMatchInstagramCrawlResult: InstagramCrawlResult | null = null;
  if (bestMatch && bestMatch.success && bestMatch.matchedResult) {
    const bestMatchInstagramCrawlResultLocal = await crawlInstagramUrl(bestMatch.matchedResult.url);
    if (bestMatchInstagramCrawlResultLocal.success) {
      bestMatchInstagramCrawlResult = bestMatchInstagramCrawlResultLocal;
    }
  }

  // Extract entities from the output
  const llmInput = {
    author: bestMatchInstagramCrawlResult?.author || null ,
    title: webhookData.title || null,
    videoDuration: videoDurationResult?.duration || null,
    videoTranscription: audioTranscriptionResult?.transcription || undefined,
  } as LLMInput;

  const entityExtractionResult = await extractEntities(llmInput);

  const entities = entityExtractionResult?.entities || [];
  const entitiesWithUrls: Entity[] = [];
  for (const entity of entities) {
    const entityWithUrls = await searchEntityWithSerp(entity);
    entitiesWithUrls.push(entityWithUrls);
  }
  const entitiesFinal = entitiesWithUrls || entities

  // Now we've got everything. If we have enough, return it. Otherwise, return an error.
  const output: WebhookOutput = {
    result: {
      title: webhookData.title,
      videoUrl: webhookData.videoUrl,
      videoDuration: videoDurationResult?.duration,
      videoTranscription: audioTranscriptionResult?.transcription,
      bestMatch: bestMatchInstagramCrawlResult ? {
        title: bestMatchInstagramCrawlResult?.title || null,
        videoUrl: bestMatchInstagramCrawlResult?.videoUrl || null,
        author: bestMatchInstagramCrawlResult?.author || null,
      } : null,
      entities: entitiesFinal,
    },
    debug: {
      searchResults,
      bestMatch,
      bestMatchInstagramCrawlResult,
      entityExtractionResult
    }
  };
  
  return output;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const instagramCrawlResult = await crawlInstagramUrl(url);
    if (!instagramCrawlResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to crawl Instagram URL' },
        { status: 400 }
      );
    }

    const webhookData = {
      title: instagramCrawlResult.title || null,
      videoUrl: instagramCrawlResult.videoUrl || null,
    }

    const output = await processWebhook(webhookData)

    return NextResponse.json({ success: true, result: output, instagramCrawlResult } as TestWebhookRespose);

  } catch (error) {
    console.error('Instagram crawl error:', error);
    
    // Check if it's a navigation timeout error
    if (error instanceof Error && error.message.includes('Failed to load Instagram page')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 504 }
      );
    }
    
    // Check if it's the custom error with debug info (no description found)
    if (typeof error === 'object' && error !== null && 'success' in error) {
      const crawlError = error as InstagramCrawlError;
      return NextResponse.json(crawlError, { status: 404 });
    }
    
    // Generic error fallback
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to crawl Instagram URL'
      },
      { status: 500 }
    );
  }
}

