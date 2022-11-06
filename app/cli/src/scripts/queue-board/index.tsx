import {
  Code as CodeIcon,
  ExpandMore,
  ForkRight as ForkRightIcon,
  Handyman,
  Star as StarIcon,
} from '@mui/icons-material';
import { Button, Drawer, LinearProgressProps, Stack } from '@mui/material';
import { Avatar, Box, Chip, Divider, LinearProgress, Typography } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridFooter,
  GridFooterContainer,
  GridRenderCellParams,
  GridSortItem,
} from '@mui/x-data-grid';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { orderBy, pickBy } from 'lodash';
import numeral from 'numeral';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import swr from 'swr';

import { Accordion, AccordionDetails, AccordionSummary } from './components/Accordion';
import { UpdaterAccordion } from './components/UpdaterAccordion';

dayjs.extend(relativeTime);

type JobType = {
  state: 'active' | 'failed' | 'completed' | 'waiting';
  progress: number;
  timestamp: number;
  finishedOn: number;
  processedOn: number;
  data: {
    id: string;
    name_with_owner: string;
    url: string;
    avatar_url?: string;
    description?: string;
    primary_language?: string;
    stargazers?: number;
    forks?: number;
    pending_resources?: string[];
    updated_resources?: string[];
  };
};

type DataType = JobType['data'] & Omit<JobType, 'data' | 'finishedOn' | 'processedOn'>;

function color(state?: JobType['state']) {
  let color: 'info' | 'success' | 'error' | undefined = undefined;
  if (state === 'active') color = 'info';
  if (state === 'completed') color = 'success';
  if (state === 'failed') color = 'error';
  return color;
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
      <Typography variant="body2" color="text.secondary">{`${props.value}%`}</Typography>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
    </Box>
  );
}

function CustomFooter(props: { [key in JobType['state']]: number } & { onClick?: (state?: string) => void }) {
  const { onClick, ...states } = props;

  const [open, setOpen] = useState<boolean>(true);

  return (
    <GridFooterContainer>
      <Box sx={{ display: 'flex', columnGap: 1, paddingLeft: 2 }}>
        <Button startIcon={<Handyman />} onClick={() => setOpen(!open)}>
          Tools
        </Button>
        <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
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
        </Drawer>
      </Box>
      <Box sx={{ display: 'flex', columnGap: 1, paddingLeft: 2 }}>
        <Chip
          label={`Total: ${Object.values(states).reduce((sum, val) => sum + val, 0)}`}
          sx={{ fontWeight: 'bold' }}
          onClick={() => onClick && onClick(undefined)}
        />
        <Divider orientation="vertical" />
        {Object.keys(states).map((key) => {
          return (
            <Chip
              key={key}
              label={`${key}: ${numeral(states[key]).format('0,[0]')}`}
              variant="outlined"
              color={color(key as JobType['state']) || 'default'}
              sx={{ fontWeight: 'bold' }}
              onClick={() => onClick && onClick(key)}
            />
          );
        })}
      </Box>
      <GridFooter />
    </GridFooterContainer>
  );
}

function App() {
  const [refreshInterval] = useState<number>(5000);
  const [state, setState] = useState<string | undefined>('active');

  // const [jobs, setJobs] = useState<DataType[]>([]);
  const [sort, setSort] = useState<GridSortItem[]>([{ field: 'progress', sort: 'desc' }]);

  const { data: count } = swr(
    '/api/jobs-count',
    (url: string) =>
      globalThis
        .fetch(url)
        .then((res) => res.json())
        .then((data) => pickBy(data, (val) => val > 0)),
    { refreshInterval },
  );

  const { data: jobs } = swr(
    ['/api/jobs', state],
    async (url, state) => {
      console.log(state);

      return globalThis
        .fetch(url + (state ? '?' + new URLSearchParams({ state }) : ''))
        .then((res) => res.json())
        .then((response: JobType[]) =>
          orderBy(
            response.map(
              ({ data, ...job }): DataType => ({
                ...data,
                timestamp: job.finishedOn || job.processedOn || job.timestamp,
                state: job.state,
                progress: job.progress,
              }),
            ),
            sort.map((criterion) => criterion.field),
            sort.map((criterion) => criterion.sort || true),
          ),
        );
    },
    { refreshInterval },
  );

  const columns: GridColDef[] = [
    {
      field: 'name_with_owner',
      headerName: 'Repository',
      flex: 1,
      renderCell(params: GridRenderCellParams<string, DataType>) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', columnGap: 1, width: '100%', fontSize: '0.85em' }}>
            <Box sx={{ margin: '5px 10px' }}>
              <Avatar alt={params.value} src={params.row.avatar_url} />
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              <Box sx={{ flexGrow: 1 }}>
                <a
                  href={params.row.url}
                  target="_blank"
                  style={{ color: 'inherit', textDecoration: 'none', fontSize: '1rem', fontWeight: 'normal' }}
                >
                  {params.value}
                </a>
                <br />
                <span style={{ fontWeight: 'lighter', color: 'gray' }}>ID: {params.row.id}</span>
                <br />
                <span style={{ fontWeight: 'lighter', color: 'gray' }}>
                  Resources: {params.row.pending_resources?.join(', ')}
                  {params.row.updated_resources?.length ? ', ' : ''}
                  <span style={{ textDecoration: 'line-through' }}>{params.row.updated_resources?.join(', ')}</span>
                </span>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'right', columnGap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ fontSize: '1rem', color: 'gold', mr: 0.5 }} />
                {numeral(params.row.stargazers).format('0.[0]a')}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ForkRightIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> {numeral(params.row.forks).format('0.[0]a')}
              </Box>
              {params.row.primary_language ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CodeIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> {params.row.primary_language}
                </Box>
              ) : (
                <></>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      width: 125,
      type: 'dateTime',
      valueGetter(params): Date {
        return new Date(params.value);
      },
      renderCell(params: GridRenderCellParams<Date, DataType>) {
        const prefix =
          params.row.state === 'completed' ? 'finished' : params.row.state === 'active' ? 'started' : 'added';
        return (
          <Box sx={{ textAlign: 'center', fontSize: '0.9em', width: '100%' }}>
            {prefix}
            <br />
            <span title={params.value?.toISOString()}>{dayjs(params.value).fromNow(false)}</span>
          </Box>
        );
      },
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 185,
      type: 'number',
      renderCell(params: GridRenderCellParams<number, DataType>) {
        return (
          <Box sx={{ width: '100%' }}>
            <LinearProgressWithLabel
              variant="determinate"
              value={params.value || 0}
              color={color(params.row.state) || 'inherit'}
            />
          </Box>
        );
      },
    },
    {
      field: 'state',
      headerName: 'State',
      width: 105,
      renderCell(params: GridRenderCellParams<JobType['state']>) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Chip label={params.value} variant="outlined" color={color(params.value) || 'default'} size="small" />
          </Box>
        );
      },
      type: 'singleSelect',
      valueOptions: ['active', 'completed', 'waiting', 'failed'],
    },
  ];

  return (
    <DataGrid
      rows={jobs || []}
      columns={columns}
      rowHeight={68}
      sortModel={sort.slice(-1)}
      filterModel={{ items: [{ columnField: 'state', operatorValue: 'is', value: state }] }}
      onSortModelChange={([sortItem]) =>
        sortItem ? setSort([...sort.filter((s) => s.field !== sortItem.field), sortItem]) : setSort(sort.slice(0, -1))
      }
      onFilterModelChange={(filter) => {
        setState(filter.items.find((item) => item.columnField === 'state')?.value);
      }}
      components={{ Footer: CustomFooter }}
      componentsProps={{ footer: { ...count, onClick: (state: string) => setState(state) } }}
      disableSelectionOnClick
    />
  );
}

const element = document.querySelector('#app-container');
if (element) createRoot(element).render(<App />);
else alert('React container not found!');
