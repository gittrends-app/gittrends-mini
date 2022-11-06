import { Autorenew, ExpandMore, PlayArrow, Settings } from '@mui/icons-material';
import { Box, Button, TextField, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

import { Accordion, AccordionDetails, AccordionSummary } from './Accordion';

export function UpdaterAccordion() {
  const [running, setRunning] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);

  const [Icon, setIcon] = useState<any>(undefined);
  const [params, setParams] = useState({ threads: 0, workers: 0 });

  const { data } = useSWR(['/api/updater', disabled], (url) =>
    fetch(url).then<{ id: number; concurrency: number }[]>((response) => response.json()),
  );

  useEffect(() => {
    setRunning((data && data.length > 0) || false);
    setParams({ threads: data?.length || 0, workers: (data || []).reduce((sum, val) => sum + val.concurrency, 0) });
  }, [data]);

  useEffect(() => setIcon(running ? <Autorenew /> : <PlayArrow />), [running]);

  const submitForm = useCallback(() => {
    if (disabled) return;

    setDisabled(true);

    return fetch('/api/updater', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).finally(() => setDisabled(false));
  }, [params]);

  return (
    <Accordion expanded={true}>
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
                const value = parseInt(event.target.value);
                setParams({ threads: value, workers: value > params.workers ? value : params.workers });
              }}
              disabled={disabled}
            />
            <TextField
              type="number"
              size="small"
              label="Number of workers"
              value={params.workers}
              InputProps={{ inputProps: { min: 0 } }}
              onChange={(event) => setParams({ ...params, workers: parseInt(event.target.value) })}
              disabled={disabled}
            />
          </Box>
          <Button variant="contained" size="small" startIcon={Icon} onClick={submitForm} disabled={disabled}>
            {running ? 'Update' : 'Start'}
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
