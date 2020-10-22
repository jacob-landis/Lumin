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
        private CurrentProfile currentProfile;

        public ApiLikeController(ILikeRepository likeRepo, CurrentProfile currentProfile)
        {
            this.likeRepo = likeRepo;
            this.currentProfile = currentProfile;
        }

        /*
             Returns the number of likes for a post or comment and wether the user has liked the post or comment.
             The PostID or CommentID is also attache.
        */
        [HttpGet("likes/{contentType}/{contentId}")]
        public LikeModel GetCommentLikes(int contentType, int contentId) =>
            new LikeModel
            {
                ContentId = contentId,
                Count = likeRepo.CountByContentId(contentType, contentId),
                HasLiked = likeRepo.HasLiked(contentType, contentId, currentProfile.id)
            };

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
            // XXX Confirm that use has not already liked!!!
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