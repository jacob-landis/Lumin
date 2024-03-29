﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Infrastructure;
using SocialMedia.Models;
using SocialMedia.Models.Session;
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
        private IPostRepository postRepo;
        private SessionResults sessionResults;
        private CurrentProfile currentProfile;

        public ApiCommentController(
            ICommentRepository commentRepo,
            IProfileRepository profileRepo,
            IImageRepository imageRepo,
            IFriendRepository friendRepo,
            ILikeRepository likeRepo,
            IPostRepository postRepo,
            SessionResults sessionResults,
            CurrentProfile currentProfile)
        {
            this.commentRepo = commentRepo;
            this.profileRepo = profileRepo;
            this.imageRepo = imageRepo;
            this.friendRepo = friendRepo;
            this.likeRepo = likeRepo;
            this.postRepo = postRepo;
            this.sessionResults = sessionResults;
            this.currentProfile = currentProfile;
        }

        //-----------------------------------------ROUTING---------------------------------------------//

        [HttpPost("refreshcomments/{postId}/{take}/{feedFilter}/{feedType}")]
        public CommentRefreshSummaryModel RefreshComments([FromBody] CommentReferencesModel comments, int postId, int take, string feedFilter, string feedType)
        {
            Post post = postRepo.ById(postId);
            if (post.PrivacyLevel > friendRepo.RelationshipTier(currentProfile.id, post.ProfileId)) return null;

            List<CommentModel> newComments = GetCommentModels(postId, 0, take, feedFilter, feedType);

            CommentRefreshSummaryModel refreshSummary = new CommentRefreshSummaryModel();
            
            if (newComments != null)
            {
                refreshSummary.Comments = newComments;
                refreshSummary.NewLength = newComments.Count;

                // If comment count has not changed, check for changes in the content of the comments.
                if (refreshSummary.NewLength == comments.commentIds.Length)
                {
                    // Loop through currentComentResults and commentIds and compare them.
                    for (int i = 0; i < comments.commentIds.Length; i++)
                    {
                        // If a mismatch is found, the results have changed, so lower the .
                        if (newComments[i].CommentId != comments.commentIds[i] ||
                            newComments[i].Likes.Count != comments.likeCounts[i] ||
                            newComments[i].Content != comments.contents[i]
                        )
                        {
                            refreshSummary.HasChanged = true;
                            break;
                        }
                    }
                }
                else refreshSummary.HasChanged = true;
            }
            // Else if no comments exist but there were comments before.
            else if (comments.commentIds != null && comments.commentIds.Length > 0)
            {
                refreshSummary.HasChanged = true;
            }

            return refreshSummary;
        }

        // Get comment count by PostId.
        [HttpGet("commentcount/{postId}")]
        public int? CommentCount(int postId)
        {
            Post post = postRepo.ById(postId);
            if (post.PrivacyLevel > friendRepo.RelationshipTier(currentProfile.id, post.ProfileId)) return null;

            return commentRepo.Comments.Where(c => c.PostId == postId).Count();
        }

        // Delete comment by CommentId.
        [HttpPost("deletecomment/{commentId}")]
        public void DeleteComment(int commentId)
        {
            Comment comment = commentRepo.ById(commentId); // Get comment by CommentId

            if(comment.ProfileId == currentProfile.id) // validate user ownership of comment
            {
                List<Like> likes = new List<Like>(); // prepare list

                // get likes belonging to this comment 
                // (type 2 is comment likes)
                foreach(Like l in likeRepo.ByTypeAndId(2, commentId)) { likes.Add(l); }

                // after retrieve operation, delete each retrieved like
                foreach(Like l in likes) { likeRepo.DeleteLike(l); }

                // delete comment retrieved by CommentId
                commentRepo.DeleteComment(commentRepo.ById(commentId));
            }

        }

        // replace text value of comment with provided id with text provided in request body
        [HttpPost("updatecomment/{commentId}")]
        public void UpdateComment([FromBody] StringModel content, int commentId)
        {
            Comment comment = commentRepo.ById(commentId); // get comment by CommentId

            // content length and comment ownership is verified
            if (content.str.Length > 0 && content.str.Length <= 125 && comment.ProfileId == currentProfile.id)
            {
                comment.Content = Util.Sanitize(content.str); // replace comment text with sanitized text
                commentRepo.SaveComment(comment); // override comment in database
            }
        }

        [HttpPost("updatecommenthasseen/{commentId}")]
        public void UpdateCommentHasSeen(int commentId)
        {
            Comment comment = commentRepo.ById(commentId);
            Post post = postRepo.ById(comment.PostId);

            if (post.ProfileId == currentProfile.id)
            {
                comment.HasSeen = true;
                commentRepo.SaveComment(comment);
            }
        }

        [HttpPost("searchcomments/{postId}/{skip}/{take}")]
        public List<CommentModel> SearchComments(int postId, int skip, int take, [FromBody] StringModel searchText)
        {
            if (searchText.str == "NULL") return null;

            Post post = postRepo.ById(postId);
            if (post.PrivacyLevel > friendRepo.RelationshipTier(currentProfile.id, post.ProfileId)) return null;

            string resultsKey = $"{postId}commentSearch";

            if (skip == 0)
            {
                // Prep list for matches. Each index contains a key value pair of <CommentId, searchPoints>.
                List<KeyValuePair<int, int>> matches = new List<KeyValuePair<int, int>>();

                // Split search terms into array of search terms.
                string[] searchTerms = searchText.str.Split(' ');

                // Define how many points an exact match is worth.
                int exactMatchWorth = 3;

                // Loop through all profiles in the database.
                foreach (Comment c in commentRepo.ByPostId(postId))
                {
                    // Define points variable and start it at 0.
                    int points = 0;

                    string[] contentTerms = c.Content.Split(' ');

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
                    if (points > 0) matches.Add(new KeyValuePair<int, int>(c.CommentId, points));
                }

                // Sort match results by points.
                matches.Sort((pair1, pair2) => pair1.Value.CompareTo(pair2.Value));

                // Prep list for preped results.
                List<int?> commentIds = new List<int?>();

                // Loop through matches.
                foreach (KeyValuePair<int, int> match in matches)
                {
                    // Add preped result to results.
                    commentIds.Add(match.Key);
                }

                sessionResults.AddResults(resultsKey, commentIds);
            }

            List<CommentModel> commentModels = new List<CommentModel>();

            foreach(int commentId in sessionResults.GetResultsSegment(resultsKey, skip, take))
            {
                commentModels.Add(GetCommentModel(commentId));
            }

            // Return search results to user.
            return commentModels;
        }

        // get list of comments by id, skip, take
        [HttpGet("postcomments/{postId}/{skip}/{take}/{feedFilter}/{feedType}")]
        public List<CommentModel> PostComments(int postId, int skip, int take, string feedFilter, string feedType)
        {
            Post post = postRepo.ById(postId);
            if (post.PrivacyLevel > friendRepo.RelationshipTier(currentProfile.id, post.ProfileId)) return null;

            return GetCommentModels(postId, skip, take, feedFilter, feedType);
        }

        // get comment by id
        [HttpGet("{commentId}")]
        public CommentModel GetComment(int commentId)
        {
            Post post = postRepo.ById(commentRepo.ById(commentId).PostId);
            if (post.PrivacyLevel > friendRepo.RelationshipTier(currentProfile.id, post.ProfileId)) return null;

            return GetCommentModel(commentId);
        }
        
        // create comment from text provided in request body, current datetime, and current user id
        [HttpPost]
        public CommentModel CreateComment([FromBody] Comment comment)
        {
            Post post = postRepo.ById(comment.PostId);
            if (post.PrivacyLevel > friendRepo.RelationshipTier(currentProfile.id, post.ProfileId)) return null;

            // content length is verified
            if (comment.Content.Length > 0 && comment.Content.Length <= 125) // if comment is 1-125 chars long
            {
                // If the post this comment belongs to belongs to the current user, raise hasSeen flag.
                if (post.ProfileId == currentProfile.id) comment.HasSeen = true;

                comment.DateTime = DateTime.UtcNow;  // set DateTime of comment to current DateTime of central time
                comment.ProfileId = currentProfile.id; // set ProfileId of comment to current profile id
                comment.Content = Util.Sanitize(comment.Content); // set Content of comment to the sanitized content provided
                return GetCommentModel(commentRepo.SaveComment(comment)); // save comment to database and return a preped version of it
            }
            else return null; // if length of comment was invalid, return null
        }

        //-----------------------------------------UTIL---------------------------------------------//

        public List<CommentModel> GetCommentModels(int postId, int skip, int take, string feedFilter, string feedType)
        {
            string resultsKey = $"{postId}{feedFilter}{feedType}";

            if (skip == 0)
            {
                IEnumerable<Comment> comments = new List<Comment>();
            
                switch (feedType)
                {
                    case "myComments":
                        comments = commentRepo.Comments.Where(c => c.PostId == postId && c.ProfileId == currentProfile.id);
                        break;
                    case "likedComments":
                        comments = commentRepo.Comments.Where(c => c.PostId == postId && likeRepo.HasLiked(2, c.CommentId, currentProfile.id));
                        break;
                    case "mainComments":
                        comments = commentRepo.Comments.Where(c => c.PostId == postId);
                        break;
                }
                
                List<int?> commentIds = new List<int?>();
                if (skip < comments.Count()) // if user has not reached end of comments
                {
                    if (feedFilter == "recent")
                    {
                        foreach (Comment c in comments // get comment results
                            .OrderByDescending(c => c.DateTime)
                            .Skip(skip)
                            .Take(take)) 
                        {
                            commentIds.Add(c.CommentId);
                        }
                    }
                    else if (feedFilter == "likes")
                    {
                        foreach (Comment c in comments
                            .OrderByDescending(c => c.DateTime)
                            .OrderByDescending(c => likeRepo.CountByContentId(2, c.CommentId))
                            .Skip(skip)
                            .Take(take))
                        {
                            commentIds.Add(c.CommentId);
                        }
                    }

                    sessionResults.AddResults(resultsKey, commentIds);
                }
                else return null; // if user has reached end of comments, return null
            }

            List<CommentModel> commentModels = new List<CommentModel>();

            foreach(int commentId in sessionResults.GetResultsSegment(resultsKey, skip, take))
            {
                commentModels.Add(GetCommentModel(commentId));
            }
            
            return commentModels; // return preped comment results
        }

        // prep comment to be sent to client
        public CommentModel GetCommentModel(int commentId)
        {
            Comment comment = commentRepo.ById(commentId); // get comment by CommentId
            if (comment == null) return null; // if no comment was found, return null
            Profile profile = profileRepo.ById(comment.ProfileId); // get handle on owner of comment

            DateTime? likeDateTime = new DateTime();
            Like like = likeRepo.ByTypeAndProfileId(2, commentId, currentProfile.id);
            if (like != null) likeDateTime = like.DateTime.ToLocalTime();

            LikeModel likes = new LikeModel // attach info for likes
            {
                ContentId = commentId, // link like data to parent comment by CommentId
                ContentType = 2,
                Count = likeRepo.CountByContentId(2, commentId), // set like count by CommentId
                HasLiked = likeRepo.HasLiked(2, commentId, currentProfile.id), // determine if user has like and assign value
                DateTime = likeDateTime
            };

            Image profilePicture = imageRepo.ById(profile.ProfilePicture);
            string relationToUser = friendRepo.RelationToUser(currentProfile.id, profile.ProfileId);
            int relationshipTier = friendRepo.RelationshipTier(currentProfile.id, profile.ProfileId);
            DateTime? relationChangeDateTime = friendRepo.RelationshipChangeDatetime(currentProfile.id, profile.ProfileId);
            int? blockerProfileId = friendRepo.BlockerProfileId(currentProfile.id, profile.ProfileId);

            ProfileModel profileModel = Util.GetProfileModel(
                profile, profilePicture, relationToUser, relationshipTier, relationChangeDateTime, blockerProfileId);

            CommentModel commentModel = new CommentModel // fill with data from comment and likeModel
            {
                CommentId = comment.CommentId,
                Content = comment.Content,
                HasSeen = comment.HasSeen,

                // attach prepped ProfileModel XXX shouldn't need to enter all this data about the user
                Profile = profileModel,

                DateTime = comment.DateTime.ToLocalTime(),
                Likes = likes,
                PostId = comment.PostId
            };

            return commentModel;
        }
    }
}