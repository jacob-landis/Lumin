using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class ProfileModel
    {
        public int ProfileId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }

        // Prepped thumbnail version of profile picture.
        public RawImage ProfilePicture { get; set; }

        // Used to fill the relationship card on client side.
        public string RelationToUser { get; set; }
    }
}
