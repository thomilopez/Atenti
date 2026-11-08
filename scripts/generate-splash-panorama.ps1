# Genera assets/splash-atenti-wide.jpg (16:9) a partir de assets/splash-atenti.jpg:
#   1. El arte original queda centrado a altura completa, escala 1:1 (sin re-escalar).
#   2. Los costados continuan el degradado navy del borde: por CADA FILA se estira
#      el color del pIxel de borde (costura exacta pIxel a pIxel en la union).
#   3. Las olas verdes que sangran por el borde izquierdo (y ~195-290) y por el
#      derecho (y ~1270-1412) se continuan en diagonal: se replica la franja del
#      borde con desplazamiento de fila (pendiente MEDIDA en el propio borde),
#      de modo que la onda sigue su camino fuera del lienzo sin cortes.
#
# Mismo patron que scripts/splash-tool.ps1: C# via LockBits, cero dependencias.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/generate-splash-panorama.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not ('PanoramaTool' -as [type])) {
    Add-Type -ReferencedAssemblies @('System.dll', 'System.Drawing.dll', 'System.Core.dll') -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text;

public static class PanoramaTool
{
    // Extension por lado: 1016 px -> lienzo 2973x1672 (16:9, error 0.02%).
    const int EXT = 1016;
    const int QUALITY = 95;
    const int SLOPE_COLUMN_GAP = 40;
    const double FALLBACK_SLOPE = 0.75;

    // Verde de ola sobre fondo navy. El azul marino siempre tiene B-G alto
    // (>= ~50 en todos los pIxeles reales); cualquier verde - incluso las
    // mezclas anti-aliasing tenues con R alto - baja de 45. Con la regla
    // "G>55 && G>=B" las filas de transicion pasaban por limpias y la
    // interpolacion producia bandas teal (p. ej. G=(53+96)/2 = 74).
    static bool IsWave(byte r, byte g, byte b)
    {
        return (b - g) < 45;
    }

    static byte[] PixelAt(byte[] S, int stride, int x, int y)
    {
        int i = y * stride + x * 4;
        return new byte[] { S[i], S[i + 1], S[i + 2], 255 }; // BGRA
    }

    // Media de las filas con ola en una columna. NaN si la ola no esta.
    static double BandMean(byte[] S, int stride, int x, int h)
    {
        double sum = 0;
        int n = 0;
        for (int y = 0; y < h; y++)
        {
            byte[] p = PixelAt(S, stride, x, y);
            if (IsWave(p[2], p[1], p[0])) { sum += y; n++; }
        }
        if (n < 8) return double.NaN;
        return sum / n;
    }

    static void BandRange(byte[] S, int stride, int x, int h, out int first, out int last, out int n)
    {
        first = -1; last = -1; n = 0;
        for (int y = 0; y < h; y++)
        {
            byte[] p = PixelAt(S, stride, x, y);
            if (IsWave(p[2], p[1], p[0]))
            {
                if (first < 0) first = y;
                last = y;
                n++;
            }
        }
    }

    static byte[] Lerp(byte[] a, byte[] b, double t)
    {
        return new byte[] {
            (byte)(a[0] + (b[0] - a[0]) * t),
            (byte)(a[1] + (b[1] - a[1]) * t),
            (byte)(a[2] + (b[2] - a[2]) * t),
            255
        };
    }

    // Promedio de las filas [y0..y1] que NO son de ola. null si no hay ninguna.
    static byte[] AvgRows(byte[] S, int stride, int x, int y0, int y1, bool[] wave)
    {
        int sr = 0, sg = 0, sb = 0, n = 0;
        for (int y = y0; y <= y1; y++)
        {
            if (y < 0 || y >= wave.Length || wave[y]) continue;
            byte[] p = PixelAt(S, stride, x, y);
            sr += p[2]; sg += p[1]; sb += p[0]; n++;
        }
        if (n == 0) return null;
        return new byte[] { (byte)(sb / n), (byte)(sg / n), (byte)(sr / n), 255 };
    }

    // Color de fondo por fila: el color crudo del borde, y en cada franja de
    // ola se reconstruye el navy que habria debajo interpolando entre
    // ventanas limpias EXTERIORES. Las filas de transicion anti-aliasing no
    // sirven de ancla: el JPEG las oscurece (p. ej. B=74 donde el navy real
    // es B~84) y dejan una banda mas oscura. Fundido de 8 filas en los
    // bordes de la franja para que no aparezca ningun escalon.
    static byte[][] BuildBg(byte[] S, int stride, int x, int h)
    {
        bool[] wave = new bool[h];
        byte[][] bg = new byte[h][];
        for (int y = 0; y < h; y++)
        {
            byte[] p = PixelAt(S, stride, x, y);
            wave[y] = IsWave(p[2], p[1], p[0]);
            bg[y] = p;
        }

        const int PAD = 8;
        const int WIN = 16;
        int pos = 0;
        while (pos < h)
        {
            if (!wave[pos]) { pos++; continue; }
            int f = pos;
            while (pos < h && wave[pos]) pos++;
            int l = pos - 1;

            int y0 = Math.Max(0, f - PAD);
            int y1 = Math.Min(h - 1, l + PAD);
            byte[] pa = AvgRows(S, stride, x, y0 - WIN, y0 - 1, wave);
            byte[] pb = AvgRows(S, stride, x, y1 + 1, y1 + WIN, wave);
            if (pa == null && pb == null) continue;
            if (pa == null) pa = pb;
            if (pb == null) pb = pa;

            for (int yy = y0; yy <= y1; yy++)
            {
                double t = y1 == y0 ? 0 : (double)(yy - y0) / (y1 - y0);
                byte[] interp = Lerp(pa, pb, t);
                double w;
                if (yy < f) w = (double)(yy - y0) / Math.Max(1, f - y0);
                else if (yy > l) w = (double)(y1 - yy) / Math.Max(1, y1 - l);
                else w = 1;
                bg[yy] = Lerp(bg[yy], interp, w);
            }
        }
        return bg;
    }

    // Muestrea la columna de borde en una fila fraccionaria (interpola entre
    // filas vecinas) para que la diagonal de la cinta no quede escalonada.
    static byte[] SampleEdge(byte[] S, int stride, int x, double ys, int h)
    {
        if (ys < 0) ys = 0;
        if (ys > h - 1) ys = h - 1;
        int y0 = (int)ys;
        int y1 = y0 + 1 < h ? y0 + 1 : y0;
        double f = ys - y0;
        int i0 = y0 * stride + x * 4;
        int i1 = y1 * stride + x * 4;
        return new byte[] {
            (byte)(S[i0]     + (S[i1]     - S[i0])     * f),
            (byte)(S[i0 + 1] + (S[i1 + 1] - S[i0 + 1]) * f),
            (byte)(S[i0 + 2] + (S[i1 + 2] - S[i0 + 2]) * f),
            255
        };
    }

    static void WritePx(byte[] O, int stride, int x, int y, byte[] p)
    {
        int i = y * stride + x * 4;
        O[i] = p[0];
        O[i + 1] = p[1];
        O[i + 2] = p[2];
        O[i + 3] = 255;
    }

    public static string Process(string src, string dst)
    {
        Bitmap bmp = new Bitmap(src);
        int w = bmp.Width, h = bmp.Height;
        BitmapData sd = bmp.LockBits(new Rectangle(0, 0, w, h),
            ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        byte[] S = new byte[sd.Stride * h];
        Marshal.Copy(sd.Scan0, S, 0, S.Length);
        int sStride = sd.Stride;
        bmp.UnlockBits(sd);
        bmp.Dispose();

        int W = w + EXT * 2;
        int H = h;

        // ---- Pendientes de las olas, medidas en el propio borde ----
        double mL0 = BandMean(S, sStride, 0, h);
        double mL1 = BandMean(S, sStride, SLOPE_COLUMN_GAP, h);
        double mR0 = BandMean(S, sStride, w - 1, h);
        double mR1 = BandMean(S, sStride, w - 1 - SLOPE_COLUMN_GAP, h);

        double sL = (mL0 - mL1) / SLOPE_COLUMN_GAP;   // ola izq.: sube al ir a la derecha
        double sR = (mR1 - mR0) / SLOPE_COLUMN_GAP;   // ola der.: sube al ir a la derecha
        string sLsrc = "medida", sRsrc = "medida";
        if (double.IsNaN(sL) || sL <= 0.05 || sL > 2.5) { sL = FALLBACK_SLOPE; sLsrc = "fallback"; }
        if (double.IsNaN(sR) || sR <= 0.05 || sR > 2.5) { sR = FALLBACK_SLOPE; sRsrc = "fallback"; }

        byte[][] bgL = BuildBg(S, sStride, 0, h);
        byte[][] bgR = BuildBg(S, sStride, w - 1, h);

        // ---- Lienzo de salida ----
        Bitmap outBmp = new Bitmap(W, H, PixelFormat.Format32bppArgb);
        BitmapData od = outBmp.LockBits(new Rectangle(0, 0, W, H),
            ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        byte[] O = new byte[od.Stride * H];
        int oStride = od.Stride;

        // 1) Arte original centrado.
        for (int y = 0; y < h; y++)
        {
            Array.Copy(S, y * sStride, O, y * oStride + EXT * 4, w * 4);
        }

        // 2) Costado izquierdo: fondo por fila + cinta de ola con cizalla.
        for (int d = 1; d <= EXT; d++)
        {
            int x = EXT - d;
            for (int y = 0; y < H; y++)
            {
                byte[] wp = SampleEdge(S, sStride, 0, y - sL * d, h);
                if (IsWave(wp[2], wp[1], wp[0])) WritePx(O, oStride, x, y, wp);
                else WritePx(O, oStride, x, y, bgL[y]);
            }
        }

        // 3) Costado derecho: idem, cizalla en sentido contrario (la ola sube).
        for (int d = 1; d <= EXT; d++)
        {
            int x = EXT + w + d - 1;
            for (int y = 0; y < H; y++)
            {
                byte[] wp = SampleEdge(S, sStride, w - 1, y + sR * d, h);
                if (IsWave(wp[2], wp[1], wp[0])) WritePx(O, oStride, x, y, wp);
                else WritePx(O, oStride, x, y, bgR[y]);
            }
        }

        Marshal.Copy(O, 0, od.Scan0, O.Length);
        outBmp.UnlockBits(od);

        // 4) JPEG.
        ImageCodecInfo jpeg = null;
        foreach (ImageCodecInfo c in ImageCodecInfo.GetImageEncoders())
        {
            if (c.FormatID == ImageFormat.Jpeg.Guid) { jpeg = c; break; }
        }
        EncoderParameters ep = new EncoderParameters(1);
        ep.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, (long)QUALITY);
        outBmp.Save(dst, jpeg, ep);
        outBmp.Dispose();

        // 5) Diagnostico.
        int lf, ll, ln, rf, rl, rn;
        BandRange(S, sStride, 0, h, out lf, out ll, out ln);
        BandRange(S, sStride, w - 1, h, out rf, out rl, out rn);
        StringBuilder sb = new StringBuilder();
        sb.Append("{");
        sb.Append("\"src\":\"" + w + "x" + h + "\",");
        sb.Append("\"dst\":\"" + W + "x" + H + "\",");
        sb.Append("\"aspect\":" + ((double)W / H).ToString("0.####", System.Globalization.CultureInfo.InvariantCulture) + ",");
        sb.Append("\"slopeLeft\":" + sL.ToString("0.###", System.Globalization.CultureInfo.InvariantCulture) + ",");
        sb.Append("\"slopeLeftSource\":\"" + sLsrc + "\",");
        sb.Append("\"slopeRight\":" + sR.ToString("0.###", System.Globalization.CultureInfo.InvariantCulture) + ",");
        sb.Append("\"slopeRightSource\":\"" + sRsrc + "\",");
        sb.Append("\"leftBand\":[" + lf + "," + ll + "],");
        sb.Append("\"rightBand\":[" + rf + "," + rl + "]");
        sb.Append("}");
        return sb.ToString();
    }
}
'@
}

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'assets\splash-atenti.jpg'
$dst = Join-Path $root 'assets\splash-atenti-wide.jpg'

if (-not (Test-Path $src)) {
    Write-Error "No existe $src"
    exit 1
}

$json = [PanoramaTool]::Process($src, $dst)
Write-Output $json
Write-Output "OK -> $dst"
