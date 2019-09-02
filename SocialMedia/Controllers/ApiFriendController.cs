using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Infrastructure;
using SocialMedia.Models;
using SocialMedia.Models.ViewModels;

namespace SocialMedia.Controllers
{
    [Route("api/[controller]")]
    public class ApiFriendController : Controller
    {
        private IProfileRepository profileRepo;
        private IFriendRepository friendRepo;
        private IImageRepository imageRepo;
        private CurrentProfile currentProfile;

        public ApiFriendController(
            IProfileRepository profileRepo,
            IFriendRepository friendRepo,
            IImageRepository imageRepo,
            CurrentProfile currentProfile)
        {
            this.profileRepo = profileRepo;
            this.friendRepo = friendRepo;
            this.imageRepo = imageRepo;
            this.currentProfile = currentProfile;
        }

        //-----------------------------------------ROUTING---------------------------------------------//

        [HttpPost("friends/{id}")]
        public List<ProfileModel> GetFriends(int id, [FromBody] StringModel search)
        {
            if (id != 0) return ProfileFriends(id);

            if (search.str != "NULL") return Search(search.str);
            
            return FriendRequests();
        }

        [HttpPost("deletefriend/{id}")]
        public void DeleteFriend(int id)
        {
            Friend friend = friendRepo.Friends.First(f => f.ToId == id || f.FromId == id);
            friendRepo.DeleteFriend(friend);
        }

        [HttpPost("createrequest/{id}")]
        public void CreateRequest(int id)
        {
            Friend friend = new Friend
            {
                Accepted = false,
                ToId = id,
                DateSent = DateTime.UtcNow,
                FromId = currentProfile.id
            };
            friendRepo.SaveFriend(friend);
        }

        [HttpPost("acceptrequest/{id}")]
        public void AcceptRequest(int id)
        {
            Friend friend = friendRepo.Friends.First(f => f.FromId == id && f.ToId == currentProfile.id);
            friend.DateAccpted = DateTime.UtcNow;
            friend.Accepted = true;
            friendRepo.SaveFriend(friend);
        }

        //-----------------------------------------UTIL---------------------------------------------//

        public List<ProfileModel> Search(string search) // terms.str
        {
            /* 
            split terms into array of words.
            for each word, check each profiles first name and then last name for a match.
            if there is a match, add that profile to a list and give it a point for each match.
            return the list in order of most points.
            */

            if (search == "") // return null instead?
            {
                List<ProfileModel> defaultResults = new List<ProfileModel>();
                foreach (Profile p in profileRepo.ExceptCurrentProfile)
                {
                    defaultResults.Add(GetProfileModel(p.ProfileId));
                }
                return defaultResults;
            }

            List<KeyValuePair<int, int>> matches = new List<KeyValuePair<int, int>>();
            string[] words = search.Split(' ');

            int exactMatchWorth = 3;
            foreach (Profile p in profileRepo.ExceptCurrentProfile)
            {
                string f = p.FirstName.ToLower();
                string l = p.LastName.ToLower();

                int points = 0;
                foreach (string word in words)
                {
                    string w = word.ToLower();

                    if (w == f) points += exactMatchWorth;
                    else if (w.Contains(f) || f.Contains(w)) points++;

                    if (w == l) points += exactMatchWorth;
                    else if (w.Contains(l) || l.Contains(w)) points++;
                }
                if (points > 0) matches.Add(new KeyValuePair<int, int>(p.ProfileId, points));
            }
            matches.Sort((pair1, pair2) => pair1.Value.CompareTo(pair2.Value));

            List<ProfileModel> results = new List<ProfileModel>();
            foreach (KeyValuePair<int, int> match in matches)
            {
                results.Add(GetProfileModel(match.Key));
            }

            return results;
        }

        public List<ProfileModel> ProfileFriends(int id)
        {
            List<int?> profileIds = friendRepo.ProfileFriends(id);

            List<ProfileModel> friendProfiles = new List<ProfileModel>();
            if (profileIds != null)
            {
                foreach (int p in profileIds) { friendProfiles.Add(GetProfileModel(p)); }
            }

            return friendProfiles;
            // != null ? friendProfiles : null
        }

        public List<ProfileModel> FriendRequests()
        {
            IEnumerable<Friend> friends = friendRepo.ByToId(currentProfile.id, false);

            List<ProfileModel> requests = new List<ProfileModel>();
            if (friends != null)
            {
                foreach (Friend f in friends) { requests.Add(GetProfileModel(f.FromId)); }
            }

            return requests;
        }

        public ProfileModel GetProfileModel(int? id)
        {
            Profile profile = profileRepo.ById(id);
            Image image = imageRepo.ById(profile.ProfilePicture);
            return Util.GetProfileModel(profile, image, friendRepo.RelationToUser(currentProfile.id, id));
        }
    }
}