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
    /*
        Shortcut methods for controller classes; logic that would otherwise be repeated.
    */
    public static class Util
    {
        /*
            Sanitizes string data for security. 
        */
        public static string Sanitize(string str)
        {
            // Instantiate a new HtmlSanitizer.
            var sanitizer = new HtmlSanitizer();

            // Sanitize the provided string and return it.
            return sanitizer.Sanitize(str);
        }

        /*
             Converts a image in file storage to a byte array so it can be passed to the client.
             Includes option parameter for image size.
        */
        public static byte[] ImageToByte(string name, bool getThumbnail)
        {
            // Declare path variable.
            string path;

            // If no name was provided, retrieve the default profile picture.
            if (name == null)
            {
                // Name of the default profile picture.
                name = "user.png";

                // Folder for non-profile images.
                path = "wwwroot/ImgStatic/";
            }

            // Else, select size.
            else path = getThumbnail ? "wwwroot/ImgThumb/" : "wwwroot/ImgFull/";

            // Retrieve image from the file system.
            System.Drawing.Image img = System.Drawing.Image.FromFile(path + name);

            // Declare byte array.
            byte[] b;

            // Open memory stream.
            using (MemoryStream mStream = new MemoryStream())
            {
                // Put the image in the memory stream.
                img.Save(mStream, img.RawFormat);

                // Feed image from stream into the byte array.
                b = mStream.ToArray();

                // Close the memory stream.
                mStream.Close();
            }

            // Release the image file from the RAM.
            img.Dispose();

            // Return the byte array image.
            return b;
        }

        /*
             Returns image as byte array with ImageID and owner ProfileID attached to it.
        */
        public static RawImage GetRawImage(Models.Image image, bool getThumbnail) =>

            // Fill new RawImage with details from provided image record and have byte array of image retrieved.
            new RawImage
            {
                Id = image.ImageId,
                ProfileId = image.ProfileId,
                Raw = ImageToByte(image.Name, getThumbnail)
            };

        /*
             Puts together an object with all relevent information in it about a profile.
             The ProfileModel is used by the client to build a profile card.
        */
        public static ProfileModel GetProfileModel(Profile profile, Models.Image image, string relationToUser) =>

            // Fill new ProfileModel with provided data and process some of it.
            new ProfileModel
            {
                ProfileId = profile.ProfileId,

                // Combine first and last name. Client never needs to distinguish the two.
                Name = profile.FirstName + " " + profile.LastName,

                // Prep profile picture for transmission.
                ProfilePicture = GetRawImage(image, true),
                RelationToUser = relationToUser
            };
    }
}
