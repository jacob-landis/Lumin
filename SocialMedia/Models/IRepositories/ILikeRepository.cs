using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public interface ILikeRepository
    {
        IEnumerable<Like> Likes { get; }
        int CountByContentId(int contentType, int contentId);
        IEnumerable<Like> ByTypeAndId(int contentType, int contentId);
        bool HasLiked(int contentType, int contentId, int profileId);
        void SaveLike(Like like);
        void DeleteLike(Like like);
    }
}
