//class Repo {

//    static JSONstring(string) { return JSON.stringify({ str: string }); }

//    //______________________________ FRIEND

//    static friends(id, search, func) {
//        let newId = id ? id : 0;
//        let newSearch = this.JSONstring(search ? search : "NULL");

//        Ajax.getFriends(newId, newSearch, profiles => func(ProfileCard.list(profiles)));
//    }
//    static acceptFriend(id) { Ajax.acceptFriendRequest(id); }
//    static removeFriend(id) { Ajax.deleteFriend(id); }
//    static requestFriend(id) { Ajax.sendFriendRequest(id); }

//    //______________________________ LIKE

//    static like(type, id) { Ajax.postLike(type, id); }
//    static dislike(type, id) { Ajax.unlike(type, id); }
//    static likes(type, id) { Ajax.getLikes(type, id); } // NOT IN USE

//    //______________________________ COMMENT

//    static postComment(data, func) {
//        Ajax.postComment(comment => func(new CommentCard(comment)), data);
//    }
//    static removeComment(id) { Ajax.deleteComment(id); }
//    static updateComment(id, content) { Ajax.updateComment(id, this.JSONstring(content)); }

//    static comments(id, skip, take, func) { Ajax.getComments(id, skip, take,
//        comments => { if(comments)func(CommentCard.list(comments)) });
//    }
//    static commentCount(id, func) { Ajax.getCommentCount(id, count => func(count)); }

//    //______________________________ PROFILE

//    static updateBio(bio) { Ajax.updateBio(this.JSONstring(bio)); }
//    static updateProfilePicture(id, classList, click, func) {
//        Ajax.updateProfilePicture(id, image => {
//            if (func) func(new ImageCard(image, classList, click));
//        });
//    }
//    static profile(id, func) { Ajax.getProfile(id, profile => func(new ProfileCard(profile))); }

//    static fullProfile(id, func) {
//        Ajax.getFullProfile(id, fullProfile => {
//            fullProfile.profilePicture = new ImageCard(fullProfile.profilePicture);
//            func(fullProfile);
//        });
//    }

//    static currentProfile(func) { Ajax.getCurrentProfile(profile => func(profile)); }
    
//    //______________________________ IMAGE

//    static deleteImage(image) {
//        var newId;
        
//        if (typeof image == "number") newId = image;
//        else if (typeof image != "Image") newId = image.id;
//        else if (typeof image == "Image") newId = image.rawImage.id;
        
//        Ajax.deleteImage(newId);
//    }
//    static postImage(rawImage, func) { Ajax.postImage(rawImage, rawImage => func(new ImageCard(rawImage))); }
//    static images(id, skip, take, classList, click, func) {
//        Ajax.getProfileImages(id, skip, take,
//            images => func(ImageCard.list(images, classList, click)));
//    }
//    static image(id, classList, click, thumb, func) {
//        Ajax.getImage(id, thumb, image => func(new ImageCard(image, classList, click)));
//    }
//    static imageCount(id, func) { Ajax.getProfileImagesCount(id, count=> func(count)); }
    
//    //______________________________ POST

//    static removePost(id) { Ajax.deletePost(id); }
//    static updatePost(id, caption) { Ajax.updatePost(id, this.JSONstring(caption)); }
//    static postPost(data, func) { Ajax.submitPost(data, post => func(new PostCard(post))); }
//    static publicPosts(skip, take, func) { Ajax.getPublicPosts(skip, take, posts => func(PostCard.list(posts))); }
//    static profilePosts(id, skip, take, func) { Ajax.getProfilePosts(id, skip, take, posts => func(PostCard.list(posts))); }
//}