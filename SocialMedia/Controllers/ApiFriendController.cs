﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Infrastructure;
using SocialMedia.Models;
using SocialMedia.Models.Session;
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
        private SessionResults sessionResults;
        private CurrentProfile currentProfile;

        public ApiFriendController(
            IProfileRepository profileRepo,
            IFriendRepository friendRepo,
            IImageRepository imageRepo,
            SessionResults sessionResults,
            CurrentProfile currentProfile)
        {
            this.profileRepo = profileRepo;
            this.friendRepo = friendRepo;
            this.imageRepo = imageRepo;
            this.sessionResults = sessionResults;
            this.currentProfile = currentProfile;
        }

        //-----------------------------------------ROUTING---------------------------------------------//

        /*
            Either returns a list of friends, friend requests, or profile search results.
        */
        [HttpPost("friends/{profileId}/{type}/{skip}/{take}")]
        public List<ProfileModel> GetFriends(int profileId, string type, int skip, int take, [FromBody] StringModel search)
        {
            if (profileId != 0)
            {
                Profile profile = profileRepo.ById(profileId);
                if (profile.ProfileFriendsPrivacyLevel > friendRepo.RelationshipTier(currentProfile.id, profileId)) return null;
            }

            List<int?> profileIds = new List<int?>();

            List<ProfileModel> results = new List<ProfileModel>();

            if (type == "profileModal")
            {
                string resultsKey = "profileModalFriends";

                if (skip == 0) sessionResults.AddResults(resultsKey, ProfileFriends(profileId));

                foreach (int sessionProfileId in sessionResults.GetResultsSegment(resultsKey, skip, take))
                {
                    results.Add(GetProfileModel(sessionProfileId));
                }
            }
            else if (type == "friendDropdown")
            {
                string resultsKey = "friendDropdown";

                if (skip == 0)
                {
                    // If ID is provided and the user has access, return friends by ProfileID.
                    if (profileId != 0 
                        && profileRepo.ById(profileId).ProfileFriendsPrivacyLevel <= friendRepo.RelationshipTier(currentProfile.profile.ProfileId, profileId))
                    {
                        sessionResults.AddResults(resultsKey, ProfileFriends(profileId));
                    }

                    // If search string is provided, return profile search results.
                    else if (search.str != "NULL")
                    {
                        sessionResults.AddResults(resultsKey, Search(search.str));
                    }

                    // If no ID or search string was provided, return the current user's friend requests.
                    else sessionResults.AddResults(resultsKey, FriendRequests());
                }

                foreach(int sessionProfileId in sessionResults.GetResultsSegment(resultsKey, skip, take))
                {
                    results.Add(GetProfileModel(sessionProfileId));
                }
            }

            return results;
        }

        /*
            Gets a boolean that indicates whether the current user has any pending friend requests. 
        */
        [HttpGet("gethasfriendrequest")]
        public int GetHasFriendRequest()
        {
            int requestCount = friendRepo.Friends.Count((Friend f) =>
                f.Accepted == false
                && f.BlockerProfileId == null
                && f.ToId == currentProfile.id);

            return requestCount > 0 ? 1 : 0;
        }

        /*
            Deletes the friend record that matches the provided ProfileID and the current user's ProfileID.
        */
        [HttpPost("deletefriend/{profileId}")]
        public void DeleteFriend(int profileId)
        {
            // Find friend record by ID.
            Friend friend = friendRepo.Friends.First(f =>
                (f.ToId == profileId         || f.FromId == profileId) &&
                (f.ToId == currentProfile.id || f.FromId == currentProfile.id));

            // Delete friend record.
            friendRepo.DeleteFriend(friend);
        }

        /*
            Adds friend record to the database that is marked as unaccepted. 
        */
        [HttpPost("createrequest/{profileId}")]
        public void CreateRequest(int profileId)
        {
            // Create friend obj with default values, a ToId of the provided id, and a FromId of the current user's profile. DateAccepted is left blank.
            Friend friend = new Friend
            {
                Accepted = false,
                ToId = profileId,
                StatusChangeDate = DateTime.UtcNow,
                FromId = currentProfile.id
            };

            // Commit friend record to database.
            friendRepo.SaveFriend(friend);
        }

        /*
             Mark friend record as accepted and set DateAccpeted to the current date time.
        */
        [HttpPost("acceptrequest/{profileId}")]
        public void AcceptRequest(int profileId)
        {
            // Find friend by provided ProfileID.
            Friend friend = friendRepo.Friends.First(f => f.FromId == profileId && f.ToId == currentProfile.id);

            // Set DateAccepted to current date time.
            friend.StatusChangeDate = DateTime.UtcNow;

            // Mark friend record as accepted.
            friend.Accepted = true;

            // Commit friend record changes to database.
            friendRepo.SaveFriend(friend);
        }
        
        [HttpPost("blockprofile/{profileid}")]
        public void BlockProfile(int profileId)
        {
            Friend friend;

            // If friend record exists.
            if (friendRepo.RelationToUser(currentProfile.id, profileId) != "unrelated")
            {
                friend = friendRepo.Friends.First(f => f.FromId == profileId || f.ToId == profileId);
                friend.BlockerProfileId = currentProfile.id;
            }
            else
            {
                friend = new Friend
                {
                    FromId = currentProfile.id,
                    ToId = profileId,
                    BlockerProfileId = currentProfile.id
                };
            }
            friend.StatusChangeDate = DateTime.UtcNow;

            friendRepo.SaveFriend(friend);
        }

        [HttpPost("unblockprofile/{profileid}")]
        public void UnblockProfile(int profileId)
        {
            Friend friend = friendRepo.Friends.First(f => 
                (f.FromId == profileId         || f.ToId == profileId) && 
                (f.FromId == currentProfile.id || f.ToId == currentProfile.id));

            friendRepo.DeleteFriend(friend);
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
        public List<int?> Search(string search) // terms.str
        {
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
            List<int?> results = new List<int?>();

            // Loop through matches.
            foreach (KeyValuePair<int, int> match in matches)
            {
                // Add preped result to results.
                results.Add(match.Key);
            }

            // Return search results to user.
            return results;
        }

        /*
            Returns preped list of friends of the provided profile by its ProfileID.
        */
        public List<int?> ProfileFriends(int profileId)
        {
            return friendRepo.ProfileFriends(profileId);
        }

        /*
            Get list of friend requests to current user. 
        */
        public List<int?> FriendRequests()
        {
            // Get list of unaccepted friend requests by the current user's ProfileID.
            IEnumerable<Friend> friends = friendRepo.ByToId(currentProfile.id, false);

            // Prep list for prepped profiles.
            List<int?> requests = new List<int?>();

            // If there were results,
            if (friends != null) 
            {
                // prep each result and add to list of requests.
                foreach (Friend f in friends) { requests.Add(f.FromId); }
            }

            // Return results to caller.
            return requests;
        }

        /*
            Preps a profile to be sent back to client.
        */
        public ProfileModel GetProfileModel(int? profileId)
        {
            // Get profile by ProfileID.
            Profile profile = profileRepo.ById(profileId);

            // Prep profile picture.
            Image image = imageRepo.ById(profile.ProfilePicture);

            // Return prepped profile.
            return Util.GetProfileModel(
                profile, 
                image, 
                friendRepo.RelationToUser(currentProfile.id, profileId), 
                friendRepo.RelationshipTier(currentProfile.id, profileId),
                friendRepo.RelationshipChangeDatetime(currentProfile.id, profileId),
                friendRepo.BlockerProfileId(currentProfile.id, profileId));
        }
    }
}