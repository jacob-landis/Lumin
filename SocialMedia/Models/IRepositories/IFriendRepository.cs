using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Defines dependancy for database access service.
    */
    public interface IFriendRepository
    {
        // Provides direct access to table.
        IEnumerable<Friend> Friends { get; }

        // Shortcuts could be achived outside of this class with access to context.{type}, but would repeat in places,
        // so they are consolodated here.
        // START SHORTCUTS

        // Get a single record of the type that this class is dedicated to by it's ID.
        Friend ById(int id);

        // Get friend records that requested to be friends with the user of the provided ProfileID.
        IEnumerable<Friend> ByToId(int? id, bool accepted);

        // Get friend records that were requested to be friends by the user of the provided ProfileID.
        IEnumerable<Friend> ByFromId(int? id, bool accepted);

        // Get list of ProfileIDs of all friend records that have been accepted, either from the user, or to the user.
        List<int?> ProfileFriends(int? id);

        /*
            Determine how the provided profile relates to current user's profile in terms of a friend record.
            There are 5 possible results:
            1. (me)            The profile is the current user's profile.
            2. (friend)        The profile either accepted the current user's friend request or the current user accepted their friend request.
            3. (userRequested) The profile was requested by the current user.
            4. (requestedUser) The profile requested the current user.
            5. (unrelated)     The profile has not sent or recieved a request to or from the current user.
        */
        string RelationToUser(int currentUserId, int? profileId);

        int? BlockerProfileId(int currentUserId, int? profileId);

        bool IsMutualFriend(int currentUserId, int? profileId);

        int RelationshipTier(int currentUserId, int? profileId);

        DateTime? RelationshipChangeDatetime(int currentUserId, int? profileId);
        // END SHORTCUTS

        // Used to create a new record or update an old record.
        void SaveFriend(Friend friend);

        // Remove record from the database.
        void DeleteFriend(Friend friend);
    }
}
