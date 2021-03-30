class CommentsBox extends Card {

    public rootElm: HTMLElement;
    private post: PostRecord;

    private getContentHeight: () => number;

    public totalCommentCount: number;

    private commentBoxes: ContentBox;
    private mainCommentsBox: ContentBox;
    private myCommentsBox: ContentBox;
    private likedCommentsBox: ContentBox;

    private commentInputWrapper: HTMLElement;
    private errorSlot: HTMLElement;

    private commentBoxDetails: HTMLElement;
    private commentCountSlot: HTMLElement; 
    private commentCountText: HTMLElement; 
    private commentBoxFeedControls: HTMLElement;
    private btnToggleFeedFilter: HTMLElement;
    private btnRefreshFeed: HTMLElement;
    private btnMyActivity: HTMLElement;

    private feedFilter: 'recent' | 'likes' = 'recent';

    // Used by postCard. Not used in this.commentBoxesStage.
    public allStaged: StageFlag = new StageFlag();

    // onStagingEnd for this stage is set in PostCard.
    public commentBoxesStage: Stage;
    private myCommentsStaged: StageFlag = new StageFlag();
    private likedCommentsStaged: StageFlag = new StageFlag();
    private mainCommentsStaged: StageFlag = new StageFlag();

    /*
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
    */

    public constructor(post: PostRecord, getContentHeight: () => number) {

        super(ViewUtil.tag('div', { classList: 'commentSection' }));

        this.post = post;
        this.getContentHeight = getContentHeight;

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
                this.commentBoxesStage.updateStaging(this.myCommentsStaged);
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
                this.commentBoxesStage.updateStaging(this.likedCommentsStaged);
            });
        });

        this.mainCommentsBox = new ContentBox(ViewUtil.tag('div', { classList: 'commentBox' }), null, 400, 30, (skip: number, take: number) => 
            Ajax.getComments(this.post.postId, skip, take, this.feedFilter, 'mainComments', (comments: CommentCard[]) => {

                if (comments == null) {
                    this.commentBoxesStage.updateStaging(this.mainCommentsStaged);
                    return;
                }

                // Determine if this is the first batch.
                // This is used after the comments have been added, but it must be determined before they are added.
                let isFirstCommentsBatch: boolean = this.mainCommentsBox.content.length == 0;

                // If this post belongs to current user, indicate which comments have not been seen by the user.
                if (this.post.profile.profileId == User.profileId)
                    comments.forEach((comment: CommentCard) => comment.disputeHasSeen());

                this.mainCommentsBox.add(comments);

                if (this.myCommentsBox.length > 0 || this.likedCommentsBox.length > 0) this.mainCommentsBox.messageElm.innerText = 'All Comments';

                // If first batch (was just loaded) and this post does NOT have an image, resize the comments section (now that the elements have loaded).
                if (isFirstCommentsBatch) {
                    if (this.post.image == null) this.resizeCommentBox();
                    this.commentBoxesStage.updateStaging(this.mainCommentsStaged);
                }
            })
        );

        this.commentBoxes = new ContentBox(ViewUtil.tag('div', { classList: 'commentBoxes' }));
        this.commentBoxes.add([this.myCommentsBox, this.likedCommentsBox, this.mainCommentsBox]); 

        let txtComment: HTMLInputElement = <HTMLInputElement>ViewUtil.tag('textarea', { classList: 'txtComment' });
        let btnConfirm: HTMLElement = Icons.confirm(); 
        let btnCancel: HTMLElement = Icons.cancel(); 
        let btnComment: HTMLElement = ViewUtil.tag('button', { classList: 'btnComment', innerHTML: 'Create Comment' });

        this.rootElm.append(this.commentInputWrapper, this.errorSlot, this.commentBoxDetails, this.commentBoxes.rootElm); 
        this.commentBoxDetails.append(this.commentCountSlot, this.commentBoxFeedControls); 
        this.commentBoxFeedControls.append(this.btnMyActivity, this.btnToggleFeedFilter, this.btnRefreshFeed); 
        this.commentInputWrapper.append(txtComment, btnConfirm, btnCancel, btnComment); 

        // Load comments
        this.mainCommentsBox.request(15); 
        this.requestCommentCount(); 

        this.btnToggleFeedFilter.onclick = (event: MouseEvent) => this.toggleFeedFilter(); 
        this.btnRefreshFeed.onclick = (event: MouseEvent) => this.refreshCommentFeed(); 
        this.setBtnMyActivity(true); 

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
                                        p.commentsBox.mainCommentsBox.add(new CommentCard(CommentRecord.copy(commentResults)), true);
                                        p.commentsBox.resizeCommentBox();
                                        p.commentsBox.setCommentCount(this.totalCommentCount + 1);
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

        this.commentBoxesStage = new Stage([this.mainCommentsStaged]);
    }

    private toggleFeedFilter(): void { 

        this.commentBoxesStage = new Stage([this.mainCommentsStaged], this.displayResults);

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

        this.mainCommentsBox.clear();
        this.mainCommentsBox.request(15);

        if (this.myCommentsBox.length > 0) {
            this.commentBoxesStage.stageFlags.push(this.mainCommentsStaged);
            this.myCommentsBox.clear();
            this.myCommentsBox.request(15);
        }

        if (this.likedCommentsBox.length > 0) {
            this.commentBoxesStage.stageFlags.push(this.likedCommentsStaged);
            this.likedCommentsBox.clear();
            this.likedCommentsBox.request(15);
        }
    }

    private showCommentActivity(): void { 
        this.commentBoxesStage = new Stage([this.mainCommentsStaged, this.myCommentsStaged, this.likedCommentsStaged], this.displayResults);
        this.myCommentsBox.request(15);
        this.likedCommentsBox.request(15);
        this.setBtnMyActivity(false);
    }

    private hideCommentActivity(): void { 
        this.commentBoxesStage = new Stage([this.mainCommentsStaged], this.displayResults);
        this.myCommentsBox.clear();
        this.likedCommentsBox.clear();
        this.myCommentsBox.messageElm.innerText = '';
        this.likedCommentsBox.messageElm.innerText = '';
        this.setBtnMyActivity(true);
    }

    private refreshCommentFeed(): void { 

        this.commentBoxesStage = new Stage([this.mainCommentsStaged], this.displayResults);

        // Collect list of all comment id's in this comment box and this post id and send to server for comparison.
        let commentIds: number[] = [];
        let likeCounts: number[] = [];
        let contents: string[] = [];
        this.mainCommentsBox.content.forEach((content: IAppendable) => {
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
            this.mainCommentsBox.take,
            this.feedFilter,
            'mainComments',
            (commentCards: CommentCard[]) => {

                if (commentCards == null) {
                    if (this.myCommentsBox.length > 0 || this.likedCommentsBox.length > 0)
                        this.mainCommentsBox.messageElm.innerText = 'All Comments - No changes have been made';
                    else
                        this.mainCommentsBox.messageElm.innerText = 'No changes have been made';
                }
                else if (commentCards != null) {
                    if (this.myCommentsBox.length > 0 || this.likedCommentsBox.length > 0) this.mainCommentsBox.messageElm.innerText = 'All Comments';
                    this.mainCommentsBox.clear();
                    this.mainCommentsBox.add(commentCards);
                }
            }
        );
        
        if (this.myCommentsBox.length > 0) {

            this.commentBoxesStage.stageFlags.push(this.myCommentsStaged);

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

            this.commentBoxesStage.stageFlags.push(this.likedCommentsStaged);

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

    private setBtnMyActivity(makeBtnShowActivty: boolean) { 
        makeBtnShowActivty ?
            this.btnMyActivity.classList.remove('showingMyCommentActivity')
            : this.btnMyActivity.classList.add('showingMyCommentActivity');

        this.mainCommentsBox.messageElm.innerText = makeBtnShowActivty ? '' : 'All Comments';
        this.btnMyActivity.title = makeBtnShowActivty ? 'Show my activity' : 'Hide my activity';
        this.btnMyActivity.onclick = (event: MouseEvent) => makeBtnShowActivty ? this.showCommentActivity() : this.hideCommentActivity();
    }

    private displayResults(): void {
        // Comment boxes need to be hidden each time a request goes out and controls need to be disabled. XXX
    }

    public resizeCommentBox(): void { 
        let inputHeight: number = this.commentInputWrapper.clientHeight;

        // The desired height of the comments box.
        let targetHeight: number = this.getContentHeight() - inputHeight;

        // Set height of comment box to the target height. CSS rule (min-height: 250px;) is applied to this.commentBox.rootElm.
        this.commentBoxes.height = targetHeight;
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
        this.mainCommentsBox.getVisibleContent().forEach((commentCard: Card) => commentCard.alertVisible());
    }
}