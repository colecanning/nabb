'use client';

import { AppBar, Avatar, Box, Container, Link, Stack, Toolbar, Typography } from "@mui/material";
import type { Tables } from "@/types/supabase";
import type { WebhookOutput } from "@/app/api/test-webhook/route";
import { HelpfulLinksSection } from "@/components/HelpfulLinksSection";

interface ContentProps {
  save: Tables<"saves">;
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
      <AppBar 
        position="relative" 
        elevation={0}
        sx={{ 
          backgroundColor: 'inherit',
          // borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar sx={{ paddingLeft: 2, paddingRight: 2 }}>
          <Box
            component="img"
            src="/images/logo.svg"
            alt="Logo"
            sx={{
              height: '23px',
              width: '18px',
            }}
          />
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="sm"
        disableGutters
        sx={{
          // border: '1px solid red',
          paddingTop: 0,
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

