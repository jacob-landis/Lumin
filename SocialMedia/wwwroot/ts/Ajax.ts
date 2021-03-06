﻿class Ajax {

    private static JSONstring(string: string): string { return JSON.stringify({ str: string }); }

    //LIKE
    public static unlike(contentType: ContentType, contentId: number): void {
        this.call(`apilike/unlike/${contentType}/${contentId}`, "POST");
    }

    public static postLike(contentType: ContentType, contentId: number): void {
        this.call(`apilike/like/${contentType}/${contentId}`, "POST");
    }

    //public static getLikes(contentType: ContentType, contentId: number): void {
    //    this.call(`apilike/likes/${contentType}/${contentId}`, "GET");
    //} // NOT IN USE


    //COMMENT
    public static deleteComment(commentId: number): void {
        this.call(`apicomment/deletecomment/${commentId}`, "POST");
    }

    public static updateComment(commentId: number, commentText: string): void {
        this.call(`apicomment/updatecomment/${commentId}`, "POST", null, this.JSONstring(commentText));
    }

    public static updateCommentHasSeen(commentId: number): void {
        this.call(`apicomment/updatecommenthasseen/${commentId}`, "POST");
    }

    public static postComment(commentForm: string, onCopyResults: (commentResults: CommentRecord) => void): void {
        this.call(
            "apicomment", 
            "POST",
            (commentResults: string) => onCopyResults(<CommentRecord><unknown>commentResults),
            commentForm
        );
    }

    public static getComment(commentId: number, onCommentResult: (commentCard: CommentCard) => void): void {
        this.call(
            `apicomment/${commentId}`,
            "GET",
            (commentResult: string) => {
                onCommentResult(new CommentCard(<CommentRecord><unknown>commentResult));
            }
        );
    }

    public static getComments(
        postId: number,
        skip: number,
        take: number,
        feedFilter: 'recent' | 'likes',
        feedType: 'myComments' | 'likedComments' | 'mainComments',
        onCommentResults: (commentCards: CommentCard[]) => void
    ): void {
        this.call(
            `apicomment/postcomments/${postId}/${skip}/${take}/${feedFilter}/${feedType}`,
            "GET",
            (commentResults: string) => {
                onCommentResults(CommentCard.list(<CommentRecord[]><unknown>commentResults))
            }
        );
    }

    public static searchComments(
        postId: number,
        skip: number,
        take: number,
        searchText: string,
        onCommentResults: (commentCards: CommentCard[]) => void
    ): void {
        this.call(
            `apicomment/searchcomments/${postId}/${skip}/${take}`,
            "POST",
            (commentResults: string) => {
                onCommentResults(CommentCard.list(<CommentRecord[]><unknown>commentResults))
            },
            this.JSONstring(searchText)
        )
    }

    public static getCommentCount(postId: number, onCommentCountResults: (commentCount: string) => void): void {
        this.call(`apicomment/commentcount/${postId}`, "GET", onCommentCountResults);
    }

    public static refreshComments(
        postId: number,
        commentIds: number[],
        likeCounts: number[],
        contents: string[],
        take,
        feedFilter: 'recent' | 'likes',
        feedType: 'myComments' | 'likedComments' | 'mainComments',
        onRefreshResults: (commentCards: CommentCard[]) => void
    ): void {
        this.call(
            `apicomment/refreshcomments/${postId}/${take}/${feedFilter}/${feedType}`,
            "POST",
            (commentResults: string) => {
                onRefreshResults(
                    commentResults == undefined ?
                        null : CommentCard.list(<CommentRecord[]><unknown>commentResults)
                );
            },
            JSON.stringify({
                commentIds: commentIds,
                likeCounts: likeCounts,
                contents: contents
            })
        )
    }

    //PROFILE
    public static updateName(namesJSON: string): void {
        this.call("apiprofile/updatename", "POST", null, namesJSON);
    }

    public static updateBio(bioText: string): void {
        this.call("apiprofile/updatebio", "POST", null, this.JSONstring(bioText));
    }

    public static updateProfilePicture(
        imageId: number,
        imageClassList?: string,
        tooltipMsg?: string,
        onImageClick?: (targetImageCard: ImageCard) => void,
        onCopyResults?: (fullsizeImageCard: ImageCard) => void
    ): void {
        this.call(
            `apiprofile/updateprofilepicture/${imageId}`,
            "POST",
            (imageResults: string) => onCopyResults(new ImageCard(<ImageRecord><unknown>imageResults, imageClassList, tooltipMsg, onImageClick))
        );
    }

    public static updatePrivacySettings(settings: number[]) {
        this.call("apiprofile/updateprivacysettings", "POST", null, JSON.stringify(settings));
    }

    public static updateProfileColor(color: string) {
        this.call(`apiprofile/updateprofilecolor/${color}`, "POST", null);
    }

    public static getProfile(profileId: number, onProfileResults: (profileCard: ProfileCard) => void): void {
        this.call(
            `apiprofile/${profileId}`,
            "GET",
            (profileResults: string) => onProfileResults(new ProfileCard(<ProfileRecord><unknown>profileResults))
        );
    }

    public static getFullProfile(profileId: number, onFullProfileResults: (fullProfile: FullProfileRecord) => void): void {
        this.call(
            `apiprofile/fullprofile/${profileId}`,
            "POST",
            (fullProfileResults: string) => {
                onFullProfileResults(<FullProfileRecord><unknown>fullProfileResults);
            }
        );
    }

    /*
        Used in index.cshtml to invoke Main.initialize 
    */
    public static getCurrentProfile(onCurrentProfileResults: (currentProfile: string) => void): void {
        this.call("apiprofile/currentprofile", "GET", onCurrentProfileResults);
    }


    //FRIEND
    public static deleteFriend(profileId: number): void {
        this.call(`apifriend/deletefriend/${profileId}`, "POST");
    } // remove

    public static acceptFriendRequest(profileId: number): void {
        this.call(`apifriend/acceptrequest/${profileId}`, "POST");
    } // accept

    public static sendFriendRequest(profileId: number): void {
        this.call(`apifriend/createrequest/${profileId}`, "POST");
    } // request
    
    public static getFriends(profileId: number, searchText: string, onProfileResults: (profileCards: ProfileCard[]) => void): void {

        let newId: number = profileId ? profileId : 0;
        let newSearch: string = this.JSONstring(searchText ? searchText : "NULL");
        
        this.call(
            `apifriend/friends/${newId}`,
            "POST", 
            (profileResults: string) => onProfileResults(ProfileCard.list(<ProfileRecord[]><unknown>profileResults, true)),
            newSearch
        );
    }
    
    public static blockProfile(profileId: number): void {
        this.call(`apifriend/blockprofile/${profileId}`, "POST");
    }

    public static unblockProfile(profileId: number): void {
        this.call(`apifriend/unblockprofile/${profileId}`, "POST");
    }

    //IMAGE
    public static deleteImage(imageId: number): void {
        this.call(`apiimage/deleteimage/${imageId}`, "POST");
    }

    public static postImage(imageAsString: string, onCopyResults: (returnImageCard: ImageCard) => void): void {
        this.call(
            "apiimage", 
            "POST", 
            (imageCopy: string) => onCopyResults(new ImageCard(<ImageRecord><unknown>imageCopy)),
            imageAsString
        );
    }

    public static updateImagePrivacy(imageId: number, privacyLevel: number): void {
        this.call(`apiimage/updateimageprivacy/${imageId}/${privacyLevel}`, "POST");
    }

    public static getProfileImages(
        profileId: number,
        skip: number,
        take: number,
        imageClassList: string,
        tooltipMsg: string,
        onImageClick: (targetImageCard: ImageCard) => void,
        onImageResults: (imageCards: ImageCard[]) => void
    ): void {
        this.call(
            `apiimage/profileimages/${profileId}/${skip}/${take}`, 
            "GET",
            (imageResults: string) => onImageResults(ImageCard.list(<ImageRecord[]><unknown>imageResults, imageClassList, tooltipMsg, onImageClick))
        );
    }

    public static getProfileImagesCount(profileId: number, onCountResults: (imageCount: string) => void): void {
        this.call(`apiimage/profileimagescount/${profileId}`, "GET", onCountResults);
    }

    public static getImage(
        imageId: number,
        thumb: boolean,
        imageClassList: string,
        tooltipMsg: string,
        onImageClick: (target: ImageCard) => void,
        onImageResults: (imageCard: ImageCard) => void
    ): void {
        this.call(
            `apiimage/${imageId}/${thumb ? 1 : 0}`, 
            "GET",
            (imageResults: string) => {
                if (imageResults != null)
                    onImageResults(new ImageCard(<ImageRecord><unknown>imageResults, imageClassList, tooltipMsg, onImageClick));
            }
        );
    }


    //POST
    public static deletePost(postId: number): void {
        this.call(`apipost/deletepost/${postId}`, "POST");
    }

    public static updatePostPrivacy(postId: number, privacyLevel: number) {
        this.call(`apipost/updatepostprivacy/${postId}/${privacyLevel}`, "POST");
    }

    public static updatePost(postId: number, postCaptionText: string): void {
        this.call(`apipost/updatepost/${postId}`, "POST", null, this.JSONstring(postCaptionText));
    }

    public static submitPost(postForm: string, onCopyResults: (post: PostRecord) => void): void {
        this.call(
            "apipost",
            "POST",
            (copyResults: string) => onCopyResults(<PostRecord><unknown>copyResults),
            postForm
        );
    }

    public static getPost(postId: number, onPostResult: (postCard: PostCard) => void) {
        this.call(
            `apipost/${postId}`,
            "GET",
            (postResult: string) => onPostResult(new PostCard(<PostRecord><unknown>postResult))
        );
    }

    public static getPublicPosts(skip: number, take: number, onPostResults: (postCards: PostCard[]) => void): void {
        this.call(
            `apipost/publicposts/${skip}/${take}`,
            "GET",
            (postResults: string) => onPostResults(PostCard.list(<PostRecord[]><unknown>postResults))
        );
    }

    public static getProfilePosts(
        profileId: number,
        skip: number,
        take: number,
        feedFilter: 'recent' | 'likes' | 'comments',
        feedType: 'commentedPosts' | 'likedPosts' | 'mainPosts',
        onPostResults: (postCards: PostCard[]) => void
    ): void {
        this.call(
            `apipost/profileposts/${profileId}/${skip}/${take}/${feedFilter}/${feedType}`, 
            "GET",
            (postResults: string) => onPostResults(PostCard.list(<PostRecord[]><unknown>postResults))
        );
    }

    public static searchPosts(
        profileId: number,
        skip: number,
        take: number,
        searchText: string,
        onPostResults: (postCards: PostCard[]) => void
    ): void {
        this.call(
            `apipost/searchposts/${profileId}/${skip}/${take}`,
            "POST",
            (postResults: string) => {
                onPostResults(PostCard.list(<PostRecord[]><unknown>postResults))
            },
            this.JSONstring(searchText)
        )
    }


    //CALL
    private static call(path: string, method: string, onResults?: (results: string) => void, data?: string): void {

        // check server for current user (redirect if session is expired)
        this.finalCall("apiprofile/confirmuser", "GET", (confirmed: string) => {
            // XXX if (confirmed != "" || confirmed != null) XXX TRY THIS XXX
            if (confirmed) this.finalCall(path, method, onResults, data);
            else location.reload(true);
        });
    }

    private static finalCall(path: string, method: string, onResults?: (results: string) => void, data?: string): void {
        $.ajax({
            url: "/api/" + path,
            contentType: "application/json",
            method: method,
            data: data,
            success: (results: string) => {
                if (onResults) onResults(results);
            }
        });
    }
}