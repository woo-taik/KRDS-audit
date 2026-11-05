import { cssFinding } from '../css-finding.js'
import { hasMedia } from '../media.js'
import type { CssRule } from '../types.js'

export const highContrastMode: CssRule = {
  id: 'krds/high-contrast-mode',
  check: ({ sources }) => {
    const first = sources[0]
    if (!first || hasMedia(sources, ['prefers-contrast:more', 'forced-colors:active'])) return []

    return [
      cssFinding('krds/high-contrast-mode', first.file, null, '@media (prefers-contrast: more)'),
    ]
  },
}
