﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Infrastructure;
using SocialMedia.Models;
using SocialMedia.Models.Session;
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
        private SessionResults sessionResults;
        private CurrentProfile currentProfile;

        public ApiPostController(
            IPostRepository postRepo,
            IProfileRepository profileRepo,
            IImageRepository imageRepo,
            IFriendRepository friendRepo,
            ILikeRepository likeRepo,
            ICommentRepository commentRepo,
            SessionResults sessionResults,
            CurrentProfile currentProfile)
        {
            this.postRepo = postRepo;
            this.profileRepo = profileRepo;
            this.imageRepo = imageRepo;
            this.friendRepo = friendRepo;
            this.likeRepo = likeRepo;
            this.commentRepo = commentRepo;
            this.sessionResults = sessionResults;
            this.currentProfile = currentProfile;
        }

        //-----------------------------------------ROUTING---------------------------------------------//

        /*
             Delete a post and it's dependencies by PostID.
        */
        [HttpPost("deletepost/{postId}")]
        public void DeletePost(int postId)
        {
            // Get handle on post by PostID.
            Post post = postRepo.ById(postId);

            // If current user owns post, delete it.
            if (post.ProfileId == currentProfile.id)
            {
                // Burrow into the nested dependencies and delete them on the way out.
                // Pattern: (1)prep list, (2)fill list, (3)loop list, (4)repeat pattern on dependencies, (5)delete record.

                List<Comment> comments = new List<Comment>(); // (1)Prep list.
                foreach (Comment c in commentRepo.ByPostId(postId)) { comments.Add(c); } // (2)Fill list.
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
                foreach (Like l in likeRepo.ByTypeAndId(1, postId)) { postLikes.Add(l); }
                foreach (Like l in postLikes)
                {
                    likeRepo.DeleteLike(l);
                }

                // (5)Delete record.
                postRepo.DeletePost(postRepo.ById(postId));
            }
        }

        [HttpPost("updatepostprivacy/{postId}/{privacyLevel}")]
        public void UpdatePostPrivacy(int postId, int privacyLevel)
        {
            Post post = postRepo.ById(postId);

            if (post.ProfileId == currentProfile.id)
            {
                post.PrivacyLevel = privacyLevel;
                postRepo.SavePost(post);
            }
        }

        /*
             Update the caption of a post.
        */
        [HttpPost("updatepost/{postId}")]
        public void UpdatePost([FromBody] StringModel caption, int postId)
        {
            // Get handle on post by provided PostID.
            Post post = postRepo.ById(postId);

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
        [HttpGet("profileposts/{profileId}/{skip}/{take}/{feedFilter}/{feedType}")]
        public List<PostModel> ProfilePosts(int profileId, int skip, int take, string feedFilter, string feedType)
        {
            string resultsKey = "profilePosts";
            
            // If a new feed is starting and the user has access permission.
            if (skip == 0)
            {
                IEnumerable<Post> posts = new List<Post>();
                
                switch (feedType)
                {
                    case "commentedPosts":
                        posts = postRepo.Posts.Where(p => p.ProfileId == profileId && 
                        (
                            commentRepo.HasCommented(p.PostId, currentProfile.id)
                            || commentRepo.ByPostId(p.PostId).Any(c => likeRepo.HasLiked(2, c.CommentId, currentProfile.id))
                        ));
                        break;

                    case "likedPosts":
                        posts = postRepo.Posts.Where(p => p.ProfileId == profileId && likeRepo.HasLiked(1, p.PostId, currentProfile.id));
                        break;

                    case "mainPosts":
                        posts = postRepo.Posts.Where(p => p.ProfileId == profileId);
                        break;
                }

                switch (feedFilter)
                {
                    case "recent":
                        posts = posts.OrderByDescending(p => p.DateTime);
                        break;

                    case "likes":
                        posts = posts
                            .OrderByDescending(p => p.DateTime)
                            .OrderByDescending(p => likeRepo.CountByContentId(1, p.PostId));
                        break;

                    case "comments":
                        posts = posts
                            .OrderByDescending(p => p.DateTime)
                            .OrderByDescending(p => commentRepo.CountByPostId(p.PostId));
                        break;
                }

                // Sorting by HasCommentActivity must happen after sorting by DateTime.
                if (feedType == "CommentedPosts") posts = posts
                        .OrderByDescending(p => commentRepo.HasCommented(p.PostId, currentProfile.id));

                // Store list of post ids.
                List<int?> postIds = new List<int?>();
                foreach (Post p in posts) postIds.Add(p.PostId);
                sessionResults.AddResults(resultsKey, postIds);
            }

            List<PostModel> postModels = new List<PostModel>();

            foreach (int postId in sessionResults.GetResultsSegment(resultsKey, skip, take))
            {
                postModels.Add(GetPostModel(postId));
            }

            return postModels;
        }

        /*
             Returns a portion of the current user's public post feed. Used for lazy loading.
        */
        [HttpGet("publicposts/{skip}/{take}")]
        public List<PostModel> PublicPosts(int skip, int take)
        {
            string resultsKey = "publicPosts";

            if (skip == 0)
            {
                // Get list of ProfileIDs (the current user's friends), and the current user's ProfileID.
                List<int?> profileIds = friendRepo.ProfileFriends(currentProfile.id);
                profileIds.Add(currentProfile.id);

                // Prep list for prepped posts.
                List<Post> posts = new List<Post>();

                // Loop through ProfileID list.
                foreach (int profileId in profileIds)
                {
                    // Try getting results before looping and adding them.
                    IEnumerable<Post> profilePosts = postRepo.ByProfileId(profileId);

                    // If posts were found.
                    if (profilePosts != null && profilePosts.Count() > 0)
                        // Loop through each profile's posts and add them to the list of posts.
                        foreach(Post post in profilePosts) { posts.Add(post); }
                }

                // Store list of post ids.
                List<int?> postIds = new List<int?>();
                foreach (Post p in posts.OrderByDescending(p => p.DateTime)) postIds.Add(p.PostId);
                sessionResults.AddResults(resultsKey, postIds);
            }

            List<PostModel> postModels = new List<PostModel>();

            foreach(int postId in sessionResults.GetResultsSegment(resultsKey, skip, take))
            {
                postModels.Add(GetPostModel(postId));
            }

            return postModels;
        }

        [HttpPost("searchposts/{profileId}/{skip}/{take}")]
        public List<PostModel> SearchPosts(int profileId, int skip, int take, [FromBody] StringModel searchText)
        {
            if (searchText.str == "NULL") return null;

            string resultsKey = "postSearch";

            if (skip == 0)
            {
                // Prep list for matches. Each index contains a key value pair of <ProfileId, searchPoints>.
                List<KeyValuePair<int, int>> matches = new List<KeyValuePair<int, int>>();

                // Split search terms into array of search terms.
                string[] searchTerms = searchText.str.Split(' ');

                // Define how many points an exact match is worth.
                int exactMatchWorth = 3;

                // Loop though all profiles in the database.
                foreach (Post p in postRepo.ByProfileId(profileId))
                {
                    if (p.Caption == "" || p.Caption == null) continue;

                    // Define points variable and start it at 0.
                    int points = 0;

                    string[] contentTerms = p.Caption.Split(' ');

                    foreach (string contentTerm in contentTerms)
                    {
                        string lcContentTerm = contentTerm.ToLower();

                        // Loop through search terms.
                        foreach (string searchTerm in searchTerms)
                        {
                            // Convert search term to lowercase.
                            string lcSearchTerm = searchTerm.ToLower();

                            // If the terms are an exact match, add an exact match worth of points.
                            if (lcSearchTerm == lcContentTerm) points += exactMatchWorth;

                            // Else if the terms are a partial match, add 1 point.
                            else if (lcSearchTerm.Contains(lcContentTerm) || lcContentTerm.Contains(lcSearchTerm)) points++;
                        }
                    }

                    // If the comment earned any points, add its id to the list of matches.
                    if (points > 0) matches.Add(new KeyValuePair<int, int>(p.PostId, points));
                }

                // Sort match results by points.
                matches.Sort((pair1, pair2) => pair1.Value.CompareTo(pair2.Value));

                // Prep list for preped results.
                List<int?> postIds = new List<int?>();

                // Loop through matches.
                foreach (KeyValuePair<int, int> match in matches)
                {
                    // Add preped result to results.
                    postIds.Add(match.Key);
                }

                sessionResults.AddResults(resultsKey, postIds);
            }

            // Prep list for preped results.
            List<PostModel> postModels = new List<PostModel>();
            
            foreach (int postId in sessionResults.GetResultsSegment(resultsKey, skip, take))
            {
                postModels.Add(GetPostModel(postId));
            }

            // Return search results to user.
            return postModels;
        }

        /*
             Get a single post by PostID.
        */
        [HttpGet("{postId}")]
        public PostModel GetPost(int postId) => GetPostModel(postId);

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
                post.ProfileId = currentProfile.id;
                post.Caption = Util.Sanitize(post.Caption);

                // Commit the post to the database and return a prepped version of it to the user.
                return GetPostModel(postRepo.SavePost(post));
            }
            // If the caption was too long, or the image was not owned by the current user, return null.
            else return null;
        }

        //-----------------------------------------UTIL---------------------------------------------//
        
        /*
             Preps a post to be sent back to the user.
        */
        public PostModel GetPostModel(int postId)
        {
            // Get handle on post by PostID.
            Post post = postRepo.ById(postId);

            // Get handle on post owner by ProfileID
            Profile profile = profileRepo.ById(post.ProfileId);

            int relationshipTier = friendRepo.RelationshipTier(currentProfile.id, profile.ProfileId);

            if (post.PrivacyLevel <= relationshipTier)
            {
                string relationToUser = friendRepo.RelationToUser(currentProfile.id, profile.ProfileId);
                DateTime? relationChangeDatetime = friendRepo.RelationshipChangeDatetime(currentProfile.id, postId);
                int? blockerProfileId = friendRepo.BlockerProfileId(currentProfile.id, postId);

                // Get handle on profile picture of owner of post.
                Image profilePicture = imageRepo.ById(profile.ProfilePicture);

                ProfileModel profileModel = Util.GetProfileModel(
                    profile, profilePicture, relationToUser, relationshipTier, relationChangeDatetime, blockerProfileId);

                RawImage postImage = Util.GetRawImage(imageRepo.ById(post.ImageId), 2);

                int count = likeRepo.CountByContentId(1, postId);
                bool hasLiked = likeRepo.HasLiked(1, postId, currentProfile.id);

                Like like = likeRepo.ByTypeAndProfileId(1, postId, currentProfile.id);
                DateTime dateTime = new DateTime();
                if (like != null) dateTime = like.DateTime.ToLocalTime();

                LikeModel likes = new LikeModel
                {
                    ContentId = postId,
                    ContentType = 1,
                    Count = count,
                    HasLiked = hasLiked,
                    DateTime = dateTime
                };

                // Prep post.
                PostModel postModel = new PostModel
                {
                    // Details from post record.
                    PostId = post.PostId,
                    Caption = post.Caption,
                    DateTime = post.DateTime.ToLocalTime(),
                    Profile = profileModel,
                    Likes = likes,
                    Image = postImage
                };

                // If the post does not have an image, set the image field to null.
                if (post.ImageId == 0) postModel.Image = null;

                // Else attach prepped image.
                else postModel.Image = Util.GetRawImage(imageRepo.ById(post.ImageId), 2, true);

                // Return prepped post to caller.
                return postModel;
            }
            return null;
        }
    }
}