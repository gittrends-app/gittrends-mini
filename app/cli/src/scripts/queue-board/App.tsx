import { Code as CodeIcon, ForkRight as ForkRightIcon, Star as StarIcon } from '@mui/icons-material';
import { Avatar, Box, Chip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridSortItem } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { isNil, orderBy, pickBy } from 'lodash';
import numeral from 'numeral';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import swr from 'swr';

import type { CliJobType } from '../../helpers/withBullQueue';
import { GridFooterContainer } from './components/GridFooterContainer';
import { Progress } from './components/LinearProgressWithLabel';

dayjs.extend(relativeTime);

export type JobType = {
  state: 'active' | 'failed' | 'completed' | 'waiting';
  progress: number | Record<string, { done: boolean; current: number; total: number }>;
  timestamp: number;
  finishedOn: number;
  processedOn: number;
  data: CliJobType;
};

type DataType = JobType['data'] & Omit<JobType, 'data' | 'finishedOn' | 'processedOn'>;

export function color(state?: JobType['state']) {
  let color: 'info' | 'success' | 'error' | undefined = undefined;
  if (state === 'active') color = 'info';
  if (state === 'completed') color = 'success';
  if (state === 'failed') color = 'error';
  return color;
}

function App() {
  const [refreshInterval] = useState<number>(5000);
  const [state, setState] = useState<string | undefined>('active');

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
                  Resources:{' '}
                  {params.row.__resources?.map((resource, index) => {
                    const textDecoration =
                      typeof params.row.progress === 'object' && params.row.progress?.[resource]?.done
                        ? 'line-through'
                        : 'none';
                    return (
                      <>
                        {index > 0 ? ', ' : ''}
                        <span style={{ textDecoration }}>{resource}</span>
                      </>
                    );
                  })}
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
      valueGetter(params: GridRenderCellParams<any, DataType>) {
        if (typeof params.row.progress === 'number') {
          return params.row.progress;
        } else {
          const [total, current] = Object.values(params.row.progress).reduce(
            ([total, current], prog) => {
              if (isNil(prog.total) || prog.total === Infinity) return [total, current];
              else return [total + prog.total, current + prog.current];
            },
            [0, 0],
          );
          return current / total;
        }
      },
      renderCell(params: GridRenderCellParams<number, DataType>) {
        const [total, current] = Object.values(params.row.progress).reduce(
          ([total, current], prog) => {
            if (isNil(prog.total) || prog.total === Infinity) return [total, current];
            else return [total + prog.total, current + prog.current];
          },
          [0, 0],
        );

        return (
          <Box sx={{ width: '100%' }}>
            <Progress
              variant="determinate"
              value={params.value ? Math.floor((current / total) * 10000) / 100 : 0}
              color={color(params.row.state) || 'inherit'}
              title={`${numeral(current).format('0[,0]')} of ${numeral(total).format('0[,0]')}`}
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
      components={{
        Footer: GridFooterContainer,
        NoRowsOverlay: (props) => {
          console.log('🚀 ~ file: App.tsx ~ line 213 ~ App ~ props', props);
          return (
            <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <span>No "{props.state}" jobs</span>
            </Box>
          );
        },
      }}
      componentsProps={{
        footer: { ...count, onClick: (state: string) => setState(state) },
        noRowsOverlay: { state },
      }}
      disableSelectionOnClick
    />
  );
}

const element = document.querySelector('#app-container');
if (element) createRoot(element).render(<App />);
else alert('React container not found!');
