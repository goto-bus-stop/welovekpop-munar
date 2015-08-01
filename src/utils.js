const moment = require('moment')

const SPANS = {
  d: 24,
  w: 24 * 7,
  m: 24 * 30
}

export function spanToTime(span) {
  if (span === 'f') {
    return moment(0)
  }

  let hours = span in SPANS ? SPANS[span] : span
  if (typeof hours === 'string' && /^\d+$/.test(hours)) {
    hours = parseInt(hours, 10)
  }
  return moment().subtract(hours, 'hours')
}

export function times(x) {
  return x === 1 ? 'once'
       : x === 2 ? 'twice'
       : x >=  3 ? `${x} times`
       : ''
}

export function days(h) {
  if (h <= 24 || (h < 48 && h % 24 !== 0)) {
    return h === 1 ? 'hour' : `${h} hours`
  }
  const x = Math.floor(h / 24)
  return x === 1 ? 'day' : `${x} days`
}

export function joinList(args, sep = ', ', lastSep = ' and ') {
  let tail = args.pop()
  let head = args.join(sep)
  return head ? head + lastSep + tail : tail
}

// channel names that we can auto-fix
const LOENENT = /^loenent|1theK \(.*?\)|LOEN MUSIC Official Channel \(.*?\)$/i
const SMENT = /^sment|smtown$/i
// random stuff
const MV = /Music ?Video/i
const MVPREFIX = /^\[M\/?V\] ?/i
const FEATURING = /Feat(?:uring)?|With/i
const TEASER = /^\s*\[?(?:M\/?V\s*)?Teaser\]?\s*/i

export function fixTags(at) {
  let author = at.author.trim()
  let title = at.title.trim()

  if (author === '' || author === '?' ||
      SMENT.test(author) || LOENENT.test(author)) {
    let parts = title.split(' _ ') // mostly loenent
    if (parts.length === 1) parts = title.split('_') // mostly sment
    if (parts.length > 1) {
      if (parts.length > 2) {
        let last = parts.pop().trim()
        // drop things like "Music Video", "MusicVideo", but  keep things like
        // "Dance Practice", and "Music Video (feat. X)", in brackets
        if (!MV.test(last) || FEATURING.test(last)) {
          parts[parts.length - 1] = parts[parts.length - 1] + ` (${last})`
        }
      }
      author = parts[0].trim()
      title = parts.slice(1).join('_').trim()
    }
  }

  // taken from
  // https://github.com/brooke/Chrome-Last.fm-Scrobbler/blob/5c45a3b/connectors/youtube.js#L186-L216
  title = title
    .replace(/\s*\*+\s?\S+\s?\*+$/, '') // **NEW**
    .replace(/\s*\[[^\]]+\]$/, '') // [whatever]
    .replace(/\s*\[\s*(M\/?V)\s*\]/, '') // [MV] or [M/V]
    .replace(/\s*\(\s*(M\/?V)\s*\)/, '') // (MV) or (M/V)
    .replace(/[\s\-–_]+(M\/?V)\s*/, '') // MV or M/V
    .replace(/\s*\([^\)]*ver(\.|sion)?\s*\)$/i, '') // (whatever version)
    .replace(/\s*[a-z]*\s*ver(\.|sion)?$/i, '') // ver. and 1 word before (no parens)
    .replace(/\s*\.(avi|wmv|mpg|mpeg|flv)$/i, '') // video extensions
    .replace(/\s*(of+icial\s*)?(music\s*)?video/i, '') // (official)? (music)? video
    .replace(/\s*(ALBUM TRACK\s*)?(album track\s*)/i, '') // (ALBUM TRACK)
    .replace(/\s*\(\s*of+icial\s*\)/i, '') // (official)
    .replace(/\s*\(\s*[0-9]{4}\s*\)/i, '') // (1999)
    .replace(/\s+\(\s*(HD|HQ)\s*\)$/, '') // HD (HQ)
    .replace(/[\s\-–_]+(HD|HQ)\s*$/, '') // HD (HQ)
    .replace(/\s*video\s*clip/i, '') // video clip
    .replace(/\s+\(?live\)?$/i, '') // live
    .replace(/\(\s*\)/, '') // Leftovers after e.g. (official video)
    .replace(/^(|.*\s)"(.*)"(\s.*|)$/, '$2') // Artist - The new "Track title" featuring someone
    .replace(/^(|.*\s)'(.*)'(\s.*|)$/, '$2') // 'Track title'
    .replace(/^[\/\s,:;~\-–_\s"]+/, '') // trim starting white chars and dash
    .replace(/[\/\s,:;~\-–_\s"\s!]+$/, '') // trim trailing white chars and dash

  author = author
    .replace(/\s*[0-1][0-9][0-1][0-9][0-3][0-9]\s*/, '') // date formats ex. 130624
    .replace(/\[\s*(1080|720)p\s*\]/i, '') // [1080p]
    .replace(/\[\s*(M\/?V)\s*\]/, '') // [MV] or [M/V]
    .replace(/\(\s*(M\/?V)\s*\)/, '') // (MV) or (M/V)
    .replace(/\s*(M\/?V)\s*/, '') // MV or M/V
    .replace(/^[\/\s,:;~\-–_\s"]+/, '') // trim starting white chars and dash
    .replace(/[\/\s,:;~\-–_\s"\s!]+$/, '') // trim trailing white chars and dash

  author = author.replace(MVPREFIX, '')
  if (TEASER.test(author)) {
    author = author.replace(TEASER, '')
    title += ' (Teaser)'
  }

  author = author.trim()
  title = title.trim()

  return { author, title }
}
