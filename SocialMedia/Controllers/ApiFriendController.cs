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
    /*
        Controls friendships between users and serves a user their list of friends and user search results.
    */
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

        /*
            Either returns a list of friends, friend requests, or profile search results.
        */
        [HttpPost("friends/{id}")]
        public List<ProfileModel> GetFriends(int id, [FromBody] StringModel search)
        {
            // If ID is provided and the user has access, return friends by ProfileID.
            if (id != 0 && profileRepo.ById(id).ProfileFriendsPrivacyLevel <= friendRepo.RelationshipTier(currentProfile.profile.ProfileId, id))
                return ProfileFriends(id);

            // If search string is provided, return profile search results.
            if (search.str != "NULL") return Search(search.str);
            
            // If no ID or search string was provided, return the current user's friend requests.
            return FriendRequests();
        }

        /*
            Deletes the friend record that matches the provided ProfileID and the current user's ProfileID.
        */
        [HttpPost("deletefriend/{id}")]
        public void DeleteFriend(int id)
        {
            // Find friend record by ID.
            Friend friend = friendRepo.Friends.First(f => f.ToId == id || f.FromId == id); // XXX need to confirm user ownership of relationship

            // Delete friend record.
            friendRepo.DeleteFriend(friend);
        }

        /*
            Adds friend record to the database that is marked as unaccepted. 
        */
        [HttpPost("createrequest/{id}")]
        public void CreateRequest(int id)
        {
            // Create friend obj with default values, a ToId of the provided id, and a FromId of the current user's profile. DateAccepted is left blank.
            Friend friend = new Friend
            {
                Accepted = false,
                ToId = id,
                DateSent = DateTime.UtcNow,
                FromId = currentProfile.id
            };

            // Commit friend record to database.
            friendRepo.SaveFriend(friend);
        }

        /*
             Mark friend record as accepted and set DateAccpeted to the current date time.
        */
        [HttpPost("acceptrequest/{id}")]
        public void AcceptRequest(int id)
        {
            // Find friend by provided ProfileID.
            Friend friend = friendRepo.Friends.First(f => f.FromId == id && f.ToId == currentProfile.id);

            // Set DateAccepted to current date time.
            friend.DateAccepted = DateTime.UtcNow;

            // Mark friend record as accepted.
            friend.Accepted = true;

            // Commit friend record changes to database.
            friendRepo.SaveFriend(friend);
        }

        //-----------------------------------------UTIL---------------------------------------------//


        /* 
            Searches for profiles by name.

            SEARCH ALGORITHM STEPS:
            Split terms into array of words.
            For each word, check each profile's first name and then last name for a match.
            If there is a match, add that profile to a list and give it a point for each match.
            Return the list in order of most points.
        */
        public List<ProfileModel> Search(string search) // terms.str
        {
            // XXX XXX XXX check if search terms are alphabetic
            // If no search string was provided, return list of AAAAALLLLLLLLLL profiles XD. XXX this cannot be!
            if (search == "") // return null instead?
            {
                List<ProfileModel> defaultResults = new List<ProfileModel>();
                foreach (Profile p in profileRepo.ExceptCurrentProfile)
                {
                    defaultResults.Add(GetProfileModel(p.ProfileId));
                }
                return defaultResults;
            }

            // Prep list for matches. Each index contains a key value pair of <ProfileID, searchPoints>.
            List<KeyValuePair<int, int>> matches = new List<KeyValuePair<int, int>>();

            // Split search terms into array of search terms.
            string[] searchTerms = search.Split(' ');

            // Define how many points an exact match is worth.
            int exactMatchWorth = 3;

            // Loop though all profiles in the database.
            foreach (Profile p in profileRepo.ExceptCurrentProfile)
            {
                // Convert first and last name to lowercase.
                string lcFirstName = p.FirstName.ToLower();
                string lcLastName = p.LastName.ToLower();

                // Define points variable and start it at 0.
                int points = 0;

                // Loop through search terms.
                foreach (string searchTerm in searchTerms)
                {
                    // Convert search term to lowercase.
                    string lcSearchTerm = searchTerm.ToLower();

                    // If the first name is an exact match, add an exact match worth of points.
                    if (lcSearchTerm == lcFirstName) points += exactMatchWorth;
                    // Else if the first name is a partial match, add 1 point.
                    else if (lcSearchTerm.Contains(lcFirstName) || lcFirstName.Contains(lcSearchTerm)) points++;

                    // If the last name is an exact match, add an exact match worth of points.
                    if (lcSearchTerm == lcLastName) points += exactMatchWorth;
                    // Else if the last name is a partial match, add 1 point.
                    else if (lcSearchTerm.Contains(lcLastName) || lcLastName.Contains(lcSearchTerm)) points++;
                }

                // If the profile earned any points, add it's id to the list of matches.
                if (points > 0) matches.Add(new KeyValuePair<int, int>(p.ProfileId, points));
            }

            // Sort match results by points.
            matches.Sort((pair1, pair2) => pair1.Value.CompareTo(pair2.Value));

            // Prep list for preped results.
            List<ProfileModel> results = new List<ProfileModel>();

            // Loop through matches.
            foreach (KeyValuePair<int, int> match in matches)
            {
                // Add preped result to results.
                results.Add(GetProfileModel(match.Key));
            }

            // Return search results to user.
            return results;
        }

        /*
            Returns preped list of friends of the provided profile by its ProfileID.
        */
        public List<ProfileModel> ProfileFriends(int id)
        {
            // Get list of ProfileIDs by ProfileID. XXX can get full profiles, just have GetProfileModel pull id where needed. No, because 
            // we want to offload logic to that func in other cases, but maybe I should overload the method...
            List<int?> profileIds = friendRepo.ProfileFriends(id);

            // Prep list for prepped profiles.
            List<ProfileModel> friendProfiles = new List<ProfileModel>();

            // If matches were found
            if (profileIds != null)
            {
                // Loop through matches, prep each one and add it to the list.
                foreach (int p in profileIds) { friendProfiles.Add(GetProfileModel(p)); }
            }

            // Return results to caller.
            return friendProfiles;
            // != null ? friendProfiles : null
        }

        /*
            Get list of friend requests to current user. 
        */
        public List<ProfileModel> FriendRequests() // XXX logic could be rearranged. This could also go in GetFriends
        {
            // Get list of unaccepted friend requests by the current user's ProfileID.
            IEnumerable<Friend> friends = friendRepo.ByToId(currentProfile.id, false);

            // Prep list for prepped profiles.
            List<ProfileModel> requests = new List<ProfileModel>();

            // If there were results,
            if (friends != null) 
            {
                // prep each result and add to list of requests.
                foreach (Friend f in friends) { requests.Add(GetProfileModel(f.FromId)); }
            }

            // Return results to caller.
            return requests;
        }

        /*
            Preps a profile to be sent back to client.
        */
        public ProfileModel GetProfileModel(int? id)
        {
            // Get profile by ProfileID.
            Profile profile = profileRepo.ById(id);

            // Prep profile picture.
            Image image = imageRepo.ById(profile.ProfilePicture);

            // Return prepped profile.
            return Util.GetProfileModel(profile, image, friendRepo.RelationToUser(currentProfile.id, id), friendRepo.RelationshipTier(currentProfile.id, id));
        }
    }
}