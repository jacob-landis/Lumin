using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class EFLikeRepository : ILikeRepository
    {
        private ApplicationDbContext context;
        public IEnumerable<Like> Likes => context.Likes;

        public bool HasLiked(int contentType, int contentId, int profileId) =>
            context.Likes.Any(l => l.ContentType == contentType && l.ContentId == contentId && l.ProfileId == profileId);

        public int CountByContentId(int contentType, int contentId) =>
            context.Likes.Where(l => l.ContentType == contentType && l.ContentId == contentId).Count();

        public IEnumerable<Like> ByTypeAndId(int contentType, int contentId) =>
            context.Likes.Where(l => l.ContentType == contentType && l.ContentId == contentId);

        public EFLikeRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

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
