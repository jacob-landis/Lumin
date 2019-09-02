using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class Image
    {
        public int ImageId { get; set; }
        public string Name { get; set; }
        public DateTime DateTime { get; set; }

        //Associations
        public int? ProfileId { get; set; }
    }
}
