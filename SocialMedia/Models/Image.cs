using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class Image
    {
        public int ImageId { get; set; }

        // File name of image in file system.
        public string Name { get; set; }

        // Datetime that the image was uploaded.
        public DateTime DateTime { get; set; }

        public int Height { get; set; }

        public int Width { get; set; }

        public int PrivacyLevel { get; set; }

        // ASSOCIATIONS

        // The owner of the image.
        public int? ProfileId { get; set; }
    }
}
