using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class LikeModel
    {
        public int ContentId { get; set; }
        public int Count { get; set; }
        public bool HasLiked { get; set; }
    }
}
