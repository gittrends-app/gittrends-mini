import CodeIcon from '@mui/icons-material/Code';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import StarIcon from '@mui/icons-material/Star';
import type { LinearProgressProps } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridRenderCellParams, GridSortItem } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import orderBy from 'lodash/orderBy';
import numeral from 'numeral';
import React from 'react';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

dayjs.extend(relativeTime);

type DataType = {
  id: string;
  name_with_owner: string;
  url: string;
  state: string;
  timestamp: number;
  progress: number;
  avatar_url?: string;
  description?: string;
  primary_language?: string;
  stargazers?: number;
  forks?: number;
  pending_resources?: string[];
  updated_resources?: string[];
};

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

function App() {
  const [jobs, setJobs] = useState<DataType[]>([]);
  const [sort, setSort] = useState<GridSortItem[]>([{ field: 'progress', sort: 'desc' }]);

  function fetch() {
    globalThis
      .fetch(`/api/jobs`)
      .then((response) => response.json())
      .then(async (response) => {
        setJobs(
          orderBy(
            response.map((job) => ({
              ...job.data,
              timestamp: job.timestamp || job.processedOn || job.finishedOn,
              state: job.state,
              progress: job.progress,
            })),
            sort.map((criterion) => criterion.field),
            sort.map((criterion) => criterion.sort || true),
          ),
        );
      });
  }

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, []);

  function color(state?: string) {
    let color: 'info' | 'success' | 'error' | undefined = undefined;
    if (state === 'active') color = 'info';
    if (state === 'completed') color = 'success';
    if (state === 'failed') color = 'error';
    return color;
  }

  const columns: GridColDef[] = [
    {
      field: 'name_with_owner',
      headerName: 'Repository',
      flex: 1,
      renderCell(params: GridRenderCellParams<string, DataType>) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', columnGap: 10, width: '100%', fontSize: '0.85em' }}>
            <div style={{ margin: '5px 10px' }}>
              <Avatar alt={params.value} src={params.row.avatar_url} />
            </div>
            <div style={{ flexGrow: 1, display: 'flex' }}>
              <div style={{ flexGrow: 1 }}>
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
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'right', columnGap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon style={{ fontSize: '1rem', marginRight: 2, color: 'gold' }} />{' '}
                {numeral(params.row.stargazers).format('0.[0]a')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ForkRightIcon style={{ fontSize: '1rem', marginRight: 2 }} />{' '}
                {numeral(params.row.forks).format('0.[0]a')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CodeIcon style={{ fontSize: '1rem', marginRight: 2 }} /> {params.row.primary_language}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      type: 'dateTime',
      valueGetter(params) {
        return new Date(params.value);
      },
      renderCell(params: GridRenderCellParams<string, DataType>) {
        const prefix =
          params.row.state === 'completed' ? 'finished' : params.row.state === 'active' ? 'started' : 'added';
        return (
          <span style={{ textAlign: 'center', fontSize: '0.9em' }}>
            {prefix}
            <br />
            {dayjs(params.value).fromNow()}
          </span>
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
      width: 125,
      renderCell(params: GridRenderCellParams<string>) {
        return <Chip label={params.value} variant="outlined" color={color(params.value) || 'default'} size="small" />;
      },
      type: 'singleSelect',
      valueOptions: ['active', 'completed', 'failed', 'waiting'],
    },
  ];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <DataGrid
        rows={jobs}
        columns={columns}
        rowHeight={68}
        initialState={{
          sorting: { sortModel: sort },
          // filter: { filterModel: { items: [{ columnField: 'state', operatorValue: 'is', value: 'active' }] } },
        }}
        onSortModelChange={([sortItem]) =>
          sortItem ? setSort([...sort.filter((s) => s.field !== sortItem.field), sortItem]) : setSort(sort.slice(0, -1))
        }
      />
    </div>
  );
}

const element = document.getElementsByTagName('body');
if (element.length) createRoot(element[0]).render(<App />);
else alert('React container not found!');
