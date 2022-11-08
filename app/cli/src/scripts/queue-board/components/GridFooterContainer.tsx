import { Handyman } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Box, Chip, Divider } from '@mui/material';
import { GridFooter, GridFooterContainer as MuiGridFooterContainer } from '@mui/x-data-grid';
import numeral from 'numeral';
import React, { useState } from 'react';

import { JobType, color } from '../App';
import { Drawer } from './Drawer';

export function GridFooterContainer(
  props: {
    [key in JobType['state']]: number;
  } & { onClick?: (state?: string) => void },
) {
  const { onClick, ...states } = props;

  const [open, setOpen] = useState<boolean>(false);

  return (
    <MuiGridFooterContainer>
      <Box sx={{ display: 'flex', columnGap: 1, paddingLeft: 2 }}>
        <Button startIcon={<Handyman />} onClick={() => setOpen(!open)} color="secondary">
          Tools
        </Button>
        <Drawer open={open} onClose={() => setOpen(false)} />
      </Box>
      <Box sx={{ display: 'flex', columnGap: 1, paddingLeft: 2 }}>
        <Chip
          label={`Total: ${Object.values(states).reduce((sum, val) => sum + val, 0)}`}
          sx={{ fontWeight: 'bold' }}
          onClick={() => onClick && onClick(undefined)}
        />
        <Divider orientation="vertical" />
        {Object.entries(states).map(([state, count]) => {
          return (
            <Chip
              key={state}
              label={`${state}: ${numeral(count).format('0,[0]')}`}
              variant="outlined"
              color={color(state as JobType['state']) || 'default'}
              sx={{ fontWeight: 'bold' }}
              onClick={() => onClick && onClick(state)}
            />
          );
        })}
      </Box>
      <GridFooter />
    </MuiGridFooterContainer>
  );
}
