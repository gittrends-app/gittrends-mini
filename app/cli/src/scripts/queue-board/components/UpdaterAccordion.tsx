import { Autorenew, Block, ExpandMore, PlayArrow, Settings } from '@mui/icons-material';
import { Box, Button, TextField, Typography } from '@mui/material';
import { delay } from 'bluebird';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';

import { Accordion, AccordionDetails, AccordionSummary } from './Accordion';

export function UpdaterAccordion() {
  const [running, setRunning] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);

  const [Icon, setIcon] = useState<any>(undefined);
  const [params, setParams] = useState({ threads: 0, workers: 0 });

  const { data } = useSWR(
    ['/api/updater', disabled],
    ([url]) => fetch(url).then<{ id: number; concurrency: number }[]>((response) => response.json()),
    {},
  );

  useEffect(() => {
    setRunning((data && data.length > 0) || false);
    setParams({ threads: data?.length || 0, workers: (data || []).reduce((sum, val) => sum + val.concurrency, 0) });
  }, [data]);

  useEffect(() => setIcon(running ? <Autorenew /> : <PlayArrow />), [running]);

  const submitForm = (args: typeof params) => {
    if (disabled) return;

    setDisabled(true);

    return fetch('/api/updater', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
      .then(() => delay(5000))
      .finally(() => setDisabled(false));
  };

  return (
    <Accordion defaultExpanded>
      <AccordionSummary id="panel1a-header" expandIcon={<ExpandMore />} aria-controls="panel1a-content">
        <Typography sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
          <Settings sx={{ fontSize: '1em', mr: 1 }} /> Updater status:{' '}
          <Typography display="inline" component="span" color={running ? 'success.main' : 'error.main'} ml={1}>
            {running ? 'running' : 'stopped'}
          </Typography>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', rowGap: 2, my: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', columnGap: 2 }}>
            <TextField
              type="number"
              size="small"
              label="Number of threads"
              value={params.threads}
              InputProps={{ inputProps: { min: 0 } }}
              onChange={(event) => {
                const threads = parseInt(event.target.value);
                setParams({ threads, workers: threads > params.workers ? threads : params.workers });
              }}
              disabled={disabled}
            />
            <TextField
              type="number"
              size="small"
              label="Number of workers"
              value={params.workers}
              InputProps={{ inputProps: { min: 0 } }}
              onChange={(event) => {
                const workers = parseInt(event.target.value);
                setParams({ threads: workers > 0 ? params.threads : 0, workers });
              }}
              disabled={disabled}
            />
          </Box>
          <Box columnGap={2} display="flex">
            <Button
              variant="contained"
              size="small"
              startIcon={Icon}
              onClick={() => submitForm(params)}
              disabled={disabled}
              fullWidth
            >
              {running ? 'Update' : 'Start'}
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<Block />}
              onClick={() => submitForm({ threads: 0, workers: 0 })}
              fullWidth
              disabled={!running || disabled}
            >
              Stop
            </Button>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
