using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    /*
        Not a like itself, but a culmination of likes for a piece of content. 
    */
    public class LikeModel
    {
        // A comment or post Id
        public int ContentId { get; set; }

        // The number of likes that the content has.
        public int Count { get; set; }

        // Whether or not the current user's profile has like the content.
        public bool HasLiked { get; set; }
    }
}
