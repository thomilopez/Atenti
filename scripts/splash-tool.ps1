Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies @("System.dll", "System.Drawing.dll", "System.Core.dll") -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text;

public static class SplashTool
{
    public static string Process(string src, string dst)
    {
        Bitmap bmp = new Bitmap(src);
        int w = bmp.Width, h = bmp.Height;
        BitmapData data = bmp.LockBits(new Rectangle(0, 0, w, h),
            ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int stride = data.Stride;
        byte[] px = new byte[stride * h];
        Marshal.Copy(data.Scan0, px, 0, px.Length);

        // ---- 1. Buscar el spinner en la zona inferior-centro ----
        int sx0 = (int)(w * 0.30), sx1 = (int)(w * 0.70);
        int sy0 = (int)(h * 0.62), sy1 = (int)(h * 0.84);

        int minX = int.MaxValue, maxX = int.MinValue;
        int minY = int.MaxValue, maxY = int.MinValue;
        List<double> greenAngles = new List<double>();

        for (int y = sy0; y < sy1; y++)
        {
            for (int x = sx0; x < sx1; x++)
            {
                int i = y * stride + x * 4;
                byte b = px[i], g = px[i + 1], r = px[i + 2];
                bool isGray = Math.Abs(r - 96) < 35 && Math.Abs(g - 115) < 35 && Math.Abs(b - 157) < 45;
                bool isGreen = r < 90 && Math.Abs(g - 229) < 55 && Math.Abs(b - 160) < 55;
                if (isGray || isGreen)
                {
                    if (x < minX) minX = x; if (x > maxX) maxX = x;
                    if (y < minY) minY = y; if (y > maxY) maxY = y;
                }
                if (isGreen)
                {
                    // guardamos angulos relativos al centro aproximado para medir el arco
                    greenAngles.Add(x); // placeholder, se recalcula despues
                }
            }
        }

        if (minX == int.MaxValue)
        {
            bmp.UnlockBits(data);
            bmp.Dispose();
            return "{\"error\":\"spinner no encontrado\"}";
        }

        double cx = (minX + maxX) / 2.0;
        double cy = (minY + maxY) / 2.0;
        double outerR = (maxX - minX + 1) / 2.0;

        // ---- 2. Grosor del anillo: primer tramo continuo en la fila central ----
        int row = (int)Math.Round(cy);
        int stroke = 0;
        bool started = false;
        for (int x = minX; x <= maxX; x++)
        {
            int i = row * stride + x * 4;
            byte b = px[i], g = px[i + 1], r = px[i + 2];
            bool isRing = (Math.Abs(r - 96) < 45 && Math.Abs(g - 115) < 45 && Math.Abs(b - 157) < 55)
                       || (r < 90 && Math.Abs(g - 229) < 55 && Math.Abs(b - 160) < 55);
            if (isRing) { stroke++; started = true; }
            else if (started) break;
        }

        // ---- 3. Angulo del arco verde (recolectar angulos reales) ----
        greenAngles.Clear();
        for (int y = minY - 2; y <= maxY + 2; y++)
        {
            for (int x = minX - 2; x <= maxX + 2; x++)
            {
                if (x < 0 || y < 0 || x >= w || y >= h) continue;
                int i = y * stride + x * 4;
                byte b = px[i], g = px[i + 1], r = px[i + 2];
                bool isGreen = r < 90 && Math.Abs(g - 229) < 55 && Math.Abs(b - 160) < 55;
                if (isGreen)
                {
                    double ang = Math.Atan2(y - cy, x - cx) * 180.0 / Math.PI;
                    greenAngles.Add(ang);
                }
            }
        }
        greenAngles.Sort();
        double arcDeg = 0;
        if (greenAngles.Count > 10)
        {
            double maxGap = 0;
            for (int k = 1; k < greenAngles.Count; k++)
            {
                double gap = greenAngles[k] - greenAngles[k - 1];
                if (gap > maxGap) maxGap = gap;
            }
            double wrapGap = (greenAngles[0] + 360.0) - greenAngles[greenAngles.Count - 1];
            if (wrapGap > maxGap) maxGap = wrapGap;
            arcDeg = 360.0 - maxGap;
        }
        double arcRatio = Math.Round(arcDeg / 360.0, 3);

        // ---- 4. Inpainting: rellenar la region del spinner con el fondo (Shepard 4 bordes) ----
        int m = 10;
        int rx0 = Math.Max(0, minX - m), rx1 = Math.Min(w - 1, maxX + m);
        int ry0 = Math.Max(0, minY - m), ry1 = Math.Min(h - 1, maxY + m);

        for (int y = ry0 + 1; y < ry1; y++)
        {
            for (int x = rx0 + 1; x < rx1; x++)
            {
                double d1 = x - rx0, d2 = rx1 - x, d3 = y - ry0, d4 = ry1 - y;
                double wL = 1.0 / d1, wR = 1.0 / d2, wT = 1.0 / d3, wB = 1.0 / d4;
                double total = wL + wR + wT + wB;

                int top = (ry0 * stride) + x * 4;
                int bot = (ry1 * stride) + x * 4;
                int lef = (y * stride) + rx0 * 4;
                int rig = (y * stride) + rx1 * 4;
                int cur = (y * stride) + x * 4;

                for (int c = 0; c < 4; c++)
                {
                    double val = (px[top + c] * wT + px[bot + c] * wB
                                + px[lef + c] * wL + px[rig + c] * wR) / total;
                    px[cur + c] = (byte)Math.Max(0, Math.Min(255, val));
                }
            }
        }

        Marshal.Copy(px, 0, data.Scan0, px.Length);
        bmp.UnlockBits(data);
        bmp.Save(dst, ImageFormat.Png);
        bmp.Dispose();

        StringBuilder sb = new StringBuilder();
        sb.Append("{");
        sb.AppendFormat("\"imageWidth\":{0},\"imageHeight\":{1},", w, h);
        sb.AppendFormat("\"bbox\":[{0},{1},{2},{3}],", minX, minY, maxX, maxY);
        sb.AppendFormat("\"cx\":{0},\"cy\":{1},", Math.Round(cx, 1), Math.Round(cy, 1));
        sb.AppendFormat("\"outerR\":{0},", Math.Round(outerR, 1));
        sb.AppendFormat("\"stroke\":{0},", stroke);
        sb.AppendFormat("\"arcRatio\":{0},", arcRatio);
        sb.AppendFormat("\"greenPixels\":{0},", greenAngles.Count);
        sb.AppendFormat("\"inpaintRegion\":[{0},{1},{2},{3}]", rx0, ry0, rx1, ry1);
        sb.Append("}");
        return sb.ToString();
    }
}
"@

$src = "C:\desarrollo-splas-screen-atenti\Pantalla de inicio Atenti en azul marino.png"
$dst = "C:\desarrollo-splas-screen-atenti\assets\splash-atenti.png"
[SplashTool]::Process($src, $dst)
