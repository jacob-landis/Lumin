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

        [HttpGet("confirmuser")]
        public bool ConfirmUser() => currentProfile.profile != null;

        [HttpPost("fullProfile/{id}")]
        public FullProfileModel GetFullProfile(int id)
        {
            Profile profile = profileRepo.ById(id);

            Image image = imageRepo.ById(profile.ProfilePicture);

            return new FullProfileModel
            {
                ProfileId = profile.ProfileId,
                Name = profile.FirstName + " " + profile.LastName,
                Bio = profile.Bio,
                ProfilePicture = Util.GetRawImage(image, false),
                RelationToUser = friendRepo.RelationToUser(currentProfile.id, id)
            };
        }

        [HttpGet("{id}")]
        public ProfileModel Get(int id)
        {
            Profile profile = profileRepo.ById(id);
            Image image = imageRepo.ById(profile.ProfilePicture);
            return Util.GetProfileModel(profile, image, friendRepo.RelationToUser(currentProfile.id, id));
        }

        [HttpPost("updatebio")]
        public void UpdateBio([FromBody] StringModel bio)
        {
            if (bio.str.Length <= 250)
            {
                Profile profile = currentProfile.profile;
                profile.Bio = Util.Sanitize(bio.str);
                profileRepo.SaveProfile(profile);
            }
        }

        [HttpPost("updateprofilepicture/{id}")]
        public RawImage SetProfilePicture(int id = 0)
        {
            if (id == 0 || imageRepo.ById(id).ProfileId == currentProfile.id)
            {
                Profile profile = currentProfile.profile;
                profile.ProfilePicture = id;
                profileRepo.SaveProfile(profile);
                return Util.GetRawImage(imageRepo.ById(id), false);
            }
            return null;
        }

        [HttpGet("currentprofile")]
        public Profile GetCurrentProfile() => currentProfile.profile == null ? null :
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