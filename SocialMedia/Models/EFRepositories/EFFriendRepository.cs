using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Implements solution for IRepository to fulfill dependancy for database access service.
    */
    public class EFFriendRepository : IFriendRepository
    {
        // Context service is provided from Startup.
        private ApplicationDbContext context;

        public EFFriendRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        /*
            Provides direct access to table.
        */
        public IEnumerable<Friend> Friends => context.Friends;

        // Shortcuts could be achived outside of this class with access to context.{type}, but would repeat in places,
        // so they are consolodated here.
        // START SHORTCUTS

        /*
            Get a single record of the type that this class is dedicated to by it's ID.
        */
        public Friend ById(int friendId) => context.Friends.First(f => f.FriendId == friendId);

        /*
            Get friend records that requested to be friends with the user of the provided ProfileID.
        */
        public IEnumerable<Friend> ByToId(int? toProfileId, bool accepted) => 
            context.Friends.Where(f => 
                f.ToId == toProfileId && 
                f.Accepted == accepted
            );

        /*
            Get friend records that were requested to be friends by the user of the provided ProfileID.
        */
        public IEnumerable<Friend> ByFromId(int? fromProfileId, bool accepted) => 
            context.Friends.Where(f => 
                f.FromId == fromProfileId && 
                f.Accepted == accepted
            );

        /*
            Get list of ProfileIDs of all friend records that have been accepted, either from the user, or to the user.
        */
        public List<int?> ProfileFriends(int? profileId)
        {
            // Prep ProfileID list.
            List<int?> profileIds = new List<int?>();

            // Parse though results and fill into ProfileID list.
            foreach (Friend f in ByFromId(profileId, true)) { profileIds.Add(f.ToId); }
            foreach (Friend f in ByToId(profileId, true)) { profileIds.Add(f.FromId); }

            // Return list of results.
            return profileIds;
        }

        /*
            Determine how the provided profile relates to current user's profile in terms of a friend record.
            There are 5 possible results:
            1. (me)            The profile is the current user's profile.
            2. (friend)        The profile either accepted the current user's friend request or the current user accepted their friend request.
            3. (userRequested) The profile was requested by the current user.
            4. (requestedUser) The profile requested the current user.
            5. (unrelated)     The profile has not sent or recieved a request to or from the current user.
        */
        public string RelationToUser(int currentUserId, int? profileId)
        {
            if (currentUserId == profileId) return "me";
            foreach(int id in ProfileFriends(currentUserId))    { if (id == profileId)       return "friend"; }
            foreach(Friend f in ByFromId(currentUserId, false)) { if (f.ToId == profileId)   return "userRequested"; }
            foreach(Friend f in ByToId(currentUserId, false))   { if (f.FromId == profileId) return "requestedUser"; }
            return "unrelated";
        }

        public int? BlockerProfileId(int currentUserId, int? profileId)
        {
            if (currentUserId == profileId) return null;

            try
            {
                Friend friend = context.Friends.First(f =>
                    (f.ToId == currentUserId && f.FromId == profileId) || (f.ToId == profileId && f.FromId == currentUserId));

                if (friend != null)
                    return friend.BlockerProfileId;
            }
            catch (Exception)
            {
                return null;
            }

            return null;
        }

        public bool IsMutualFriend(int currentUserId, int? profileId)
        {
            if (RelationToUser(currentUserId, profileId) != "friend")
            {
                List<int?> otherUsersFriends = ProfileFriends(profileId);

                foreach(int id in ProfileFriends(currentUserId))
                {
                    foreach(int otherId in otherUsersFriends)
                    {
                        if (id == otherId) return true;
                    }
                }
            }
            return false;
        }

        /*
            0: Unrelated
            1: MutualFriend
            2: Friend
            3: Me
        */
        public int RelationshipTier(int currentUserId, int? profileId)
        {
            int tier = 0;

            string relationToUser = RelationToUser(currentUserId, profileId);

            if ((relationToUser == "unrelated" || relationToUser == "requestedUser")
                && IsMutualFriend(currentUserId, profileId))
                tier = 1;

            else if (relationToUser == "friend" || relationToUser == "userRequested")
                tier = 2;

            else if (relationToUser == "me")
                tier = 3;

            return tier;
        }

        public DateTime? RelationshipChangeDatetime(int currentUserId, int? profileId)
        {
            try
            {
                Friend friend = Friends.First(f =>
                    (f.ToId == currentUserId && f.FromId == profileId) ||
                    (f.FromId == currentUserId && f.ToId == profileId));

                if (friend != null && friend.StatusChangeDate != null)
                    return friend.StatusChangeDate;

                return null;
            }
            catch (Exception e)
            {
                return null;
            }

        }
        // END SHORTCUTS

        /*
            Used to create a new record or update an old record.
        */
        public void SaveFriend(Friend friend)
        {
            // If the ID is defualt, create a new record.
            if (friend.FriendId == 0) context.Friends.Add(friend);

            // Else, update the record in the database.
            else context.Friends.Update(friend);

            // Commit change to the database.
            context.SaveChanges();
        }

        /*
             Remove record from the database.
        */
        public void DeleteFriend(Friend friend)
        {
            // Remove comment record from the database.
            context.Friends.Remove(friend);

            // Commit change to the database.
            context.SaveChanges();
        }
    }
}
