param([string]$Out)
Add-Type -AssemblyName System.Drawing
$PW = 1050; $PH = 900; $TOP = 90
$W = $PW * 3; $H = $TOP + $PH * 2 + 20
$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::White)
$black = [System.Drawing.Color]::Black
$pen   = New-Object System.Drawing.Pen $black, 2
$pen1  = New-Object System.Drawing.Pen $black, 1.5
$thick = New-Object System.Drawing.Pen $black, 3
$dash  = New-Object System.Drawing.Pen $black, 2
$dash.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$frame = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(200,200,200)), 1.5
$font  = New-Object System.Drawing.Font 'Segoe UI', 13
$fontB = New-Object System.Drawing.Font 'Segoe UI', 17, ([System.Drawing.FontStyle]::Bold)
$fontT = New-Object System.Drawing.Font 'Segoe UI', 24, ([System.Drawing.FontStyle]::Bold)
$fontH = New-Object System.Drawing.Font 'Segoe UI', 15, ([System.Drawing.FontStyle]::Bold)
$fontS = New-Object System.Drawing.Font 'Segoe UI', 13
$brush = [System.Drawing.Brushes]::Black
$white = [System.Drawing.Brushes]::White
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center

function Draw-Node($n) {
  $t = $n.t
  if ($t -eq 'entity') { $f = $fontB } else { $f = $font }
  $s = $g.MeasureString($n.n, $f)
  if ($t -eq 'entity') { $w = [math]::Max(200, $s.Width + 50); $h = 66 }
  else { $w = [math]::Max(110, $s.Width + 34); $h = 46 }
  if ($n.w) { $w = $n.w }; if ($n.h) { $h = $n.h }
  $r = New-Object System.Drawing.RectangleF ([float]($n.x - $w / 2)), ([float]($n.y - $h / 2)), ([float]$w), ([float]$h)
  if ($t -eq 'entity') {
    $g.FillRectangle($white, $r); $g.DrawRectangle($thick, $r.X, $r.Y, $r.Width, $r.Height)
  } else {
    $g.FillEllipse($white, $r)
    if ($t -eq 'derived') { $g.DrawEllipse($dash, $r) } else { $g.DrawEllipse($pen, $r) }
  }
  $g.DrawString($n.n, $f, $brush, $r, $sf)
  if ($t -eq 'key') {
    $uy = [float]($n.y + $s.Height / 2 - 5)
    $g.DrawLine($pen1, [float]($n.x - $s.Width / 2 + 4), $uy, [float]($n.x + $s.Width / 2 - 4), $uy)
  }
}

# Desenha um painel: entidade no centro e atributos em dois aneis alternados.
function Draw-Panel($col, $row, $name, $attrs, $composites) {
  $ox = $col * $PW; $oy = $TOP + $row * $PH
  $g.DrawRectangle($frame, [float]($ox + 10), [float]($oy + 10), [float]($PW - 20), [float]($PH - 20))
  $cx = $ox + $PW / 2; $cy = $oy + $PH / 2
  $nodes = @()
  $n = $attrs.Count
  for ($i = 0; $i -lt $n; $i++) {
    $a = $attrs[$i]
    $ang = -[math]::PI / 2 + 2 * [math]::PI * $i / $n
    if ($i % 2 -eq 0) { $rx = 400; $ry = 345 } else { $rx = 290; $ry = 235 }
    $nodes += @{ n = $a[0]; t = $a[1]; x = [float]($cx + $rx * [math]::Cos($ang)); y = [float]($cy + $ry * [math]::Sin($ang)); px = $cx; py = $cy }
  }
  if ($composites) {
    foreach ($c in $composites) {
      $nodes += @{ n = $c.n; t = 'attr'; x = [float]($cx + $c.dx); y = [float]($cy + $c.dy); px = $cx; py = $cy }
      foreach ($sub in $c.subs) {
        $nodes += @{ n = $sub[0]; t = 'attr'; x = [float]($cx + $c.dx + $sub[1]); y = [float]($cy + $c.dy + $sub[2]); px = [float]($cx + $c.dx); py = [float]($cy + $c.dy) }
      }
    }
  }
  foreach ($nd in $nodes) { $g.DrawLine($pen, [float]$nd.px, [float]$nd.py, [float]$nd.x, [float]$nd.y) }
  foreach ($nd in $nodes) { Draw-Node $nd }
  Draw-Node @{ n = $name; t = 'entity'; x = [float]$cx; y = [float]$cy }
}

$g.DrawString('DER conceitual - banco do site LACIS (notação MER de Chen / Elmasri-Navathe)', $fontT, $brush, 30, 25)

# CIDADES (tabela existente): fotos como atributos compostos
$cid = @(
  @('id','key'), @('nome_cidade','attr'), @('nome_simples','derived'), @('estado','attr'),
  @('nome_orgao','attr'), @('nome_secretario','attr'), @('cargo','attr'),
  @('url','attr'), @('created_at','attr'), @('updated_at','attr')
)
$cidComp = @(
  @{ n = 'foto_perfil'; dx = -330; dy = 230; subs = @(@('arquivo', -95, 115), @('link', 75, 120)) },
  @{ n = 'foto_1';      dx = 0;    dy = 300; subs = @(@('arquivo', -105, 95), @('link', 105, 95)) },
  @{ n = 'foto_2';      dx = 330;  dy = 230; subs = @(@('arquivo', -75, 120), @('link', 95, 115)) }
)
# Para cidades, os atributos simples ficam na metade de cima (aneis em 220 graus)
$ox = 0; $oy = $TOP; $cx = $PW / 2; $cy = $oy + $PH / 2 - 40
$g.DrawRectangle($frame, 10, [float]($oy + 10), [float]($PW - 20), [float]($PH - 20))
$nodes = @()
for ($i = 0; $i -lt $cid.Count; $i++) {
  $ang = [math]::PI * (200 - 220 * $i / ($cid.Count - 1)) / 180
  if ($i % 2 -eq 0) { $rx = 420; $ry = 330 } else { $rx = 300; $ry = 215 }
  $nodes += @{ n = $cid[$i][0]; t = $cid[$i][1]; x = [float]($cx + $rx * [math]::Cos($ang)); y = [float]($cy - $ry * [math]::Sin($ang)); px = $cx; py = $cy }
}
foreach ($c in $cidComp) {
  $nodes += @{ n = $c.n; t = 'attr'; x = [float]($cx + $c.dx); y = [float]($cy + $c.dy); px = $cx; py = $cy }
  foreach ($sub in $c.subs) { $nodes += @{ n = $sub[0]; t = 'attr'; x = [float]($cx + $c.dx + $sub[1]); y = [float]($cy + $c.dy + $sub[2]); px = [float]($cx + $c.dx); py = [float]($cy + $c.dy) } }
}
foreach ($nd in $nodes) { $g.DrawLine($pen, [float]$nd.px, [float]$nd.py, [float]$nd.x, [float]$nd.y) }
foreach ($nd in $nodes) { Draw-Node $nd }
Draw-Node @{ n = 'CIDADES'; t = 'entity'; x = [float]$cx; y = [float]$cy }
$g.DrawString('(tabela já existente - dirigentes de cultura)', $fontS, $brush, 30, [float]($oy + 25))

Draw-Panel 1 0 'EVENTOS' @(
  @('id','key'), @('titulo','attr'), @('descricao','attr'), @('inicio','attr'), @('termino','attr'),
  @('modalidade','attr'), @('local','attr'), @('cidade','attr'), @('uf','attr'), @('link','attr'),
  @('imagem_capa','attr'), @('publicado','attr'), @('created_at','attr'), @('updated_at','attr')
) $null

Draw-Panel 2 0 'PESQUISAS' @(
  @('id','key'), @('titulo','attr'), @('descricao','attr'), @('pesquisadores','attr'), @('ano_inicio','attr'),
  @('ano_fim','attr'), @('situacao','attr'), @('link','attr'), @('imagem_capa','attr'), @('publicado','attr'),
  @('created_at','attr'), @('updated_at','attr')
) $null

Draw-Panel 0 1 'CURSOS' @(
  @('id','key'), @('titulo','attr'), @('descricao','attr'), @('carga_horaria','attr'), @('modalidade','attr'),
  @('inicio','attr'), @('termino','attr'), @('local','attr'), @('link_inscricao','attr'), @('vagas','attr'),
  @('imagem_capa','attr'), @('publicado','attr'), @('created_at','attr'), @('updated_at','attr')
) $null

Draw-Panel 1 1 'TEXTOS' @(
  @('id','key'), @('titulo','attr'), @('resumo','attr'), @('conteudo','attr'), @('arquivo_pdf','attr'),
  @('autor','attr'), @('data_publicacao','attr'), @('numero_edicao','attr'), @('imagem_capa','attr'),
  @('publicado','attr'), @('created_at','attr'), @('updated_at','attr')
) $null

# Painel de legenda e notas
$lx = 2 * $PW + 40; $ly = $TOP + $PH + 40
$g.DrawRectangle($frame, [float](2 * $PW + 10), [float]($TOP + $PH + 10), [float]($PW - 20), [float]($PH - 20))
$g.DrawString('Legenda', $fontH, $brush, [float]$lx, [float]$ly)
$items = @(@('entity','E','Entidade (tabela)'), @('attr','a','Atributo (coluna)'), @('key','a','Atributo-chave'), @('derived','a','Atributo derivado'))
$iy = $ly + 65
foreach ($it in $items) {
  if ($it[0] -eq 'entity') { $hh = 40 } else { $hh = 36 }
  Draw-Node @{ n = $it[1]; t = $it[0]; x = [float]($lx + 55); y = [float]$iy; w = 90; h = $hh }
  $g.DrawString($it[2], $fontS, $brush, [float]($lx + 120), [float]($iy - 11))
  $iy += 55
}
$g.DrawString('Notas', $fontH, $brush, [float]$lx, [float]($iy + 15))
$notas = @(
  '- As cinco tabelas são independentes: não há relacionamentos nem chaves estrangeiras.',
  '- eventos.cidade e eventos.uf são texto livre, sem ligação com a tabela cidades.',
  '- publicado: o item começa como rascunho e só aparece no site depois de publicado.',
  '- modalidade (eventos e cursos): presencial, online ou hibrido.',
  '- situacao (pesquisas): em_andamento ou concluida; concluída exige ano_fim.',
  '- textos (boletim): exige conteudo, arquivo_pdf ou os dois.',
  '- nome_simples (cidades) é calculado a partir de nome_cidade.',
  '- Fotos de cidades: atributo composto (arquivo = foto_x, link = foto_x_link).'
)
$ny = $iy + 55
$noteRect = New-Object System.Drawing.RectangleF ([float]$lx), 0, ([float]($PW - 80)), 60
foreach ($nt in $notas) {
  $noteRect.Y = [float]$ny
  $g.DrawString($nt, $fontS, $brush, $noteRect)
  $ny += [math]::Ceiling($g.MeasureString($nt, $fontS, [int]($PW - 80)).Height) + 8
}

$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "Salvo em $Out"