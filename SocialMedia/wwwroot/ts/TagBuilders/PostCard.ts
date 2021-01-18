class PostCard extends Card {

    public static list(posts: PostRecord[]): PostCard[] {
        let postCards: PostCard[] = [];
        if (posts) {
            posts.forEach(p => postCards.push(new PostCard(p)));
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

    public constructor(post: PostRecord) {

        super(ViewUtil.tag('div', { classList: 'postCard' }));

        this.post = post;

        if (this.post.image) this.hasImage = true;
        
        // POST CONSTRUCTION
        // __________________________________ TAG
        
        let postSection = ViewUtil.tag('div', { classList: 'postSection' });
        let commentSection = ViewUtil.tag('div', { classList: 'commentSection' });

        this.rootElm.append(postSection, commentSection);

        // __________________________________ COMMENT INPUT

        this.commentInputWrapper = ViewUtil.tag('div', { classList: 'commentInputWrapper' });
        this.errorSlot = ViewUtil.tag('div', { classList: 'errorSlot' });
        this.commentCountSlot = ViewUtil.tag('div', { classList: 'commentCountSlot' });

        this.commentsBox = new ContentBox(ViewUtil.tag('div'), 30, (skip, take) =>
                Ajax.getComments(this.post.postId, skip, take, comments => this.commentsBox.add(comments)));

        let txtComment: HTMLInputElement = <HTMLInputElement> ViewUtil.tag('textarea', { classList: 'txtComment' });
        let btnComment = ViewUtil.tag('button', { classList: 'btnComment', innerHTML: 'Comment' });

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
            caption => Ajax.updatePost(this.post.postId, caption));

        this.captionWrapper.append(this.captionEditor.rootElm);

        //------------------------------------------------------------------------------------------

        let profileCardSlot = ViewUtil.tag('div', { classList: 'profileCardSlot' });
        let likeCardSlot = ViewUtil.tag('div', { classList: 'detailsSlot' });
        let postOptsSlot = ViewUtil.tag('div', { classList: 'postOptsSlot' });

        this.postHeading.append(profileCardSlot, likeCardSlot, postOptsSlot);
        profileCardSlot.append(new ProfileCard(this.post.profile).rootElm);
        likeCardSlot.append(new LikeCard(LikesRecord.copy(this.post.likes), this.post.dateTime).rootElm);

        //------------------------------------------------------------------------------------------
        // END POST CONSTRUCTION
        
        // Load comments
        this.commentsBox.request(15);
        this.requestCommentCount();

        // On scroll
        this.commentsBox.rootElm.onscroll = () => {
            let divHeight = this.commentsBox.rootElm.scrollHeight;
            let offset = this.commentsBox.rootElm.scrollTop + this.commentsBox.rootElm.clientHeight; // XXX can ContentBox.Height be used? XXX

            if (offset == divHeight) this.commentsBox.request();
        }

        // PRIVATE OPTIONS
        if (post.profile.relationToUser == 'me') {
            let btnPostOpts = ViewUtil.tag('i', { classList: 'btnPostOpts threeDots fa fa-ellipsis-v' });
            postOptsSlot.append(btnPostOpts);

            btnPostOpts.onclick = e => contextMenu.load(e, [
                new ContextOption(this.editIcon, () => this.captionEditor.start()),
                new ContextOption(Icons.deletePost(), () =>
                    confirmPrompt.load('Are you sure you want to delete this post?', confirmation => {
                        if (!confirmation) return;
                        this.remove();
                    }))
            ]);
        }

        // submit comment
        btnComment.onclick = () => {
            let error = ViewUtil.tag('div', { classList: 'errorMsg', innerText: '- Must be less than 125 characters' });
            
            if (txtComment.value.length <= 125) {
                Ajax.postComment(
                    JSON.stringify({ Content: txtComment.value, PostId: post.postId }),
                    (commentResults: CommentRecord) => {
                        PostCard.postCards.forEach(p => {
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

        // triggered when image is done loading
        this.observer = new MutationObserver(() => this.resizeCommentBox());
        this.observer.observe(this.rootElm, { attributes: true });
        this.postImageWrapper.onLoadEnd = () => this.mutate();

        // unload or reload posts above and below the position of the viewport
        window.addEventListener('scroll', () => {
            let offset = this.rootElm.offsetTop - window.pageYOffset;
            
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
        let inputHeight = this.commentInputWrapper.clientHeight;
        let contentHeight = this.postImageWrapper.height + this.postHeading.clientHeight + this.captionWrapper.clientHeight;

        this.commentsBox.height = contentHeight - inputHeight;
        if (this.commentsBox.height < 250) this.commentsBox.height = 250;
        this.observer.disconnect();
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
        Ajax.getCommentCount(this.post.postId, commentCount => {
            this.commentCountText = ViewUtil.tag('div');
            this.setCommentCount(commentCount);

            this.commentCountSlot.append(this.commentCountText);
        });
    }

    public remove(): void {
        this.setCommentCount(this.totalCommentCount - 1);
        Ajax.deletePost(this.post.postId);

        // XXX Instead of this, PostsBox should delete them so it can also splice it out of it's content array. XXX
        PostCard.postCards.forEach(c => {
            if (c.post.postId == this.post.postId) {
                ViewUtil.remove(c.rootElm);
                c = null;
            }
        });

        Util.filterNulls(PostCard.postCards);

        // XXX This is invalid code in TS. XXX
        //delete this;
    }

    // Triggers the mutation observer which triggers a resize. The assigned id is never used.
    private mutate(): void { this.rootElm.id = 'loadedPost'; }
}