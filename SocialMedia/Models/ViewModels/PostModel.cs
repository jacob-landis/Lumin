using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class PostModel
    {
        public int PostId { get; set; }

        // The caption that the user enters for the post.
        public string Caption { get; set; }

        // The datetime that the post was created.
        public DateTime DateTime { get; set; }

        public int PrivacyLevel { get; set; }

        // The profile of the owner of the post.
        public ProfileModel Profile { get; set; }

        // The image that belongs to the post. If the post has no image this will get filled with a blank RawImage model.
        public RawImage Image { get; set; }

        // The number of likes for the post and whether or not the current user has liked it.
        public LikeModel Likes { get; set; }
    }
}
