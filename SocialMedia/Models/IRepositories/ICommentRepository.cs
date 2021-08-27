using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Defines dependancy for database access service.
    */
    public interface ICommentRepository
    {
        // Provides direct access to table.
        IEnumerable<Comment> Comments { get; }

        // Shortcuts could be achived outside of this class with access to context.{type}, but would repeat in places,
        // so they are consolodated here.
        // START SHORTCUTS

        // Get a single record of the type that this class is dedicated to by it's ID.
        Comment ById(int? commentId);

        // Get comments belonging to a post by the PostID.
        IEnumerable<Comment> ByPostId(int? postId);

        // Get the count of comments that belong to the post with the provided PostID.
        int CountByPostId(int? postId);

        // Get a range of comments belonging to a post ordered by datetime. 
        // Caller can specify how many to skip, and how many to take.
        IEnumerable<Comment> RangeByPostId(int? postId, int? skip, int? take);

        bool HasCommented(int postId, int profileId);
        // END SHORTCUTS

        // Used to create a new record or update an old record, and return the ID of the newly created or the updated record.
        int SaveComment(Comment comment);

        // Remove record from the database.
        void DeleteComment(Comment comment);
    }
}
