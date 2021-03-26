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

    private commentBoxes: ContentBox;
    private commentsBox: ContentBox;
    private myCommentsBox: ContentBox;
    private likedCommentsBox: ContentBox;
    private postImageWrapper: ImageBox;
    private captionEditor: Editor;
    private likeCard: LikeCard;
    private observer: MutationObserver;

    private commentInputWrapper: HTMLElement;
    private errorSlot: HTMLElement;

    private commentBoxDetails: HTMLElement;
    private commentCountSlot: HTMLElement;
    private commentCountText: HTMLElement;
    private commentBoxFeedControls: HTMLElement;
    private btnToggleFeedFilter: HTMLElement;
    private btnRefreshFeed: HTMLElement;
    private btnMyActivity: HTMLElement;

    private captionWrapper: HTMLElement;
    private postHeading: HTMLElement;
    private editIcon: HTMLElement;
    private refreshPostDetailsMessage: HTMLElement;

    private feedFilter: 'recent' | 'likes' = 'recent';

    public allStaged: StageFlag = new StageFlag();
    public onStagingEnd: () => void;

    private commentsStaged: StageFlag = new StageFlag();
    private imageStaged: StageFlag = new StageFlag();

    public stage: Stage;

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
            <div class="commentSection">
                <div class="commentInputWrapper">
                    <textarea class="txtComment"></textarea>
                    <div class="icon"><i class="fa fa-check"></i></div>
                    <div class="icon"><i class="fa fa-times"></i></div>
                    <button class="btnComment">Comment</button>
                </div>
                <div class="errorSlot"></div>
                <div class="commentBoxDetails">
                    <div class="commentCountSlot">
                        <div>No Comments</div>
                    </div>
                    <div class="commentBoxFeedControls">
                        <div class="btnToggleCommentFeedFilter"></div>
                        <div class="btnRefreshCommentFeed"></div>
                        <div class="btnMyActivity"></div>
                    </div>
                </div>
                <div class="content-box commentBoxes">
                    <div class="contentMessage"></div>
                    <div class="contentContainer">
                        <div class="content-box myComments"></div>
                        <div class="content-box likedComments"></div>
                        <div class="content-box mainComments"></div>
                    </div>
                </div>
            </div>
        </div>
    */
    public constructor(post: PostRecord) {

        super(ViewUtil.tag('div', { classList: 'postCard' }));

        this.post = post;

        if (this.post.image) this.hasImage = true;

        this.stage = new Stage([this.imageStaged, this.commentsStaged]);

        // POST CONSTRUCTION
        // __________________________________ TAG
        
        let postSection: HTMLElement = ViewUtil.tag('div', { classList: 'postSection' });
        let commentSection: HTMLElement = ViewUtil.tag('div', { classList: 'commentSection' });

        this.rootElm.append(postSection, commentSection);

        // __________________________________ COMMENT INPUT

        this.commentInputWrapper = ViewUtil.tag('div', { classList: 'commentInputWrapper' });
        this.errorSlot = ViewUtil.tag('div', { classList: 'errorSlot' });

        this.commentBoxDetails = ViewUtil.tag('div', { classList: 'commentBoxDetails' });
        this.commentCountSlot = ViewUtil.tag('div', { classList: 'commentCountSlot' });
        this.commentBoxFeedControls = ViewUtil.tag('div', { classList: 'commentBoxFeedControls' });
        
        this.btnToggleFeedFilter = Icons.filterByLikes();
        this.btnToggleFeedFilter.classList.add('btnToggleCommentFeedFilter');
        this.btnToggleFeedFilter.title = 'Sort by popularity';

        this.btnRefreshFeed = Icons.refresh();
        this.btnRefreshFeed.classList.add('btnRefreshCommentFeed');
        this.btnRefreshFeed.title = 'Refresh comment feed';

        this.btnMyActivity = Icons.history();
        this.btnMyActivity.classList.add('btnMyActivity');
        this.btnMyActivity.title = 'Show my activity'

        this.myCommentsBox = new ContentBox(ViewUtil.tag('div', { classList: 'myCommentsBox' }), null, 400, 30, (skip: number, take: number) => {
            Ajax.getComments(this.post.postId, skip, take, this.feedFilter, 'myComments', (commentCards: CommentCard[]) => {
                if (commentCards != null) {
                    this.myCommentsBox.add(commentCards);
                    this.myCommentsBox.messageElm.innerText = 'My Comments';
                }
                else {
                    this.myCommentsBox.messageElm.innerText = '';
                }
            });
        });

        this.likedCommentsBox = new ContentBox(ViewUtil.tag('div', { classList: 'likedCommentsBox' }), null, 400, 30, (skip: number, take: number) => {
            Ajax.getComments(this.post.postId, skip, take, this.feedFilter, 'likedComments', (commentCards: CommentCard[]) => {
                if (commentCards != null) {
                    this.likedCommentsBox.add(commentCards);
                    this.likedCommentsBox.messageElm.innerText = 'My Liked Comments';
                }
                else {
                    this.likedCommentsBox.messageElm.innerText = '';
                }
            });
        });

        this.commentsBox = new ContentBox(ViewUtil.tag('div', { classList: 'commentBox' }), null, 400, 30, (skip: number, take: number) => 
            Ajax.getComments(this.post.postId, skip, take, this.feedFilter, 'mainComments', (comments: CommentCard[]) => {

                if (comments == null) {
                    this.stage.updateStaging(this.commentsStaged);
                    return;
                }

                // Determine if this is the first batch.
                // This is used after the comments have been added, but it must be determined before they are added.
                let isFirstCommentsBatch: boolean = this.commentsBox.content.length == 0;

                // If this post belongs to current user, indicate which comments have not been seen by the user.
                if (this.post.profile.profileId == User.profileId)
                    comments.forEach((comment: CommentCard) => comment.disputeHasSeen());

                this.commentsBox.add(comments);

                if (this.myCommentsBox.length > 0 || this.likedCommentsBox.length > 0) this.commentsBox.messageElm.innerText = 'All Comments';

                // If first batch (was just loaded) and this post does NOT have an image, resize the comments section (now that the elements have loaded).
                if (isFirstCommentsBatch) {
                    if (!this.hasImage) this.resizeCommentBox();
                    this.stage.updateStaging(this.commentsStaged);
                }
            })
        );

        this.commentBoxes = new ContentBox(ViewUtil.tag('div', { classList: 'commentBoxes' }));
        this.commentBoxes.add([this.myCommentsBox, this.likedCommentsBox, this.commentsBox]);

        let txtComment: HTMLInputElement = <HTMLInputElement>ViewUtil.tag('textarea', { classList: 'txtComment' });
        let btnConfirm: HTMLElement = Icons.confirm();
        let btnCancel: HTMLElement = Icons.cancel();
        let btnComment: HTMLElement = ViewUtil.tag('button', { classList: 'btnComment', innerHTML: 'Create Comment' });

        commentSection.append(this.commentInputWrapper, this.errorSlot, this.commentBoxDetails, this.commentBoxes.rootElm);
        this.commentBoxDetails.append(this.commentCountSlot, this.commentBoxFeedControls);
        this.commentBoxFeedControls.append(this.btnMyActivity, this.btnToggleFeedFilter, this.btnRefreshFeed);
        this.commentInputWrapper.append(txtComment, btnConfirm, btnCancel, btnComment);

        // __________________________________ 

        this.postImageWrapper = new ImageBox(
            ViewUtil.tag('div', { classList: 'postImageWrapper' }),
            'postImage',
            'Fullscreen',
            (target: ImageCard) => fullSizeImageModal.loadSingle(target.image.imageId)
        );

        if (this.hasImage) {
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

        this.postHeading.append(profileCardSlot, likeCardSlot, postOptsSlot);
        profileCardSlot.append(new ProfileCard(this.post.profile).rootElm);
        likeCardSlot.append(this.likeCard.rootElm, this.refreshPostDetailsMessage);

        //------------------------------------------------------------------------------------------
        // END POST CONSTRUCTION
        
        // Load comments
        this.commentsBox.request(15);
        this.requestCommentCount();

        this.btnToggleFeedFilter.onclick = (event: MouseEvent) => this.toggleFeedFilter();
        this.btnRefreshFeed.onclick = (event: MouseEvent) => this.refreshCommentFeed();
        this.btnMyActivity.onclick = (event: MouseEvent) => this.showCommentActivity();

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
                    })),
                new ContextOption(Icons.refresh(), (event: MouseEvent) => this.refreshPostDetails())
            ]);
        }
        else {
            let btnRefreshPostDetails: HTMLElement = ViewUtil.tag('i', { classList: 'btnPostOpts threeDots fa fa-refresh' });
            btnRefreshPostDetails.onclick = (event: MouseEvent) => this.refreshPostDetails();
            postOptsSlot.append(btnRefreshPostDetails);
        }

        // Clear txtComment and remove class to change styling.
        let deactivateInput: () => void = () => {
            txtComment.value = '';
            this.commentInputWrapper.classList.remove('activeInput');
        }

        // Submit comment.
        btnConfirm.onclick = (e: MouseEvent) => {

            let tooLong: boolean = txtComment.value.length > 125;
            let tooShort: boolean = txtComment.value.length == 0;

            let tooLongError: HTMLElement = ViewUtil.tag('div', { classList: 'errorMsg', innerText: '- Must be less than 125 characters' });
            let tooShortError: HTMLElement = ViewUtil.tag('div', { classList: 'errorMsg', innerText: '- Comment cannot be empty' });
            
            if (!tooLong && !tooShort) {
                confirmPrompt.load("Are you sure you want to make this comment?", (answer: boolean) => {
                    if (answer == true) {

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
                        deactivateInput();
                    }
                });
            }
            else if (tooLong) this.errorSlot.append(tooLongError);
            else if (tooShort) this.errorSlot.append(tooShortError);
        }

        btnCancel.onclick = (event: MouseEvent) => {
            
            // If the user has entered more than 10 characters.
            if (txtComment.value.length > 10) {

                // Prompt for confirmation to cancel.
                confirmPrompt.load("Are you sure you want to discard this comment?", (answer: boolean) => {
                    if (answer == true) deactivateInput();
                    else txtComment.focus();
                });
            }
            // Else deactivate input without prompting the user.
            else deactivateInput();

        }

        btnComment.onclick = (event: MouseEvent) => {
            // Add class to change styling and put the cursor in the text element.
            this.commentInputWrapper.classList.add('activeInput');
            txtComment.focus();
        }

        // If post has image.
        if (this.hasImage) {

            // triggered when image is done loading
            this.observer = new MutationObserver(() => this.resizeCommentBox());
            this.observer.observe(this.rootElm, { attributes: true });
            this.postImageWrapper.onLoadEnd = () => {
                this.mutate();
                this.stage.updateStaging(this.imageStaged);
            }
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

    private toggleFeedFilter(): void {

        let feedFilterSecondIcon = this.btnToggleFeedFilter.children[1];

        this.feedFilter = this.feedFilter == 'likes' ? 'recent' : 'likes';

        if (this.feedFilter == 'likes') {

            this.btnToggleFeedFilter.title = 'Sort by recent';
            feedFilterSecondIcon.classList.remove('fa-thumbs-up');
            feedFilterSecondIcon.classList.add('fa-calendar');
        }
        else if (this.feedFilter == 'recent') {
            
            this.btnToggleFeedFilter.title = 'Sort by popularity';
            feedFilterSecondIcon.classList.remove('fa-calendar');
            feedFilterSecondIcon.classList.add('fa-thumbs-up');
        }

        this.commentsBox.clear();
        this.commentsBox.request(15);

        if (this.myCommentsBox.length > 0) {
            this.myCommentsBox.clear();
            this.myCommentsBox.request(15);
        }

        if (this.likedCommentsBox.length > 0) {
            this.likedCommentsBox.clear();
            this.likedCommentsBox.request(15)
        }
    }

    private showCommentActivity(): void {
        this.myCommentsBox.request(15);
        this.likedCommentsBox.request(15);

        this.commentsBox.messageElm.innerText = 'All Comments';
    }

    private refreshCommentFeed(): void {
        
        // Collect list of all comment id's in this comment box and this post id and send to server for comparison.
        let commentIds: number[] = [];
        let likeCounts: number[] = [];
        let contents: string[] = [];
        this.commentsBox.content.forEach((content: IAppendable) => {
            commentIds.push((<CommentCard>content).comment.commentId);
            likeCounts.push((<CommentCard>content).comment.likes.count);
            contents.push((<CommentCard>content).comment.content);
        });

        // Refresh main comments
        Ajax.refreshComments(
            this.post.postId,
            commentIds,
            likeCounts,
            contents,
            this.commentsBox.take,
            this.feedFilter,
            'mainComments',
            (commentCards: CommentCard[]) => {

                if (commentCards == null) {
                    if (this.myCommentsBox.length > 0 || this.likedCommentsBox.length > 0)
                        this.commentsBox.messageElm.innerText = 'All Comments - No changes have been made';
                    else
                        this.commentsBox.messageElm.innerText = 'No changes have been made';
                }
                else if (commentCards != null) {
                    if (this.myCommentsBox.length > 0 || this.likedCommentsBox.length > 0) this.commentsBox.messageElm.innerText = 'All Comments';
                    this.commentsBox.clear();
                    this.commentsBox.add(commentCards);
                }
            }
        );

        // If the message for my comments box has been set.
        if (this.myCommentsBox.messageElm.innerText != '') {

            if (this.myCommentsBox.length > 0) {

                // Prepare my comments
                //let myCommentIds, myLikeCounts: number[] = [];
                let myCommentIds: number[] = [];
                let myLikeCounts: number[] = [];
                let myContents: string[] = [];
                this.myCommentsBox.content.forEach((content: IAppendable) => {
                    myCommentIds.push((<CommentCard>content).comment.commentId);
                    myLikeCounts.push((<CommentCard>content).comment.likes.count);
                    myContents.push((<CommentCard>content).comment.content);
                });
            
                // Refresh my comments
                Ajax.refreshComments(this.post.postId, myCommentIds, myLikeCounts, myContents, this.myCommentsBox.take, this.feedFilter, 'myComments',
                    (commentCards: CommentCard[]) => {

                        if (commentCards == null) {
                            this.myCommentsBox.messageElm.innerText = 'My Comments - No changes have been made';
                        }
                        else {
                            this.myCommentsBox.messageElm.innerText = 'My Comments';
                            this.myCommentsBox.clear();
                            this.myCommentsBox.add(commentCards);
                        }
                    }
                );
            }

            if (this.likedCommentsBox.length > 0) {

                // Prepare liked comments
                let likedCommentIds: number[] = [];
                let likedLikeCounts: number[] = [];
                let likedContents: string[] = [];
                this.likedCommentsBox.content.forEach((content: IAppendable) => {
                    likedCommentIds.push((<CommentCard>content).comment.commentId);
                    likedLikeCounts.push((<CommentCard>content).comment.likes.count);
                    likedContents.push((<CommentCard>content).comment.content);
                });


                // Refresh liked comments
                Ajax.refreshComments(this.post.postId, likedCommentIds, likedLikeCounts, likedContents, this.likedCommentsBox.take, this.feedFilter, 
                    'likedComments',
                    (commentCards: CommentCard[]) => {

                        if (commentCards == null) {
                            this.likedCommentsBox.messageElm.innerText = 'My Liked Comments - No changes have been made';
                        }
                        else {
                            this.likedCommentsBox.messageElm.innerText = 'My Liked Comments';
                            this.likedCommentsBox.clear();
                            this.likedCommentsBox.add(commentCards);
                        }
                    }
                );
            }
        }
        
    }

    private refreshPostDetails(): void {
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