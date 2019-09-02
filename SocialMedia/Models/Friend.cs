using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class Friend
    {
        public int FriendId { get; set; }
        public bool Accepted { get; set; }
        public DateTime DateSent { get; set; }
        public DateTime DateAccpted { get; set; }

        //Associations
        public int? ToId { get; set; }
        public int? FromId { get; set; }
    }
}
