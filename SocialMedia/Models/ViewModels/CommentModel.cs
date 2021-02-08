using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class CommentModel
    {
        public int CommentId { get; set; }

        // The text that the user entered.
        public string Content { get; set; }

        // If the owner of the post that this comment belongs to has seen this comment.
        public bool HasSeen { get; set; }

        // Data for a profile card of the comment owner.
        public ProfileModel Profile { get; set; }

        // Datetime of creation of comment. Displayed by client.
        public DateTime DateTime { get; set; }

        // The like count and whether the current user has liked it.
        public LikeModel Likes { get; set; }

        // The Id of the post that this comment belongs to.
        public int? PostId { get; set; }
    }
}
