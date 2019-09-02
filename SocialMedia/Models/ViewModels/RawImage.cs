using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class RawImage
    {
        public int Id { get; set; }
        public int? ProfileId { get; set; }
        public byte[] Raw { get; set; }
    }
}
