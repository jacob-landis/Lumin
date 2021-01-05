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
    /*
        Handles CRUD operations for posts.
        Posts have either a caption, an image, or both.
        Only the caption can be edited.
        Routes are availble for getting main feed posts and personal feed posts (both of which support lazy loading), and individual posts.
        Post dependencies are deleted with posts.
    */
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

        /*
             Delete a post and it's dependencies by PostID.
        */
        [HttpPost("deletepost/{id}")]
        public void DeletePost(int id)
        {
            // Get handle on post by PostID.
            Post post = postRepo.ById(id);

            // If current user owns post, delete it.
            if(post.ProfileId == currentProfile.id)
            {
                // Burrow into the nested dependencies and delete them on the way out.
                // Pattern: (1)prep list, (2)fill list, (3)loop list, (4)repeat pattern on dependencies, (5)delete record.

                List<Comment> comments = new List<Comment>(); // (1)Prep list.
                foreach (Comment c in commentRepo.ByPostId(id)) { comments.Add(c); } // (2)Fill list.
                foreach (Comment c in comments) // (3)Loop list.
                {
                    // (4)Repeat pattern on dependencies.
                    List<Like> commentLikes = new List<Like>();
                    foreach (Like l in likeRepo.ByTypeAndId(2, c.CommentId)) { commentLikes.Add(l); }
                    foreach (Like l in commentLikes)
                    {
                        likeRepo.DeleteLike(l);
                    }

                    commentRepo.DeleteComment(c);
                }

                List<Like> postLikes = new List<Like>();
                foreach (Like l in likeRepo.ByTypeAndId(1, id)) { postLikes.Add(l); }
                foreach (Like l in postLikes)
                {
                    likeRepo.DeleteLike(l);
                }

                // (5)Delete record.
                postRepo.DeletePost(postRepo.ById(id));
            }
        }

        /*
             Update the caption of a post.
        */
        [HttpPost("updatepost/{id}")]
        public void UpdatePost([FromBody] StringModel caption, int id)
        {
            // Get handle on post by provided PostID.
            Post post = postRepo.ById(id);

            // caption length and post ownership are verified
            // If the provided caption length is not too long and the post belongs to the current user's profile, update post.
            if(caption.str.Length <= 1000 && post.ProfileId == currentProfile.id)
            {
                // Set caption to the sanitized provided caption.
                post.Caption = Util.Sanitize(caption.str);

                // Commit change to database.
                postRepo.SavePost(post);
            }
        }

        /*
             Returns a portion of a profile's posts. Used for lazy loading.
        */
        [HttpGet("profileposts/{id}/{postCount}/{amount}")]
        public List<PostModel> ProfilePosts(int id, int postCount, int amount) => 
            // If there are more posts than the user requested, only return the amount requested, or else return none. XXX this logic smells funny.
            postCount < postRepo.CountByProfileId(id) ? PostRange(GetProfilePosts(id), postCount, amount) : null;

        /*
             Returns a portion of the current user's public post feed. Used for lazy loading.
        */
        [HttpGet("publicposts/{postCount}/{amount}")]
        public List<PostModel> PublicPosts(int postCount, int amount)
        {
            // Get list of ProfileIDs (the current user's friends), and the current user's ProfileID.
            List<int?> profileIds = friendRepo.ProfileFriends(currentProfile.id);
            profileIds.Add(currentProfile.id); // XXX redirect if id == 0

            // Prep list for prepped posts.
            List<PostModel> posts = new List<PostModel>();

            // Loop through ProfileID list.
            foreach (int p in profileIds)
            {
                // Loop through each profile's posts and add them to the list of posts.
                foreach(PostModel pm in GetProfilePosts(p)) { posts.Add(pm); }
            }

            // If there are more posts than the user requested, only return the amount requested, or else return none. XXX this logic smells funny.
            return postCount < posts.Count() ? PostRange(posts, postCount, amount) : null;
        }

        /*
             Get a single post by PostID.
        */
        [HttpGet("{id}")]
        public PostModel GetPost(int id) => GetPostModel(id);

        /*
             Create a post record.
        */
        [HttpPost]
        public PostModel PostPost([FromBody] Post post)
        {
            // If the caption of the provided post is not too long and the attached image is owned by the current user, or there is no image, then create.
            if (post.Caption.Length <= 1000 && (imageRepo.ById(post.ImageId).ProfileId == currentProfile.id || post.ImageId == 0))
            {
                // Set up post information.
                post.DateTime = DateTime.UtcNow;
                post.ProfileId = currentProfile.id; // XXX redirect if id == 0
                post.Caption = Util.Sanitize(post.Caption);

                // Commit the post to the database and return a prepped version of it to the user.
                return GetPostModel(postRepo.SavePost(post));
            }
            // If the caption was too long, or the image was not owned by the current user, return null.
            else return null;
        }

        //-----------------------------------------UTIL---------------------------------------------//

        /*
             Shortcut function taking a segment of a list of posts.
        */
        public List<PostModel> PostRange(List<PostModel> posts, int postCount, int amount) =>
            posts.OrderByDescending(p => p.DateTime).Skip(postCount).Take(postCount + amount).ToList();

        /*
             Returns a prepped list of a profile's posts by ProfileID.
        */
        public List<PostModel> GetProfilePosts(int id)
        {
            // Prep list for prepped posts.
            List<PostModel> postModels = new List<PostModel>();

            // Get list of post records.
            IEnumerable<Post> posts = postRepo.ByProfileId(id);

            // If post records were found, prep them and add them to list.
            if (posts != null)
            {
                // Prep each post and add it to the list.
                foreach (Post p in posts) { postModels.Add(GetPostModel(p.PostId)); }
            }
            return postModels;
        }

        /*
             Preps a post to be sent back to the user.
        */
        public PostModel GetPostModel(int id)
        {
            // Get handle on post by PostID.
            Post post = postRepo.ById(id);

            // Get handle on post owner by ProfileID
            Profile profile = profileRepo.ById(post.ProfileId);

            // Get handle on profile picture of owner of post.
            Image profilePicture = imageRepo.ById(profile.ProfilePicture);

            // Prep post.
            PostModel postModel = new PostModel
            {
                // Details from post record.
                PostId = post.PostId,
                Caption = post.Caption,
                DateTime = post.DateTime.ToLocalTime(),

                // Prep profile card.
                Profile = Util.GetProfileModel(profile, profilePicture, friendRepo.RelationToUser(currentProfile.id, profile.ProfileId)),

                // Prep like card.
                Likes = new LikeModel
                {
                    ContentId = id,
                    ContentType = 1,
                    Count = likeRepo.CountByContentId(1, id),
                    HasLiked = likeRepo.HasLiked(1, id, currentProfile.id)
                },

                // Prep post image. XXX what if it doesn't have an image?
                Image = Util.GetRawImage(imageRepo.ById(post.ImageId), false)
            };

            // If the post does not have an image, set the image field to null.
            if (post.ImageId == 0) postModel.Image = null;

            // Else attach prepped image. XXX I think this is handled above.
            else postModel.Image = Util.GetRawImage(imageRepo.ById(post.ImageId), false);

            // Return prepped post to caller.
            return postModel;
        }
    }
}