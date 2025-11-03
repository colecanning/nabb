'use client';

import { useState } from 'react';
import Header from '@/components/Header';

// const defaultWebhookData = {
//   "object": "instagram",
//   "entry": [
//     {
//       "time": 1761172378459,
//       "id": "17841477359317156",
//       "messaging": [
//         {
//           "sender": {
//             "id": "3113785858790603"
//           },
//           "recipient": {
//             "id": "17841477359317156"
//           },
//           "timestamp": 1761172375330,
//           "message": {
//             "mid": "aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjE3ODQxNDc3MzU5MzE3MTU2OjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI2MDAyODQ1MTA3MzEzMjg1NTozMjQ4Nzg5NjA3NzQwMTMzMDI3Nzc3MDY2NzYwMjQ3NzA1NgZDZD",
//             "attachments": [
//               {
//                 "type": "ig_reel",
//                 "payload": {
//                   "reel_video_id": "17873858025351922",
//                   "title": "You can not build a business without doubting something along the way. Moving past it is just a part of the process. #entrepreneur #doubts #startup #building",
//                   "url": "https://lookaside.fbsbx.com/ig_messaging_cdn/?asset_id=17873858025351922&signature=AYd2HENtt2pTmKBPqpk1U8Ry4ruk-FysXleWRRwz-IL-d5emxHA1o671vDFWAIlVo2WjzLv3BnCVQ3FwNJdA0wjKuKTKSkpLvClj6LnnO354W-TWjUQ8VSv9Ox9AmR1y0JeLinMi41q0yjv4XkVSnmUN2DPh-92yKAHW1jb34BWCQV27iOv0yVDiqT2vHa8x-tEg9bfytOLGVUG_4pUmDASfq4c9k1u1"
//                 }
//               }
//             ]
//           }
//         }
//       ]
//     }
//   ]
// };

// # megaphone25@gmail.com
const defaultWebhookData = {
  "object": "instagram",
  "entry": [
    {
      "time": 1762146662163,
      "id": "17841477359317156",
      "messaging": [
        {
          "sender": {
            "id": "1122050090040890"
          },
          "recipient": {
            "id": "17841477359317156"
          },
          "timestamp": 1762146661491,
          "message": {
            "mid": "aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjE3ODQxNDc3MzU5MzE3MTU2OjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI3NjAyNDQyOTgzMjY2MzgwMTozMjUwNTg2ODQ4NDg3OTYwNDgzMzgxODYwNDU3MzAzMjQ0OAZDZD",
            "attachments": [
              {
                "type": "ig_reel",
                "payload": {
                  "reel_video_id": "18389679349120387",
                  "title": "A top 5 rated burger in what we think is the best burger city in the world (and that’s coming from a born-and-raised New Yorker) 🍔\n\n📍 The Izakaya (West Loop, Chicago) @izakayamomotaro \n\n#chicagoburger #burgerreview #chicagorestaurant #bestburgers #chicagorestaurants #bestburger #chicagofoodscene #burgers #chicagofoodgoals #burger",
                  "url": "https://lookaside.fbsbx.com/ig_messaging_cdn/?asset_id=18389679349120387&signature=AYfguKhlVre__0Gz-wxZlcSpCHjoe7d3rOKDS7ySrv1Uio7iLHfoYVKPTgFXXDkDqlnRJnbGSpHAyqhc7asAw-MQifTz9UWYheFeRSpaIK9wftWhaMyPL7OKO_YUKARb0KfI8O8T-vevgM0T0aCrtucsfzjpe5gYnKGuWQBiVpd9rVL0NorTSPIFhGJpKTrHWC1npSxPDHPEmw_FXaybI6QvzI96X1yP"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}

export default function TestWebhookPage() {
  const [webhookData, setWebhookData] = useState(
    JSON.stringify(defaultWebhookData, null, 2)
  );
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Validate JSON
      const parsedData = JSON.parse(webhookData);

      // Send to webhook endpoint
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });

      const responseData = await res.json();
      setResponse(JSON.stringify(responseData, null, 2));
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON: ' + err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setWebhookData(JSON.stringify(defaultWebhookData, null, 2));
    setResponse(null);
    setError(null);
  };

  return (
    <>
      <Header />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
          Test Webhook Events
        </h1>

      <p style={{ marginBottom: '20px', color: '#666' }}>
        Edit the JSON below and click "Send Test Event" to simulate an Instagram webhook event.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px' }}>
            Webhook Payload (JSON):
          </label>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Reset to Default
          </button>
        </div>
        <textarea
          value={webhookData}
          onChange={(e) => setWebhookData(e.target.value)}
          style={{
            width: '100%',
            minHeight: '400px',
            padding: '12px',
            fontFamily: 'monospace',
            fontSize: '13px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: '#f9fafb',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        style={{
          padding: '12px 24px',
          backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '20px',
        }}
      >
        {isLoading ? 'Sending...' : 'Send Test Event'}
      </button>

      {error && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
            Error
          </h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#991b1b' }}>
            {error}
          </pre>
        </div>
      )}

      {response && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontWeight: '600', marginBottom: '10px', fontSize: '16px' }}>
            Response:
          </h3>
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '6px',
            }}
          >
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                fontSize: '13px',
                fontFamily: 'monospace',
                margin: 0,
              }}
            >
              {response}
            </pre>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: '40px',
          padding: '16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
        }}
      >
        <h3 style={{ fontWeight: '600', marginBottom: '10px', fontSize: '14px' }}>
          💡 Tips:
        </h3>
        <ul style={{ marginLeft: '20px', fontSize: '14px', color: '#1e40af' }}>
          <li>The JSON will be sent to <code style={{ backgroundColor: '#dbeafe', padding: '2px 6px', borderRadius: '3px' }}>/api/webhook</code></li>
          <li>Messages with <code style={{ backgroundColor: '#dbeafe', padding: '2px 6px', borderRadius: '3px' }}>ig_reel</code> attachments will trigger a brain emoji auto-reply</li>
          <li>Check your console logs for detailed webhook processing information</li>
          <li>You can modify sender IDs, timestamps, and message content to test different scenarios</li>
        </ul>
      </div>
      </div>
    </>
  );
}

