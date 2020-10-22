using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        This class handles comment likes and post likes.
        When the types need distinguishing there is a parameter for that.
    */
    public class EFLikeRepository : ILikeRepository
    {
        private ApplicationDbContext context;

        public EFLikeRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public IEnumerable<Like> Likes => context.Likes;

        // START SHORTCUTS

        /*
            Has the profile with the given ProfileID liked the content with the provided Id?
        */
        public bool HasLiked(int contentType, int contentId, int profileId) => 
            context.Likes.Any(l => 
                l.ContentType == contentType && 
                l.ContentId == contentId && 
                l.ProfileId == profileId
            );

        /*
            Get the count of likes belonging to the content with the provided Id.
        */
        public int CountByContentId(int contentType, int contentId) => 
            context.Likes.Where(l => 
                l.ContentType == contentType && 
                l.ContentId == contentId
            ).Count();

        /*
            Get list of likes belonging to the content with the provided Id.
        */
        public IEnumerable<Like> ByTypeAndId(int contentType, int contentId) => 
            context.Likes.Where(l => 
                l.ContentType == contentType && 
                l.ContentId == contentId
            );
        // END SHORTCUTS

        public void SaveLike(Like like)
        {
            if (like.LikeId == 0) context.Likes.Add(like);
            else context.Likes.Update(like);
            context.SaveChanges();
        }

        public void DeleteLike(Like like)
        {
            context.Likes.Remove(like);
            context.SaveChanges();
        }
    }
}
