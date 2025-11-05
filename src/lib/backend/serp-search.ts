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
  // Strip newlines from the query first
  const cleanedQuery = query.replace(/[\r\n]+/g, ' ');
  
  // Limit query to first 100 characters and add Instagram site filter
  let limitedQuery = cleanedQuery.substring(0, 100);
  
  // If we truncated and didn't end on a word boundary, handle the partial word
  if (cleanedQuery.length > 100) {
    // Check if we're in the middle of a word (next char exists and is not whitespace)
    if (cleanedQuery[100] && !/\s/.test(cleanedQuery[100])) {
      // Find the end of the current word in the remaining string
      const restOfString = cleanedQuery.substring(100);
      const wordEndMatch = restOfString.match(/^(\S+)/);
      
      if (wordEndMatch) {
        const remainingWord = wordEndMatch[1];
        
        // If the remaining part of the word is <= 20 characters, include it
        if (remainingWord.length <= 20) {
          limitedQuery += remainingWord;
        } else {
          // Remove the partial word we already have at the end
          limitedQuery = limitedQuery.replace(/\S+$/, '').trimEnd();
        }
      }
    }
  }

  const instagramQuery = `${limitedQuery} site:instagram.com`;

  const serpApiKey = process.env.SERPAPI_API_KEY;
  if (!serpApiKey) {
    const error: SerpSearchError = {
      success: false,
      error: 'SerpAPI key not configured. Add SERPAPI_API_KEY to your .env.local file'
    };
    throw error;
  }

  console.log('Searching Google via SerpAPI for:', instagramQuery, limitedQuery.length < cleanedQuery.length ? `(truncated from ${cleanedQuery.length} chars)` : '');

  // Use SerpAPI's Google search endpoint with Instagram site filter
  const searchUrl = new URL('https://serpapi.com/search');

  // searchUrl.searchParams.append('engine', 'duckduckgo');
  searchUrl.searchParams.append('engine', 'google_videos');
  searchUrl.searchParams.append('google_domain', 'google.com');
  searchUrl.searchParams.append('q', instagramQuery);
  // searchUrl.searchParams.append('tbm', 'vid'); // Limit to video results only
  searchUrl.searchParams.append('api_key', serpApiKey);
  searchUrl.searchParams.append('async', 'true');
  
  // Retry configuration
  const maxRetries = 3; // Retries for network errors
  const maxNoResultsRetries = 2; // Additional retries when no results found
  const baseDelay = 1000; // 1 second
  
  let results: SerpSearchResult[] = [];
  let responseData: any = null;
  
  // Outer loop: retry when no results found
  for (let noResultsAttempt = 1; noResultsAttempt <= maxNoResultsRetries; noResultsAttempt++) {
    let response;
    let lastError: any;
    
    // Inner loop: retry for network/server errors
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const attemptLabel = maxNoResultsRetries > 1 ? `(network attempt ${attempt}/${maxRetries}, search attempt ${noResultsAttempt}/${maxNoResultsRetries})` : `(attempt ${attempt}/${maxRetries})`;
        console.log(`Search URL ${attemptLabel}:`, searchUrl.toString());
        response = await fetch(searchUrl.toString(), {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SearchBot/1.0)',
          }
        });
        
        clearTimeout(timeoutId);
        
        // If successful or client error (4xx), don't retry network errors
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          break;
        }
        
        // Server error (5xx) - retry
        console.warn(`SerpAPI returned status ${response.status}, retrying...`);
        lastError = new Error(`Server error: ${response.status}`);
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        lastError = fetchError;
        
        if (fetchError.name === 'AbortError') {
          console.error(`SerpAPI request timed out (attempt ${attempt}/${maxRetries})`);
          if (attempt === maxRetries) {
            const error: SerpSearchError = {
              success: false,
              error: 'Search request timed out after multiple attempts. Please try again.'
            };
            throw error;
          }
        } else {
          console.error(`SerpAPI request failed (attempt ${attempt}/${maxRetries}):`, fetchError.message);
          if (attempt === maxRetries) {
            throw fetchError;
          }
        }
      }
      
      // Wait before retrying network errors (exponential backoff)
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    if (!response) {
      throw lastError || new Error('Failed to fetch after multiple retries');
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
    responseData = data;
    
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
    
    results = organicResults.slice(0, 5).map((result: any, index: number) => {
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

    // If we found results, break out of the retry loop
    if (results.length > 0) {
      console.log(`✅ Found ${results.length} results`);
      break;
    }
    
    // No results found - retry if we have attempts left
    if (noResultsAttempt < maxNoResultsRetries) {
      const delay = baseDelay * 2; // 2 second delay for no-results retries
      console.log(`⚠️ No results found. Retrying search in ${delay}ms (attempt ${noResultsAttempt + 1}/${maxNoResultsRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } else {
      console.log('❌ No results found after all retry attempts');
    }
  }

  // If still no results after all retries, throw error
  if (results.length === 0) {
    const error: SerpSearchError = {
      success: false,
      error: 'No search results found after multiple attempts'
    };
    throw error;
  }

  return {
    success: true,
    results: results,
    query: instagramQuery,
    originalQuery: query,
    wasTruncated: limitedQuery.length < cleanedQuery.length,
    metadata: {
      searchMetadata: responseData?.search_metadata,
      searchParameters: responseData?.search_parameters,
      searchInformation: responseData?.search_information,
    },
    fullResponse: responseData // Include complete SerpAPI response
  };
}

