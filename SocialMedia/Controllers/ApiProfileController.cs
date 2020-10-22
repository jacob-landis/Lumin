using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Infrastructure;
using SocialMedia.Models;
using SocialMedia.Models.ViewModels;

namespace SocialMedia.Controllers
{
    /*
        Handles profile confirmation, editing and retrieval.
        Profile picture and bio can be changed.
    */
    [Route("api/[controller]")]
    public class ApiProfileController : Controller
    {
        private IProfileRepository profileRepo;
        private IImageRepository imageRepo;
        private IFriendRepository friendRepo;
        private CurrentProfile currentProfile;

        public ApiProfileController(
            IProfileRepository profileRepo,
            IImageRepository imageRepo,
            IFriendRepository friendRepo,
            CurrentProfile currentProfile)
        {
            this.profileRepo = profileRepo;
            this.imageRepo = imageRepo;
            this.friendRepo = friendRepo;
            this.currentProfile = currentProfile;
        }

        //-----------------------------------------ROUTING---------------------------------------------//

        /*
            Confirms that the session has not timed out.
        */
        [HttpGet("confirmuser")]
        public bool ConfirmUser() => currentProfile.profile != null; // Is the current profile not null.

        /*
            Returns a prepped profile by ProfileID.
        */
        [HttpPost("fullProfile/{id}")]
        public FullProfileModel GetFullProfile(int id)
        {
            // Get profile by ProfileID.
            Profile profile = profileRepo.ById(id);

            // Get profile picture image by ImageID.
            Image image = imageRepo.ById(profile.ProfilePicture);

            // Prep profile.
            return new FullProfileModel
            {
                // Details from profile.
                ProfileId = profile.ProfileId,
                Name = profile.FirstName + " " + profile.LastName, // Combine first and last name.
                Bio = profile.Bio,

                // Prep profile picture.
                ProfilePicture = Util.GetRawImage(image, false),

                // Get data for relationship button.
                RelationToUser = friendRepo.RelationToUser(currentProfile.id, id)
            };
        }

        /*
            Not used... XXX
        */
        [HttpGet("{id}")]
        public ProfileModel Get(int id)
        {
            Profile profile = profileRepo.ById(id);
            Image image = imageRepo.ById(profile.ProfilePicture);
            return Util.GetProfileModel(profile, image, friendRepo.RelationToUser(currentProfile.id, id));
        }

        /*
            Updates the current user's bio with the provided string.
        */
        [HttpPost("updatebio")]
        public void UpdateBio([FromBody] StringModel bio)
        {
            // If the provided bio does not exceed length limit, update bio.
            if (bio.str.Length <= 250)
            {
                // Get handle on current user's profile. XXX should use currentProfile.profile.ProfileId so it's the most recent version.
                Profile profile = currentProfile.profile;

                // Set bio to sanitized provided bio.
                profile.Bio = Util.Sanitize(bio.str);

                // Commit profile to database.
                profileRepo.SaveProfile(profile);
            }
        }

        /*
            Update profile picture of the current user's profile.
        */
        [HttpPost("updateprofilepicture/{id}")]
        public RawImage SetProfilePicture(int id = 0)
        {
            // If the current user owns the image with the provided ImageID, set it as their profile picture.
            if (id == 0 || imageRepo.ById(id).ProfileId == currentProfile.id)
            {
                // Get handle on current profile. XXX Get most recent version like above.
                Profile profile = currentProfile.profile;

                // Change profile picture id.
                profile.ProfilePicture = id;

                // Commit profile to database.
                profileRepo.SaveProfile(profile);

                // Return new profile picture to user. XXX they should be able to use the local version to swap out.
                return Util.GetRawImage(imageRepo.ById(id), false);
            }

            // If the user does not own that image or that image does not exist, return null.
            return null;
        }

        /*
            Used when initializing home page.
        */
        [HttpGet("currentprofile")]
        public Profile GetCurrentProfile() => currentProfile.profile == null ? null :

            // Returns basic data with no profile picture attached, only the images id.
            new Profile
            {
                ProfileId = currentProfile.profile.ProfileId,
                FirstName = currentProfile.profile.FirstName,
                LastName = currentProfile.profile.LastName,
                Bio = currentProfile.profile.Bio,
                ProfilePicture = currentProfile.profile.ProfilePicture
            };
    }
}