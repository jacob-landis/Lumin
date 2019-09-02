using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class CommentModel
    {
        public int CommentId { get; set; }
        public string Content { get; set; }
        public ProfileModel Profile { get; set; }
        public DateTime DateTime { get; set; }
        public LikeModel Likes { get; set; }
        public int? PostId { get; set; }
    }
}
