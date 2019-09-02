using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class PostModel
    {
        public int PostId { get; set; }
        public string Caption { get; set; }
        public DateTime DateTime { get; set; }
        public ProfileModel Profile { get; set; }
        public RawImage Image { get; set; }
        public LikeModel Likes { get; set; }
    }
}
