import { MultiBar, Presets } from 'cli-progress';

export async function withMultibar(context: (multibar: MultiBar) => Promise<void>): Promise<void> {
  const multibar = new MultiBar(
    {
      format: '{resource} [{bar}] {eta_formatted} | {value}/{total} ({percentage}%)',
      stopOnComplete: true,
      clearOnComplete: true,
      hideCursor: true,
      autopadding: true,
    },
    Presets.rect,
  );

  await context(multibar).finally(() => {
    multibar.stop();
  });
}
