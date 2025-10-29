import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  raw: {
    title: string;
    url: string;
    snippet: string;
    index: number;
    htmlMatch?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    console.log('Searching DuckDuckGo for:', query);

    // Use DuckDuckGo HTML search
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    let response;
    try {
      response = await fetch(searchUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('DuckDuckGo request timed out');
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
      return NextResponse.json(
        { success: false, error: `Failed to fetch search results (status: ${response.status})` },
        { status: response.status }
      );
    }

    const html = await response.text();
    
    // Parse HTML to extract search results
    const results: SearchResult[] = [];
    
    // DuckDuckGo HTML results are in divs with class "result"
    // This is a simple regex-based parser
    const resultRegex = /<div class="result[^"]*">[\s\S]*?<a rel="nofollow" class="result__a" href="([^"]+)">([^<]+)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([^<]+)<\/a>/g;
    
    let match;
    let count = 0;
    
    while ((match = resultRegex.exec(html)) !== null && count < 5) {
      const url = match[1];
      const title = match[2].trim();
      const snippet = match[3].trim();
      
      // Decode HTML entities
      const decodedTitle = decodeHtmlEntities(title);
      const decodedSnippet = decodeHtmlEntities(snippet);
      
      results.push({
        url: url,
        title: decodedTitle,
        snippet: decodedSnippet,
        raw: {
          title: title,
          url: url,
          snippet: snippet,
          index: count,
          htmlMatch: match[0].substring(0, 200) + '...' // First 200 chars of matched HTML
        }
      });
      
      count++;
    }

    // If regex parsing didn't work well, try alternative parsing
    if (results.length === 0) {
      // Try alternative regex pattern
      const altRegex = /<a rel="nofollow" class="result__a" href="([^"]+)">([^<]+)<\/a>/g;
      const snippetRegex = /<a class="result__snippet"[^>]*>([^<]+)<\/a>/g;
      
      const links: Array<{ url: string; title: string }> = [];
      while ((match = altRegex.exec(html)) !== null && links.length < 5) {
        links.push({
          url: match[1],
          title: decodeHtmlEntities(match[2].trim()),
        });
      }
      
      const snippets: string[] = [];
      while ((match = snippetRegex.exec(html)) !== null && snippets.length < 5) {
        snippets.push(decodeHtmlEntities(match[1].trim()));
      }
      
      // Combine links and snippets
      for (let i = 0; i < Math.min(links.length, 5); i++) {
        results.push({
          url: links[i].url,
          title: links[i].title,
          snippet: snippets[i] || 'No description available',
          raw: {
            title: links[i].title,
            url: links[i].url,
            snippet: snippets[i] || 'No description available',
            index: i,
          }
        });
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No search results found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      results: results,
      query: query,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to perform search'
      },
      { status: 500 }
    );
  }
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };
  
  return text.replace(/&[^;]+;/g, (entity) => entities[entity] || entity);
}

