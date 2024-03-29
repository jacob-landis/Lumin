﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class RawImage
    {
        // Image record Id.
        public int ImageId { get; set; }

        // ProfileID of owner.
        public int? ProfileId { get; set; }

        // Datetime that the image was uploaded.
        public DateTime DateTime { get; set; }

        public int PrivacyLevel { get; set; }

        // Dimensions in pixels
        public int Height { get; set; }
        public int Width { get; set; }

        // The image in byte array form so it can be sent to client.
        public byte[] ImageAsByteArray { get; set; }
    }
}
