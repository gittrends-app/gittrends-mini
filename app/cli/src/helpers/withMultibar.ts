import { MultiBar, Presets } from 'cli-progress';

export async function withMultibar<T>(context: (multibar: MultiBar) => Promise<T>): Promise<T> {
  const multibar = new MultiBar(
    {
      format: '{resource} [{bar}] {eta_formatted} | {value}/{total} ({percentage}%)',
      autopadding: true,
      hideCursor: true,
    },
    Presets.rect,
  );

  return context(multibar).finally(() => {
    multibar.stop();
  });
}
