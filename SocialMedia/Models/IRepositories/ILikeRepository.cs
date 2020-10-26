using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Defines dependancy for database access service.
        
        Handles comment likes and post likes.
        
        When the types need distinguishing a contentType parameter is used.
        The parameter is of type int but is treated like an enum; 0 = post, 1 = comment.
    */
    public interface ILikeRepository
    {
        // Provides direct access to table.
        IEnumerable<Like> Likes { get; }

        // Shortcuts could be achived outside of this class with access to context.{type}, but would repeat in places,
        // so they are consolodated here.
        // START SHORTCUTS

        // Get a single record of the type that this class is dedicated to by it's ID and contentType enum.
        IEnumerable<Like> ByTypeAndId(int contentType, int contentId);

        // Get the count of likes belonging to the content with the provided Id and contentType enum.
        int CountByContentId(int contentType, int contentId);

        // Has the profile with the given ProfileID liked the content with the provided Id?
        bool HasLiked(int contentType, int contentId, int profileId);
        // END SHORTCUTS

        // Used to create a new record or update an old record.
        void SaveLike(Like like);

        // Remove record from the database.
        void DeleteLike(Like like);
    }
}
