import { Code as CodeIcon, ForkRight as ForkRightIcon, Star as StarIcon } from '@mui/icons-material';
import type { LinearProgressProps } from '@mui/material';
import { Avatar, Box, Chip, LinearProgress, Typography } from '@mui/material';
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
import { countBy, orderBy } from 'lodash';
import numeral from 'numeral';
import React, { useCallback, useMemo } from 'react';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

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

type DataType = JobType['data'] & Omit<JobType, 'data'>;

function color(state?: JobType['state']) {
  console.log(state);

  let color: 'info' | 'success' | 'error' | undefined = undefined;
  if (state === 'active') color = 'info';
  if (state === 'completed') color = 'success';
  if (state === 'failed') color = 'error';
  return color;
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
      <Typography variant="body2" color="text.secondary">{`${Math.round(props.value)}%`}</Typography>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
    </Box>
  );
}

function CustomFooter(props: { [key in JobType['state']]: number }) {
  return (
    <GridFooterContainer>
      <Box sx={{ display: 'flex', columnGap: 1, paddingLeft: 2 }}>
        {Object.keys(props).map((key) => {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={`${key}: ${numeral(props[key]).format('0,[0]')}`}
                variant="outlined"
                color={color(key as JobType['state']) || 'default'}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          );
        })}
      </Box>
      <GridFooter />
    </GridFooterContainer>
  );
}

function App() {
  const [jobs, setJobs] = useState<DataType[]>([]);

  const count = useMemo(() => countBy(jobs, 'state'), [jobs]);

  const [sort, setSort] = useState<GridSortItem[]>([
    { field: 'state', sort: 'asc' },
    { field: 'timestamp', sort: 'desc' },
  ]);

  const fetch = useCallback(async () => {
    const response = await globalThis.fetch(`/api/jobs`).then((res) => res.json());

    setJobs(
      orderBy(
        response.map((job: JobType) => ({
          ...job.data,
          timestamp: job.finishedOn || job.processedOn || job.timestamp,
          state: job.state,
          progress: job.progress,
        })),
        sort.map((criterion) => criterion.field),
        sort.map((criterion) => criterion.sort || true),
      ),
    );
  }, [sort]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, []);

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
      valueOptions: ['active', 'completed', 'failed', 'waiting'],
    },
  ];

  return (
    <DataGrid
      rows={jobs}
      columns={columns}
      rowHeight={68}
      initialState={
        {
          // sorting: { sortModel: sort },
          // filter: { filterModel: { items: [{ columnField: 'state', operatorValue: 'is', value: 'active' }] } },
        }
      }
      onSortModelChange={([sortItem]) =>
        sortItem ? setSort([...sort.filter((s) => s.field !== sortItem.field), sortItem]) : setSort(sort.slice(0, -1))
      }
      components={{ Footer: CustomFooter }}
      componentsProps={{ footer: count }}
    />
  );
}

const element = document.querySelector('#app-container');
if (element) createRoot(element).render(<App />);
else alert('React container not found!');
