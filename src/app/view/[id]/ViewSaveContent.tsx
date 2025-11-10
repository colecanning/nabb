'use client';

import { Avatar, Box, Card, CardContent, Container, IconButton, Link, Stack, Typography } from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useRef, useState, useEffect } from "react";
import type { Tables } from "@/types/supabase";
import type { WebhookOutput } from "@/app/api/test-webhook/route";
import type { Entity } from "@/lib/store";

interface ContentProps {
  save: Tables<"saves">;
}

interface HelpfulLinksSectionProps {
  entities?: Entity[];
  totalLinks: number;
}

function HelpfulLinksSection({ entities, totalLinks }: HelpfulLinksSectionProps) {
  const scrollContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scrollStates, setScrollStates] = useState<{ [key: number]: { canScrollLeft: boolean; canScrollRight: boolean } }>({});

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
      }}
    >
      <Stack direction="column" gap={2}>
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

        <Stack direction="column" gap={2}>
          {entities?.map((entity, entityIndex) => (
            <Box key={entityIndex}>
              <Typography variant="body1" sx={{ fontWeight: '600', marginBottom: '12px' }}>
                {entity.name}
              </Typography>
              
              {/* Scrollable container with arrows */}
              <Box sx={{ position: 'relative' }}>
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
                    <Card
                      key={urlIndex}
                      sx={{
                        minWidth: '200px',
                        maxWidth: '200px',
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '12px',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: '150px',
                          backgroundColor: '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#999',
                          fontSize: '48px',
                        }}
                      >
                        🔗
                      </Box>
                      <CardContent sx={{ paddingTop: '12px', paddingBottom: '12px' }}>
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#1976d2',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {url}
                        </Link>
                      </CardContent>
                    </Card>
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

/*
Note
- the `save` object is the save object from the supabase database
- the `save` object's output is a JSON object that matches the `WebhookOutput` type in `src/app/api/test-webhook/route.ts`
*/

/*

TODO:
- get the instagram handle's profile picture
- get the instagram handle's link
- Ask LLM to give us a title for the save

*/

export function ViewSaveContent({ save }: ContentProps) {
  const output = save.output as unknown as WebhookOutput;
  const videoUrl = output?.result?.videoUrl;
  const username = output?.result?.bestMatch?.author;
  
  // Calculate total number of links across all entities
  const totalLinks = output?.result?.entities?.reduce((total, entity) => {
    return total + (entity.urls?.length || 0);
  }, 0) || 0;

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        // backgroundColor: 'lightblue',
        // paddingTop: '48px',
        // paddingBottom: '50px',
        padding: 0
      }}
    >
      <Container 
        maxWidth="sm"
        disableGutters
        sx={{
          // border: '1px solid red',
          paddingTop: 6,
        }}
      >
        <Stack direction="column" gap={3}>

        {/* The video / instagram title */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            gap: '16px',
          }}
        >
          <Typography variant="h6" sx={{
            fontWeight: 'bold',
          }}>
            Title Here
          </Typography>
          <Stack 
            direction="column" 
            gap={0.5}
            sx={{
              width: '100%',
              maxWidth: '60%',
            }}>
            <Box
              component="video"
              controls
              src={videoUrl || ''}
              sx={{
                width: '100%',
                borderRadius: '24px',
              }}
            />
            
            {username && (
              <Stack 
                direction="row"
                gap="12px"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '8px',
                }}
              >
                <Avatar
                  sx={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#e0e0e0',
                    color: '#666',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {username.charAt(0).toUpperCase()}
                </Avatar>
                  <Link
                    href={`https://instagram.com/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                    sx={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#262626',
                    }}
                  >
                    {username}
                  </Link>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* The helpful links */}
        <HelpfulLinksSection 
          entities={output?.result?.entities}
          totalLinks={totalLinks}
        />


        
        </Stack>
      </Container>
    </Box>
  );
}

