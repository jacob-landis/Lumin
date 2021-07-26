using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Implements solution for IRepository to fulfill dependancy for database access service.

        Handles comment likes and post likes.
        
        When the types need distinguishing a contentType parameter is used.
        The parameter is of type int but is treated like an enum; 0 = post, 1 = comment.
    */
    public class EFLikeRepository : ILikeRepository
    {
        // Context service is provided from Startup.
        private ApplicationDbContext context;

        public EFLikeRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        /*
            Provides direct access to table.
        */
        public IEnumerable<Like> Likes => context.Likes;

        // Shortcuts could be achived outside of this class with access to context.{type}, but would repeat in places,
        // so they are consolodated here.
        // START SHORTCUTS

        /*
            Get a single record of the type that this class is dedicated to by it's ID and contentType enum.
        */
        public IEnumerable<Like> ByTypeAndId(int contentType, int contentId) => 
            context.Likes.Where(l => 
                l.ContentType == contentType && 
                l.ContentId == contentId
            );

        public Like ByTypeAndProfileId(int contentType, int contentId, int profileId) =>
            context.Likes.First(l =>
                l.ContentType == contentType &&
                l.ContentId == contentId &&
                l.ProfileId == profileId
            );

        /*
            Get the count of likes belonging to the content with the provided Id and contentType enum.
        */
        public int CountByContentId(int contentType, int contentId) => 
            context.Likes.Where(l => 
                l.ContentType == contentType && 
                l.ContentId == contentId
            ).Count();

        /*
            Has the profile with the given ProfileID liked the content with the provided Id?
        */
        public bool HasLiked(int contentType, int contentId, int profileId) => 
            context.Likes.Any(l => 
                l.ContentType == contentType && 
                l.ContentId == contentId && 
                l.ProfileId == profileId
            );
        // END SHORTCUTS

        /*
            Used to create a new record or update an old record.
        */
        public void SaveLike(Like like)
        {
            // If the ID is defualt, create a new record.
            if (like.LikeId == 0) context.Likes.Add(like);

            // Else, update the record in the database.
            else context.Likes.Update(like);

            // Commit change to the database.
            context.SaveChanges();
        }

        /*
             Remove record from the database.
        */
        public void DeleteLike(Like like)
        {
            // Remove comment record from the database.
            context.Likes.Remove(like);

            // Commit change to the database.
            context.SaveChanges();
        }
    }
}
