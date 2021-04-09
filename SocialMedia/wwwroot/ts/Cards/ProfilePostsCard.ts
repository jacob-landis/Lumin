class ProfilePostsCard extends Card {

    private profileId: number;

    private feedFilter: 'recent' | 'likes' | 'comments' = 'recent';
    
    private btnMyPostActivity: ToggleButton; 
    private btnToggleSearchBar: ToggleButton; 
    
    // A PostsBox for displaying a profile's posts.
    private postBoxes: ContentBox; 
    private mainPostsBox: PostsBox;
    private likedPostsBox: PostsBox; 
    private commentedPostsBox: PostsBox; 
    
    private commentedPostsStaged: StageFlag = new StageFlag(); 
    private likedPostsStaged: StageFlag = new StageFlag(); 
    private mainPostsStaged: StageFlag = new StageFlag(); 

    private postBoxesStage: Stage;

    public constructor(
        rootElm: HTMLElement,
        btnToggleSearchBar: HTMLElement,
        private btnTogglePostFeedFilter: HTMLElement,
        btnRefreshProfilePostFeed: HTMLElement,
        btnMyPostActivity: HTMLElement,
        private btnSearchPosts: HTMLElement,
        private txtSearchPosts: HTMLInputElement,
        commentedPostsBoxWrapper: HTMLElement,
        likedPostsBoxWrapper: HTMLElement,
        mainPostsBoxWrapper: HTMLElement
    ) {

        super(rootElm);

        this.btnToggleSearchBar = new ToggleButton(null, 'fa-search', 'fa-times', 'Open search bar', 'Close search bar',
            <HTMLElement>btnToggleSearchBar.childNodes[1], btnToggleSearchBar, () => this.showSearchBar(), () => this.hideSearchBar());

        this.btnMyPostActivity = new ToggleButton(null, '', 'showingMyPostActivity', 'Show my activity', 'Hide my activity', null, btnMyPostActivity,
            () => this.showMyPostActivity(), () => this.hideMyPostActivity()); 

        this.btnSearchPosts.onclick = (e: MouseEvent) => this.searchPosts();
        this.txtSearchPosts.onkeyup = (e: KeyboardEvent) => { if (e.keyCode == 13) this.btnSearchPosts.click(); }

        this.btnTogglePostFeedFilter.onclick = (event: MouseEvent) => this.togglePostFeedFilter(); 
        btnRefreshProfilePostFeed.onclick = (event: MouseEvent) => this.refreshProfilePostFeed(); 

        this.postBoxes = new ContentBox(this.rootElm); 

        this.commentedPostsBox = new PostsBox(0, commentedPostsBoxWrapper, this.rootElm, 'commentedPosts', () => this.feedFilter, () => { 
            this.commentedPostsBox.messageElm.innerText = 'Comment Activity Posts';
            this.postBoxesStage.updateStaging(this.commentedPostsStaged);

            // ShowCommentActivity on each post card in commentedPosts.
            this.commentedPostsBox.content.forEach((content: IAppendable) => {
                let postCard = <PostCard>content;
                postCard.commentsSection.showCommentActivity(() => postCard.stage.updateStaging(postCard.commentsSection.allStaged));
            });
        });

        this.likedPostsBox = new PostsBox(0, likedPostsBoxWrapper, this.rootElm, 'likedPosts', () => this.feedFilter, () => { 
            this.likedPostsBox.messageElm.innerText = 'Liked Posts';
            this.postBoxesStage.updateStaging(this.likedPostsStaged);
        });

        this.mainPostsBox = new PostsBox(0, mainPostsBoxWrapper, this.rootElm, 'mainPosts', () => this.feedFilter, () => { 
            this.mainPostsBox.messageElm.innerText = 'All Posts'
            this.postBoxesStage.updateStaging(this.mainPostsStaged);
        });
    }

    public load(profileId: number): void {
        this.profileId = profileId;
        this.postBoxesStage = new Stage([this.mainPostsStaged], () => this.displayPosts()); 
        this.mainPostsBox.onLoadEnd = () => this.postBoxesStage.updateStaging(this.mainPostsStaged); 

        // Create post box and start feed.
        this.mainPostsBox.profileId = profileId; 
        this.mainPostsBox.start(); 
    }


    private togglePostFeedFilter(): void { 

        let feedFilterSecondIcon = this.btnTogglePostFeedFilter.children[1];

        switch (this.feedFilter) {
            case 'recent': { // Switch to likes. Next: comments
                this.feedFilter = 'likes';
                this.btnTogglePostFeedFilter.title = 'Sort by comment popularity';
                feedFilterSecondIcon.classList.remove('fa-thumbs-up');
                feedFilterSecondIcon.classList.add('fa-comments');
                break;
            }
            case 'likes': { // Switch to comments. Next: recent
                this.feedFilter = 'comments';
                this.btnTogglePostFeedFilter.title = 'Sort by recent';
                feedFilterSecondIcon.classList.remove('fa-comments');
                feedFilterSecondIcon.classList.add('fa-calendar');
                break;
            }
            case 'comments': { // Switch to recent. Next: likes
                this.feedFilter = 'recent';
                this.btnTogglePostFeedFilter.title = 'Sort by like popularity';
                feedFilterSecondIcon.classList.remove('fa-calendar');
                feedFilterSecondIcon.classList.add('fa-thumbs-up');
                break;
            }
        }

        this.mainPostsBox.clear();
        this.mainPostsBox.requestCallback = (skip: number, take: number) => {
            Ajax.getProfilePosts(this.profileId, skip, take, this.feedFilter, 'mainPosts', (postCards: PostCard[]) => {

                if (postCards == null) return;
                this.mainPostsBox.add(postCards);
            });
        }

        this.mainPostsBox.start();
    }

    private refreshProfilePostFeed(): void { 

        this.postBoxesStage = new Stage([this.mainPostsStaged], () => this.displayPosts());
        ViewUtil.hide(this.postBoxes.rootElm);

        this.mainPostsBox.refreshPosts(() => {

            if (this.commentedPostsBox.length > 0 || this.likedPostsBox.length > 0) this.mainPostsBox.messageElm.innerText = 'All Posts';
            this.postBoxesStage.updateStaging(this.mainPostsStaged);
        });

        if (this.commentedPostsBox.length > 0) {

            this.postBoxesStage.stageFlags.push(this.commentedPostsStaged);
            this.commentedPostsBox.refreshPosts(() => this.postBoxesStage.updateStaging(this.commentedPostsStaged));
        }

        if (this.likedPostsBox.length > 0) {

            this.postBoxesStage.stageFlags.push(this.likedPostsStaged);
            this.likedPostsBox.refreshPosts(() => this.postBoxesStage.updateStaging(this.likedPostsStaged));
        }
    }

    private searchPosts(): void {
        Ajax.searchPosts(this.profileId, 0, 5, this.txtSearchPosts.value, (postCards: PostCard[]) => {

            this.mainPostsBox.clear();

            if (postCards != null && postCards.length != 0) {
                this.hideMyPostActivity();
                this.mainPostsBox.add(postCards);
                this.mainPostsBox.messageElm.innerText = 'Search results';
            }
            else this.mainPostsBox.messageElm.innerText = 'Search results - No posts found';
        });
    }

    private showSearchBar(): void {
        ViewUtil.show(this.txtSearchPosts);
        ViewUtil.show(this.btnSearchPosts);
        this.btnToggleSearchBar.toggle();
        this.txtSearchPosts.focus();
    }

    private hideSearchBar(): void {
        ViewUtil.hide(this.txtSearchPosts);
        ViewUtil.hide(this.btnSearchPosts);
        this.txtSearchPosts.value = '';
        this.btnToggleSearchBar.toggle();
        this.mainPostsBox.clear();
        this.mainPostsBox.request(15);
        this.mainPostsBox.messageElm.innerText = '';
    }

    private showMyPostActivity(): void { 
        this.postBoxesStage = new Stage([this.commentedPostsStaged, this.likedPostsStaged], () => this.displayPosts());
        ViewUtil.hide(this.postBoxes.rootElm);
        this.commentedPostsBox.request(15);
        this.likedPostsBox.request(15);
        this.setBtnMyPostActivity(false);
    }

    private hideMyPostActivity(): void { 
        this.commentedPostsBox.clear();
        this.likedPostsBox.clear();
        this.commentedPostsBox.messageElm.innerText = '';
        this.likedPostsBox.messageElm.innerText = '';
        this.mainPostsBox.messageElm.innerText = '';
        this.setBtnMyPostActivity(true);
    }

    private setBtnMyPostActivity(makeBtnShowActivity: boolean): void { 
        this.mainPostsBox.messageElm.innerText = makeBtnShowActivity ? '' : 'All Posts';
        this.btnMyPostActivity.toggle();
    }

    private displayPosts(): void { 
        ViewUtil.show(this.postBoxes.rootElm, 'block');
    }

    public clear(): void {
        this.hideMyPostActivity();
        this.mainPostsBox.clear();
        this.mainPostsBox.messageElm.innerText = '';
    }
}