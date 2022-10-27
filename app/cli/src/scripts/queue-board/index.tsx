import GitHubIcon from '@mui/icons-material/GitHub';
import { Box, Chip, LinearProgress, LinearProgressProps, Link, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridSortItem } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { orderBy } from 'lodash';
import React from 'react';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

dayjs.extend(relativeTime);

type DataType = {
  id: string;
  name_with_owner: string;
  url: string;
  state: string;
  processedOn: number;
  progress: number;
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
              finishedOn: job.finishedOn,
              processedOn: job.processedOn,
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
    { field: 'id', headerName: 'id', width: 175 },
    {
      field: 'name_with_owner',
      headerName: 'Repository',
      flex: 1,
      renderCell(params: GridRenderCellParams<string, DataType>) {
        return (
          <Link href={params.row.url} style={{ display: 'flex', columnGap: '10px' }} color="inherit" target="_blank">
            <GitHubIcon /> {params.value}
          </Link>
        );
      },
    },
    {
      field: 'finishedOn',
      headerName: 'Finished',
      renderCell(params: GridRenderCellParams<string, DataType>) {
        return params.value ? dayjs(params.value).fromNow() : '--';
      },
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 225,
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
    },
  ];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <DataGrid
        rows={jobs}
        columns={columns}
        rowHeight={36}
        initialState={{
          sorting: { sortModel: sort },
          filter: { filterModel: { items: [{ columnField: 'state', operatorValue: 'contains', value: 'active' }] } },
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
