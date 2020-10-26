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
        Implements solution for IRepository to fulfill dependancy for database access service.
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

        // Shortcuts could be achived outside of this class with access to context.{type}, but would repeat in places,
        // so they are consolodated here.
        // START SHORTCUTS

        /*
            Get a single record of the type that this class is dedicated to by it's ID.
        */
        public Comment ById(int? id) => context.Comments.FirstOrDefault(c => c.CommentId == id);

        /*
            Get comments belonging to a post by the PostID.
        */
        public IEnumerable<Comment> ByPostId(int? id) => context.Comments.Where(c => c.PostId == id);

        /*
            Get the count of comments that belong to the post with the provided PostID.
        */
        public int CountByPostId(int? id) => context.Comments.Where(c => c.PostId == id).Count();

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
        // END SHORTCUTS

        /*
            Used to create a new record or update an old record, and return the ID of the newly created or the updated record.
        */
        public int SaveComment(Comment comment)
        {
            // If the ID is defualt, create a new record.
            if (comment.CommentId == 0) context.Comments.Add(comment);

            // Else, update the record in the database.
            else context.Comments.Update(comment);

            // Commit change to the database.
            context.SaveChanges();

            // Return the ID to the caller. 
            // Return value is most useful when using this method to create a new record.
            return comment.CommentId;
        }

        /*
             Remove record from the database.
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
