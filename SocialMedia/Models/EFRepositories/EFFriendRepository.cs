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
        public Friend ById(int id) => context.Friends.First(f => f.FriendId == id);

        public IEnumerable<Friend> ByToId(int id, bool accepted) => context.Friends.Where(f => f.ToId == id && f.Accepted == accepted);
        public IEnumerable<Friend> ByFromId(int id, bool accepted) => context.Friends.Where(f => f.FromId == id && f.Accepted == accepted);

        public List<int?> ProfileFriends(int id) // gets all friends of accpted friend requests
        {
            List<int?> profileIds = new List<int?>();

            foreach (Friend f in ByFromId(id, true)) { profileIds.Add(f.ToId); }
            foreach (Friend f in ByToId(id, true)) { profileIds.Add(f.FromId); }

            return profileIds;

            //IEnumerable<Friend> requestedFriends = ByFromId(id, true);
            //if (requestedFriends != null)
            //IEnumerable<Friend> prompterFriends = ByToId(id, true);
            //if (prompterFriends != null)
        }

        public string RelationToUser(int currentUserId, int? profileId)
        {
            if (currentUserId == profileId) return "me";
            foreach(int id in ProfileFriends(currentUserId)) { if (id == profileId) return "friend"; }
            foreach(Friend f in ByFromId(currentUserId, false)) { if (f.ToId == profileId) return "userRequested"; }
            foreach(Friend f in ByToId(currentUserId, false)) { if (f.FromId == profileId) return "requestedUser"; }
            return "unrelated";
        }

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
