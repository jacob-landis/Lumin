using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class Like
    {
        public int LikeId { get; set; }
        public DateTime DateTime { get; set; }
        public int? ProfileId { get; set; }
        public int ContentType { get; set; } // 1 = Post, 2 = Comment
        public int? ContentId { get; set; }
        public bool HasSeen { get; set; }
    }
}
