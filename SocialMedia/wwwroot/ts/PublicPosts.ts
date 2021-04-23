class PublicPosts {
    
    private postBox: PostsBox;

    public constructor(postWrapper: HTMLElement) {
        this.postBox = new PostsBox(null, postWrapper, null, null, null, () => {
            if (!this.postBox.hasContent)
                this.postBox.messageElm.innerHTML = `You have no posts or friends. Search for friends by clicking the 
                    <i class="fa fa-users helpIcon" alt="users"></i> button on the left side of the navigation bar.`;
            else
                this.postBox.messageElm.innerHTML = '';
        });
        this.postBox.start();
    }
}