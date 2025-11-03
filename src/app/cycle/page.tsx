'use client';

import Header from '@/components/Header';
import InstagramReelCrawler from '@/components/InstagramReelCrawler';
import AudioLengthSection from '@/components/AudioLengthSection';
import AudioTranscriptionSection from '@/components/AudioTranscriptionSection';
import FindInstagramReelSection from '@/components/FindInstagramReelSection';
import FindMatchSection from '@/components/FindMatchSection';
import ScrapeMatchSection from '@/components/ScrapeMatchSection';
import EntityExtractionSection from '@/components/EntityExtractionSection';
import ExtractEntityUrlsSection from '@/components/ExtractEntityUrlsSection';
import { useFinalResultStore } from '@/lib/store';

export default function CyclePage() {
  // Get final result from Zustand store
  const { finalResult } = useFinalResultStore();

  return (
    <>
      <Header />
      <main style={{ 
        padding: '50px', 
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ fontSize: '36px', marginBottom: '20px' }}>Instagram Reel Crawler</h1>
      
        <InstagramReelCrawler />

        <AudioLengthSection />

        <AudioTranscriptionSection />

        <FindInstagramReelSection />

        <FindMatchSection />

        <ScrapeMatchSection />

      {/* Result Section */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginTop: '30px'
      }}>
        <h2 style={{ fontSize: '28px', marginTop: '0', marginBottom: '20px' }}>Result</h2>
        
        {Object.keys(finalResult).length > 0 ? (
          <pre style={{
            backgroundColor: '#263238',
            color: '#aed581',
            padding: '20px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            margin: '0'
          }}>
            {JSON.stringify(finalResult, null, 2)}
          </pre>
        ) : (
          <p style={{
            fontSize: '14px',
            color: '#666',
            fontStyle: 'italic',
            margin: '0'
          }}>
            Process an Instagram link above to see the final result
          </p>
        )}
      </div>

      <EntityExtractionSection />

      <ExtractEntityUrlsSection />
    </main>
    </>
  );
}

