import { ExpandMore, Handyman } from '@mui/icons-material';
import { DrawerProps, Drawer as MuiDrawer, Stack } from '@mui/material';
import { Box, Typography } from '@mui/material';
import React from 'react';

import { Accordion, AccordionDetails, AccordionSummary } from './components/Accordion';
import { UpdaterAccordion } from './components/UpdaterAccordion';

export function AppTools(props: DrawerProps) {
  return (
    <MuiDrawer anchor="left" {...props}>
      <Stack sx={{ width: '350px' }}>
        <Typography
          variant="h3"
          component="h3"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '2em',
            fontWeight: 'bold',
            mb: 2,
            mt: 2,
          }}
          color="secondary"
        >
          <Handyman /> Tools
        </Typography>
        <Box>
          <UpdaterAccordion />
          <Accordion disabled>
            <AccordionSummary id="panel2a-header" expandIcon={<ExpandMore />} aria-controls="panel2a-content">
              <Typography sx={{ color: 'text.secondary' }}>Last scheduled at: xxxx</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet
                blandit leo lobortis eget.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disabled>
            <AccordionSummary id="panel3a-header" expandIcon={<ExpandMore />} aria-controls="panel3a-content">
              <Typography sx={{ color: 'text.secondary' }}>Add repositories from GitHub</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet
                blandit leo lobortis eget.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Stack>
    </MuiDrawer>
  );
}
