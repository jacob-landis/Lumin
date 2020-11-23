using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    /*
        Not a like itself, but a culmination of likes for a piece of content. XXX So more of a LikesModel? XXX
    */
    public class LikeModel
    {
        // A comment or post Id
        public int ContentId { get; set; }

        // The type of the content that this belongs to. (1 = Post, 2 = Comment)
        public int ContentType { get; set; }

        // The number of likes that the content has.
        public int Count { get; set; }

        // Whether or not the current user's profile has like the content.
        public bool HasLiked { get; set; }
    }
}
