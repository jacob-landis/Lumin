class ProfilePostsCard extends Card {

    private profileId: number;

    private feedFilter: 'recent' | 'likes' | 'comments' = 'recent';

    // A PostsBox for displaying a profile's posts.
    private postBoxes: ContentBox; 
    public mainPostsBox: PostsBox;
    private likedPostsBox: PostsBox; 
    private commentedPostsBox: PostsBox; 
    
    private commentedPostsStaged: StageFlag = new StageFlag(); 
    private likedPostsStaged: StageFlag = new StageFlag(); 
    private mainPostsStaged: StageFlag = new StageFlag(); 

    private postBoxesStage: Stage;

    private get myActivityIsShowing() { return this.commentedPostsBox.hasContent || this.likedPostsBox.hasContent }

    public constructor(
        scrollElm: HTMLElement,
        rootElm: HTMLElement,
        btnToggleSearchBar: HTMLElement,
        btnTogglePostFeedFilter: HTMLElement,
        btnRefreshProfilePostFeed: HTMLElement,
        btnMyPostActivity: HTMLElement,
        private btnSearchPosts: HTMLElement,
        private txtSearchPosts: HTMLInputElement,
        commentedPostsBoxWrapper: HTMLElement,
        likedPostsBoxWrapper: HTMLElement,
        mainPostsBoxWrapper: HTMLElement
    ) {

        super(rootElm);
        
        new ToggleButton(null, btnToggleSearchBar, <HTMLElement>btnToggleSearchBar.childNodes[1], [
            new ToggleState('fa-search', 'Open search bar', () => this.showSearchBar()),
            new ToggleState('fa-times', 'Close search bar', () => this.hideSearchBar())
        ]);
        
        new ToggleButton(null, btnMyPostActivity, null, [
            new ToggleState('', 'Show my activity', () => this.showMyPostActivity()),
            new ToggleState('showingMyPostActivity', 'Hide my activity', () => this.hideMyPostActivity())
        ]);

        new ToggleButton(null, btnTogglePostFeedFilter, <HTMLElement>btnTogglePostFeedFilter.children[1], [
            new ToggleState('fa-thumbs-up', 'Sort by popularity',        () => this.setPostFeedFilter('likes')),
            new ToggleState('fa-comments', 'Sort by comment popularity', () => this.setPostFeedFilter('comments')),
            new ToggleState('fa-calendar', 'Sort by recent',             () => this.setPostFeedFilter('recent'))
        ]);

        this.btnSearchPosts.onclick = (e: MouseEvent) => this.searchPosts();
        this.txtSearchPosts.onkeyup = (e: KeyboardEvent) => { if (e.keyCode == 13) this.btnSearchPosts.click(); }
        btnRefreshProfilePostFeed.onclick = (event: MouseEvent) => this.refreshProfilePostFeed(); 

        this.postBoxes = new ContentBox(this.rootElm); 
        
        this.commentedPostsBox = new PostsBox(0, commentedPostsBoxWrapper, scrollElm, 'commentedPosts', () => this.feedFilter, () => { 
            this.commentedPostsBox.messageElm.innerText = 'Comment Activity Posts';
            this.postBoxesStage.updateStaging(this.commentedPostsStaged);

            // ShowCommentActivity on each post card in commentedPosts.
            this.commentedPostsBox.content.forEach((content: IAppendable) => {
                let postCard = <PostCard>content;
                postCard.commentsSection.showCommentActivity(() => postCard.stage.updateStaging(postCard.commentsSection.allStaged));
            });
        });

        this.likedPostsBox = new PostsBox(0, likedPostsBoxWrapper, scrollElm, 'likedPosts', () => this.feedFilter, () => { 
            this.likedPostsBox.messageElm.innerText = 'Liked Posts';
            this.postBoxesStage.updateStaging(this.likedPostsStaged);
        });

        this.mainPostsBox = new PostsBox(0, mainPostsBoxWrapper, scrollElm, 'mainPosts', () => this.feedFilter, () => { 
            
            if (this.myActivityIsShowing)
                this.mainPostsBox.messageElm.innerText = 'All Posts';

            else if (!this.mainPostsBox.hasContent && this.profileId == User.profileId)
                this.mainPostsBox.messageElm.innerHTML = `You have no posts. Click the <i class="fa fa-plus" alt="plus"></i>
                    <i class="fa fa-sticky-note" alt="post"></i> button on the left side of the navigation bar to start creating your first post.`;

            else if (!this.mainPostsBox.hasContent && this.profileId)
                this.mainPostsBox.messageElm.innerText = 'This user has no posts.';

            this.postBoxesStage.updateStaging(this.mainPostsStaged);
        });
    }

    public load(profileId: number): void {
        this.profileId = profileId;
        this.postBoxesStage = new Stage([this.mainPostsStaged], () => this.displayPosts());

        [this.mainPostsBox, this.commentedPostsBox, this.likedPostsBox].forEach((postsBox: PostsBox) => {
            postsBox.expandBox();
        });

        // Create post box and start feed.
        this.mainPostsBox.profileId = profileId; 
        this.mainPostsBox.start(); 
    }


    private setPostFeedFilter(feedFilter: 'recent' | 'likes' | 'comments' = 'recent'): void { 

        this.feedFilter = feedFilter;

        this.mainPostsBox.clear();
        this.mainPostsBox.requestCallback = (skip: number, take: number) => {
            Ajax.getProfilePosts(this.profileId, skip, take, this.feedFilter, 'mainPosts', (postCards: PostCard[]) => {

                if (postCards == null) return;
                this.mainPostsBox.add(postCards);
            });
        }

        this.mainPostsBox.start();

        if (this.commentedPostsBox.hasContent) {
            this.postBoxesStage.flags.push(this.commentedPostsStaged);
            this.commentedPostsBox.clear();
            this.commentedPostsBox.request(15);
        }

        if (this.likedPostsBox.hasContent) {
            this.postBoxesStage.flags.push(this.likedPostsStaged);
            this.likedPostsBox.clear();
            this.likedPostsBox.request(15);
        }
    }

    private refreshProfilePostFeed(): void { 

        this.postBoxesStage = new Stage([this.mainPostsStaged], () => this.displayPosts());
        this.postBoxes.rootElm.classList.add('contentLoading');

        this.mainPostsBox.refreshPosts(() => {

            if (this.myActivityIsShowing) this.mainPostsBox.messageElm.innerText = 'All Posts';
        });

        if (this.commentedPostsBox.hasContent) {

            this.postBoxesStage.flags.push(this.commentedPostsStaged);
            this.commentedPostsBox.refreshPosts(() => this.postBoxesStage.updateStaging(this.commentedPostsStaged));
        }

        if (this.likedPostsBox.hasContent) {

            this.postBoxesStage.flags.push(this.likedPostsStaged);
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
        this.txtSearchPosts.focus();
    }

    private hideSearchBar(): void {
        ViewUtil.hide(this.txtSearchPosts);
        ViewUtil.hide(this.btnSearchPosts);
        this.txtSearchPosts.value = '';
        this.mainPostsBox.clear();
        this.mainPostsBox.request(15);
        this.mainPostsBox.messageElm.innerText = '';
    }

    private showMyPostActivity(): void {
        this.postBoxesStage = new Stage([this.commentedPostsStaged, this.likedPostsStaged], () => this.displayPosts());
        this.postBoxes.rootElm.classList.add('contentLoading');
        this.commentedPostsBox.request(15);
        this.likedPostsBox.request(15);
        this.mainPostsBox.messageElm.innerText = 'All Posts';
    }

    private hideMyPostActivity(): void { 
        this.commentedPostsBox.clear();
        this.likedPostsBox.clear();
        this.commentedPostsBox.messageElm.innerText = '';
        this.likedPostsBox.messageElm.innerText = '';
        this.mainPostsBox.messageElm.innerText = '';
    }

    private displayPosts(): void { 
        this.postBoxes.rootElm.classList.remove('contentLoading');
        if (this.mainPostsBox.length == 0)
            this.mainPostsBox.messageElm.innerText = `No posts were retrieved.`;
    }

    public setMessage(message: string): void {
        this.mainPostsBox.messageElm.innerText = message;
    }

    public clear(): void {
        this.hideMyPostActivity();
        this.mainPostsBox.clear();
        this.mainPostsBox.messageElm.innerText = '';
    }
}