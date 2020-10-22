using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    /*
        The obj recieved from client when a user uploads an image. 
    */
    public class RawImageUpload
    {
        // File name of image.
        public string Name { get; set; }

        // Image file as string.
        public string Raw { get; set; }
    }
}
