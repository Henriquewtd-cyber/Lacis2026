param([string]$Out)
Add-Type -AssemblyName System.Drawing
$W = 2800; $H = 2060
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
$dash1 = New-Object System.Drawing.Pen $black, 1.5
$dash1.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$font  = New-Object System.Drawing.Font 'Segoe UI', 14
$fontB = New-Object System.Drawing.Font 'Segoe UI', 15, ([System.Drawing.FontStyle]::Bold)
$fontC = New-Object System.Drawing.Font 'Segoe UI', 16, ([System.Drawing.FontStyle]::Bold)
$fontT = New-Object System.Drawing.Font 'Segoe UI', 22, ([System.Drawing.FontStyle]::Bold)
$fontS = New-Object System.Drawing.Font 'Segoe UI', 13
$brush = [System.Drawing.Brushes]::Black
$white = [System.Drawing.Brushes]::White
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center

$N = [ordered]@{}
$E = New-Object System.Collections.ArrayList
function Add-N($id, $label, $type, $x, $y) { $script:N[$id] = @{ n = $label; t = $type; x = [float]$x; y = [float]$y } }
function Add-E($a, $b, $style = 's', $card = '') { [void]$script:E.Add(@{ a = $a; b = $b; s = $style; c = $card }) }

function Diamond($x, $y, $w, $h) {
  , ([System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF ([float]$x), ([float]($y - $h / 2))),
    (New-Object System.Drawing.PointF ([float]($x + $w / 2)), ([float]$y)),
    (New-Object System.Drawing.PointF ([float]$x), ([float]($y + $h / 2))),
    (New-Object System.Drawing.PointF ([float]($x - $w / 2)), ([float]$y))))
}

function Draw-Line($x1, $y1, $x2, $y2, $double) {
  if ($double) {
    $dx = $x2 - $x1; $dy = $y2 - $y1; $len = [math]::Sqrt($dx * $dx + $dy * $dy)
    $ox = -$dy / $len * 3.5; $oy = $dx / $len * 3.5
    $g.DrawLine($pen, [float]($x1 + $ox), [float]($y1 + $oy), [float]($x2 + $ox), [float]($y2 + $oy))
    $g.DrawLine($pen, [float]($x1 - $ox), [float]($y1 - $oy), [float]($x2 - $ox), [float]($y2 - $oy))
  } else {
    $g.DrawLine($pen, [float]$x1, [float]$y1, [float]$x2, [float]$y2)
  }
}

function Draw-Node($n) {
  $t = $n.t
  $isEnt = $t -in 'entity', 'weak'
  $isRel = $t -in 'rel', 'idrel'
  $f = if ($isEnt -or $isRel) { $fontB } else { $font }
  $s = $g.MeasureString($n.n, $f)
  if ($isEnt) { $w = [math]::Max(180, $s.Width + 50); $h = 64 }
  elseif ($isRel) { $w = [math]::Max(150, $s.Width + 80); $h = 84 }
  else { $w = [math]::Max(120, $s.Width + 40); $h = 52 }
  if ($n.w) { $w = $n.w }; if ($n.h) { $h = $n.h }
  $x = $n.x; $y = $n.y
  $r = New-Object System.Drawing.RectangleF ([float]($x - $w / 2)), ([float]($y - $h / 2)), ([float]$w), ([float]$h)
  if ($isEnt) {
    $g.FillRectangle($white, $r); $g.DrawRectangle($thick, $r.X, $r.Y, $r.Width, $r.Height)
    if ($t -eq 'weak') { $g.DrawRectangle($pen, [float]($r.X + 6), [float]($r.Y + 6), [float]($r.Width - 12), [float]($r.Height - 12)) }
  } elseif ($isRel) {
    $pts = Diamond $x $y $w $h
    $g.FillPolygon($white, $pts); $g.DrawPolygon($thick, $pts)
    if ($t -eq 'idrel') { $g.DrawPolygon($pen, (Diamond $x $y ($w - 24) ($h - 14))) }
  } else {
    $g.FillEllipse($white, $r)
    $pp = if ($t -eq 'derived') { $dash } else { $pen }
    $g.DrawEllipse($pp, $r)
    if ($t -eq 'multi') { $g.DrawEllipse($pen, [float]($r.X + 5), [float]($r.Y + 5), [float]($r.Width - 10), [float]($r.Height - 10)) }
  }
  $g.DrawString($n.n, $f, $brush, $r, $sf)
  if ($t -in 'key', 'partial') {
    $uy = [float]($y + $s.Height / 2 - 4)
    $up = if ($t -eq 'partial') { $dash1 } else { $pen1 }
    $g.DrawLine($up, [float]($x - $s.Width / 2 + 5), $uy, [float]($x + $s.Width / 2 - 5), $uy)
  }
}

# ---------------- Entidades, relacionamentos e atributos ----------------
Add-N ESTADO 'ESTADO' entity 220 1000
Add-N e_sigla 'sigla' key 130 830
Add-N e_nome 'nome' attr 320 830
Add-N POSSUI 'POSSUI' rel 500 1000

Add-N CIDADE 'CIDADE' entity 800 1000
Add-N c_id 'id' key 640 820
Add-N c_nome 'nome_cidade' attr 800 760
Add-N c_simples 'nome_simples' derived 970 820
Add-N c_dir 'dirigente_cultura' attr 800 1220
Add-N c_org 'nome_orgao' attr 610 1380
Add-N c_sec 'nome_secretario' attr 800 1450
Add-N c_cargo 'cargo' attr 990 1380

Add-N SEDIA 'SEDIA' rel 1140 1000

Add-N BIB 'BIBLIOTECA' entity 1500 1000
Add-N b_id 'id' key 1240 880
Add-N b_tel 'telefone' multi 1170 740
Add-N b_redes 'redes_sociais' multi 1250 610
Add-N b_nome 'nome' attr 1100 560
Add-N b_tipo 'tipo' attr 1390 690
Add-N b_infra 'infraestrutura' attr 1520 520
Add-N i_area 'area_m2' attr 1330 380
Add-N i_assent 'assentos' attr 1480 380
Add-N i_comp 'computadores' attr 1645 380
Add-N i_acess 'acessibilidade' multi 1830 380
Add-N b_site 'site' attr 1660 690
Add-N b_end 'endereco' attr 1900 720
Add-N en_log 'logradouro' attr 1760 570
Add-N en_num 'numero' attr 1900 570
Add-N en_bai 'bairro' attr 2030 570
Add-N en_cep 'cep' attr 2160 570
Add-N b_email 'email' attr 1800 900

Add-N OFERECE 'OFERECE' rel 1980 1000
Add-N o_per 'periodicidade' attr 1990 1150
Add-N SERVICO 'SERVICO' entity 2330 1000
Add-N s_id 'id' key 2230 840
Add-N s_nome 'nome' attr 2410 840
Add-N s_cat 'categoria' attr 2570 960

Add-N ATUA 'ATUA_EM' rel 1920 1330
Add-N a_func 'funcao' attr 1760 1480
Add-N a_resp 'responsavel' attr 1920 1520
Add-N a_ini 'data_inicio' attr 2090 1480
Add-N BT 'BIBLIOTECARIO' entity 2330 1330
Add-N t_id 'id' key 2240 1170
Add-N t_nome 'nome' attr 2400 1170
Add-N t_crb 'registro_crb' attr 2600 1260
Add-N t_form 'formacao' attr 2600 1400
Add-N t_email 'email' attr 2400 1500

Add-N REG 'REGISTRA' idrel 1600 1530
Add-N IND 'INDICADOR_ANUAL' weak 1650 1750
Add-N d_ano 'ano' partial 1400 1720
Add-N d_acv 'acervo_total' attr 1480 1900
Add-N d_emp 'emprestimos' attr 1660 1920
Add-N d_usu 'usuarios_cadastrados' attr 1870 1900
Add-N d_vis 'visitas' attr 1900 1760

Add-N TEM 'TEM' idrel 1250 1460
Add-N HOR 'HORARIO' weak 1080 1680
Add-N h_dia 'dia_semana' partial 860 1600
Add-N h_abre 'abertura' attr 930 1830
Add-N h_fecha 'fechamento' attr 1150 1850

# atributos
foreach ($p in 'e_sigla','e_nome') { Add-E ESTADO $p }
foreach ($p in 'c_id','c_nome','c_simples','c_dir') { Add-E CIDADE $p }
foreach ($p in 'c_org','c_sec','c_cargo') { Add-E c_dir $p }
foreach ($p in 'b_id','b_tel','b_redes','b_nome','b_tipo','b_infra','b_site','b_end','b_email') { Add-E BIB $p }
foreach ($p in 'i_area','i_assent','i_comp','i_acess') { Add-E b_infra $p }
foreach ($p in 'en_log','en_num','en_bai','en_cep') { Add-E b_end $p }
Add-E OFERECE o_per
foreach ($p in 's_id','s_nome','s_cat') { Add-E SERVICO $p }
foreach ($p in 'a_func','a_resp','a_ini') { Add-E ATUA $p }
foreach ($p in 't_id','t_nome','t_crb','t_form','t_email') { Add-E BT $p }
foreach ($p in 'd_ano','d_acv','d_emp','d_usu','d_vis') { Add-E IND $p }
foreach ($p in 'h_dia','h_abre','h_fecha') { Add-E HOR $p }

# relacionamentos (d = participacao total)
Add-E POSSUI ESTADO 's' '1'
Add-E POSSUI CIDADE 'd' 'N'
Add-E SEDIA CIDADE 's' '1'
Add-E SEDIA BIB 'd' 'N'
Add-E OFERECE BIB 's' 'M'
Add-E OFERECE SERVICO 's' 'N'
Add-E ATUA BIB 's' 'N'
Add-E ATUA BT 's' 'M'
Add-E TEM BIB 's' '1'
Add-E TEM HOR 'd' 'N'
Add-E REG BIB 's' '1'
Add-E REG IND 'd' 'N'

# ---------------- Desenho ----------------
foreach ($ed in $E) { $p = $N[$ed.a]; $q = $N[$ed.b]; Draw-Line $p.x $p.y $q.x $q.y ($ed.s -eq 'd') }
foreach ($k in $N.Keys) { Draw-Node $N[$k] }
foreach ($ed in $E) {
  if (-not $ed.c) { continue }
  $p = $N[$ed.a]; $q = $N[$ed.b]
  $dx = $q.x - $p.x; $dy = $q.y - $p.y; $len = [math]::Sqrt($dx * $dx + $dy * $dy)
  $mx = $p.x + $dx * 0.45 - $dy / $len * 18; $my = $p.y + $dy * 0.45 + $dx / $len * 18
  $g.DrawString($ed.c, $fontC, $brush, [float]$mx, [float]$my, $sf)
}

# ---------------- Titulo, legenda e notas ----------------
$g.DrawString('Proposta de DER - Lacis2026: bibliotecas por cidade (notação MER de Chen / Elmasri-Navathe)', $fontT, $brush, 40, 30)

$lx = 2330; $ly = 110
$g.DrawRectangle($pen1, $lx, $ly, 440, 600)
$g.DrawString('Legenda', $fontB, $brush, [float]($lx + 15), [float]($ly + 10))
$items = @(
  @('entity', 'E', 'Entidade'), @('weak', 'E', 'Entidade fraca'),
  @('rel', 'R', 'Relacionamento'), @('idrel', 'R', 'Relac. de identificação'),
  @('attr', 'a', 'Atributo'), @('key', 'a', 'Atributo-chave'),
  @('partial', 'a', 'Atributo parcial'), @('multi', 'a', 'Atributo multivalorado'),
  @('derived', 'a', 'Atributo derivado'), @('line', '', 'Participação total')
)
$iy = $ly + 70
foreach ($it in $items) {
  if ($it[0] -eq 'line') { Draw-Line ($lx + 20) $iy ($lx + 110) $iy $true }
  else {
    $hh = if ($it[0] -in 'rel', 'idrel') { 44 } else { 36 }
    Draw-Node @{ n = $it[1]; t = $it[0]; x = [float]($lx + 65); y = [float]$iy; w = 90; h = $hh }
  }
  $g.DrawString($it[2], $fontS, $brush, [float]($lx + 130), [float]($iy - 11))
  $iy += 52
}

$g.DrawString('CIDADE mantém também url e as fotos (foto_perfil, foto_1, foto_2) do esquema atual.  tipo de BIBLIOTECA: pública municipal, escolar, comunitária, universitária, especializada.', $fontS, $brush, 40, 1975)
$g.DrawString('categoria de SERVICO: serviço ou ação cultural.  HORARIO: um registro por dia da semana.  INDICADOR_ANUAL: um registro por ano.  responsavel (ATUA_EM): indica o bibliotecário responsável.', $fontS, $brush, 40, 2005)

$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "Salvo em $Out"