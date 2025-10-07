// Serve a default avatar as SVG
export default function handler(req, res) {
  const svg = `
    <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="64" cy="64" r="64" fill="url(#grad)"/>
      <circle cx="64" cy="48" r="20" fill="white" opacity="0.9"/>
      <path d="M 32 96 Q 32 80 48 80 L 80 80 Q 96 80 96 96 L 96 128 L 32 128 Z" fill="white" opacity="0.9"/>
      <text x="64" y="120" text-anchor="middle" fill="#6366F1" font-family="Arial, sans-serif" font-size="12" font-weight="bold">USER</text>
    </svg>
  `
  
  res.setHeader('Content-Type', 'image/svg+xml')
  res.setHeader('Cache-Control', 'public, max-age=86400') // Cache for 24 hours
  res.status(200).send(svg)
}
