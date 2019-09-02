using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Infrastructure;
using SocialMedia.Models;
using SocialMedia.Models.ViewModels;

namespace SocialMedia.Controllers
{
    [Route("api/[controller]")]
    public class ApiPostController : Controller
    {
        private IPostRepository postRepo;
        private IProfileRepository profileRepo;
        private IImageRepository imageRepo;
        private IFriendRepository friendRepo;
        private ILikeRepository likeRepo;
        private ICommentRepository commentRepo;
        private CurrentProfile currentProfile;

        public ApiPostController(
            IPostRepository postRepo,
            IProfileRepository profileRepo,
            IImageRepository imageRepo,
            IFriendRepository friendRepo,
            ILikeRepository likeRepo,
            ICommentRepository commentRepo,
            CurrentProfile currentProfile)
        {
            this.postRepo = postRepo;
            this.profileRepo = profileRepo;
            this.imageRepo = imageRepo;
            this.friendRepo = friendRepo;
            this.likeRepo = likeRepo;
            this.commentRepo = commentRepo;
            this.currentProfile = currentProfile;
        }

        //-----------------------------------------ROUTING---------------------------------------------//

        [HttpPost("deletepost/{id}")]
        public void DeletePost(int id)
        {
            Post post = postRepo.ById(id);

            // post ownership is verified
            if(post.ProfileId == currentProfile.id)
            {
                List<Comment> comments = new List<Comment>();
                foreach (Comment c in commentRepo.ByPostId(id)) { comments.Add(c); }
                foreach (Comment c in comments)
                {
                    List<Like> commentLikes = new List<Like>();
                    foreach (Like l in likeRepo.ByTypeAndId(2, c.CommentId)) { commentLikes.Add(l); }
                    foreach (Like l in commentLikes) { likeRepo.DeleteLike(l); }

                    commentRepo.DeleteComment(c);
                }

                List<Like> postLikes = new List<Like>();
                foreach (Like l in likeRepo.ByTypeAndId(1, id)) { postLikes.Add(l); }
                foreach (Like l in postLikes) { likeRepo.DeleteLike(l); }

                postRepo.DeletePost(postRepo.ById(id));
            }
        }

        [HttpPost("updatepost/{id}")]
        public void UpdatePost([FromBody] StringModel caption, int id)
        {
            Post post = postRepo.ById(id);

            // caption length and post ownership are verified
            if(caption.str.Length <= 1000 && post.ProfileId == currentProfile.id)
            {
                post.Caption = Util.Sanitize(caption.str);
                postRepo.SavePost(post);
            }
        }

        [HttpGet("profileposts/{id}/{postCount}/{amount}")]
        public List<PostModel> ProfilePosts(int id, int postCount, int amount) => 
            postCount < postRepo.CountByProfileId(id) ? PostRange(GetProfilePosts(id), postCount, amount) : null;

        [HttpGet("publicposts/{postCount}/{amount}")]
        public List<PostModel> PublicPosts(int postCount, int amount)
        {
            List<int?> profileIds = friendRepo.ProfileFriends(currentProfile.id);
            profileIds.Add(currentProfile.id); // redirect if id == 0
            List<PostModel> posts = new List<PostModel>();
            foreach (int p in profileIds)
            {
                foreach(PostModel pm in GetProfilePosts(p)) { posts.Add(pm); }
            }
            return postCount < posts.Count() ? PostRange(posts, postCount, amount) : null;
        }

        [HttpGet("{id}")]
        public PostModel GetPost(int id) => GetPostModel(id);

        [HttpPost]
        public PostModel PostPost([FromBody] Post post)
        {
            // caption length and image ownership is verified
            if (post.Caption.Length <= 1000 && (imageRepo.ById(post.ImageId).ProfileId == currentProfile.id || post.ImageId == 0))
            {
                //post.DateTime = DateTime.UtcNow;
                post.DateTime = DateTime.UtcNow;
                post.ProfileId = currentProfile.id; // redirect if id == 0
                post.Caption = Util.Sanitize(post.Caption);
                return GetPostModel(postRepo.SavePost(post));
            }
            else return null;
        }

//-----------------------------------------UTIL---------------------------------------------//

        public List<PostModel> PostRange(List<PostModel> posts, int postCount, int amount) =>
            posts.OrderByDescending(p => p.DateTime).Skip(postCount).Take(postCount + amount).ToList();

        public List<PostModel> GetProfilePosts(int id)
        {
            List<PostModel> postModels = new List<PostModel>();
            IEnumerable<Post> posts = postRepo.ByProfileId(id);
            if (posts != null)
            {
                foreach (Post p in posts) { postModels.Add(GetPostModel(p.PostId)); }
            }
            return postModels;
        }

        public PostModel GetPostModel(int id)
        {
            Post post = postRepo.ById(id);
            Profile profile = profileRepo.ById(post.ProfileId);
            Image profilePicture = imageRepo.ById(profile.ProfilePicture);

            PostModel postModel = new PostModel
            {
                PostId = post.PostId,
                Caption = post.Caption,
                DateTime = post.DateTime.ToLocalTime(),
                Profile = Util.GetProfileModel(profile, profilePicture, friendRepo.RelationToUser(currentProfile.id, profile.ProfileId)),
                Likes = new LikeModel
                {
                    ContentId = id,
                    Count = likeRepo.CountByContentId(1, id),
                    HasLiked = likeRepo.HasLiked(1, id, currentProfile.id)
                },
                Image = Util.GetRawImage(imageRepo.ById(post.ImageId), false)
            };
            if (post.ImageId == 0) postModel.Image = null;
            else postModel.Image = Util.GetRawImage(imageRepo.ById(post.ImageId), false);

            return postModel;
        }
    }
}