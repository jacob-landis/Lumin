using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public interface IPostRepository
    {
        IEnumerable<Post> Posts { get; }
        Post ById(int id);
        IEnumerable<Post> ByProfileId(int id);
        int CountByProfileId(int id);
        int SavePost(Post post);
        void DeletePost(Post post);
    }
}
