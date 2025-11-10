import { EntityUrl } from "@/lib/store";
import { Box, Card, CardContent, Link, Typography } from "@mui/material";
import LinkIcon from '@mui/icons-material/Link';

interface LinkCardProps {
  url: EntityUrl;
}

function formatUrlForDisplay(url: string): string {
  try {
    const urlObj = new URL(url);
    let displayUrl = urlObj.hostname + urlObj.pathname + urlObj.search + urlObj.hash;
    
    // Remove 'www.' prefix if present
    if (displayUrl.startsWith('www.')) {
      displayUrl = displayUrl.substring(4);
    }
    
    return displayUrl;
  } catch (e) {
    // If URL parsing fails, return original
    return url;
  }
}

export function LinkCard({ url }: LinkCardProps) {
  return (
    <Link
      href={url.url}
      target="_blank"
      rel="noopener noreferrer"
      underline="none"
      sx={{
        display: 'block',
        textDecoration: 'none',
      }}
    >
      <Card
        sx={{
          minWidth: '144px',
          maxWidth: '144px',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '18px',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          backgroundColor: '#F7F7F7',

        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '144px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            borderRadius: '18px',

          }}
        >
          {url.image ? (
            <Box
              component="img"
              src={url.image}
              alt={url.title || 'Link preview'}
              sx={{
                minWidth: '100%',
                overflowClipMargin: 'unset',
                overflow: 'visible',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<div style="color: #999; font-size: 48px;">🔗</div>';
                }
              }}
            />
          ) : (
            <Box sx={{ color: '#999', fontSize: '48px' }}>🔗</Box>
          )}
          <Box
            sx={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(71, 71, 71, 0.3)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // backdropFilter: 'blur(4px)',
            }}
          >
            <LinkIcon sx={{ fontSize: '18px', color: 'white' }}/>
          </Box>
        </Box>
        <CardContent sx={{ 
          paddingTop: '8px', 
          paddingBottom: '6px !important', 
          paddingLeft: '10px', 
          paddingRight: '10px',
          height: '56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#262626',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.3',
              minHeight: '28px', // Fixed height for 2 lines (11px * 1.3 * 2 ≈ 28px)
            }}
          >
            {url.title}
          </Typography>
          <Typography
            sx={{
              fontSize: '9px',
              fontWeight: '400',
              color: '#666',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: '2px',
            }}
          >
            {formatUrlForDisplay(url.url)}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}

