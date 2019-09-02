using Ganss.XSS;
using SocialMedia.Models;
using SocialMedia.Models.ViewModels;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Infrastructure
{
    public static class Util
    {
        public static string Sanitize(string str)
        {
            var sanitizer = new HtmlSanitizer();
            return sanitizer.Sanitize(str);
        }

        public static byte[] ImageToByte(string name, bool getThumbnail)
        {
            string path;

            if (name == null)
            {
                name = "user.png";
                path = "wwwroot/ImgStatic/";
            }
            else path = getThumbnail ? "wwwroot/ImgThumb/" : "wwwroot/ImgFull/";

            System.Drawing.Image img = System.Drawing.Image.FromFile(path + name);
            byte[] b;
            using (MemoryStream mStream = new MemoryStream())
            {
                img.Save(mStream, img.RawFormat);
                b = mStream.ToArray();
                mStream.Close();
            }
            img.Dispose();
            return b;
        }

        public static RawImage GetRawImage(Models.Image image, bool getThumbnail) =>
            new RawImage
            {
                Id = image.ImageId,
                ProfileId = image.ProfileId,
                Raw = ImageToByte(image.Name, getThumbnail)
            };

        public static ProfileModel GetProfileModel(Profile profile, Models.Image image, string relationToUser) =>
            new ProfileModel
            {
                ProfileId = profile.ProfileId,
                Name = profile.FirstName + " " + profile.LastName,
                ProfilePicture = GetRawImage(image, true),
                RelationToUser = relationToUser
            };
    }
}
