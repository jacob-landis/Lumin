using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class CommentReferencesModel
    {
        public int[] commentIds { get; set; }
        public int[] likeCounts { get; set; }
        public string[] contents { get; set; }
    }
}
