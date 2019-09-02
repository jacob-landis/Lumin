using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Infrastructure;
using SocialMedia.Models;
using SocialMedia.Models.ViewModels;

namespace SocialMedia.Controllers
{
    [Route("api/[controller]")]
    public class ApiCommentController : Controller
    {
        private ICommentRepository commentRepo;
        private IProfileRepository profileRepo;
        private IImageRepository imageRepo;
        private IFriendRepository friendRepo;
        private ILikeRepository likeRepo;
        private CurrentProfile currentProfile;

        public ApiCommentController(
            ICommentRepository commentRepo,
            IProfileRepository profileRepo,
            IImageRepository imageRepo,
            IFriendRepository friendRepo,
            ILikeRepository likeRepo,
            CurrentProfile currentProfile)
        {
            this.commentRepo = commentRepo;
            this.profileRepo = profileRepo;
            this.imageRepo = imageRepo;
            this.friendRepo = friendRepo;
            this.likeRepo = likeRepo;
            this.currentProfile = currentProfile;
        }

        //-----------------------------------------ROUTING---------------------------------------------//

        [HttpGet("commentcount/{id}")]
        public int CommentCount(int id) => commentRepo.Comments.Where(c => c.PostId == id).Count();

        [HttpPost("deletecomment/{id}")]
        public void DeleteComment(int id)
        {
            Comment comment = commentRepo.ById(id);

            if(comment.ProfileId == currentProfile.id)
            {
                List<Like> likes = new List<Like>();
                foreach(Like l in likeRepo.ByTypeAndId(2, id)) { likes.Add(l); }
                foreach(Like l in likes) { likeRepo.DeleteLike(l); }

                commentRepo.DeleteComment(commentRepo.ById(id));
            }

        }

        [HttpPost("updatecomment/{id}")]
        public void UpdateComment([FromBody] StringModel content, int id)
        {
            Comment comment = commentRepo.ById(id);

            // content length and comment ownership is verified
            if (content.str.Length <= 125 && comment.ProfileId == currentProfile.id)
            {
                comment.Content = Util.Sanitize(content.str);
                commentRepo.SaveComment(comment);
            }
        }

        [HttpGet("postcomments/{id}/{commentCount}/{amount}")]
        public List<CommentModel> PostComments(int id, int commentCount, int amount)
        {
            List<CommentModel> comments = new List<CommentModel>();
            if (commentCount < commentRepo.CountByPostId(id))
            {
                foreach (Comment c in commentRepo.RangeByPostId(id, commentCount, amount))
                {
                    comments.Add(GetCommentModel(c.CommentId));
                }
            }
            else return null;

            return comments;
        }

        [HttpGet("{id}")]
        public CommentModel GetComment(int id) => GetCommentModel(id);
        
        // create comment
        [HttpPost]
        public CommentModel CreateComment([FromBody] Comment comment)
        {
            // content length is verified
            if (comment.Content.Length <= 125)
            {
                comment.DateTime = DateTime.UtcNow;
                comment.ProfileId = currentProfile.id;
                comment.Content = Util.Sanitize(comment.Content);
                return GetCommentModel(commentRepo.SaveComment(comment));
            }
            else return null;
        }

        //-----------------------------------------UTIL---------------------------------------------//

        public CommentModel GetCommentModel(int id)
        {
            Comment comment = commentRepo.ById(id);
            if (comment == null) return null;
            Profile profile = profileRepo.ById(comment.ProfileId);
            LikeModel likes = new LikeModel
            {
                ContentId = id,
                Count = likeRepo.CountByContentId(2, id),
                HasLiked = likeRepo.HasLiked(2, id, currentProfile.id)
            };

            return new CommentModel
            {
                CommentId = comment.CommentId,
                Content = comment.Content,
                Profile = Util.GetProfileModel(profile, imageRepo.ById(profile.ProfilePicture), friendRepo.RelationToUser(currentProfile.id, profile.ProfileId)),
                DateTime = comment.DateTime.ToLocalTime(),
                Likes = likes,
                PostId = comment.PostId
            };
        }
    }
}