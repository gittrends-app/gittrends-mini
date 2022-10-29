import { MultiBar, Presets } from 'cli-progress';
import { round, truncate } from 'lodash';

const clearLastLine = () => {
  process.stdout.moveCursor(0, -1); // up one line
  process.stdout.clearLine(1); // from cursor to end
};

export async function withMultibar(): Promise<MultiBar>;
export async function withMultibar<T>(context: (multibar: MultiBar) => Promise<T>): Promise<T>;
export async function withMultibar(callback?: any): Promise<any> {
  let maxProgressDetails = 0;
  const multibar = new MultiBar(
    {
      format(options, params, payload: { resource: string }) {
        if (!payload.resource) payload.resource = '';
        // bar grows dynamically by current progress - no whitespaces are added
        const completedBar = options.barCompleteString?.substring(
          0,
          Math.round(params.progress * (options.barsize || 40)),
        );
        const pendingBar = options.barIncompleteString?.substring(
          0,
          Math.round((1 - params.progress) * (options.barsize || 40)),
        );
        const resource = (
          payload.resource.length > 38 ? truncate(payload.resource, { length: 38, omission: '..' }) : payload.resource
        ).padEnd(38);
        const progress = `${round(params.progress * 100, 1)}`.padStart(4);
        const progressDetails = `${params.value}/${params.total}`;
        maxProgressDetails = Math.max(maxProgressDetails, progressDetails.length);
        return `${resource}  [${completedBar}${pendingBar}]  ${progressDetails.padStart(
          maxProgressDetails,
        )} (${progress}%)`;
      },
      clearOnComplete: true,
      autopadding: true,
      hideCursor: true,
      emptyOnZero: true,
      noTTYOutput: !process.stdout.isTTY,
    },
    Presets.rect,
  );

  let newLineWriten = false;
  multibar.on('update-pre', () => {
    if (newLineWriten) return;
    newLineWriten = true;
    process.stdout.write('\n');
  });

  multibar.on('stop', () => (newLineWriten ? clearLastLine() : null));

  return callback ? callback(multibar).finally(() => multibar.stop()) : multibar;
}
