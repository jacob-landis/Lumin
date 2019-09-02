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
        public string Content { get; set; }
        public DateTime DateTime { get; set; }
        public bool HasSeen { get; set; }

        //Associations
        public int? PostId { get; set; }
        public int? ProfileId { get; set; }
    }
}
