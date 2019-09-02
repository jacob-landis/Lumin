using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public interface ICommentRepository
    {
        IEnumerable<Comment> Comments { get; }
        IEnumerable<Comment> ByPostId(int? id);
        IEnumerable<Comment> RangeByPostId(int? id, int? commentCount, int? amount);
        int CountByPostId(int? id);
        Comment ById(int? id);
        int SaveComment(Comment comment);
        void DeleteComment(Comment comment);
    }
}
