using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Defines dependancy for database access service.
    */
    public interface IPostRepository
    {
        // Provides direct access to table.
        IEnumerable<Post> Posts { get; }

        // Shortcuts could be achived outside of this class with access to context.{type}, but would repeat in places,
        // so they are consolodated here.
        // START SHORTCUTS

        // Get a single record of the type that this class is dedicated to by it's ID.
        Post ById(int? id);

        // Get posts belonging to a profile by the ProfileID.
        IEnumerable<Post> ByProfileId(int id);

        // Get the count of posts that belong to the profile with the provided ProfileID.
        int CountByProfileId(int id);
        // END SHORTCUTS

        // Used to create a new record or update an old record, and return the ID of the newly created or the updated record.
        int SavePost(Post post);

        // Remove record from the database.
        void DeletePost(Post post);
    }
}
