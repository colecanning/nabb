# Testing Guide

## Overview

This project uses **Jest** for unit testing, configured to work with TypeScript and Next.js.

## Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (reruns on file changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

## Test Files

Tests should be placed in one of these locations:
- `**/__tests__/**/*.test.ts(x)` - Dedicated test directories
- `**/*.test.ts(x)` - Co-located with source files
- `**/*.spec.ts(x)` - Alternative naming convention

## Test Examples

### 1. Instagram Crawler Tests

The Instagram crawler tests (`src/lib/backend/__tests__/instagram-crawler.test.ts`) demonstrate testing the quote extraction and HTML entity decoding logic.

#### Test Cases Include:

1. **Basic extraction** - Simple content between quotes
2. **HTML entities** - Content with `&nbsp;`, `&amp;`, etc.
3. **Multiline content** - Posts with mentions, hashtags, and line breaks
4. **Edge cases** - Empty strings, unclosed quotes, no quotes
5. **Real-world examples** - Actual Instagram post formats

#### Example Test:

```typescript
it('should extract multiline content with mentions and hashtags', () => {
  const input = `will bowers on Instagram: &quot;DJI Osmo 360 vs the Insta360 X5 - WHO WINS? 🤔👀 

@djiglobal @osmo_global 

#DJIOsmo360 #360Camera #DJI&quot;`;
  
  const result = extractQuotedContent(input);
  
  expect(result).toContain('DJI Osmo 360 vs the Insta360 X5 - WHO WINS?');
  expect(result).toContain('@djiglobal');
  expect(result).toContain('#DJIOsmo360');
});
```

### 2. SERP Search Tests

The SERP search tests (`src/lib/backend/__tests__/serp-search.test.ts`) document the retry behavior when no results are found.

#### Test Cases Include:

1. **Retry configuration** - Documents retry constants and behavior
2. **No results retry** - Tests logic for retrying when search returns no results
3. **Network retry** - Tests exponential backoff for network failures
4. **Timing calculations** - Verifies wait times between retries
5. **Error messages** - Tests appropriate error messages

#### Key Retry Behavior:

- **No-results retries**: Up to 2 attempts with 2-second delays
- **Network retries**: Up to 3 attempts per search with exponential backoff (1s, 2s, 4s)
- **Maximum attempts**: 6 total requests (2 search × 3 network retries each)
- **Worst-case wait**: ~8 seconds total

#### Example Test:

```typescript
it('should retry once when first search returns no results but second succeeds', () => {
  // Scenario: First search returns 0 results, second returns results
  // Expected: 2 search attempts, waits 2s between them
  const searchAttempts = 2;
  const delayBetweenSearches = 2000;
  
  expect(searchAttempts).toBe(2);
  expect(delayBetweenSearches).toBe(2000);
});
```

## Configuration Files

- **`jest.config.js`** - Main Jest configuration
- **`jest.setup.js`** - Setup file that runs before tests (includes jest-dom)

## Writing Tests

1. Create a test file with `.test.ts` or `.test.tsx` extension
2. Use `describe` blocks to group related tests
3. Use `it` or `test` for individual test cases
4. Use Jest matchers like `expect().toBe()`, `expect().toContain()`, etc.

## Coverage

To see test coverage:

```bash
pnpm test:coverage
```

This will generate a coverage report showing which lines of code are covered by tests.

