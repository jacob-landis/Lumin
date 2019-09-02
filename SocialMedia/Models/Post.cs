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
        public string Caption { get; set; }
        public DateTime DateTime { get; set; }

        //Associations
        public int? ProfileId { get; set; }
        public int? ImageId { get; set; }
    }
}
