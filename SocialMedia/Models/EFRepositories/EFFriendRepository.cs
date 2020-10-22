using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class EFFriendRepository : IFriendRepository
    {
        private ApplicationDbContext context;

        public EFFriendRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public IEnumerable<Friend> Friends => context.Friends;

        // START SHORTCUTS
        public Friend ById(int id) => context.Friends.First(f => f.FriendId == id);

        /*
            Get friend records that requested to be friends with the user of the provided ProfileID.
        */
        public IEnumerable<Friend> ByToId(int id, bool accepted) => 
            context.Friends.Where(f => 
                f.ToId == id && 
                f.Accepted == accepted
            );


        /*
            Get friend records that were requested to be friends by the user of the provided ProfileID.
        */
        public IEnumerable<Friend> ByFromId(int id, bool accepted) => 
            context.Friends.Where(f => 
                f.FromId == id && 
                f.Accepted == accepted
            );

        /*
            Get list of ProfileIDs of all friend records that have been accepted, either from the user, or to the user.
        */
        public List<int?> ProfileFriends(int id)
        {
            // Prep ProfileID list.
            List<int?> profileIds = new List<int?>();

            // Parse though results and fill into ProfileID list.
            foreach (Friend f in ByFromId(id, true)) { profileIds.Add(f.ToId); }
            foreach (Friend f in ByToId(id, true)) { profileIds.Add(f.FromId); }

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
        // END SHORTCUTS

        public void SaveFriend(Friend friend)
        {
            if(friend.FriendId == 0) context.Friends.Add(friend);
            else context.Friends.Update(friend);
            context.SaveChanges();
        }

        public void DeleteFriend(Friend friend)
        {
            context.Friends.Remove(friend);
            context.SaveChanges();
        }
    }
}
