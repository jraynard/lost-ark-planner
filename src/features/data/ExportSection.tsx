import { useEffect, useMemo, useState } from 'react'
import { Button, Card, inputClass } from '../../app/ui'
import { useNow } from '../../app/useNow'
import { encodeShare } from '../../share/codec'
import { buildSharePayload } from '../../share/transfer'
import { useChecklist } from '../../store/checklist'
import { useRoster } from '../../store/roster'

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]']

export function ExportSection() {
  const characters = useRoster((s) => s.characters)
  // Re-encode when ticks change or a reset passes.
  const weekly = useChecklist((s) => s.weekly)
  const daily = useChecklist((s) => s.daily)
  const now = useNow()
  const [includeChecklist, setIncludeChecklist] = useState(false)
  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const code = useMemo(
    () => (characters.length ? encodeShare(buildSharePayload(characters, includeChecklist, now)) : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- weekly/daily are read inside buildSharePayload
    [characters, includeChecklist, weekly, daily, now],
  )
  const link = `${location.origin}${location.pathname}#/import?d=${code}`
  const isLocal = LOCAL_HOSTS.includes(location.hostname)

  useEffect(() => {
    if (!code) return
    let cancelled = false
    import('qrcode')
      .then((QRCode) => QRCode.toString(link, { type: 'svg', errorCorrectionLevel: 'L', margin: 2 }))
      .then((url) => !cancelled && setQr(url))
      .catch(() => !cancelled && setQr(null))
    return () => {
      cancelled = true
    }
  }, [link, code])

  if (!characters.length) {
    return <Card className="text-sm text-muted">Add characters on the Roster page to share them.</Card>
  }

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setCopied('Copy failed; select the text and copy it by hand')
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lost Ark Planner roster', url: link })
      } catch {
        // Cancelled by the user.
      }
    } else {
      await copy(link, 'Link copied')
    }
  }

  return (
    <Card className="flex flex-col gap-4 text-sm">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={includeChecklist} onChange={(e) => setIncludeChecklist(e.target.checked)} className="accent-accent" />
        Include this week’s checklist ticks
      </label>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-muted">
            Share code ({code.length} characters). Paste it into the Import box on another device, or send it by text.
          </span>
          <textarea readOnly value={code} rows={5} className={`${inputClass} font-mono text-xs break-all`} aria-label="Share code"
            onFocus={(e) => e.target.select()} />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" onClick={() => void copy(code, 'Code copied')}>
              Copy code
            </Button>
            <Button onClick={() => void share()}>Share link…</Button>
            <Button variant="ghost" onClick={() => void copy(link, 'Link copied')}>
              Copy link
            </Button>
            {copied && <span className="text-good">{copied}</span>}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          {qr && (
            // SVG markup generated locally by the qrcode library from our own link.
            <div role="img" aria-label="QR code of the share link" className="h-52 w-52 overflow-hidden rounded-md bg-white"
              dangerouslySetInnerHTML={{ __html: qr }} />
          )}
          <span className="max-w-52 text-center text-xs text-muted">Scan with a phone camera to open the import link.</span>
        </div>
      </div>

      {isLocal && (
        <div className="rounded-md bg-warn/10 p-3 text-xs text-warn">
          This link points to <code>{location.host}</code>, which only works on this computer. For a phone on the same
          Wi-Fi, run <code>npm run dev -- --host</code>, open the “Network” address it prints on this computer, and share
          from there. The text code works anywhere.
        </div>
      )}
    </Card>
  )
}
