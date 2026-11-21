param([string]$Out)
Add-Type -AssemblyName System.Drawing
$W = 1600; $H = 1080
$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::White)
$black = [System.Drawing.Color]::Black
$pen = New-Object System.Drawing.Pen $black, 2
$dash = New-Object System.Drawing.Pen $black, 2
$dash.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$thick = New-Object System.Drawing.Pen $black, 3
$font  = New-Object System.Drawing.Font 'Segoe UI', 14
$fontU = New-Object System.Drawing.Font 'Segoe UI', 14, ([System.Drawing.FontStyle]::Underline)
$fontB = New-Object System.Drawing.Font 'Segoe UI', 18, ([System.Drawing.FontStyle]::Bold)
$fontT = New-Object System.Drawing.Font 'Segoe UI', 20, ([System.Drawing.FontStyle]::Bold)
$fontS = New-Object System.Drawing.Font 'Segoe UI', 12
$brush = [System.Drawing.Brushes]::Black
$white = [System.Drawing.Brushes]::White
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center

$nodes = [ordered]@{
  'E'           = @{ n='CIDADE';          x=800;  y=500; k='entity'; p=$null }
  'id'          = @{ n='id';              x=300;  y=170; k='key';    p='E' }
  'nome_cidade' = @{ n='nome_cidade';     x=550;  y=170; k='attr';   p='E' }
  'nome_simples'= @{ n='nome_simples';    x=800;  y=170; k='derived';p='E' }
  'estado'      = @{ n='estado';          x=1050; y=170; k='attr';   p='E' }
  'nome_orgao'  = @{ n='nome_orgao';      x=1300; y=170; k='attr';   p='E' }
  'nome_secr'   = @{ n='nome_secretario'; x=250;  y=380; k='attr';   p='E' }
  'cargo'       = @{ n='cargo';           x=250;  y=500; k='attr';   p='E' }
  'url'         = @{ n='url';             x=250;  y=620; k='attr';   p='E' }
  'created_at'  = @{ n='created_at';      x=1350; y=440; k='attr';   p='E' }
  'updated_at'  = @{ n='updated_at';      x=1350; y=560; k='attr';   p='E' }
  'fp'          = @{ n='foto_perfil';     x=400;  y=780; k='attr';   p='E' }
  'fp_a'        = @{ n='arquivo';         x=290;  y=930; k='attr';   p='fp' }
  'fp_l'        = @{ n='link';            x=510;  y=930; k='attr';   p='fp' }
  'f1'          = @{ n='foto_1';          x=800;  y=780; k='attr';   p='E' }
  'f1_a'        = @{ n='arquivo';         x=690;  y=930; k='attr';   p='f1' }
  'f1_l'        = @{ n='link';            x=910;  y=930; k='attr';   p='f1' }
  'f2'          = @{ n='foto_2';          x=1200; y=780; k='attr';   p='E' }
  'f2_a'        = @{ n='arquivo';         x=1090; y=930; k='attr';   p='f2' }
  'f2_l'        = @{ n='link';            x=1310; y=930; k='attr';   p='f2' }
}

foreach ($key in $nodes.Keys) {
  $a = $nodes[$key]
  if ($a.p) { $p = $nodes[$a.p]; $g.DrawLine($pen, [float]$p.x, [float]$p.y, [float]$a.x, [float]$a.y) }
}

foreach ($key in $nodes.Keys) {
  $a = $nodes[$key]
  if ($a.k -eq 'entity') {
    $w = 220; $h = 70
    $r = New-Object System.Drawing.RectangleF ([float]($a.x - $w/2)), ([float]($a.y - $h/2)), ([float]$w), ([float]$h)
    $g.FillRectangle($white, $r); $g.DrawRectangle($thick, $r.X, $r.Y, $r.Width, $r.Height)
    $g.DrawString($a.n, $fontB, $brush, $r, $sf)
    continue
  }
  $f = if ($a.k -eq 'key') { $fontU } else { $font }
  $s = $g.MeasureString($a.n, $f)
  $w = [math]::Max(130, $s.Width + 44); $h = 56
  $r = New-Object System.Drawing.RectangleF ([float]($a.x - $w/2)), ([float]($a.y - $h/2)), ([float]$w), ([float]$h)
  $g.FillEllipse($white, $r)
  $pp = if ($a.k -eq 'derived') { $dash } else { $pen }
  $g.DrawEllipse($pp, $r)
  $g.DrawString($a.n, $f, $brush, $r, $sf)
}

$g.DrawString('DER conceitual - Lacis2026 (notação MER de Chen / Elmasri-Navathe)', $fontT, $brush, 40, 30)
$nota1 = 'Atributo-chave: id (sublinhado).  Atributo derivado: nome_simples (tracejado), calculado de nome_cidade por NormalizerService::cidade.'
$nota2 = 'Atributos compostos: foto_perfil, foto_1, foto_2 (arquivo -> coluna foto_x; link -> coluna foto_x_link).  Chave candidata: (estado, nome_simples).'
$g.DrawString($nota1, $fontS, $brush, 40, 1005)
$g.DrawString($nota2, $fontS, $brush, 40, 1035)

$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "Salvo em $Out"