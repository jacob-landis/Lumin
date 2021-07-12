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

        public int? BlockerProfileId { get; set; }

        // Used to fill the relationship card on client side.
        public string RelationToUser { get; set; }

        // Used in conjunction with privacy levels to determine accessibility.
        // RELATIONSHIP TIERS (0: Unrelated, 1: Mutual Friend, 2: Friend, 3: Me)
        public int RelationshipTier { get; set; }

        // PRIVACY LEVELS (0: All, 1: Mutual Friends, 2: Friends, 3: None)
        public int ProfilePicturePrivacyLevel { get; set; }
        public int ProfileBioPrivacyLevel { get; set; }
        public int ProfileImagesPrivacyLevel { get; set; }
        public int ProfileFriendsPrivacyLevel { get; set; }
        public int ProfilePostsPrivacyLevel { get; set; }

        public string ProfileColor { get; set; }
    }
}
