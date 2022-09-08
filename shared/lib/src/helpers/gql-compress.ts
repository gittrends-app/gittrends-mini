/*
 *  Inspired by: https://github.com/jane/gql-compress
 */
export default function gglCompress(s: string = ''): string {
  return s
    .trim()
    .replace(/(\b|\B)[\s\t\r\n]+(\b|\B)/gm, ' ')
    .replace(/([{}[\](),:])\s+|\s+([{}[\](),:])/gm, '$1$2');
}
