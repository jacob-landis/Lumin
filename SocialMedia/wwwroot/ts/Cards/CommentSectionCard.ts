class CommentSectionCard extends Card {
    
    private post: PostRecord;

    private getContentHeight: () => number;

    public totalCommentCount: number;
    private inputHeight: number;
    private targetHeight: number;
    private rootElmMinHeight: number;

    public commentBoxes: ContentBox;
    private mainCommentsBox: CommentsBox;
    private myCommentsBox: CommentsBox;
    private likedCommentsBox: CommentsBox;

    private commentInputWrapper: HTMLElement;
    private errorSlot: HTMLElement;
    private lblCommentCharacterCount: HTMLElement;

    private txtSearchComments: HTMLInputElement;
    private btnConfirmCommentSearch: HTMLElement;

    private commentBoxDetails: HTMLElement;
    private commentCountSlot: HTMLElement;
    private commentCountText: HTMLElement;
    private commentBoxFeedControls: HTMLElement;
    private btnRefreshFeed: HTMLElement;
    private btnToggleFeedFilter: ToggleButton;
    private btnMyActivity: ToggleButton;
    private btnToggleViewExpansion: ToggleButton;
    private btnSearchComments: ToggleButton;

    private feedFilter: 'recent' | 'likes' = 'recent';

    // Used by postCard. Not used in this.commentBoxesStage.
    public allStaged: StageFlag = new StageFlag();

    // onStagingEnd for this stage is set in PostCard for the first load. This class may overwrite it.
    public commentBoxesStage: Stage;
    private myCommentsStaged: StageFlag = new StageFlag();
    private likedCommentsStaged: StageFlag = new StageFlag();
    private mainCommentsStaged: StageFlag = new StageFlag();
    private isFirstCommentsBatch: boolean = true;
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

                    <div class="btnSearchComments">
                        <i class="fa fa-search"
                    </div>

                    <div class="btnToggleCommentFeedFilter"></div>
                    <div class="btnRefreshCommentFeed"></div>
                    <div class="btnMyActivity"></div>
                </div>
            </div>

            <input type="text" class="txtSearchComments myTextBtnPair" />
            <div class="icon btnSearchFriends myBtnTextPair">
                <i class="fa fa-search"></i>
            </div>

            <div class="content-box commentBoxes">
                <div class="contentMessage"></div>
                <div class="contentContainer">
                    <div class="content-box myComments"></div>
                    <div class="content-box likedComments"></div>
                    <div class="content-box mainComments"></div>
                </div>
            </div>
            <i class="fa fa-dropdownArrow"></i>
        </div>
    */

    public constructor(post: PostRecord, getContentHeight: () => number) {

        super(ViewUtil.tag('div', { classList: 'commentSection' }));

        this.post = post;
        this.getContentHeight = getContentHeight;

        this.commentInputWrapper = ViewUtil.tag('div', { classList: 'commentInputWrapper' });
        this.errorSlot = ViewUtil.tag('div', { classList: 'errorSlot' });
        this.lblCommentCharacterCount = ViewUtil.tag('div', { classList: 'lblCommentCharacterCount' })

        this.commentBoxDetails = ViewUtil.tag('div', { classList: 'commentBoxDetails' });
        this.commentCountSlot = ViewUtil.tag('div', { classList: 'commentCountSlot' });
        this.commentBoxFeedControls = ViewUtil.tag('div', { classList: 'commentBoxFeedControls' });

        let btnSearchCommentsIcon: HTMLElement = Icons.search();

        this.btnSearchComments = new ToggleButton('btnSearchComments', btnSearchCommentsIcon, <HTMLElement>btnSearchCommentsIcon.childNodes[0], [
            new ToggleState('fa-search', 'Search comments', () => this.showCommentSearchBar()),
            new ToggleState('fa-times', 'Close search', () => this.hideCommentSearchBar())
        ]);

        let btnToggleFeedFilterIcon: HTMLElement = Icons.filterByLikes();
        this.btnToggleFeedFilter = new ToggleButton('btnToggleCommentFeedFilter', btnToggleFeedFilterIcon, <HTMLElement>btnToggleFeedFilterIcon.childNodes[1], [
            new ToggleState('fa-thumbs-up', 'Sort by popularity', () => this.toggleFeedFilter()),
            new ToggleState('fa-calendar', 'Sort by recent')
        ]);

        this.btnRefreshFeed = Icons.refresh();
        this.btnRefreshFeed.classList.add('btnRefreshCommentFeed');
        this.btnRefreshFeed.title = 'Refresh comment feed';
        
        this.btnMyActivity = new ToggleButton('btnMyActivity', Icons.history(), null, [
            new ToggleState('', 'Show my activity', () => this.showCommentActivity()),
            new ToggleState('showingMyCommentActivity', 'Hide my activity', () => this.hideCommentActivity())
        ]);

        this.txtSearchComments = <HTMLInputElement>ViewUtil.tag('input', { type: 'text', classList: 'txtSearchComments myTextBtnPair' });
        this.btnConfirmCommentSearch = Icons.search();
        this.btnConfirmCommentSearch.classList.add('btnConfirmCommentSearch', 'myBtnTextPair');
        this.btnConfirmCommentSearch.title = 'Search';

        this.myCommentsBox = new CommentsBox(this.post.postId, 'myComments', () => this.feedFilter, (noChanges: boolean) => {

            if (noChanges) this.myCommentsBox.messageElm.innerText = 'My Comments - No changes have been made';
            else this.myCommentsBox.messageElm.innerText = 'My Comments';
            
            this.commentBoxesStage.updateStaging(this.myCommentsStaged);
        });

        this.likedCommentsBox = new CommentsBox(this.post.postId, 'likedComments', () => this.feedFilter, (noChanges: boolean) => {
            if (noChanges) this.likedCommentsBox.messageElm.innerText = 'My Liked Comments - No changes have been made';
            else this.likedCommentsBox.messageElm.innerText = 'My Liked Comments';

            this.commentBoxesStage.updateStaging(this.likedCommentsStaged);
        });
        
        this.mainCommentsBox = new CommentsBox(this.post.postId, 'mainComments', () => this.feedFilter, () => {
            
            if (this.mainCommentsBox.length == 0) {
                this.commentBoxesStage.updateStaging(this.mainCommentsStaged);
                return;
            }

            if (this.myCommentsBox.length > 0 || this.likedCommentsBox.length > 0) this.mainCommentsBox.messageElm.innerText = 'All Comments';

            // If this post belongs to current user, indicate which comments have not been seen by the user.
            if (this.post.profile.profileId == User.profileId)
                this.mainCommentsBox.content.forEach((comment: CommentCard) => comment.disputeHasSeen());

            // If first batch (was just loaded) and this post does NOT have an image, resize the comments section (now that the elements have loaded).
            if (this.isFirstCommentsBatch) {
                this.isFirstCommentsBatch = false;

                if (this.post.image == null) this.resizeCommentBox();
            }

            this.commentBoxesStage.updateStaging(this.mainCommentsStaged);
        });

        this.commentBoxes = new ContentBox(ViewUtil.tag('div', { classList: 'commentBoxes' }));
        this.commentBoxes.add([this.myCommentsBox, this.likedCommentsBox, this.mainCommentsBox]);

        let txtComment: HTMLInputElement = <HTMLInputElement>ViewUtil.tag('textarea', { classList: 'txtComment' });
        let btnConfirm: HTMLElement = Icons.confirm();
        let btnCancel: HTMLElement = Icons.cancel();
        let btnComment: HTMLElement = ViewUtil.tag('button', { classList: 'btnComment', innerHTML: 'Create Comment' });

        let btnToggleExpanIcon: HTMLElement = Icons.dropdownArrow();
        this.btnToggleViewExpansion = new ToggleButton('btnToggleViewExpansion', btnToggleExpanIcon, <HTMLElement>btnToggleExpanIcon.childNodes[0], [
            new ToggleState('fa-sort-down', 'Expand comments', () => this.expandCommentSection()),
            new ToggleState('fa-sort-up', 'Contract comments', () => this.contractCommentSection())
        ]);

        this.rootElm.append(this.commentInputWrapper, this.errorSlot, this.commentBoxDetails, this.txtSearchComments,
            this.btnConfirmCommentSearch, this.commentBoxes.rootElm, this.btnToggleViewExpansion.rootElm);
        this.commentBoxDetails.append(this.commentCountSlot, this.commentBoxFeedControls);
        this.commentBoxFeedControls.append(this.btnMyActivity.rootElm, this.btnToggleFeedFilter.rootElm, this.btnRefreshFeed, this.btnSearchComments.rootElm);
        this.commentInputWrapper.append(txtComment, this.lblCommentCharacterCount, btnConfirm, btnCancel, btnComment);

        // Load comments
        this.mainCommentsBox.request(15);
        this.requestCommentCount();

        this.btnConfirmCommentSearch.onclick = (e: MouseEvent) => this.searchComments();
        this.txtSearchComments.onkeyup = (e: KeyboardEvent) => { if (e.keyCode == 13) this.btnConfirmCommentSearch.click(); }
        
        this.btnRefreshFeed.onclick = (event: MouseEvent) => this.refreshCommentFeed();

        // Clear txtComment and remove class to change styling.
        let deactivateInput: () => void = () => {
            txtComment.value = '';
            this.commentInputWrapper.classList.remove('activeInput');
        }
        
        this.lblCommentCharacterCount.innerText = `${txtComment.value.length}/125`;

        txtComment.onkeyup = (event: KeyboardEvent) => {
            this.lblCommentCharacterCount.innerText = `${txtComment.value.length}/125`;

            if (txtComment.value.length > 125 || txtComment.value.length == 0)
                this.lblCommentCharacterCount.classList.add('errorMsg');

            else if (this.lblCommentCharacterCount.classList.contains('errorMsg'))
                this.lblCommentCharacterCount.classList.remove('errorMsg');
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
                                        p.commentsSection.mainCommentsBox.add(new CommentCard(CommentRecord.copy(commentResults)), true);
                                        p.commentsSection.resizeCommentBox();
                                        p.commentsSection.setCommentCount(this.totalCommentCount + 1);
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

        this.commentBoxesStage = new Stage([this.mainCommentsStaged], () => this.displayResults());
        ViewUtil.hide(this.commentBoxes.rootElm);
        
        this.feedFilter = this.feedFilter == 'likes' ? 'recent' : 'likes';

        this.mainCommentsBox.clear();
        this.mainCommentsBox.request(15);
        this.mainCommentsBox.messageElm.innerText = '';

        if (this.myCommentsBox.length > 0) {
            this.commentBoxesStage.flags.push(this.mainCommentsStaged);
            this.myCommentsBox.clear();
            this.myCommentsBox.request(15);
        }

        if (this.likedCommentsBox.length > 0) {
            this.commentBoxesStage.flags.push(this.likedCommentsStaged);
            this.likedCommentsBox.clear();
            this.likedCommentsBox.request(15);
        }
    }

    public showCommentActivity(onActivityStaged?: () => void): void {
        this.commentBoxesStage = new Stage([this.myCommentsStaged, this.likedCommentsStaged], () => {
            this.displayResults()
            if (onActivityStaged != null) onActivityStaged();
        });

        ViewUtil.hide(this.commentBoxes.rootElm);
        this.myCommentsBox.request(15);
        this.likedCommentsBox.request(15);
        this.setBtnMyActivity(false);
    }

    private hideCommentActivity(): void {
        this.myCommentsBox.clear();
        this.likedCommentsBox.clear();
        this.myCommentsBox.messageElm.innerText = '';
        this.likedCommentsBox.messageElm.innerText = '';
        this.mainCommentsBox.messageElm.innerText = '';
        this.setBtnMyActivity(true);
    }

    private refreshCommentFeed(): void {

        this.commentBoxesStage = new Stage([this.mainCommentsStaged], () => this.displayResults());
        ViewUtil.hide(this.commentBoxes.rootElm);

        this.mainCommentsBox.refreshComments((noChanges: boolean) => {

            let myActivityIsShowing: boolean = this.myCommentsBox.length > 0 || this.likedCommentsBox.length > 0;

            if (noChanges) {
                if (myActivityIsShowing) this.mainCommentsBox.messageElm.innerText = 'All Comments - No changes have been made';
                else this.mainCommentsBox.messageElm.innerText = 'No changes have been made';
            }
            else if (myActivityIsShowing) this.mainCommentsBox.messageElm.innerText = 'All Comments';

            this.commentBoxesStage.updateStaging(this.mainCommentsStaged);
        });

        if (this.myCommentsBox.length > 0) {

            this.commentBoxesStage.flags.push(this.myCommentsStaged);
            this.myCommentsBox.refreshComments();
        }

        if (this.likedCommentsBox.length > 0) {
            
            this.commentBoxesStage.flags.push(this.likedCommentsStaged);
            this.likedCommentsBox.refreshComments();
        }
    }

    private setBtnMyActivity(makeBtnShowActivity: boolean) {
        this.mainCommentsBox.messageElm.innerText = makeBtnShowActivity ? '' : 'All Comments';
    }

    private displayResults(): void {
        ViewUtil.show(this.commentBoxes.rootElm, 'block');
    }

    private searchComments(): void {

        Ajax.searchComments(this.post.postId, 0, 30, this.txtSearchComments.value, (commentCards: CommentCard[]) => {

            this.mainCommentsBox.clear();

            if (commentCards != null) {
                this.hideCommentActivity();
                this.mainCommentsBox.add(commentCards);
                this.mainCommentsBox.messageElm.innerText = 'Search results';
            }
            else this.mainCommentsBox.messageElm.innerText = 'Search results - No comments found';
        });
    }

    private showCommentSearchBar(): void {
        ViewUtil.show(this.txtSearchComments);
        ViewUtil.show(this.btnConfirmCommentSearch);
        this.txtSearchComments.focus();
    }

    private hideCommentSearchBar(): void {
        ViewUtil.hide(this.txtSearchComments);
        ViewUtil.hide(this.btnConfirmCommentSearch);
        this.txtSearchComments.value = '';
        this.mainCommentsBox.clear();
        this.mainCommentsBox.request(15);
        this.mainCommentsBox.messageElm.innerText = '';
    }

    private expandCommentSection(): void {
        this.setHeight(720, (720 + this.inputHeight));
    }

    private contractCommentSection(): void {
        this.setHeight(this.targetHeight, this.rootElmMinHeight);
    }

    public resizeCommentBox(): void {
        this.inputHeight = this.commentInputWrapper.clientHeight + this.commentBoxDetails.clientHeight + this.btnToggleViewExpansion.rootElm.clientHeight;
        this.targetHeight = this.getContentHeight() - this.inputHeight;
        
        this.setHeight(this.targetHeight, this.rootElm.offsetHeight);
        this.rootElmMinHeight = this.rootElm.clientHeight; // clientHeight must be read after setHeight() call.
    }

    private setHeight(commentBoxesHeight: number, sectionHeight: number): void {
        this.commentBoxes.height = commentBoxesHeight;
        this.commentBoxes.rootElm.style.maxHeight = `${commentBoxesHeight}`;
        this.rootElm.style.minHeight = `${sectionHeight}`;
        this.rootElm.style.maxHeight = `${sectionHeight}`;
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