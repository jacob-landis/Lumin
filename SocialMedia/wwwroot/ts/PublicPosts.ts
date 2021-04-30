class PublicPosts {
    
    private postBox: PostsBox;

    public constructor(postWrapper: HTMLElement) {
        this.postBox = new PostsBox(null, postWrapper, null, null, null, () => {
            if (!this.postBox.hasContent)
                this.postBox.messageElm.innerHTML = `You have no posts or friends. Search for friends by clicking the 
                    <i class="fa fa-users helpIcon" alt="users"></i> button on the left side of the navigation bar.`;
            else {
                this.postBox.messageElm.innerHTML = '';

                this.postBox.content.forEach((contentItem: IAppendable) => {
                    let commentSectionElm: HTMLElement = (<PostCard>contentItem).commentsSection.commentBoxes.rootElm;

                    commentSectionElm.addEventListener('mouseenter', (event: MouseEvent) => {
                        if (ViewUtil.isOverflowing(commentSectionElm)) this.lockScrolling();
                    });

                    commentSectionElm.addEventListener('mouseleave', (event: MouseEvent) => {
                        if (ViewUtil.isOverflowing(commentSectionElm)) this.unlockScrolling();
                    });
                });
            }
        });
        this.postBox.start();
    }

    private lockScrolling(): void { console.log('lock'); }
    private unlockScrolling(): void { console.log('unlock'); }
}