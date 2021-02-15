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
    public totalCommentCount: number;

    private commentsBox: ContentBox;
    private postImageWrapper: ImageBox;
    private captionEditor: Editor;
    private observer: MutationObserver;

    private commentInputWrapper: HTMLElement;
    private errorSlot: HTMLElement;
    private commentCountSlot: HTMLElement;
    private commentCountText: HTMLElement;
    private captionWrapper: HTMLElement;
    private postHeading: HTMLElement;
    private editIcon: HTMLElement;

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
                    </div>
                    <div class="postOptsSlot">
                        <i class="btnPostOpts threeDots fa fa-ellipsis-v"></i>
                    </div>
                </div>
                <div class="captionWrapper noImageCaptionWrapper">
                    <div class="editor post-caption-editor"></div>   // Editor root element (contains caption element)
                </div>
                <div class="postImageWrapper image-box"></div>
            </div>
            <div class="commentSection">
                <div class="commentInputWrapper">
                    <textarea class="txtComment"></textarea>
                    <button class="btnComment">Comment</button>
                </div>
                <div class="errorSlot"></div>
                <div class="commentCountSlot">
                    <div>No Comments</div>
                </div>
                <div class="content-box"></div>
            </div>
        </div>
    */
    public constructor(post: PostRecord) {

        super(ViewUtil.tag('div', { classList: 'postCard' }));

        this.post = post;

        if (this.post.image) this.hasImage = true;
        
        // POST CONSTRUCTION
        // __________________________________ TAG
        
        let postSection: HTMLElement = ViewUtil.tag('div', { classList: 'postSection' });
        let commentSection: HTMLElement = ViewUtil.tag('div', { classList: 'commentSection' });

        this.rootElm.append(postSection, commentSection);

        // __________________________________ COMMENT INPUT

        this.commentInputWrapper = ViewUtil.tag('div', { classList: 'commentInputWrapper' });
        this.errorSlot = ViewUtil.tag('div', { classList: 'errorSlot' });
        this.commentCountSlot = ViewUtil.tag('div', { classList: 'commentCountSlot' });

        this.commentsBox = new ContentBox(ViewUtil.tag('div', { classList: 'commentBox' }), null, 400, 30, (skip: number, take: number) =>
            Ajax.getComments(this.post.postId, skip, take, (comments: CommentCard[]) => {

                // Determine if this is the first batch.
                // This is used after the comments have been added, but it must be determined before they are added.
                let isFirstCommentsBatch: boolean = this.commentsBox.content.length == 0;

                // If this post belongs to current user, indicate which comments have not been seen by the user.
                if (this.post.profile.profileId == User.profileId)
                    comments.forEach((comment: CommentCard) => comment.disputeHasSeen());

                this.commentsBox.add(comments);

                // If first batch (was just loaded) and this post does NOT have an image, resize the comments section (now that the elements have loaded).
                if (isFirstCommentsBatch && !this.hasImage) this.resizeCommentBox();
            })
        );

        let txtComment: HTMLInputElement = <HTMLInputElement> ViewUtil.tag('textarea', { classList: 'txtComment' });
        let btnComment: HTMLElement = ViewUtil.tag('button', { classList: 'btnComment', innerHTML: 'Comment' });

        commentSection.append(this.commentInputWrapper, this.errorSlot, this.commentCountSlot, this.commentsBox.rootElm);
        this.commentInputWrapper.append(txtComment, btnComment);

        // __________________________________ 

        this.postImageWrapper = new ImageBox(
            ViewUtil.tag('div', { classList: 'postImageWrapper' }),
            'postImage',
            (target: ImageCard) => fullSizeImageModal.loadSingle(target.image.imageId)
        );

        if (this.hasImage) {
            this.postImageWrapper.load(this.post.image.imageId);
            this.captionWrapper = ViewUtil.tag('div', { classList: 'captionWrapper' });
        }
        else this.captionWrapper = ViewUtil.tag('div', { classList: 'captionWrapper noImageCaptionWrapper' });

        this.postHeading = ViewUtil.tag('div', { classList: 'postHeading' });

        postSection.append(this.postHeading, this.captionWrapper, this.postImageWrapper.rootElm);

        // must have a handle on editIcon to exclude it from the window onclick event listener in Editor
        this.editIcon = Icons.edit();
        this.captionEditor = new Editor(this.editIcon, this.post.caption, 'post-caption-editor', 1000,
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

        let profileCardSlot: HTMLElement = ViewUtil.tag('div', { classList: 'profileCardSlot' });
        let likeCardSlot: HTMLElement = ViewUtil.tag('div', { classList: 'detailsSlot' });
        let postOptsSlot: HTMLElement = ViewUtil.tag('div', { classList: 'postOptsSlot' });

        this.postHeading.append(profileCardSlot, likeCardSlot, postOptsSlot);
        profileCardSlot.append(new ProfileCard(this.post.profile).rootElm);
        likeCardSlot.append(new LikeCard(LikesRecord.copy(this.post.likes), this.post.dateTime).rootElm);

        //------------------------------------------------------------------------------------------
        // END POST CONSTRUCTION
        
        // Load comments
        this.commentsBox.request(15);
        this.requestCommentCount();

        // PRIVATE OPTIONS
        if (post.profile.relationToUser == 'me') {
            let btnPostOpts: HTMLElement = ViewUtil.tag('i', { classList: 'btnPostOpts threeDots fa fa-ellipsis-v' });
            postOptsSlot.append(btnPostOpts);

            btnPostOpts.onclick = (e: MouseEvent) => contextMenu.load(e, [
                new ContextOption(this.editIcon, (e: MouseEvent) => this.captionEditor.start()),
                new ContextOption(Icons.deletePost(), (e: MouseEvent) =>
                    confirmPrompt.load('Are you sure you want to delete this post?', (confirmation: boolean) => {
                        if (!confirmation) return;
                        this.remove();
                    }))
            ]);
        }

        // submit comment
        btnComment.onclick = (e: MouseEvent) => {
            let error = ViewUtil.tag('div', { classList: 'errorMsg', innerText: '- Must be less than 125 characters' });
            
            if (txtComment.value.length <= 125) {
                Ajax.postComment(
                    JSON.stringify({ Content: txtComment.value, PostId: post.postId }),
                    (commentResults: CommentRecord) => {
                        PostCard.postCards.forEach((p: PostCard) => {
                            if (p.post.postId == commentResults.postId) {
                                p.commentsBox.add(new CommentCard(CommentRecord.copy(commentResults)), true);
                                p.resizeCommentBox();
                                p.setCommentCount(this.totalCommentCount + 1);
                            }
                        });
                    }
                );
                ViewUtil.empty(this.errorSlot);
                txtComment.value = "";
            }
            else this.errorSlot.append(error);
        }

        // If post has image.
        if (this.hasImage) {

            // triggered when image is done loading
            this.observer = new MutationObserver(() => this.resizeCommentBox());
            this.observer.observe(this.rootElm, { attributes: true });
            this.postImageWrapper.onLoadEnd = () => this.mutate();
        }

        // unload or reload posts above and below the position of the viewport
        window.addEventListener('scroll', (e: UIEvent) => {
            let offset: number = this.rootElm.offsetTop - window.pageYOffset;
            
            if ((offset > -3000 && offset < -2500) || (offset < 3000 && offset > 2500)) {
                if (this.hasImage) this.postImageWrapper.unload();
            }
            else if (offset > -2000 && offset < 2000) {
                if (this.hasImage) this.postImageWrapper.reload();
            }
        });

        PostCard.postCards.push(this);
    }
    
    private resizeCommentBox(): void {
        let inputHeight: number = this.commentInputWrapper.clientHeight;
        let contentHeight: number = this.postImageWrapper.height + this.postHeading.clientHeight + this.captionWrapper.clientHeight;

        // The desired height of the comments box.
        let targetHeight: number = contentHeight - inputHeight;
        
        // Set height of comment box to the target height. CSS rule (min-height: 250px;) is applied to this.commentBox.rootElm.
        this.commentsBox.height = targetHeight;

        // If there is an observer (if the post has an image), disconnect the observer.
        if (this.observer != undefined) this.observer.disconnect();
    }
    
    public setCommentCount(newCount: number): void {
        this.totalCommentCount = newCount;

        switch (newCount) {
            case 0: this.commentCountText.innerText = 'No Comments'; break;
            case 1: this.commentCountText.innerText = '1 Comment'; break;
            default: this.commentCountText.innerText = `${newCount} Comments`;
        }
    }

    private requestCommentCount(): void {
        Ajax.getCommentCount(this.post.postId, (commentCount: string) => {
            this.commentCountText = ViewUtil.tag('div');
            this.setCommentCount(+commentCount);

            this.commentCountSlot.append(this.commentCountText);
        });
    }

    public alertVisible() {
        this.commentsBox.getVisibleContent().forEach((commentCard: Card) => commentCard.alertVisible());
    }

    public remove(): void {
        this.setCommentCount(this.totalCommentCount - 1);
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

    // Triggers the mutation observer which triggers a resize. The assigned id is never used.
    private mutate(): void { this.rootElm.id = 'loadedPost'; }
}