using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public interface IFriendRepository
    {
        IEnumerable<Friend> Friends { get; }
        IEnumerable<Friend> ByToId(int id, bool accepted);
        IEnumerable<Friend> ByFromId(int id, bool accepted);
        Friend ById(int id);
        List<int?> ProfileFriends(int id);
        string RelationToUser(int currentUserId, int? profileId);
        void SaveFriend(Friend friend);
        void DeleteFriend(Friend friend);
    }
}
