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
        private IPostRepository postRepo;
        private CurrentProfile currentProfile;

        public ApiCommentController(
            ICommentRepository commentRepo,
            IProfileRepository profileRepo,
            IImageRepository imageRepo,
            IFriendRepository friendRepo,
            ILikeRepository likeRepo,
            IPostRepository postRepo,
            CurrentProfile currentProfile)
        {
            this.commentRepo = commentRepo;
            this.profileRepo = profileRepo;
            this.imageRepo = imageRepo;
            this.friendRepo = friendRepo;
            this.likeRepo = likeRepo;
            this.postRepo = postRepo;
            this.currentProfile = currentProfile;
        }

        //-----------------------------------------ROUTING---------------------------------------------//

        [HttpPost("refreshcomments/{postId}/{take}/{feedFilter}/{feedType}")]
        public List<CommentModel> RefreshComments([FromBody] CommentReferencesModel comments, int postId, int take, string feedFilter, string feedType)
        {
            // Create list to compare to commentIds.
            List<CommentModel> currentCommentResults = GetCommentModels(postId, 0, comments.commentIds.Length, feedFilter, feedType);

            // Loop through currentComentResults and commentIds and compare them.
            for (int i = 0; i < comments.commentIds.Length; i++)
            {
                // If a mismatch is found, the results have change, so return the current comment results.
                if (currentCommentResults[i].CommentId   != comments.commentIds[i] ||
                    currentCommentResults[i].Likes.Count != comments.likeCounts[i] || 
                    currentCommentResults[i].Content     != comments.contents[i]
                )
                {
                    return GetCommentModels(postId, 0, take, feedFilter, feedType);
                }
            }
            return null;
        }

        // Get comment count by PostId XXX shouldn't this go in ApiPostController??
        [HttpGet("commentcount/{id}")]
        public int CommentCount(int id) => commentRepo.Comments.Where(c => c.PostId == id).Count();

        // Delete comment by CommentId
        [HttpPost("deletecomment/{id}")]
        public void DeleteComment(int id)
        {
            Comment comment = commentRepo.ById(id); // get comment by CommentId

            if(comment.ProfileId == currentProfile.id) // validate user ownership of comment
            {
                List<Like> likes = new List<Like>(); // prepare list

                // get likes belonging to this comment 
                // (type 2 is comment likes)
                // XXX use enumeration instead of magic numbers for type
                foreach(Like l in likeRepo.ByTypeAndId(2, id)) { likes.Add(l); }

                // after retrieve operation, delete each retrieved like
                foreach(Like l in likes) { likeRepo.DeleteLike(l); }

                // delete comment retrieved by CommentId
                commentRepo.DeleteComment(commentRepo.ById(id));
            }

        }

        // replace text value of comment with provided id with text provided in request body
        [HttpPost("updatecomment/{id}")]
        public void UpdateComment([FromBody] StringModel content, int id)
        {
            Comment comment = commentRepo.ById(id); // get comment by CommentId

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

            // Prep list for matches. Each index contains a key value pair of <ProfileID, searchPoints>.
            List<KeyValuePair<int, int>> matches = new List<KeyValuePair<int, int>>();

            // Split search terms into array of search terms.
            string[] searchTerms = searchText.str.Split(' ');

            // Define how many points an exact match is worth.
            int exactMatchWorth = 3;

            // Loop though all profiles in the database.
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
            List<CommentModel> results = new List<CommentModel>();

            // Loop through matches.
            foreach (KeyValuePair<int, int> match in matches)
            {
                // Add preped result to results.
                results.Add(GetCommentModel(match.Key));
            }

            // Return search results to user.
            return results;
        }

        // get list of comments by id, skip, take
        [HttpGet("postcomments/{id}/{commentCount}/{amount}/{feedFilter}/{feedType}")]
        public List<CommentModel> PostComments(int id, int commentCount, int amount, string feedFilter, string feedType)
        {
            return GetCommentModels(id, commentCount, amount, feedFilter, feedType);
        }

        // get comment by id
        [HttpGet("{id}")]
        public CommentModel GetComment(int id) => GetCommentModel(id);
        
        // create comment from text provided in request body, current datetime, and current user id
        [HttpPost]
        public CommentModel CreateComment([FromBody] Comment comment)
        {
            // content length is verified
            if (comment.Content.Length > 0 && comment.Content.Length <= 125) // if comment is 1-125 chars long
            {
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

            List<CommentModel> commentModels = new List<CommentModel>(); // prepare list
            if (skip < comments.Count()) // if user has not reached end of comments
            {
                if (feedFilter == "recent")
                {
                    foreach (Comment c in comments // get comment results
                        .OrderByDescending(c => c.DateTime)
                        .Skip(skip)
                        .Take(take)) 
                    {
                        commentModels.Add(GetCommentModel(c.CommentId)); // prep comment and add to returning list
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
                        commentModels.Add(GetCommentModel(c.CommentId));
                    }
                }
            }
            else return null; // if user has reached end of comments, return null
            
            return commentModels; // return preped comment results
        }

        // prep comment to be sent to client
        public CommentModel GetCommentModel(int id)
        {
            Comment comment = commentRepo.ById(id); // get comment by CommentId
            if (comment == null) return null; // if no comment was found, return null
            Profile profile = profileRepo.ById(comment.ProfileId); // get handle on owner of comment
            LikeModel likes = new LikeModel // attach info for likes
            {
                ContentId = id, // link like data to parent comment by CommentId
                ContentType = 2,
                Count = likeRepo.CountByContentId(2, id), // set like count by CommentId
                HasLiked = likeRepo.HasLiked(2, id, currentProfile.id) // determine if user has like and assign value
            };

            return new CommentModel // fill with data from comment and likeModel
            {
                CommentId = comment.CommentId,
                Content = comment.Content,
                HasSeen = comment.HasSeen,

                // attach prepped ProfileModel XXX shouldn't need to enter all this data about the user
                Profile = Util.GetProfileModel(profile, imageRepo.ById(profile.ProfilePicture), friendRepo.RelationToUser(currentProfile.id, profile.ProfileId)),
                DateTime = comment.DateTime.ToLocalTime(),
                Likes = likes,
                PostId = comment.PostId
            };
        }
    }
}