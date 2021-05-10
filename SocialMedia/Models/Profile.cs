using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class Profile
    {
        public int ProfileId { get; set; }

        // Not a password, a link to an IdentityUser.
        // 1 - 50 char length.
        public string Password { get; set; } 

        // 1 - 30 char length.
        public string FirstName { get; set; }

        // 1 - 30 char length.
        public string LastName { get; set; }

        // 0 - 250 char length.
        public string Bio { get; set; }

        // Date/time of account creation.
        public DateTime DateTime { get; set; }

        // PRIVACY LEVELS (0: All, 1: Mutual Friends, 2: Friends, 3: None)
        public int ProfilePicturePrivacyLevel { get; set; }
        public int ProfileBioPrivacyLevel { get; set; }
        public int ProfileImagesPrivacyLevel { get; set; }
        public int ProfileFriendsPrivacyLevel { get; set; }
        public int ProfilePostsPrivacyLevel { get; set; }
        
        public string ProfileColor { get; set; }

        // ImageID of profile picture. 0 if default.
        public int ProfilePicture { get; set; }
    }
}
