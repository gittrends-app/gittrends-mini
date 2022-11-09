import { EventRepeat, ExpandMore, PlayArrow } from '@mui/icons-material';
import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';

import { Accordion, AccordionDetails, AccordionSummary } from './Accordion';

export function SchedulerAccordion() {
  const [drain, setDrain] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);

  const { data } = useSWR(['/api/scheduler', disabled], (url) => fetch(url).then((response) => response.json()), {
    refreshInterval(latestData) {
      if (latestData && latestData.done === true) return 0;
      return 1000;
    },
  });

  useEffect(() => setRunning(data && !data.done), [data]);

  return (
    <Accordion defaultExpanded={false}>
      <AccordionSummary id="panel2a-header" expandIcon={<ExpandMore />} aria-controls="panel2a-content">
        <Typography sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
          <EventRepeat sx={{ fontSize: '1em', mr: 1 }} /> Scheduler status:{' '}
          <Typography display="inline" component="span" color={running ? 'success.main' : 'error.main'} ml={1}>
            {running ? 'running' : 'stopped'}
          </Typography>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 2 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <FormControlLabel
              label="Clear jobs before scheduling"
              control={<Checkbox checked={drain} onChange={(event) => setDrain(event.target.checked)} />}
              disabled={running || disabled}
              title="Remove completed and waiting jobs before running scheduler"
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<PlayArrow />}
              disabled={running || disabled}
              fullWidth
              onClick={async () => {
                setDisabled(true);
                return fetch('/api/scheduler', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ drain }),
                }).finally(() => setDisabled(false));
              }}
            >
              {running ? 'Scheduling jobs...' : 'Schedule jobs'}
            </Button>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
