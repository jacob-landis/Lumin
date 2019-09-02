using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Models;
using SocialMedia.Models.ViewModels;

namespace SocialMedia.Controllers
{
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

        [HttpGet("likes/{contentType}/{contentId}")]
        public LikeModel GetCommentLikes(int contentType, int contentId) =>
            new LikeModel
            {
                ContentId = contentId,
                Count = likeRepo.CountByContentId(contentType, contentId),
                HasLiked = likeRepo.HasLiked(contentType, contentId, currentProfile.id)
            };

        [HttpPost("unlike/{contentType}/{contentId}")]
        public void Unlike(int contentType, int contentId)
        {
            likeRepo.DeleteLike(likeRepo.Likes.First(l => 
                l.ContentType == contentType
                && l.ContentId == contentId
                && l.ProfileId == currentProfile.id
            ));
        }

        [HttpPost("like/{contentType}/{contentId}")]
        public void Like(int contentType, int contentId)
        {
            Like like = new Like
            {
                DateTime = DateTime.UtcNow,
                ProfileId = currentProfile.id,
                ContentType = contentType,
                ContentId = contentId
            };
            likeRepo.SaveLike(like);
        }
    }
}