using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class EFPostRepository : IPostRepository
    {
        private ApplicationDbContext context;
        public IEnumerable<Post> Posts => context.Posts;

        public Post ById(int id) => context.Posts.First(p => p.PostId == id);
        public IEnumerable<Post> ByProfileId(int id) => context.Posts.Where(p => p.ProfileId == id);
        public int CountByProfileId(int id) => context.Posts.Where(p => p.ProfileId == id).Count();

        public EFPostRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public int SavePost(Post post)
        {
            if(post.PostId == 0) context.Posts.Add(post);
            else context.Posts.Update(post);
            context.SaveChanges();
            return post.PostId;
        }

        public void DeletePost(Post post)
        {
            context.Remove(post);
            context.SaveChanges();
        }
    }
}
