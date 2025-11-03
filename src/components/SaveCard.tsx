'use client';

import Link from 'next/link';
import { useState } from 'react';

interface SaveCardProps {
  save: {
    id: string;
    created_at: string;
    instagram_user_id: string | null;
    input: any;
    output: any;
  };
}

export default function SaveCard({ save }: SaveCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const input = save.input as any;
  const output = save.output as any;
  const hasOutput = !!output;

  return (
    <Link
      href={`/saves/${save.id}`}
      style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: isHovered ? '0 4px 8px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '20px',
            marginTop: '0',
            marginBottom: '8px',
            color: '#1976d2'
          }}>
            {input?.title || 'Untitled'}
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginTop: '0',
            marginBottom: '0'
          }}>
            {new Date(save.created_at).toLocaleString()}
          </p>
        </div>
        
        <div style={{
          backgroundColor: hasOutput ? '#4CAF50' : '#ff9800',
          color: 'white',
          padding: '6px 14px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          textTransform: 'uppercase'
        }}>
          {hasOutput ? 'Complete' : 'Processing'}
        </div>
      </div>

      {save.instagram_user_id && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{
            fontSize: '13px',
            color: '#888',
            fontWeight: '500'
          }}>
            Instagram:
          </span>
          <span style={{
            fontSize: '13px',
            color: '#666'
          }}>
            @{save.instagram_user_id}
          </span>
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '12px',
        fontSize: '13px',
        color: '#888'
      }}>
        <span>
          ID: <code style={{
            backgroundColor: '#f5f5f5',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '12px'
          }}>
            {save.id.substring(0, 8)}...
          </code>
        </span>
        {hasOutput && output.result?.entities && (
          <span>
            • {output.result.entities.length} {output.result.entities.length === 1 ? 'entity' : 'entities'}
          </span>
        )}
      </div>
    </Link>
  );
}

