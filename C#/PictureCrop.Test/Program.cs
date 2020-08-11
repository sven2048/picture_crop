using System.IO;
using PictureCrop.Core;

namespace PictureCrop.Test
{
    class Program
    {
        static void Main(string[] args)
        {
            System.Diagnostics.StackTrace st = new System.Diagnostics.StackTrace(true);
            System.Diagnostics.StackFrame sf = st.GetFrame(0);
            string path = sf.GetFileName();

            string sourceDir = Path.Combine(Path.GetDirectoryName(path), "SourcePicture");
            string outputDir = sourceDir.Replace("SourcePicture", "OutputPicture");

            if (Directory.Exists(outputDir))
            {
                Directory.Delete(outputDir, true);
            }

            Directory.CreateDirectory(outputDir);

            string[] files = Directory.GetFiles(sourceDir);

            foreach (var filePath in files)
            {
                string rawFileName = Path.GetFileNameWithoutExtension(filePath);

                string[] paramStrings = rawFileName.Split('@', '_');

                string fileName = paramStrings[0];

                int left = int.Parse(paramStrings[1]);
                int top = int.Parse(paramStrings[2]);
                int right = int.Parse(paramStrings[3]);
                int bottom = int.Parse(paramStrings[4]);
                int centerW = int.Parse(paramStrings[5]);
                int centerH = int.Parse(paramStrings[6]);

                string outputPath = Path.Combine(outputDir, fileName + Path.GetExtension(filePath));

                NineGrid.Crop(filePath, outputPath, left, top, right, bottom, centerW, centerH);
            }
        }
    }
}
