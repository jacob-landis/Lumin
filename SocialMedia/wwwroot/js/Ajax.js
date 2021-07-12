var Ajax = (function () {
    function Ajax() {
    }
    Ajax.JSONstring = function (string) { return JSON.stringify({ str: string }); };
    Ajax.unlike = function (contentType, contentId) {
        this.call("apilike/unlike/" + contentType + "/" + contentId, "POST");
    };
    Ajax.postLike = function (contentType, contentId) {
        this.call("apilike/like/" + contentType + "/" + contentId, "POST");
    };
    Ajax.deleteComment = function (commentId) {
        this.call("apicomment/deletecomment/" + commentId, "POST");
    };
    Ajax.updateComment = function (commentId, commentText) {
        this.call("apicomment/updatecomment/" + commentId, "POST", null, this.JSONstring(commentText));
    };
    Ajax.updateCommentHasSeen = function (commentId) {
        this.call("apicomment/updatecommenthasseen/" + commentId, "POST");
    };
    Ajax.postComment = function (commentForm, onCopyResults) {
        this.call("apicomment", "POST", function (commentResults) { return onCopyResults(commentResults); }, commentForm);
    };
    Ajax.getComment = function (commentId, onCommentResult) {
        this.call("apicomment/" + commentId, "GET", function (commentResult) {
            onCommentResult(new CommentCard(commentResult));
        });
    };
    Ajax.getComments = function (postId, skip, take, feedFilter, feedType, onCommentResults) {
        this.call("apicomment/postcomments/" + postId + "/" + skip + "/" + take + "/" + feedFilter + "/" + feedType, "GET", function (commentResults) {
            onCommentResults(CommentCard.list(commentResults));
        });
    };
    Ajax.searchComments = function (postId, skip, take, searchText, onCommentResults) {
        this.call("apicomment/searchcomments/" + postId + "/" + skip + "/" + take, "POST", function (commentResults) {
            onCommentResults(CommentCard.list(commentResults));
        }, this.JSONstring(searchText));
    };
    Ajax.getCommentCount = function (postId, onCommentCountResults) {
        this.call("apicomment/commentcount/" + postId, "GET", onCommentCountResults);
    };
    Ajax.refreshComments = function (postId, commentIds, likeCounts, contents, take, feedFilter, feedType, onRefreshResults) {
        this.call("apicomment/refreshcomments/" + postId + "/" + take + "/" + feedFilter + "/" + feedType, "POST", function (commentResults) {
            onRefreshResults(commentResults == undefined ?
                null : CommentCard.list(commentResults));
        }, JSON.stringify({
            commentIds: commentIds,
            likeCounts: likeCounts,
            contents: contents
        }));
    };
    Ajax.updateName = function (namesJSON) {
        this.call("apiprofile/updatename", "POST", null, namesJSON);
    };
    Ajax.updateBio = function (bioText) {
        this.call("apiprofile/updatebio", "POST", null, this.JSONstring(bioText));
    };
    Ajax.updateProfilePicture = function (imageId, imageClassList, tooltipMsg, onImageClick, onCopyResults) {
        this.call("apiprofile/updateprofilepicture/" + imageId, "POST", function (imageResults) { return onCopyResults(new ImageCard(imageResults, imageClassList, tooltipMsg, onImageClick)); });
    };
    Ajax.updatePrivacySettings = function (settings) {
        this.call("apiprofile/updateprivacysettings", "POST", null, JSON.stringify(settings));
    };
    Ajax.updateProfileColor = function (color) {
        this.call("apiprofile/updateprofilecolor/" + color, "POST", null);
    };
    Ajax.getProfile = function (profileId, onProfileResults) {
        this.call("apiprofile/" + profileId, "GET", function (profileResults) { return onProfileResults(new ProfileCard(profileResults)); });
    };
    Ajax.getFullProfile = function (profileId, onFullProfileResults) {
        this.call("apiprofile/fullprofile/" + profileId, "POST", function (fullProfileResults) {
            onFullProfileResults(fullProfileResults);
        });
    };
    Ajax.getCurrentProfile = function (onCurrentProfileResults) {
        this.call("apiprofile/currentprofile", "GET", onCurrentProfileResults);
    };
    Ajax.deleteFriend = function (profileId) {
        this.call("apifriend/deletefriend/" + profileId, "POST");
    };
    Ajax.acceptFriendRequest = function (profileId) {
        this.call("apifriend/acceptrequest/" + profileId, "POST");
    };
    Ajax.sendFriendRequest = function (profileId) {
        this.call("apifriend/createrequest/" + profileId, "POST");
    };
    Ajax.getFriends = function (profileId, searchText, onProfileResults) {
        var newId = profileId ? profileId : 0;
        var newSearch = this.JSONstring(searchText ? searchText : "NULL");
        this.call("apifriend/friends/" + newId, "POST", function (profileResults) { return onProfileResults(ProfileCard.list(profileResults, true)); }, newSearch);
    };
    Ajax.blockProfile = function (profileId) {
        this.call("apifriend/blockprofile/" + profileId, "POST");
    };
    Ajax.unblockProfile = function (profileId) {
        this.call("apifriend/unblockprofile/" + profileId, "POST");
    };
    Ajax.deleteImage = function (imageId) {
        this.call("apiimage/deleteimage/" + imageId, "POST");
    };
    Ajax.postImage = function (imageAsString, onCopyResults) {
        this.call("apiimage", "POST", function (imageCopy) { return onCopyResults(new ImageCard(imageCopy)); }, imageAsString);
    };
    Ajax.updateImagePrivacy = function (imageId, privacyLevel) {
        this.call("apiimage/updateimageprivacy/" + imageId + "/" + privacyLevel, "POST");
    };
    Ajax.getProfileImages = function (profileId, skip, take, imageClassList, tooltipMsg, onImageClick, onImageResults) {
        this.call("apiimage/profileimages/" + profileId + "/" + skip + "/" + take, "GET", function (imageResults) { return onImageResults(ImageCard.list(imageResults, imageClassList, tooltipMsg, onImageClick)); });
    };
    Ajax.getProfileImagesCount = function (profileId, onCountResults) {
        this.call("apiimage/profileimagescount/" + profileId, "GET", onCountResults);
    };
    Ajax.getImage = function (imageId, thumb, imageClassList, tooltipMsg, onImageClick, onImageResults) {
        this.call("apiimage/" + imageId + "/" + (thumb ? 1 : 0), "GET", function (imageResults) {
            if (imageResults != null)
                onImageResults(new ImageCard(imageResults, imageClassList, tooltipMsg, onImageClick));
        });
    };
    Ajax.deletePost = function (postId) {
        this.call("apipost/deletepost/" + postId, "POST");
    };
    Ajax.updatePostPrivacy = function (postId, privacyLevel) {
        this.call("apipost/updatepostprivacy/" + postId + "/" + privacyLevel, "POST");
    };
    Ajax.updatePost = function (postId, postCaptionText) {
        this.call("apipost/updatepost/" + postId, "POST", null, this.JSONstring(postCaptionText));
    };
    Ajax.submitPost = function (postForm, onCopyResults) {
        this.call("apipost", "POST", function (copyResults) { return onCopyResults(copyResults); }, postForm);
    };
    Ajax.getPost = function (postId, onPostResult) {
        this.call("apipost/" + postId, "GET", function (postResult) { return onPostResult(new PostCard(postResult)); });
    };
    Ajax.getPublicPosts = function (skip, take, onPostResults) {
        this.call("apipost/publicposts/" + skip + "/" + take, "GET", function (postResults) { return onPostResults(PostCard.list(postResults)); });
    };
    Ajax.getProfilePosts = function (profileId, skip, take, feedFilter, feedType, onPostResults) {
        this.call("apipost/profileposts/" + profileId + "/" + skip + "/" + take + "/" + feedFilter + "/" + feedType, "GET", function (postResults) { return onPostResults(PostCard.list(postResults)); });
    };
    Ajax.searchPosts = function (profileId, skip, take, searchText, onPostResults) {
        this.call("apipost/searchposts/" + profileId + "/" + skip + "/" + take, "POST", function (postResults) {
            onPostResults(PostCard.list(postResults));
        }, this.JSONstring(searchText));
    };
    Ajax.call = function (path, method, onResults, data) {
        var _this = this;
        this.finalCall("apiprofile/confirmuser", "GET", function (confirmed) {
            if (confirmed)
                _this.finalCall(path, method, onResults, data);
            else
                location.reload(true);
        });
    };
    Ajax.finalCall = function (path, method, onResults, data) {
        $.ajax({
            url: "/api/" + path,
            contentType: "application/json",
            method: method,
            data: data,
            success: function (results) {
                if (onResults)
                    onResults(results);
            }
        });
    };
    return Ajax;
}());
//# sourceMappingURL=Ajax.js.map