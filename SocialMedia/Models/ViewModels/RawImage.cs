using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class RawImage
    {
        // Image record Id.
        public int Id { get; set; }

        // ProfileID of owner.
        public int? ProfileId { get; set; }

        // The image in byte array form so it can be sent to client. XXX rename to ByteArrImg
        public byte[] Raw { get; set; }
    }
}
