using SocialMedia.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Agent of dependency injection for database access service. XXX move comments that will be repeated in a general document that describes the common pattern.
    */
    public class EFCommentRepository : ICommentRepository
    {
        // Context service is provided from Startup.
        private ApplicationDbContext context;

        public EFCommentRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        /*
            Provides direct access to table.
        */
        public IEnumerable<Comment> Comments => context.Comments;

        // All shortcuts could be achived outside of this class with access to Comments property.
        // START SHORTCUTS

        /*
            Get comments belonging to a post by the PostID.
        */
        public IEnumerable<Comment> ByPostId(int? id) => context.Comments.Where(c => c.PostId == id);

        /*
            Get a range of comments belonging to a post ordered by datetime. 
            Caller can specify how many to skip, and how many to take.
        */
        public IEnumerable<Comment> RangeByPostId(int? id, int? commentCount, int? amount) => 
            context.Comments
                .Where(c => c.PostId == id)
                .OrderByDescending(c => c.DateTime)
                .Skip((int)commentCount)
                .Take((int)amount);

        /*
            Get the count of comments that belong to the post with the provided PostID.
        */
        public int CountByPostId(int? id) => context.Comments.Where(c => c.PostId == id).Count();

        /*
            Get a single comment by CommentID.
        */
        public Comment ById(int? id) => context.Comments.FirstOrDefault(c => c.CommentId == id);
        // END SHORTCUTS

        /*
            Used to create a new record or update an old record, and return the CommentID of the newly created or the updated comment record.
        */
        public int SaveComment(Comment comment)
        {
            // If the CommentID is defualt, create a new record.
            if (comment.CommentId == 0) context.Comments.Add(comment);

            // Else, update the record in the database.
            else context.Comments.Update(comment);

            // Commit change to the database.
            context.SaveChanges();

            // Return the CommentID to the caller. Most useful when using this method to create a new record.
            return comment.CommentId;
        }

        /*
             Remove comment record from the database.
        */
        public void DeleteComment(Comment comment)
        {
            // Remove comment record from the database.
            context.Comments.Remove(comment);

            // Commit change to the database.
            context.SaveChanges();
        }
    }
}
