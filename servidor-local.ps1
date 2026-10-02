# Servidor local para el portfolio (evita Error 153 de YouTube en file://)
# Uso: click derecho > Ejecutar con PowerShell, o: powershell -ExecutionPolicy Bypass -File .\servidor-local.ps1
# Luego abre: http://localhost:8000/  http://localhost:8000/videos.html  http://localhost:8000/3d.html

$port = 8000
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $root) { $root = Get-Location }

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.png'  = 'image/png'
  '.webp' = 'image/webp'
  '.ico'  = 'image/x-icon'
  '.json' = 'application/json'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Output "Sirviendo $root en http://localhost:$port/  (Ctrl+C para detener)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    try {
      $path = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($path)) { $path = 'index.html' }
      $full = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, ($path -replace '/', '\')))
      if (-not $full.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $full -PathType Leaf)) {
        $res.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes('404 - no encontrado')
        $res.OutputStream.Write($msg, 0, $msg.Length)
      } else {
        $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
        $ct = $mime[$ext]
        if (-not $ct) { $ct = 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($full)
        $res.ContentType = $ct
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } catch {
      try { $res.StatusCode = 500 } catch {}
    } finally {
      $res.OutputStream.Close()
    }
  }
} finally {
  $listener.Stop()
}
