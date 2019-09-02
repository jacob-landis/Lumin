using SocialMedia.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class EFCommentRepository : ICommentRepository
    {
        private ApplicationDbContext context;
        public IEnumerable<Comment> Comments => context.Comments;

        public IEnumerable<Comment> ByPostId(int? id) => context.Comments.Where(c => c.PostId == id);

        public IEnumerable<Comment> RangeByPostId(int? id, int? commentCount, int? amount) => context.Comments
            .Where(c => c.PostId == id)
            .OrderByDescending(c => c.DateTime)
            .Skip((int)commentCount)
            .Take((int)amount);

        public int CountByPostId(int? id) => context.Comments.Where(c => c.PostId == id).Count();

        public Comment ById(int? id) => context.Comments.FirstOrDefault(c => c.CommentId == id);

        public EFCommentRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public int SaveComment(Comment comment)
        {
            if (comment.CommentId == 0) context.Comments.Add(comment);
            else context.Comments.Update(comment);
            context.SaveChanges();
            return comment.CommentId;
        }

        public void DeleteComment(Comment comment)
        {
            context.Comments.Remove(comment);
            context.SaveChanges();
        }
    }
}
