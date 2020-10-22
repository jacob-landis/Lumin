using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class Comment
    {
        public int CommentId { get; set; }

        // The text that the user enters.
        public string Content { get; set; }

        // The datetime that the comment was created.
        public DateTime DateTime { get; set; }

        // XXX this is not used.
        public bool HasSeen { get; set; }

        // ASSOCIATIONS

        // Post that the comment belongs to.
        public int? PostId { get; set; }

        // Profile that comment belongs to.
        public int? ProfileId { get; set; }
    }
}
