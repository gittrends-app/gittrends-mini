import { LinearProgressProps } from '@mui/material';
import { Box, LinearProgress, Typography } from '@mui/material';
import React from 'react';

export function Progress(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
      <Typography variant="body2" color="text.secondary">{`${props.value}%`}</Typography>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
    </Box>
  );
}
