'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';

interface Message {
  id: string;
  created_time: string;
  from: {
    id: string;
    username?: string;
    name?: string;
  };
  message: string;
}

interface Conversation {
  id: string;
  updated_time: string;
  participants?: {
    data: Array<{
      id: string;
      username?: string;
      name?: string;
    }>;
  };
  messages?: {
    data: Message[];
  };
  recipient_id?: string;
}

export default function Home() {
  const [recipientId, setRecipientId] = useState('');
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ success?: boolean; error?: string; data?: any; details?: any } | null>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);
  
  const [webhookJson, setWebhookJson] = useState('');
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<{ status?: number; data?: any; error?: string } | null>(null);

  const [videoUrl, setVideoUrl] = useState('');
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<{ success?: boolean; transcription?: string; error?: string; details?: any } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{ success?: boolean; results?: Array<{ title: string; url: string; snippet: string; raw: any }>; error?: string; query?: string } | null>(null);

  const [serpQuery, setSerpQuery] = useState('');
  const [serpLoading, setSerpLoading] = useState(false);
  const [serpResults, setSerpResults] = useState<{ success?: boolean; results?: Array<{ title: string; url: string; snippet: string; position: number; raw: any }>; error?: string; query?: string; originalQuery?: string; wasTruncated?: boolean; metadata?: any; fullResponse?: any } | null>(null);

  const fetchMessages = async (silent = false) => {
    if (!silent) {
      setLoadingMessages(true);
    }
    setMessagesError(null);

    try {
      const res = await fetch('/api/get-messages');
      const data = await res.json();

      if (data.success) {
        setConversations(data.data);
        setRawApiResponse(data); // Store the complete API response
      } else {
        setMessagesError(data.error || 'Failed to fetch messages');
      }
    } catch (error) {
      setMessagesError('Failed to fetch messages. Please try again.');
    } finally {
      if (!silent) {
        setLoadingMessages(false);
      }
    }
  };

  // Auto-refresh messages every 10 seconds
  useEffect(() => {
    fetchMessages();
    
    const interval = setInterval(() => {
      fetchMessages(true); // Silent refresh (no loading indicator)
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const payload: any = {
        recipient_id: recipientId,
        message: message,
      };

      // Add reply_to if provided
      if (replyTo.trim()) {
        payload.reply_to = replyTo.trim();
      }

      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(data);

      if (data.success) {
        // Clear form on success
        setMessage('');
        setReplyTo('');
        // Refresh messages to show the sent message
        setTimeout(() => fetchMessages(true), 1000);
      }
    } catch (error) {
      setResponse({
        error: 'Failed to send message. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWebhookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookLoading(true);
    setWebhookResponse(null);

    try {
      // Parse the JSON to validate it
      const parsedJson = JSON.parse(webhookJson);

      // Send to webhook endpoint
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedJson),
      });

      const data = await res.json();
      setWebhookResponse({
        status: res.status,
        data: data,
      });

      // Refresh messages after a short delay in case the webhook triggered something
      setTimeout(() => fetchMessages(true), 1000);
    } catch (error) {
      setWebhookResponse({
        error: error instanceof Error ? error.message : 'Invalid JSON or request failed',
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  const loadExampleWebhook = () => {
    const exampleWebhook = {
      "object": "instagram",
      "entry": [
        {
          "time": 1761172378459,
          "id": "17841477359317156",
          "messaging": [
            {
              "sender": {
                "id": "3113785858790603"
              },
              "recipient": {
                "id": "17841477359317156"
              },
              "timestamp": 1761172375330,
              "message": {
                "mid": "aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjE3ODQxNDc3MzU5MzE3MTU2OjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI2MDAyODQ1MTA3MzEzMjg1NTozMjQ4Nzg5NjA3NzQwMTMzMDI3Nzc3MDY2NzYwMjQ3NzA1NgZDZD",
                "attachments": [
                  {
                    "type": "ig_reel",
                    "payload": {
                      "reel_video_id": "17873858025351922",
                      "title": "You can not build a business without doubting something along the way. Moving past it is just a part of the process. #entrepreneur #doubts #startup #building",
                      "url": "https://lookaside.fbsbx.com/ig_messaging_cdn/?asset_id=17873858025351922&signature=AYd2HENtt2pTmKBPqpk1U8Ry4ruk-FysXleWRRwz-IL-d5emxHA1o671vDFWAIlVo2WjzLv3BnCVQ3FwNJdA0wjKuKTKSkpLvClj6LnnO354W-TWjUQ8VSv9Ox9AmR1y0JeLinMi41q0yjv4XkVSnmUN2DPh-92yKAHW1jb34BWCQV27iOv0yVDiqT2vHa8x-tEg9bfytOLGVUG_4pUmDASfq4c9k1u1"
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    setWebhookJson(JSON.stringify(exampleWebhook, null, 2));
  };

  const handleTranscribeVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setTranscriptionLoading(true);
    setTranscriptionResult(null);

    try {
      const res = await fetch('/api/transcribe-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await res.json();
      setTranscriptionResult(data);

    } catch (error) {
      setTranscriptionResult({
        error: error instanceof Error ? error.message : 'Failed to transcribe video',
      });
    } finally {
      setTranscriptionLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchResults(null);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      setSearchResults(data);

    } catch (error) {
      setSearchResults({
        error: error instanceof Error ? error.message : 'Failed to perform search',
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSerpSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSerpLoading(true);
    setSerpResults(null);

    try {
      const res = await fetch('/api/search-serp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: serpQuery }),
      });

      const data = await res.json();
      setSerpResults(data);

    } catch (error) {
      setSerpResults({
        error: error instanceof Error ? error.message : 'Failed to perform SERP API search',
      });
    } finally {
      setSerpLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main style={{ padding: '50px', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '20px' }}>Instagram Message Sender</h1>
      
      <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '30px' }}>
        This application sends messages to Instagram users via the Instagram Graph API.
      </p>

      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>Quick Start</h2>
        <ol style={{ fontSize: '16px', lineHeight: '1.8' }}>
          <li>Copy <code>env.example</code> to <code>.env.local</code> and add your credentials</li>
          <li>Run <code>pnpm install</code> to install dependencies</li>
          <li>Run <code>pnpm dev</code> to start the server</li>
          <li>Send a POST request to <code>/api/send-message</code></li>
        </ol>
      </div>

      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>API Endpoint</h2>
        <p style={{ fontSize: '16px', marginBottom: '10px' }}>
          <strong>POST</strong> <code>/api/send-message</code>
        </p>
        <pre style={{
          backgroundColor: '#263238',
          color: '#aed581',
          padding: '15px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '14px'
        }}>
{`{
  "recipient_id": "USER_INSTAGRAM_ID",
  "message": "Hello there!"
}`}
        </pre>
      </div>

      <div style={{
        backgroundColor: '#fff3e0',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #ff9800',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#e65100' }}>⚠️ Important</h3>
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
          You can only send messages to users who have initiated a conversation with your business 
          or sent a message within the last 24 hours. This is an Instagram platform restriction.
        </p>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Send a Message</h2>
        
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          borderLeft: '4px solid #1976d2'
        }}>
          <p style={{ fontSize: '14px', color: '#0d47a1', margin: '0', lineHeight: '1.6' }}>
            💡 <strong>Tip:</strong> To get the correct recipient ID, scroll down to "Received Messages" and click the "↑ Use This ID" button next to any conversation marked with a <span style={{ padding: '1px 6px', backgroundColor: '#4caf50', color: '#fff', borderRadius: '8px', fontSize: '10px', fontWeight: '600' }}>CAN REPLY</span> badge.
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="recipientId" 
              style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#333'
              }}
            >
              Recipient Instagram ID
            </label>
            <input
              type="text"
              id="recipientId"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              required
              placeholder="Enter recipient's Instagram user ID"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="message" 
              style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#333'
              }}
            >
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Type your message here..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'system-ui, sans-serif',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="replyTo" 
              style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#333'
              }}
            >
              Reply To (Optional)
            </label>
            <input
              type="text"
              id="replyTo"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="Enter message ID to reply to (optional)"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                fontFamily: 'monospace'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              Leave blank to send a new message, or enter a message ID from below to reply to a specific message
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: loading ? '#9e9e9e' : '#1976d2',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#1565c0';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#1976d2';
            }}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        {response && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '6px',
            backgroundColor: response.success ? '#e8f5e9' : '#ffebee',
            border: `1px solid ${response.success ? '#4caf50' : '#f44336'}`
          }}>
            {response.success ? (
              <>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#2e7d32',
                  marginBottom: '8px'
                }}>
                  ✅ Message sent successfully!
                </p>
                {response.data && (
                  <p style={{ fontSize: '14px', color: '#555' }}>
                    Message ID: <code>{response.data.message_id}</code>
                  </p>
                )}
              </>
            ) : (
              <>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#c62828',
                  marginBottom: '8px'
                }}>
                  ❌ Error sending message
                </p>
                <p style={{ fontSize: '14px', color: '#555' }}>
                  {response.error || 'Unknown error occurred'}
                </p>
                {response.details && (
                  <pre style={{
                    fontSize: '12px',
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(response.details, null, 2)}
                  </pre>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginTop: '30px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Webhook Event Simulator</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Test your webhook endpoint by simulating Instagram webhook events. Paste your webhook JSON below or use the example.
        </p>

        <div style={{
          backgroundColor: '#fff3e0',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          borderLeft: '4px solid #ff9800'
        }}>
          <p style={{ fontSize: '14px', color: '#e65100', margin: '0', lineHeight: '1.6' }}>
            🧪 <strong>Testing Tool:</strong> This simulates receiving a webhook event from Instagram. The JSON will be sent to your <code>/api/webhook</code> endpoint.
          </p>
        </div>

        <form onSubmit={handleWebhookSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <label 
                htmlFor="webhookJson" 
                style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#333'
                }}
              >
                Webhook JSON
              </label>
              <button
                type="button"
                onClick={loadExampleWebhook}
                style={{
                  fontSize: '13px',
                  padding: '6px 12px',
                  backgroundColor: '#9c27b0',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Load Example
              </button>
            </div>
            <textarea
              id="webhookJson"
              value={webhookJson}
              onChange={(e) => setWebhookJson(e.target.value)}
              required
              placeholder="Paste Instagram webhook JSON here..."
              rows={12}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '13px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                resize: 'vertical',
                boxSizing: 'border-box',
                backgroundColor: '#fafafa'
              }}
              onFocus={(e) => e.target.style.borderColor = '#9c27b0'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <button
            type="submit"
            disabled={webhookLoading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: webhookLoading ? '#9e9e9e' : '#9c27b0',
              border: 'none',
              borderRadius: '6px',
              cursor: webhookLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!webhookLoading) e.currentTarget.style.backgroundColor = '#7b1fa2';
            }}
            onMouseLeave={(e) => {
              if (!webhookLoading) e.currentTarget.style.backgroundColor = '#9c27b0';
            }}
          >
            {webhookLoading ? 'Sending to Webhook...' : 'Simulate Webhook Event'}
          </button>
        </form>

        {webhookResponse && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '6px',
            backgroundColor: webhookResponse.error ? '#ffebee' : '#e8f5e9',
            border: `1px solid ${webhookResponse.error ? '#f44336' : '#4caf50'}`
          }}>
            {webhookResponse.error ? (
              <>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#c62828',
                  marginBottom: '8px'
                }}>
                  ❌ Error
                </p>
                <p style={{ fontSize: '14px', color: '#555' }}>
                  {webhookResponse.error}
                </p>
              </>
            ) : (
              <>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#2e7d32',
                  marginBottom: '8px'
                }}>
                  ✅ Webhook event sent successfully
                </p>
                <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>
                  Status: {webhookResponse.status}
                </p>
                {webhookResponse.data && (
                  <details style={{ marginTop: '8px' }}>
                    <summary style={{
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2e7d32',
                      padding: '4px 0'
                    }}>
                      View Response
                    </summary>
                    <pre style={{
                      fontSize: '12px',
                      marginTop: '8px',
                      padding: '12px',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                    }}>
                      {JSON.stringify(webhookResponse.data, null, 2)}
                    </pre>
                  </details>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginTop: '30px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Video Transcription</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Extract text from video audio using OpenAI Whisper. Paste a direct video URL below.
        </p>

        <div style={{
          backgroundColor: '#e8f5e9',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          borderLeft: '4px solid #4caf50'
        }}>
          <p style={{ fontSize: '14px', color: '#1b5e20', margin: '0', lineHeight: '1.6' }}>
            🎥 <strong>Tip:</strong> Use a direct video file URL (e.g., .mp4, .mov, .m4a). Max file size: 25MB.
          </p>
        </div>

        <form onSubmit={handleTranscribeVideo}>
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="videoUrl" 
              style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#333'
              }}
            >
              Video URL
            </label>
            <input
              type="url"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
              placeholder="https://example.com/video.mp4"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                fontFamily: 'monospace'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4caf50'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <button
            type="submit"
            disabled={transcriptionLoading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: transcriptionLoading ? '#9e9e9e' : '#4caf50',
              border: 'none',
              borderRadius: '6px',
              cursor: transcriptionLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!transcriptionLoading) e.currentTarget.style.backgroundColor = '#45a049';
            }}
            onMouseLeave={(e) => {
              if (!transcriptionLoading) e.currentTarget.style.backgroundColor = '#4caf50';
            }}
          >
            {transcriptionLoading ? 'Processing Video...' : '🎙️ Transcribe Video'}
          </button>
        </form>

        {transcriptionResult && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '6px',
            backgroundColor: transcriptionResult.success ? '#e8f5e9' : '#ffebee',
            border: `1px solid ${transcriptionResult.success ? '#4caf50' : '#f44336'}`
          }}>
            {transcriptionResult.success ? (
              <>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#2e7d32',
                  marginBottom: '12px'
                }}>
                  ✅ Transcription Complete
                </p>
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #c8e6c9',
                  marginTop: '12px'
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#333',
                    marginBottom: '8px'
                  }}>
                    Transcribed Text:
                  </p>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#555',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    margin: '0'
                  }}>
                    {transcriptionResult.transcription}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#c62828',
                  marginBottom: '8px'
                }}>
                  ❌ Error transcribing video
                </p>
                <p style={{ fontSize: '14px', color: '#555' }}>
                  {transcriptionResult.error || 'Unknown error occurred'}
                </p>
                {transcriptionResult.details && (
                  <pre style={{
                    fontSize: '12px',
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(transcriptionResult.details, null, 2)}
                  </pre>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginTop: '30px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>DuckDuckGo Search</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Search the web using DuckDuckGo and get the top 5 results.
        </p>

        <div style={{
          backgroundColor: '#fff8e1',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          borderLeft: '4px solid #ffc107'
        }}>
          <p style={{ fontSize: '14px', color: '#f57f17', margin: '0', lineHeight: '1.6' }}>
            🔍 <strong>Tip:</strong> Enter any search query to find relevant web results.
          </p>
        </div>

        <form onSubmit={handleSearch}>
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="searchQuery" 
              style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#333'
              }}
            >
              Search Query
            </label>
            <input
              type="text"
              id="searchQuery"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
              placeholder="What would you like to search for?"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ffc107'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <button
            type="submit"
            disabled={searchLoading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: searchLoading ? '#9e9e9e' : '#ffc107',
              border: 'none',
              borderRadius: '6px',
              cursor: searchLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!searchLoading) e.currentTarget.style.backgroundColor = '#ffb300';
            }}
            onMouseLeave={(e) => {
              if (!searchLoading) e.currentTarget.style.backgroundColor = '#ffc107';
            }}
          >
            {searchLoading ? 'Searching...' : '🔍 Search'}
          </button>
        </form>

        {searchResults && (
          <div style={{
            marginTop: '20px',
          }}>
            {searchResults.success && searchResults.results ? (
              <>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#e8f5e9',
                  border: '1px solid #4caf50',
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <p style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#2e7d32',
                    margin: '0'
                  }}>
                    ✅ Found {searchResults.results.length} results for "{searchResults.query}"
                  </p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {searchResults.results.map((result, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '16px',
                        backgroundColor: '#fafafa',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        transition: 'box-shadow 0.2s, border-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#ffc107';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                      }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#ffffff',
                          backgroundColor: '#ffc107',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          marginBottom: '8px'
                        }}>
                          #{index + 1}
                        </span>
                      </div>
                      <a 
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1976d2',
                          textDecoration: 'none',
                          display: 'block',
                          marginBottom: '8px'
                        }}
                      >
                        {result.title}
                      </a>
                      <p style={{
                        fontSize: '14px',
                        color: '#555',
                        lineHeight: '1.6',
                        margin: '0 0 8px 0'
                      }}>
                        {result.snippet}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#888',
                        margin: '0 0 12px 0',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace'
                      }}>
                        {result.url}
                      </p>
                      
                      {result.raw && (
                        <details style={{ marginTop: '8px' }}>
                          <summary style={{
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#ffc107',
                            padding: '4px 0'
                          }}>
                            View Raw Data
                          </summary>
                          <pre style={{
                            fontSize: '11px',
                            marginTop: '8px',
                            padding: '12px',
                            backgroundColor: '#263238',
                            color: '#aed581',
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                            maxHeight: '300px'
                          }}>
                            {JSON.stringify(result.raw, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{
                padding: '16px',
                borderRadius: '6px',
                backgroundColor: '#ffebee',
                border: '1px solid #f44336'
              }}>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#c62828',
                  marginBottom: '8px'
                }}>
                  ❌ Error performing search
                </p>
                <p style={{ fontSize: '14px', color: '#555', margin: '0' }}>
                  {searchResults.error || 'Unknown error occurred'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginTop: '30px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>DuckDuckGo SERP API Search</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Search using SerpAPI's DuckDuckGo endpoint for structured JSON results.
        </p>

        <div style={{
          backgroundColor: '#e8eaf6',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          borderLeft: '4px solid #3f51b5'
        }}>
          <p style={{ fontSize: '14px', color: '#1a237e', margin: '0', lineHeight: '1.6' }}>
            🚀 <strong>API-Powered:</strong> Uses SerpAPI for reliable, structured search data with rich metadata. Requires API key.
          </p>
        </div>

        <form onSubmit={handleSerpSearch}>
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="serpQuery" 
              style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#333'
              }}
            >
              Search Query
            </label>
            <input
              type="text"
              id="serpQuery"
              value={serpQuery}
              onChange={(e) => setSerpQuery(e.target.value)}
              required
              placeholder="What would you like to search for?"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3f51b5'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <button
            type="submit"
            disabled={serpLoading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: serpLoading ? '#9e9e9e' : '#3f51b5',
              border: 'none',
              borderRadius: '6px',
              cursor: serpLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!serpLoading) e.currentTarget.style.backgroundColor = '#303f9f';
            }}
            onMouseLeave={(e) => {
              if (!serpLoading) e.currentTarget.style.backgroundColor = '#3f51b5';
            }}
          >
            {serpLoading ? 'Searching via SERP API...' : '🚀 Search with SERP API'}
          </button>
        </form>

        {serpResults && (
          <div style={{
            marginTop: '20px',
          }}>
            {serpResults.success && serpResults.results ? (
              <>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#e8f5e9',
                  border: '1px solid #4caf50',
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <p style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#2e7d32',
                    margin: '0'
                  }}>
                    ✅ Found {serpResults.results.length} results for "{serpResults.query}"
                  </p>
                  {serpResults.wasTruncated && (
                    <p style={{
                      fontSize: '12px',
                      color: '#f57c00',
                      margin: '4px 0 0 0',
                      fontStyle: 'italic'
                    }}>
                      ⚠️ Query was truncated to 50 characters (original: {serpResults.originalQuery?.length} chars)
                    </p>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {serpResults.results.map((result, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '16px',
                        backgroundColor: '#fafafa',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        transition: 'box-shadow 0.2s, border-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#3f51b5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                      }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#ffffff',
                          backgroundColor: '#3f51b5',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          marginBottom: '8px'
                        }}>
                          Position #{result.position}
                        </span>
                      </div>
                      <a 
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1976d2',
                          textDecoration: 'none',
                          display: 'block',
                          marginBottom: '8px'
                        }}
                      >
                        {result.title}
                      </a>
                      <p style={{
                        fontSize: '14px',
                        color: '#555',
                        lineHeight: '1.6',
                        margin: '0 0 8px 0'
                      }}>
                        {result.snippet}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#888',
                        margin: '0 0 12px 0',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace'
                      }}>
                        {result.url}
                      </p>
                      
                      {result.raw && (
                        <details style={{ marginTop: '8px' }}>
                          <summary style={{
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#3f51b5',
                            padding: '4px 0'
                          }}>
                            View Raw SERP Data
                          </summary>
                          <pre style={{
                            fontSize: '11px',
                            marginTop: '8px',
                            padding: '12px',
                            backgroundColor: '#263238',
                            color: '#aed581',
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                            maxHeight: '300px'
                          }}>
                            {JSON.stringify(result.raw, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>

                {serpResults.metadata && (
                  <details style={{ marginTop: '20px' }}>
                    <summary style={{
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#3f51b5',
                      padding: '12px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '6px',
                      userSelect: 'none'
                    }}>
                      View Search Metadata & Full API Response
                    </summary>
                    <pre style={{
                      fontSize: '11px',
                      marginTop: '12px',
                      padding: '16px',
                      backgroundColor: '#263238',
                      color: '#aed581',
                      borderRadius: '6px',
                      overflow: 'auto',
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                      maxHeight: '600px'
                    }}>
                      {JSON.stringify(serpResults.fullResponse, null, 2)}
                    </pre>
                  </details>
                )}
              </>
            ) : (
              <div style={{
                padding: '16px',
                borderRadius: '6px',
                backgroundColor: '#ffebee',
                border: '1px solid #f44336'
              }}>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#c62828',
                  marginBottom: '8px'
                }}>
                  ❌ Error performing SERP API search
                </p>
                <p style={{ fontSize: '14px', color: '#555', margin: '0' }}>
                  {serpResults.error || 'Unknown error occurred'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginTop: '30px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 4px 0' }}>Received Messages</h2>
            <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
              Auto-refreshes every 10 seconds
            </p>
          </div>
          <button
            onClick={() => fetchMessages(false)}
            disabled={loadingMessages}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: loadingMessages ? '#9e9e9e' : '#1976d2',
              border: 'none',
              borderRadius: '6px',
              cursor: loadingMessages ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loadingMessages) e.currentTarget.style.backgroundColor = '#1565c0';
            }}
            onMouseLeave={(e) => {
              if (!loadingMessages) e.currentTarget.style.backgroundColor = '#1976d2';
            }}
          >
            {loadingMessages ? 'Refreshing...' : '🔄 Refresh Now'}
          </button>
        </div>

        {messagesError && (
          <div style={{
            padding: '16px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '14px', color: '#c62828', margin: '0' }}>
              ❌ {messagesError}
            </p>
          </div>
        )}

        {loadingMessages && conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p style={{ fontSize: '16px' }}>Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p style={{ fontSize: '16px' }}>No conversations found.</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              Messages will appear here once users start conversing with your business account.
            </p>
          </div>
        ) : (
          <div style={{ 
            maxHeight: '600px', 
            overflowY: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: '6px'
          }}>
            {conversations.map((conversation, index) => {
              const recipientId = conversation.recipient_id;
              const participant = conversation.participants?.data.find(p => p.id === recipientId);
              const messages = conversation.messages?.data || [];
              const lastMessage = messages[0];
              const lastMessageTime = lastMessage?.created_time ? new Date(lastMessage.created_time) : null;
              const now = new Date();
              const hoursSinceLastMessage = lastMessageTime ? (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60) : null;
              const canReply = hoursSinceLastMessage !== null && hoursSinceLastMessage < 24;

              return (
                <div 
                  key={conversation.id}
                  style={{
                    padding: '20px',
                    borderBottom: index < conversations.length - 1 ? '1px solid #e0e0e0' : 'none',
                    backgroundColor: '#ffffff',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <p style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: '#333',
                            margin: '0'
                          }}>
                            {participant?.username || participant?.name || 'Unknown User'}
                          </p>
                          {canReply && (
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              backgroundColor: '#4caf50',
                              color: '#ffffff',
                              borderRadius: '12px',
                              fontWeight: '600'
                            }}>
                              CAN REPLY
                            </span>
                          )}
                          {!canReply && hoursSinceLastMessage !== null && (
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              backgroundColor: '#f44336',
                              color: '#ffffff',
                              borderRadius: '12px',
                              fontWeight: '600'
                            }}>
                              24h EXPIRED
                            </span>
                          )}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}>
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#888',
                            margin: '0',
                            fontFamily: 'monospace'
                          }}>
                            ID: {participant?.id || 'N/A'}
                          </p>
                          {recipientId && (
                            <button
                              onClick={() => {
                                setRecipientId(recipientId);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              style={{
                                fontSize: '11px',
                                padding: '4px 10px',
                                backgroundColor: '#1976d2',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              ↑ Use This ID
                            </button>
                          )}
                        </div>
                      </div>
                      {conversation.updated_time && (
                        <p style={{ 
                          fontSize: '12px', 
                          color: '#888',
                          margin: '0'
                        }}>
                          {new Date(conversation.updated_time).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {messages.length > 0 && (
                    <div style={{
                      backgroundColor: '#f9f9f9',
                      padding: '12px',
                      borderRadius: '6px',
                      borderLeft: '3px solid #1976d2'
                    }}>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        margin: '0 0 4px 0',
                        fontWeight: '600'
                      }}>
                        Latest Message:
                      </p>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#333',
                        margin: '0 0 8px 0'
                      }}>
                        {lastMessage?.message || 'No message text'}
                      </p>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <p style={{ 
                          fontSize: '12px', 
                          color: '#888',
                          margin: '0'
                        }}>
                          From: {lastMessage?.from?.username || lastMessage?.from?.id || 'Unknown'} • {' '}
                          {lastMessage?.created_time ? new Date(lastMessage.created_time).toLocaleString() : 'Unknown time'}
                        </p>
                        {lastMessage?.id && (
                          <button
                            onClick={() => {
                              setReplyTo(lastMessage.id);
                              setRecipientId(recipientId || '');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            style={{
                              fontSize: '10px',
                              padding: '2px 8px',
                              backgroundColor: '#4caf50',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            Reply
                          </button>
                        )}
                      </div>
                      <p style={{ 
                        fontSize: '11px', 
                        color: '#999',
                        margin: '4px 0 0 0',
                        fontFamily: 'monospace'
                      }}>
                        ID: {lastMessage?.id || 'N/A'}
                      </p>
                      
                      {messages.length > 1 && (
                        <details style={{ marginTop: '12px' }}>
                          <summary style={{
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#1976d2',
                            fontWeight: '600',
                            padding: '4px 0'
                          }}>
                            View all {messages.length} messages
                          </summary>
                          <div style={{ marginTop: '12px', paddingLeft: '12px' }}>
                            {messages.slice(1).map((msg) => (
                              <div 
                                key={msg.id}
                                style={{
                                  marginBottom: '12px',
                                  paddingBottom: '12px',
                                  borderBottom: '1px solid #e0e0e0'
                                }}
                              >
                                <p style={{ 
                                  fontSize: '14px', 
                                  color: '#333',
                                  margin: '0 0 4px 0'
                                }}>
                                  {msg.message}
                                </p>
                                <div style={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  flexWrap: 'wrap'
                                }}>
                                  <p style={{ 
                                    fontSize: '12px', 
                                    color: '#888',
                                    margin: '0'
                                  }}>
                                    From: {msg.from?.username || msg.from?.id} • {' '}
                                    {new Date(msg.created_time).toLocaleString()}
                                  </p>
                                  <button
                                    onClick={() => {
                                      setReplyTo(msg.id);
                                      setRecipientId(recipientId || '');
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    style={{
                                      fontSize: '10px',
                                      padding: '2px 8px',
                                      backgroundColor: '#4caf50',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      fontWeight: '600'
                                    }}
                                  >
                                    Reply
                                  </button>
                                </div>
                                <p style={{ 
                                  fontSize: '11px', 
                                  color: '#999',
                                  margin: '4px 0 0 0',
                                  fontFamily: 'monospace'
                                }}>
                                  ID: {msg.id}
                                </p>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  )}

                  {messages.length === 0 && (
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#888',
                      fontStyle: 'italic',
                      margin: '0'
                    }}>
                      No messages in this conversation yet.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginTop: '30px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Raw API Response</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
          Complete JSON response from the Facebook Graph API for debugging
        </p>
        
        {rawApiResponse ? (
          <details style={{ cursor: 'pointer' }}>
            <summary style={{
              fontSize: '14px',
              fontWeight: '600',
              padding: '12px',
              backgroundColor: '#f5f5f5',
              borderRadius: '6px',
              marginBottom: '12px',
              userSelect: 'none'
            }}>
              Click to expand/collapse JSON
            </summary>
            <pre style={{
              backgroundColor: '#263238',
              color: '#aed581',
              padding: '20px',
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '12px',
              lineHeight: '1.5',
              maxHeight: '600px',
              margin: '0',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace'
            }}>
              {JSON.stringify(rawApiResponse, null, 2)}
            </pre>
          </details>
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '6px',
            color: '#666'
          }}>
            <p style={{ fontSize: '14px', margin: '0' }}>
              No API response yet. Fetch messages to see the raw JSON data.
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
        <p>See <code>README.md</code> for detailed documentation.</p>
      </div>
      </main>
    </>
  );
}

