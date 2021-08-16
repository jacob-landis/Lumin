using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.ViewModels
{
    public class CommentRefreshSummaryModel
    {
        public List<CommentModel> Comments;
        public bool HasChanged = false;
        public int NewLength = 0;
    }
}
