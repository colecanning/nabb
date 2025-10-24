import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Limit query to first 50 characters and add Instagram site filter
    const limitedQuery = query.substring(0, 100);
    const instagramQuery = `${limitedQuery} site:instagram.com`;

    const serpApiKey = process.env.SERPAPI_API_KEY;
    if (!serpApiKey) {
      return NextResponse.json(
        { success: false, error: 'SerpAPI key not configured. Add SERPAPI_API_KEY to your .env.local file' },
        { status: 500 }
      );
    }

    console.log('Searching Google via SerpAPI for:', instagramQuery, limitedQuery.length < query.length ? `(truncated from ${query.length} chars)` : '');

    // Use SerpAPI's Google search endpoint with Instagram site filter
    const searchUrl = new URL('https://serpapi.com/search');
    // searchUrl.searchParams.append('engine', 'duckduckgo');
    searchUrl.searchParams.append('engine', 'google');
    searchUrl.searchParams.append('q', instagramQuery);
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
        return NextResponse.json(
          { success: false, error: 'Search request timed out. Please try again.' },
          { status: 504 }
        );
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SerpAPI error status:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `SerpAPI error (${response.status}): ${errorText || 'Unknown error'}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      return NextResponse.json(
        { success: false, error: data.error },
        { status: 400 }
      );
    }

    // Extract organic results (top 5)
    const organicResults = data.organic_results || [];
    
    // Log first result structure for debugging
    if (organicResults.length > 0) {
      console.log('Sample result structure:', JSON.stringify(organicResults[0], null, 2));
    }
    
    const results = organicResults.slice(0, 5).map((result: any, index: number) => ({
      title: result.title || 'No title',
      url: result.link || '',
      snippet: result.snippet || 'No description available',
      position: result.position || index + 1,
      // Try to extract video duration from various possible fields
      duration: result.rich_snippet?.extensions?.duration || 
                result.video?.duration || 
                result.duration || 
                null,
      thumbnail: result.thumbnail || null,
      raw: result // Include all raw data from SerpAPI
    }));

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No search results found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('SERP API search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to perform SERP API search'
      },
      { status: 500 }
    );
  }
}

