using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class FullProfileModel
    {
        public int ProfileId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Bio { get; set; }

        // Prepped image.
        public RawImage ProfilePicture { get; set; }

        // Simple string. Used in switch case by client. (me, friend, userRequested, requestedUser, or unrelated)
        public string RelationToUser { get; set; }
    }
}
