using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class FullProfileModel
    {
        public int ProfileId { get; set; }
        public string Name { get; set; }
        public string Bio { get; set; }
        public RawImage ProfilePicture { get; set; }
        public string RelationToUser { get; set; }
    }
}
