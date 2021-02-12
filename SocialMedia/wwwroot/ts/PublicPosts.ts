class PublicPosts {
    
    private postBox: PostsBox;

    public constructor(postWrapper: HTMLElement) {
        this.postBox = new PostsBox(null, postWrapper);
        this.postBox.start();
    }
}