import { Entity } from './entity-extraction';

export interface SerpSearchResult {
  title: string;
  url: string;
  snippet: string;
  position: number;
  duration: string | null;
  thumbnail: string | null;
  raw: any;
}

export interface SerpSearchResponse {
  success: boolean;
  results: SerpSearchResult[];
  query: string;
  originalQuery: string;
  wasTruncated: boolean;
  metadata: {
    searchMetadata?: any;
    searchParameters?: any;
    searchInformation?: any;
  };
  fullResponse: any;
}

export interface SerpSearchError {
  success: false;
  error: string;
  details?: string;
}

/**
 * Performs a general Google search using SerpAPI for an entity
 * @param entity - The entity object to search for
 * @returns Promise resolving to the entity with URLs populated
 */
export async function searchEntityWithSerp(entity: Entity): Promise<Entity> {
  const serpApiKey = process.env.SERPAPI_API_KEY;
  if (!serpApiKey) {
    throw new Error('SerpAPI key not configured. Add SERPAPI_API_KEY to your .env.local file');
  }

  // Build search query from entity name and type
  const searchQuery = `${entity.name} ${entity.type}`;
  
  console.log('Searching Google via SerpAPI for entity:', searchQuery);

  // Use SerpAPI's Google search endpoint for general web search
  const searchUrl = new URL('https://serpapi.com/search');
  searchUrl.searchParams.append('engine', 'google');
  searchUrl.searchParams.append('q', searchQuery);
  searchUrl.searchParams.append('api_key', serpApiKey);
  searchUrl.searchParams.append('num', '5'); // Request 5 results
  
  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  
  let response;
  try {
    response = await fetch(searchUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SearchBot/1.0)',
      }
    });
  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    if (fetchError.name === 'AbortError') {
      console.error('SerpAPI request timed out');
      throw new Error('Search request timed out. Please try again.');
    }
    throw fetchError;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SerpAPI error status:', response.status, errorText);
    throw new Error(`SerpAPI error (${response.status}): ${errorText || 'Unknown error'}`);
  }

  const data = await response.json();
  
  // Check for API errors
  if (data.error) {
    throw new Error(data.error);
  }

  // Extract organic results (standard web search results)
  const organicResults = data.organic_results || [];
  
  if (organicResults.length === 0) {
    console.log('No results found. Response keys:', Object.keys(data));
    throw new Error('No search results found');
  }

  // Extract just the URLs from the top 5 results
  const urls = organicResults
    .slice(0, 5)
    .map((result: any) => result.link)
    .filter((url: string) => url); // Remove any undefined/null URLs

  // Return the entity with URLs populated
  return {
    ...entity,
    urls
  };
}

/**
 * Performs a search using SerpAPI for Instagram video results
 * @param query - The search query
 * @returns Promise resolving to search results or throwing an error
 */
export async function searchWithSerp(query: string): Promise<SerpSearchResponse> {
  // Limit query to first 100 characters and add Instagram site filter
  const limitedQuery = query.substring(0, 100);
  const instagramQuery = `${limitedQuery} site:instagram.com`;

  const serpApiKey = process.env.SERPAPI_API_KEY;
  if (!serpApiKey) {
    const error: SerpSearchError = {
      success: false,
      error: 'SerpAPI key not configured. Add SERPAPI_API_KEY to your .env.local file'
    };
    throw error;
  }

  console.log('Searching Google via SerpAPI for:', instagramQuery, limitedQuery.length < query.length ? `(truncated from ${query.length} chars)` : '');

  // Use SerpAPI's Google search endpoint with Instagram site filter
  const searchUrl = new URL('https://serpapi.com/search');
  // searchUrl.searchParams.append('engine', 'duckduckgo');
  searchUrl.searchParams.append('engine', 'google');
  searchUrl.searchParams.append('q', instagramQuery);
  searchUrl.searchParams.append('tbm', 'vid'); // Limit to video results only
  searchUrl.searchParams.append('api_key', serpApiKey);
  
  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  
  let response;
  try {
    response = await fetch(searchUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SearchBot/1.0)',
      }
    });
  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    if (fetchError.name === 'AbortError') {
      console.error('SerpAPI request timed out');
      const error: SerpSearchError = {
        success: false,
        error: 'Search request timed out. Please try again.'
      };
      throw error;
    }
    throw fetchError;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SerpAPI error status:', response.status, errorText);
    const error: SerpSearchError = {
      success: false,
      error: `SerpAPI error (${response.status}): ${errorText || 'Unknown error'}`,
      details: errorText
    };
    throw error;
  }

  const data = await response.json();
  
  // Check for API errors
  if (data.error) {
    const error: SerpSearchError = {
      success: false,
      error: data.error
    };
    throw error;
  }

  // Extract results - for video searches, SerpAPI returns video_results instead of organic_results
  const organicResults = data.video_results || data.organic_results || [];
  
  // Log first result structure for debugging
  if (organicResults.length > 0) {
    console.log('Sample result structure:', JSON.stringify(organicResults[0], null, 2));
    console.log('Available text fields:', {
      title: organicResults[0].title?.substring(0, 50),
      snippet: organicResults[0].snippet?.substring(0, 50),
      description: organicResults[0].description?.substring(0, 50),
      channelDescription: organicResults[0].channel?.description?.substring(0, 50),
    });
  } else {
    console.log('No results found. Response keys:', Object.keys(data));
  }
  
  const results = organicResults.slice(0, 5).map((result: any, index: number) => {
    // Try to get the most complete description available
    // Priority: channel description > snippet > description > title
    const snippet = result.channel?.description || 
                    result.snippet || 
                    result.description || 
                    result.title || 
                    'No description available';
    
    return {
      title: result.title || 'No title',
      url: result.link || '',
      snippet: snippet,
      position: result.position || index + 1,
      // Try to extract video duration from various possible fields
      duration: result.rich_snippet?.extensions?.duration || 
                result.video?.duration || 
                result.duration || 
                null,
      thumbnail: result.thumbnail || null,
      raw: result // Include all raw data from SerpAPI
    };
  });

  if (results.length === 0) {
    const error: SerpSearchError = {
      success: false,
      error: 'No search results found'
    };
    throw error;
  }

  return {
    success: true,
    results: results,
    query: instagramQuery,
    originalQuery: query,
    wasTruncated: limitedQuery.length < query.length,
    metadata: {
      searchMetadata: data.search_metadata,
      searchParameters: data.search_parameters,
      searchInformation: data.search_information,
    },
    fullResponse: data // Include complete SerpAPI response
  };
}

