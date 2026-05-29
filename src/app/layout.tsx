import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Duo Handshake — Redscout' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--bg:#ffffff;--bg2:#eef4fc;--bg3:#ffffff;--text:#1a1a18;--text2:#6b6b68;--text3:#b0b0aa;--border:rgba(0,0,0,0.12);--border2:rgba(0,0,0,0.22);--r:8px;--rl:12px;--font:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--blue:#378ADD;}
        @media(prefers-color-scheme:dark){:root{--bg:#1a1a18;--bg2:#242422;--bg3:#2e2e2c;--text:#f0f0ee;--text2:#9a9a96;--border:rgba(255,255,255,0.12);--border2:rgba(255,255,255,0.22);}}
        body{font-family:var(--font);background:var(--bg3);color:var(--text);font-size:15px;line-height:1.6;min-height:100vh;}
        input,select,textarea,button{font-family:var(--font);}
      `}</style></head>
      <body>{children}</body>
    </html>
  )
}
