'use client';

import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SendIcon from '@mui/icons-material/Send';
import { useRef, useState, useEffect } from "react";
import type { Entity } from "@/lib/store";
import { LinkCard } from "./LinkCard";

interface HelpfulLinksSectionProps {
  entities?: Entity[];
  totalLinks: number;
}

function formatEntityType(type: string): string {
  // Handle camelCase by adding spaces before capital letters
  let formatted = type.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Handle snake_case by replacing underscores with spaces
  formatted = formatted.replace(/_/g, ' ');
  
  // Capitalize first letter of each word
  return formatted
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function HelpfulLinksSection({ entities, totalLinks }: HelpfulLinksSectionProps) {
  const scrollContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scrollStates, setScrollStates] = useState<{ [key: number]: { canScrollLeft: boolean; canScrollRight: boolean } }>({});
  const [copied, setCopied] = useState(false);

  const checkScrollPosition = (index: number) => {
    const container = scrollContainerRefs.current[index];
    if (container) {
      const canScrollLeft = container.scrollLeft > 0;
      const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 1;
      
      setScrollStates(prev => ({
        ...prev,
        [index]: { canScrollLeft, canScrollRight }
      }));
    }
  };

  const scroll = (direction: 'left' | 'right', index: number) => {
    const container = scrollContainerRefs.current[index];
    if (container) {
      const scrollAmount = 300;
      const newScrollPosition = container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
      
      // Update scroll state after animation
      setTimeout(() => checkScrollPosition(index), 300);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  useEffect(() => {
    // Check scroll position for all containers on mount and resize
    entities?.forEach((_, index) => {
      checkScrollPosition(index);
    });

    const handleResize = () => {
      entities?.forEach((_, index) => {
        checkScrollPosition(index);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [entities]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: '16px',
        backgroundColor: 'white',
        padding: 3,
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.1)',

      }}
    >
      <Stack direction="column" gap={6}>
        <Stack direction="row" gap={1}>
          
          <Stack direction="column" gap={0.5}>
            <Typography variant="h6">
              Helpful Links
            </Typography>
            <Typography variant="body2" sx={{
              color: 'gray',
            }}>
              We found {entities?.length || 0} things and {totalLinks} resources from your save
            </Typography>
          </Stack>

          <Button
            variant="text"
            startIcon={<SendIcon />}
            // size="small"
            onClick={handleCopyLink}
            sx={{
              marginLeft: 'auto',
              width: '100px',
              alignSelf: 'flex-start',
              textTransform: 'none',
              borderRadius: '8px',
              color: '#262626',
              paddingLeft: 2,
              paddingRight: 2
            }}
          >
            {copied ? 'Copied!' : 'Share'}
          </Button>
        </Stack>

        <Stack direction="column" gap={4}>
          {entities?.map((entity, entityIndex) => (
            <Box key={entityIndex}>
              <Stack direction="row" gap={0}>
                <Stack direction="column" gap={0}>
                  <Typography variant="body2" sx={{ }}>
                    {formatEntityType(entity.type)}
                  </Typography>

                  <Typography variant="body1" sx={{ fontWeight: '600' }}>
                    {entity.name}
                  </Typography>
                </Stack>
              </Stack>
              
              {/* Scrollable container with arrows */}
              <Box sx={{ position: 'relative', paddingLeft: 0.5 }}>
                {/* Left Arrow */}
                {scrollStates[entityIndex]?.canScrollLeft && (
                  <IconButton
                    onClick={() => scroll('left', entityIndex)}
                    sx={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                      width: '36px',
                      height: '36px',
                    }}
                  >
                    <ArrowBackIosIcon sx={{ fontSize: '16px', marginLeft: '6px' }} />
                  </IconButton>
                )}

                {/* Scrollable cards container */}
                <Box
                  ref={(el: HTMLDivElement | null) => {
                    scrollContainerRefs.current[entityIndex] = el;
                  }}
                  onScroll={() => checkScrollPosition(entityIndex)}
                  sx={{
                    display: 'flex',
                    gap: '16px',
                    overflowX: 'auto',
                    scrollBehavior: 'smooth',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    cursor: 'grab',
                    '&:active': {
                      cursor: 'grabbing',
                    },
                  }}
                >
                  {entity.urls?.map((url, urlIndex) => (
                    <LinkCard key={urlIndex} url={url} />
                  ))}
                </Box>

                {/* Right Arrow */}
                {scrollStates[entityIndex]?.canScrollRight && (
                  <IconButton
                    onClick={() => scroll('right', entityIndex)}
                    sx={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                      width: '36px',
                      height: '36px',
                    }}
                  >
                    <ArrowForwardIosIcon sx={{ fontSize: '16px' }} />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

