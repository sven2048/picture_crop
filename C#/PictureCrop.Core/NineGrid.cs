using System;
using System.Drawing;
using System.Drawing.Drawing2D;

namespace PictureCrop.Core
{
    public static class NineGrid
    {
        /// <summary>
        /// 九切图片
        /// </summary>
        /// <param name="sourcePath">图片原始路径</param>
        /// <param name="destPath">切图保存目标路径</param>
        /// <param name="left">左上角保留宽度</param>
        /// <param name="top">左上角保留高度</param>
        /// <param name="right">右下角保留宽度</param>
        /// <param name="bottom">右下角保留高度</param>
        /// <param name="centerW">中心区域保留宽度</param>
        /// <param name="centerH">中心区域保留高度</param>
        public static void Crop(string sourcePath, string destPath, int left, int top, int right, int bottom, int centerW, int centerH)
        {
            Bitmap source = null;
            Bitmap dest = null;
            Graphics g = null;
            try
            {
                source = new Bitmap(sourcePath);
                int rawWidth = source.Width;
                int rawHeight = source.Height;
                dest = new Bitmap(left + right + centerW, top + bottom + centerH, source.PixelFormat);

                g = Graphics.FromImage(dest);
                g.InterpolationMode = InterpolationMode.NearestNeighbor;

                //左上
                g.DrawImage(source, new Rectangle(0, 0, left, top), new Rectangle(0, 0, left, top), GraphicsUnit.Pixel);
                //左下
                g.DrawImage(source, new Rectangle(0, top + centerH, left, bottom), new Rectangle(0, rawHeight - bottom, left, bottom), GraphicsUnit.Pixel);
                //右上
                g.DrawImage(source, new Rectangle(left + centerW, 0, right, top), new Rectangle(rawWidth - right, 0, right, top), GraphicsUnit.Pixel);
                //右下
                g.DrawImage(source, new Rectangle(left + centerW, top + centerH, right, bottom), new Rectangle(rawWidth - right, rawHeight - bottom, right, bottom), GraphicsUnit.Pixel);

                //上
                g.DrawImage(source, new Rectangle(left, 0, centerW, top), new Rectangle(left, 0, rawWidth - left - right, top), GraphicsUnit.Pixel);
                //下
                g.DrawImage(source, new Rectangle(left, top + centerH, centerW, bottom), new Rectangle(left, rawHeight - bottom, rawWidth - left - right, bottom), GraphicsUnit.Pixel);
                //左
                g.DrawImage(source, new Rectangle(0, top, left, centerH), new Rectangle(0, top, left, rawHeight - top - bottom), GraphicsUnit.Pixel);
                //右
                g.DrawImage(source, new Rectangle(left + centerW, top, right, centerH), new Rectangle(rawWidth - right, top, right, rawHeight - top - bottom), GraphicsUnit.Pixel);

                //中
                g.DrawImage(source, new Rectangle(left, top, centerW, centerH), new Rectangle(left, top, rawWidth - right - left, rawHeight - top - bottom), GraphicsUnit.Pixel);

                dest.Save(destPath, source.RawFormat);
            }
            catch (Exception e)
            {
                Console.WriteLine("PictureCrop NiceGrid Crop Error " + e);
            }
            finally
            {
                g?.Dispose();
                dest?.Dispose();
                source?.Dispose();
            }
        }
    }

}
