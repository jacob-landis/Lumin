using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class ProfileModel
    {
        public int ProfileId { get; set; }

        // First and last name of the profile combined.
        public string Name { get; set; }

        // Prepped thumbnail version of profile picture.
        public RawImage ProfilePicture { get; set; }

        // Used to fill the relationship card on client side.
        public string RelationToUser { get; set; }
    }
}
