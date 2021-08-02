class PostCard extends Card {

    public static list(posts: PostRecord[]): PostCard[] {
        let postCards: PostCard[] = [];
        if (posts) {
            posts.forEach((p: PostRecord) => postCards.push(new PostCard(p)));
            return postCards;
        }
    }

    public static postCards: PostCard[] = [];

    public post: PostRecord;
    
    private hasImage: boolean;

    private postImageWrapper: ImageBox;
    private captionEditor: Editor;
    private likeCard: LikeCard;
    private observer: MutationObserver;
    
    private captionWrapper: HTMLElement;
    private postHeading: HTMLElement;
    private editIcon: HTMLElement;
    private refreshPostDetailsMessage: HTMLElement;

    public commentsSection: CommentSectionCard;
    
    // Used by postsBox. Not used in this.stage.
    public allStaged: StageFlag = new StageFlag();

    // onStagingEnd for this stage is set in PostsBox.
    public stage: Stage;
    private imageStaged: StageFlag = new StageFlag();

    /*
        Example:
        <div class="postCard">
            <div class="postSection">
                <div class="postHeading">
                    <div class="profileCardSlot">
                        <div class="profileCard"></div>   // ProfileCard root element
                    </div>
                    <div class="detailsSlot">
                        <div class="likeCard"></div>   // LikeCard root element
                        <div class="postDetailsRefreshMessage"></div>
                    </div>
                    <div class="postOptsSlot">
                        <i class="btnPostOpts threeDots fa fa-ellipsis-v"></i>
                        OR
                        <i class="btnRefreshPostDetails threeDots fa fa-refresh"></i>
                    </div>
                </div>
                <div class="captionWrapper noImageCaptionWrapper">
                    <div class="editor post-caption-editor"></div>   // Editor root element (contains caption element)
                </div>
                <div class="postImageWrapper image-box"></div>
            </div>
            <div class="commentSection"></div>
        </div>
    */
    public constructor(post: PostRecord) {

        super(ViewUtil.tag('div', { classList: 'postCard' }));

        this.post = post;

        if (this.post.image) this.hasImage = true;

        // POST CONSTRUCTION
        // __________________________________ TAG
        
        let postSection: HTMLElement = ViewUtil.tag('div', { classList: 'postSection' });

        this.commentsSection = new CommentSectionCard(
            this.post,
            () => (this.postImageWrapper.height + this.postHeading.clientHeight + this.captionWrapper.clientHeight),
            () => {
                this.commentsSection.mainCommentsBox.content.forEach((content: IAppendable) => {
                    let commentCard = <CommentCard>content;
                    commentCard.imageBoxes.forEach((imageBox: ImageBox) => this.imageBoxes.push(imageBox));
                });
            }
        );

        this.commentsSection.commentBoxesStage.onStagingEnd = () => this.stage.updateStaging(this.commentsSection.allStaged);

        this.stage = new Stage([this.imageStaged, this.commentsSection.allStaged]);

        this.rootElm.append(postSection, this.commentsSection.rootElm);
        
        // __________________________________ 

        this.postImageWrapper = new ImageBox(
            ViewUtil.tag('div', { classList: 'postImageWrapper' }),
            'postImage',
            'Fullscreen',
            (target: ImageBox) => fullSizeImageModal.loadSingle(target.imageCard.image.imageId)
        );

        if (this.hasImage) {
            this.imageBoxes.push(this.postImageWrapper);
            this.postImageWrapper.load(this.post.image.imageId);
            this.captionWrapper = ViewUtil.tag('div', { classList: 'captionWrapper' });
        }
        else {
            this.stage.updateStaging(this.imageStaged);
            this.captionWrapper = ViewUtil.tag('div', { classList: 'captionWrapper noImageCaptionWrapper' });
        }

        this.postHeading = ViewUtil.tag('div', { classList: 'postHeading' });

        postSection.append(this.postHeading, this.captionWrapper, this.postImageWrapper.rootElm);

        // must have a handle on editIcon to exclude it from the window onclick event listener in Editor
        this.editIcon = Icons.edit();
        this.captionEditor = new Editor(this.editIcon, this.post.caption, 'post-caption-editor', this.hasImage, 1000,
            (caption: string) => {

                Ajax.updatePost(this.post.postId, caption)

                // Loop through all post cards.
                PostCard.postCards.forEach((p: PostCard) => {

                    // If a match is found, update its caption.
                    if (p.post.postId == this.post.postId) p.captionEditor.setText(caption);
                });
            }
        );

        this.captionWrapper.append(this.captionEditor.rootElm);

        //------------------------------------------------------------------------------------------

        this.likeCard = new LikeCard(LikesRecord.copy(this.post.likes), this.post.dateTime);
        this.refreshPostDetailsMessage = ViewUtil.tag('div', { classList: 'postDetailsRefreshMessage' });

        let profileCardSlot: HTMLElement = ViewUtil.tag('div', { classList: 'profileCardSlot' });
        let likeCardSlot: HTMLElement = ViewUtil.tag('div', { classList: 'detailsSlot' });
        let postOptsSlot: HTMLElement = ViewUtil.tag('div', { classList: 'postOptsSlot' });

        let profileCard: ProfileCard = new ProfileCard(this.post.profile);
        profileCard.imageBoxes.forEach((imageBox: ImageBox) => this.imageBoxes.push(imageBox));

        this.postHeading.append(profileCardSlot, likeCardSlot, postOptsSlot);
        profileCardSlot.append(profileCard.rootElm);
        likeCardSlot.append(this.likeCard.rootElm, this.refreshPostDetailsMessage);

        //------------------------------------------------------------------------------------------
        // END POST CONSTRUCTION
        
        // PRIVATE OPTIONS
        if (post.profile.relationToUser == 'me') {
            let btnPostOpts: HTMLElement = ViewUtil.tag('i', { classList: 'btnPostOpts threeDots fa fa-ellipsis-v' });
            postOptsSlot.append(btnPostOpts);

            btnPostOpts.onclick = (e: MouseEvent) => contextMenu.load(e, [
                new ContextOption(this.editIcon, 'Edit post caption', (e: MouseEvent) => this.captionEditor.start()),
                new ContextOption(Icons.privacy(), 'Change privacy', (e: MouseEvent) => {
                    setTimeout(() => {
                        contextMenu.load(e, [
                            new ContextOption(ViewUtil.tag('div', { innerText: 'All' }), null, () => Ajax.updatePostPrivacy(this.post.postId, 0)),
                            new ContextOption(ViewUtil.tag('div', { innerText: 'Mutual' }), null, () => Ajax.updatePostPrivacy(this.post.postId, 1)),
                            new ContextOption(ViewUtil.tag('div', { innerText: 'Friends' }), null, () => Ajax.updatePostPrivacy(this.post.postId, 2)),
                            new ContextOption(ViewUtil.tag('div', { innerText: 'None' }), null, () => Ajax.updatePostPrivacy(this.post.postId, 3))
                        ]);
                    }, 10);
                }),
                new ContextOption(Icons.deletePost(), 'Delete post', (e: MouseEvent) =>
                    confirmPrompt.load('Are you sure you want to delete this post?', (confirmation: boolean) => {
                        if (!confirmation) return;
                        this.remove();
                    })),
                new ContextOption(Icons.refresh(), 'Refresh post details', (event: MouseEvent) => this.refreshPostDetails())
            ]);
        }
        else {
            let btnRefreshPostDetails: HTMLElement = ViewUtil.tag('i', { classList: 'btnPostOpts threeDots fa fa-refresh', title: 'Refresh post details' });
            btnRefreshPostDetails.onclick = (event: MouseEvent) => this.refreshPostDetails();
            postOptsSlot.append(btnRefreshPostDetails);
        }
        
        // If post has image.
        if (this.hasImage) {
            this.commentsSection.resizeCommentBox();
            
            this.postImageWrapper.onLoadEnd = () => {
                this.stage.updateStaging(this.imageStaged);
            }
        }
        
        PostCard.postCards.push(this);
    }

    private refreshPostDetails(): void {
        // Raise isLoading
        Ajax.getPost(this.post.postId, (postCard: PostCard) => {

            // If nothing was found.
            if (postCard == null) {
                this.refreshPostDetailsMessage.innerText = 'This post could not be found.';
            }
            // If nothing was changed.
            else if (
                postCard.post.caption == this.post.caption &&
                postCard.post.likes.count == this.post.likes.count
            ) {
                this.refreshPostDetailsMessage.innerText = 'These post details have not changed.';
            }
            // If there were changes.
            else {

                // Clear refresh message.
                this.refreshPostDetailsMessage.innerText = '';

                // Update like count.
                this.likeCard.setLikeCount(postCard.post.likes.count);
                this.post.likes.count = postCard.post.likes.count;

                // Update caption.
                this.captionEditor.setText(postCard.post.caption);
                this.post.caption = postCard.post.caption;
            }

        });
    }
    
    public remove(): void {

        Ajax.deletePost(this.post.postId);

        // XXX Instead of this, PostsBox should delete them so it can also splice it out of it's content array. XXX
        PostCard.postCards.forEach((postCard: PostCard) => {
            if (postCard.post.postId == this.post.postId) {
                ViewUtil.remove(postCard.rootElm);
                postCard = null;
            }
        });

        Util.filterNulls(PostCard.postCards);

        // XXX This is invalid code in TS. XXX
        //delete this;
    }
}