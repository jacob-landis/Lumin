using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class Like
    {
        // PK
        public int LikeId { get; set; }

        // Datetime of when this like record was created.
        public DateTime DateTime { get; set; }

        // The ProfileID of the profile that created the like.
        public int? ProfileId { get; set; }
        
        // The type of the content that this belongs to. (1 = Post, 2 = Comment)
        public int ContentType { get; set; }

        // Post or comment ID.
        public int? ContentId { get; set; }

        // XXX not used anywhere. Remove or use.
        public bool HasSeen { get; set; }
    }
}
