using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Implements solution for IRepository to fulfill dependancy for database access service.
    */
    public class EFPostRepository : IPostRepository
    {
        // Context service is provided from Startup.
        private ApplicationDbContext context;

        public EFPostRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        /*
            Provides direct access to table.
        */
        public IEnumerable<Post> Posts => context.Posts;

        // Shortcuts could be achived outside of this class with access to context.{type}, but would repeat in places,
        // so they are consolodated here.
        // START SHORTCUTS

        /*
            Get a single record of the type that this class is dedicated to by it's ID.
        */
        public Post ById(int? postId) => context.Posts.First(p => p.PostId == postId);

        /*
            Get posts belonging to a profile by the ProfileID.
        */
        public IEnumerable<Post> ByProfileId(int? profileId) => context.Posts.Where(p => p.ProfileId == profileId);
        
        /*
            Get the count of posts that belong to the profile with the provided ProfileID.
        */
        public int CountByProfileId(int profileId) => context.Posts.Where(p => p.ProfileId == profileId).Count();
        // END SHORTCUTS

        /*
            Used to create a new record or update an old record, and return the ID of the newly created or the updated record.
        */
        public int SavePost(Post post)
        {
            // If the ID is defualt, create a new record.
            if (post.PostId == 0) context.Posts.Add(post);

            // Else, update the record in the database.
            else context.Posts.Update(post);

            // Commit change to the database.
            context.SaveChanges();

            // Return the ID to the caller. 
            // Return value is most useful when using this method to create a new record.
            return post.PostId;
        }

        /*
             Remove record from the database.
        */
        public void DeletePost(Post post)
        {
            // Remove comment record from the database.
            context.Remove(post);

            // Commit change to the database.
            context.SaveChanges();
        }
    }
}
