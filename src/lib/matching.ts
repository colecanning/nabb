import { MatchedResult, SearchResult } from './store';


// Helper function to calculate string similarity (Levenshtein distance based)
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  console.log('Comparing titles:', {
    ourTitle: str1,
    searchResultTitle: str2,
    ourTitleNormalized: s1,
    searchResultNormalized: s2
  });

  if (s1 === s2) {
    console.log('  → Exact match! Score: 1.0');
    return 1;
  }
  if (s1.length === 0 || s2.length === 0) {
    console.log('  → Empty string. Score: 0');
    return 0;
  }

  // Remove leading and trailing "..." from search result and extra whitespace
  const s2WithoutEllipsis = s2.replace(/^\.{3,}\s*/g, '').replace(/\s*\.{3,}$/g, '').trim();
  console.log('  → Search result without ellipsis:', s2WithoutEllipsis);

  // Create versions without special characters for more flexible matching
  const s1NoSpecialChars = s1.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const s2NoSpecialChars = s2WithoutEllipsis.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  console.log('  → Without special chars:', {
    ourTitle: s1NoSpecialChars,
    searchResult: s2NoSpecialChars
  });

  // Check if search result (without ellipsis and special chars) is a substring of our title
  if (s2NoSpecialChars.length > 0 && s1NoSpecialChars.includes(s2NoSpecialChars)) {
    console.log('  → Substring match! Search result is in our title (special chars removed). Score: 1.0');
    return 1.0;
  }

  // Check if search result (without trailing ...) is a substring of our title
  if (s2WithoutEllipsis.length > 0 && s1.includes(s2WithoutEllipsis)) {
    console.log('  → Substring match! Search result is in our title. Score: 1.0');
    return 1.0;
  }

  // Also check the reverse - if our title is in the search result
  if (s1.length > 0 && s2.includes(s1)) {
    console.log('  → Substring match! Our title is in search result. Score: 1.0');
    return 1.0;
  }

  // Check if one string contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    console.log('  → Contains match. Score: 0.8');
    return 0.8;
  }

  // Calculate Levenshtein distance
  const matrix: number[][] = [];

  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  const distance = matrix[s2.length][s1.length];
  const score = 1 - distance / maxLength;
  console.log('  → Levenshtein distance calculation. Score:', score.toFixed(3));
  return score;
}

const DURATION_SECONDS_DIFF = 1;
const DURATION_PERCENT_DIFF = 0.05;

// Helper function to parse duration string to seconds
function parseDurationToSeconds(duration: string): number | null {
  if (!duration) return null;

  // Handle formats like "45s", "1:23", "2:34:56", etc.
  const secondsMatch = duration.match(/^(\d+)s?$/i);
  if (secondsMatch) {
    return parseInt(secondsMatch[1]);
  }

  const timeMatch = duration.match(/^(?:(\d+):)?(\d+):(\d+)$/);
  if (timeMatch) {
    const hours = timeMatch[1] ? parseInt(timeMatch[1]) : 0;
    const minutes = parseInt(timeMatch[2]);
    const seconds = parseInt(timeMatch[3]);
    return hours * 3600 + minutes * 60 + seconds;
  }

  const minutesMatch = duration.match(/^(\d+):(\d+)$/);
  if (minutesMatch) {
    const minutes = parseInt(minutesMatch[1]);
    const seconds = parseInt(minutesMatch[2]);
    return minutes * 60 + seconds;
  }

  return null;
}

export interface FindMatchResult {
  success: boolean;
  matchedResult?: MatchedResult;
  error?: string;
}

const DURATION_SIMILARITY = 1;

/**
 * Finds the first search result with a duration within ±1 second of the input duration
 * @param searchResults - Array of search results to check
 * @param videoDuration - The video duration in seconds to match against
 * @returns Promise resolving to match result
 */
export async function findFirstMatchByDuration(
  searchResults: SearchResult[],
  videoDuration: number | null
): Promise<FindMatchResult> {
  try {
    if (!searchResults || searchResults.length === 0) {
      return {
        success: false,
        error: 'No search results available',
      };
    }

    if (!videoDuration) {
      return {
        success: false,
        error: 'Video duration is required for matching',
      };
    }

    console.log('=== Starting Duration-Based Match Process ===');
    console.log('Our video duration:', videoDuration, 'seconds');
    console.log('Number of search results:', searchResults.length);
    console.log('Looking for duration within ±1 second');

    for (const result of searchResults) {
      console.log('\n--- Checking result:', result.title);
      
      if (!result.duration) {
        console.log('  → Skipping: No duration available');
        continue;
      }

      const resultDurationSeconds = parseDurationToSeconds(result.duration);
      console.log('  → Duration:', {
        ours: videoDuration,
        theirs: resultDurationSeconds,
        theirsDurationString: result.duration
      });

      if (!resultDurationSeconds) {
        console.log('  → Skipping: Could not parse duration');
        continue;
      }

      const durationDiff = Math.abs(videoDuration - resultDurationSeconds);
      console.log('  → Duration difference:', durationDiff, 'seconds');

      const durationPercentDiff = DURATION_PERCENT_DIFF * videoDuration;
      const durationDiffComparison = Math.max(durationPercentDiff, DURATION_SECONDS_DIFF)
      if (durationDiff <= durationDiffComparison) {
        console.log(`✅ Match found! Duration within ±${DURATION_SECONDS_DIFF} seconds or ±${DURATION_PERCENT_DIFF * 100}% of the video duration`);
        
        const matchedResult: MatchedResult = {
          ...result,
          matchScore: 1.0,
          durationScore: 1.0,
          titleScore: 0
        };

        return {
          success: true,
          matchedResult,
        };
      }
    }

    console.log('\n=== No Match Found ===');
    console.log('❌ No result found with duration within ±1 second');
    
    return {
      success: false,
      error: 'No result found with duration within ±1 second of the video',
    };
  } catch (error) {
    console.error('Match error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to find match',
    };
  }
}

// Legacy, don't need this complex matching anymore, just trust google order
export async function findBestMatch(
  searchResults: SearchResult[],
  // titleText: string,
  videoDuration: number | null
): Promise<FindMatchResult> {
  try {
    if (!searchResults || searchResults.length === 0) {
      return {
        success: false,
        error: 'No search results available',
      };
    }

    console.log('=== Starting Match Process ===');
    console.log('Our video duration:', videoDuration);
    // console.log('Our title:', titleText);
    console.log('Number of search results:', searchResults.length);

    const ourDurationSeconds = videoDuration;
    console.log('Our duration in seconds:', ourDurationSeconds);

    let bestMatch: MatchedResult | null = null;
    let bestScore = 0;

    for (const result of searchResults) {
      console.log('\n--- Checking result:', result.title);
      let score = 0;
      let durationScore = 0;
      let titleScore = 0;

      // Duration matching (weight: DURATION_SIMILARITY)
      if (ourDurationSeconds && result.duration) {
        const resultDurationSeconds = parseDurationToSeconds(result.duration);
        console.log('Duration comparison:', {
          ours: ourDurationSeconds,
          theirs: resultDurationSeconds,
          theirsDurationString: result.duration
        });
        if (resultDurationSeconds) {
          const durationDiff = Math.abs(ourDurationSeconds - resultDurationSeconds);
          const durationSimilarity = Math.max(0, 1 - (durationDiff / Math.max(ourDurationSeconds, resultDurationSeconds)));
          durationScore = durationSimilarity;
          score += durationSimilarity * DURATION_SIMILARITY;
          console.log('Duration score:', durationSimilarity.toFixed(3), '(weighted:', (durationSimilarity * DURATION_SIMILARITY).toFixed(3) + ')');
        }
      } else {
        console.log('Duration matching skipped:', { ourDuration: ourDurationSeconds, theirDuration: result.duration });
      }

      // // Title matching (weight: 0.4) - using snippet from SERP API
      // if (titleText && result.snippet) {
      //   console.log('\nTitle matching (using snippet):');
      //   const titleSimilarity = calculateStringSimilarity(titleText, result.snippet);
      //   titleScore = titleSimilarity;
      //   score += titleSimilarity * 0.4;
      //   console.log('Title score:', titleSimilarity.toFixed(3), '(weighted:', (titleSimilarity * 0.4).toFixed(3) + ')');
      // } else {
      //   console.log('Title matching skipped:', { ourTitle: titleText, theirSnippet: result.snippet });
      // }

      console.log('Total score for this result:', score.toFixed(3));

      if (score > bestScore) {
        console.log('🎯 New best match!');
        bestScore = score;
        bestMatch = {
          ...result,
          matchScore: score,
          durationScore: durationScore,
          titleScore: titleScore
        };
      }
    }

    console.log('\n=== Match Process Complete ===');
    console.log('Best score:', bestScore.toFixed(3));
    console.log('Best match:', bestMatch?.title);

    // Only show match if score is above threshold (e.g., 0.5)
    if (bestMatch && bestScore > 0.5) {
      console.log('✅ Match found and displayed!');
      return {
        success: true,
        matchedResult: bestMatch,
      };
    } else {
      console.log('❌ No match above threshold (0.5)');
      return {
        success: false,
        error: 'No good match found. Try adjusting the search or check if the video exists in the results.',
      };
    }
  } catch (error) {
    console.error('Match error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to find match',
    };
  }
}
