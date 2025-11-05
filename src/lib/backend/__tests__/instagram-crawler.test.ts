/**
 * Tests for Instagram Crawler quote extraction logic
 */

describe('Instagram Crawler - Quote Extraction', () => {
  /**
   * Decodes common HTML entities to their character equivalents
   */
  function decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
      '&quot;': '"',
      '&apos;': "'",
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&nbsp;': ' ',
      '&#39;': "'",
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#47;': '/',
    };

    return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
      return entities[entity] || entity;
    });
  }

  /**
   * Helper function that mimics the quote extraction logic from instagram-crawler.ts
   */
  function extractQuotedContent(content: string): string | null {
    if (!content || !content.includes('&quot;')) {
      return null;
    }

    const quotedContentMatch = content.match(/&quot;([\s\S]+?)&quot;/);
    if (quotedContentMatch && quotedContentMatch[1]) {
      const extracted = quotedContentMatch[1].trim();
      // Decode HTML entities
      return decodeHtmlEntities(extracted);
    }

    return null;
  }

  describe('extractQuotedContent', () => {
    it('should extract content between &quot; entities', () => {
      const input = 'Some text: &quot;Hello World&quot;';
      const result = extractQuotedContent(input);
      expect(result).toBe('Hello World');
    });

    it('should extract content and decode HTML entities like &nbsp;', () => {
      const input = 'will bowers on Instagram: &quot;DJI Osmo 360 vs the Insta360 X5 - WHO WINS? 🤔👀&nbsp;&quot;';
      const result = extractQuotedContent(input);
      expect(result).toBe('DJI Osmo 360 vs the Insta360 X5 - WHO WINS? 🤔👀 ');
    });

    it('should extract multiline content with mentions and hashtags', () => {
      const input = `will bowers on Instagram: &quot;DJI Osmo 360 vs the Insta360 X5 - WHO WINS? 🤔👀 

@djiglobal @osmo_global 

#DJIOsmo360 #360Camera #DJI&quot;`;
      const result = extractQuotedContent(input);
      
      expect(result).toBe(`DJI Osmo 360 vs the Insta360 X5 - WHO WINS? 🤔👀 

@djiglobal @osmo_global 

#DJIOsmo360 #360Camera #DJI`);
    });

    it('should decode multiple HTML entities', () => {
      const input = 'Test: &quot;Content with &amp; and &nbsp; and &lt; symbols&quot;';
      const result = extractQuotedContent(input);
      expect(result).toBe('Content with & and   and < symbols');
    });

    it('should extract content with emojis', () => {
      const input = 'User: &quot;Amazing! 🎉 🚀 💯&quot;';
      const result = extractQuotedContent(input);
      expect(result).toBe('Amazing! 🎉 🚀 💯');
    });

    it('should handle content with line breaks and special characters', () => {
      const input = `Test: &quot;Line 1
Line 2
Line 3&quot;`;
      const result = extractQuotedContent(input);
      expect(result).toBe(`Line 1
Line 2
Line 3`);
    });

    it('should return null if no &quot; entities present', () => {
      const input = 'Just some regular text without quotes';
      const result = extractQuotedContent(input);
      expect(result).toBeNull();
    });

    it('should return null if quotes are not closed', () => {
      const input = 'Text with &quot;unclosed quote';
      const result = extractQuotedContent(input);
      expect(result).toBeNull();
    });

    it('should extract first quoted section if multiple exist', () => {
      const input = 'Text: &quot;First quote&quot; and &quot;Second quote&quot;';
      const result = extractQuotedContent(input);
      expect(result).toBe('First quote');
    });

    it('should handle empty string', () => {
      const result = extractQuotedContent('');
      expect(result).toBeNull();
    });

    it('should preserve whitespace within quotes', () => {
      const input = 'Text: &quot;  Content with   spaces  &quot;';
      const result = extractQuotedContent(input);
      expect(result).toBe('Content with   spaces');
    });

    it('should handle complex Instagram post with all elements', () => {
      const input = `username on Instagram: &quot;Check out this amazing view! 🌅

Shot with my new camera 📸

@brandname @locationtag

#photography #nature #sunset #photooftheday&quot;`;
      
      const result = extractQuotedContent(input);
      
      expect(result).toContain('Check out this amazing view! 🌅');
      expect(result).toContain('@brandname @locationtag');
      expect(result).toContain('#photography #nature #sunset #photooftheday');
    });
  });

  describe('Real-world Instagram examples', () => {
    it('should handle the will bowers DJI example', () => {
      // This is the actual example from the user's Instagram post
      const ogTitle = `will bowers on Instagram: &quot;DJI Osmo 360 vs the Insta360 X5 - WHO WINS? 🤔👀 

@djiglobal @osmo_global 

#DJIOsmo360 #360Camera #DJI&quot;`;

      const extracted = extractQuotedContent(ogTitle);
      
      // Should extract everything between the quotes
      expect(extracted).not.toBeNull();
      expect(extracted).toContain('DJI Osmo 360 vs the Insta360 X5 - WHO WINS?');
      expect(extracted).toContain('@djiglobal');
      expect(extracted).toContain('@osmo_global');
      expect(extracted).toContain('#DJIOsmo360');
      expect(extracted).toContain('#360Camera');
      expect(extracted).toContain('#DJI');
    });

    it('should handle content with &nbsp; HTML entities', () => {
      const ogTitle = 'user: &quot;Check this out&nbsp;&nbsp;&nbsp;Amazing!&quot;';
      const extracted = extractQuotedContent(ogTitle);
      
      // &nbsp; should be decoded to regular space
      expect(extracted).toBe('Check this out   Amazing!');
      expect(extracted).not.toContain('&nbsp;');
    });

    it('should extract until first closing quote (handles nested quotes limitation)', () => {
      const ogTitle = 'user: &quot;He said &quot;hello&quot; to me&quot;';
      const extracted = extractQuotedContent(ogTitle);
      
      // Non-greedy regex matches from first &quot; to the next &quot;
      // This is expected behavior - nested quotes aren't common in Instagram
      expect(extracted).toBe('He said');
    });
  });

  describe('HTML entity decoding', () => {
    it('should decode common HTML entities', () => {
      const input = 'Test: &quot;&amp;&lt;&gt;&apos;&nbsp;&quot;';
      const result = extractQuotedContent(input);
      expect(result).toBe('&<>\' ');
    });

    it('should decode numeric HTML entities', () => {
      const input = 'Test: &quot;It&#39;s great&#x2F;awesome&quot;';
      const result = extractQuotedContent(input);
      expect(result).toBe("It's great/awesome");
    });

    it('should leave unknown entities as-is', () => {
      const input = 'Test: &quot;Unknown &unknownentity; here&quot;';
      const result = extractQuotedContent(input);
      expect(result).toBe('Unknown &unknownentity; here');
    });
  });
});

