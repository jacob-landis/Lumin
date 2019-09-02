class PostsBox {

    static postBoxes = [];

    constructor(profileId, existingTag) {
        this.profileId = profileId ? profileId : User.id;

        let contentBoxRequestFunc =(skip, take)=> profileId ?
            Repo.profilePosts(this.profileId, skip, take, (posts)=> this.contentBox.add(posts))
            :
            Repo.publicPosts(skip, take, (posts)=> this.contentBox.add(posts));

        this.contentBox = new ContentBox(existingTag, 'posts-box', 5, contentBoxRequestFunc);

        PostsBox.postBoxes.push(this);
    }

    addPost(postCard) { this.contentBox.add(postCard, true); }

    start() { this.contentBox.request(15); }

}