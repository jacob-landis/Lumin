using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class Post
    {
        public int PostId { get; set; }

        // Caption of post.
        public string Caption { get; set; }

        // Datetime that post was created.
        public DateTime DateTime { get; set; }

        // ASSOCIATIONS

        // ProfileID of the profile that owns this post.
        public int? ProfileId { get; set; }
        
        // The ImageID of the image that belongs to this post. 0 if there is no image.
        public int? ImageId { get; set; }
    }
}
