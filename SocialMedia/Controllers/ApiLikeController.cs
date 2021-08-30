using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Models;
using SocialMedia.Models.ViewModels;

namespace SocialMedia.Controllers
{
    /*
        Handles the creation and deletion of like records and serves like data (the count, and whether the user has liked the content).
        Post likes and comment likes are handled here.
        PostLike = 0
        CommentLike = 1
        XXX use enumeration!
    */
    [Route("api/[controller]")]
    public class ApiLikeController : Controller
    {
        private ILikeRepository likeRepo;
        private IPostRepository postRepo;
        private IFriendRepository friendRepo;
        private CurrentProfile currentProfile;

        public ApiLikeController(
            ILikeRepository likeRepo,
            IPostRepository postRepo,
            IFriendRepository friendRepo,
            CurrentProfile currentProfile)
        {
            this.likeRepo = likeRepo;
            this.postRepo = postRepo;
            this.friendRepo = friendRepo;
            this.currentProfile = currentProfile;
        }

        /*
             Returns the number of likes for a post or comment and wether the user has liked the post or comment.
             The PostID or CommentID is also attached.
        */
        [HttpGet("likes/{contentType}/{contentId}")]
        public LikeModel GetContentLikes(int contentType, int contentId)
        {
            // If like is for a post.
            if (contentType == 0)
            {
                Post post = postRepo.ById(contentId);

                // If the current user does not have access to the post, return null.
                if (post.PrivacyLevel > friendRepo.RelationshipTier(currentProfile.id, post.ProfileId)) return null;
            }

            LikeModel likeModel = new LikeModel
            {
                ContentId = contentId,
                ContentType = contentType,
                Count = likeRepo.CountByContentId(contentType, contentId),
                HasLiked = likeRepo.HasLiked(contentType, contentId, currentProfile.id),
                DateTime = likeRepo.ByTypeAndProfileId(contentType, contentId, currentProfile.id).DateTime
            };

            return likeModel;
        }

        /*
            Deletes like record by LikeID and Type.   
        */
        [HttpPost("unlike/{contentType}/{contentId}")]
        public void Unlike(int contentType, int contentId)
        {
            likeRepo.DeleteLike(likeRepo.Likes.First(l => 
                l.ContentType == contentType
                && l.ContentId == contentId
                && l.ProfileId == currentProfile.id
            ));
        }

        /*
             Creates like record.
        */
        [HttpPost("like/{contentType}/{contentId}")]
        public void Like(int contentType, int contentId)
        {
            // If the user has already liked this content, return.
            if (!likeRepo.Likes.Any(l => l.ContentId == contentId && l.ContentType == contentType)) return;

            // If like is for a post.
            if (contentType == 0)
            {
                Post post = postRepo.ById(contentId);

                // If the current user does not have access to the post, return.
                if (post.PrivacyLevel > friendRepo.RelationshipTier(currentProfile.id, post.ProfileId)) return;
            }

            Like like = new Like
            {
                DateTime = DateTime.UtcNow, // Current datetime.
                ProfileId = currentProfile.id, // Current user's ProfileID
                ContentType = contentType, // Like type (post, comment)
                ContentId = contentId // PostID or CommentID
            };

            // Save like record to database.
            likeRepo.SaveLike(like);
        }
    }
}