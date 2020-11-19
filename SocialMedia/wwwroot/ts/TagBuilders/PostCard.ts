class PostCard extends Card {

    static list(posts) {
        let postCards = [];
        if (posts) {
            posts.forEach(p => postCards.push(new PostCard(p)));
            return postCards;
        }
    }

    static postCards = [];
    
    constructor(rootElm: HTMLElement, post: PostRecord) {

        super(rootElm);

        this.profileId = post.profile.profileId;
        this.post = post;
        this.postId = post.postId;
        this.image = post.image;

        if (this.post.image) this.hasImage = true;

        // POST CONSTRUCTION
        // __________________________________ TAG

        this.rootElm = ViewUtil.tag('div', { classList: 'postCard' });
        let postSection = ViewUtil.tag('div', { classList: 'postSection' });
        let commentSection = ViewUtil.tag('div', { classList: 'commentSection' });

        this.rootElm.append(postSection, commentSection);

        // __________________________________ COMMENT INPUT

        this.commentInputWrapper = ViewUtil.tag('div', { classList: 'commentInputWrapper' });
        this.errorSlot = ViewUtil.tag('div', { classList: 'errorSlot' });
        this.commentCountSlot = ViewUtil.tag('div', { classList: 'commentCountSlot' });

        this.commentsBox = new ContentBox(null, 'comments', 30, (skip, take) =>
                Repo.comments(this.postId, skip, take, comments => this.commentsBox.add(comments)));

        let txtComment = ViewUtil.tag('textarea', { classList: 'txtComment' });
        let btnComment = ViewUtil.tag('button', { classList: 'btnComment', innerHTML: 'Comment' });

        commentSection.append(this.commentInputWrapper, this.errorSlot, this.commentCountSlot, this.commentsBox.tag);
        this.commentInputWrapper.append(txtComment, btnComment);

        // __________________________________ 

        this.postImageWrapper = new ImageBox(null, 'postImageWrapper', 'postImage', Behavior.singleFullSizeImage);

        if (this.hasImage) {
            this.postImageWrapper.load(this.post.image.id);
            this.captionWrapper = ViewUtil.tag('div', { classList: 'captionWrapper' });
        }
        else this.captionWrapper = ViewUtil.tag('div', { classList: 'captionWrapper noImageCaptionWrapper' });

        this.postHeading = ViewUtil.tag('div', { classList: 'postHeading' });

        postSection.append(this.postHeading, this.captionWrapper, this.postImageWrapper.tag);

        // must have a handle on editIcon to exclude it from the window onclick event listener in Editor
        this.editIcon = Icons.edit();
        this.captionEditor = new Editor(this.editIcon, post.caption, 'post-caption-editor', 1000,
            caption => Repo.updatePost(this.postId, caption));

        this.captionWrapper.append(this.captionEditor.tag);

        //------------------------------------------------------------------------------------------

        let profileCardSlot = ViewUtil.tag('div', { classList: 'profileCardSlot' });
        let likeCardSlot = ViewUtil.tag('div', { classList: 'detailsSlot' });
        let postOptsSlot = ViewUtil.tag('div', { classList: 'postOptsSlot' });

        this.postHeading.append(profileCardSlot, likeCardSlot, postOptsSlot);
        profileCardSlot.append(new ProfileCard(post.profile).tag);
        likeCardSlot.append(new LikeCard(post.likes, 1, post.dateTime));

        //------------------------------------------------------------------------------------------
        // END POST CONSTRUCTION

        // Load comments
        this.commentsBox.request(15);
        this.requestCommentCount();

        // On scroll
        this.commentsBox.tag.onscroll = () => {
            let divHeight = this.commentsBox.tag.scrollHeight;
            let offset = this.commentsBox.tag.scrollTop + this.commentsBox.tag.clientHeight;

            if (offset == divHeight) this.commentsBox.request();
        }

        // PRIVATE OPTIONS
        if (post.profile.relationToUser == 'me') {
            let btnPostOpts = ViewUtil.tag('i', { classList: 'btnPostOpts threeDots fa fa-ellipsis-v' });
            postOptsSlot.append(btnPostOpts);

            btnPostOpts.onclick = e => ContextModal.load(e, [
                new ContextOption(this.editIcon, () => this.captionEditor.start()),
                new ContextOption(Icons.deletePost(), () =>
                    ConfirmModal.load('Are you sure you want to delete this post?', confirmation => {
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
                    (commentCard: string) => {
                        PostCard.postCards.forEach(p => {
                            if (p.post.postId == commentCard.comment.postId) {
                                p.commentsBox.add(CommentCard.copy(commentCard), true);
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

    resizeCommentBox() {
        let inputHeight = this.commentInputWrapper.clientHeight;
        let contentHeight = this.postImageWrapper.height + this.postHeading.clientHeight + this.captionWrapper.clientHeight;

        this.commentsBox.height = contentHeight - inputHeight;
        if (this.commentsBox.height < 250) this.commentsBox.height = 250;
        this.observer.disconnect();
    }

    setCommentCount(newCount) {
        this.totalCommentCount = newCount;
        this.commentCountText.innerText = PostCard.formatCommentCount(newCount);
    }

    requestCommentCount() {
        Repo.commentCount(this.postId, commentCount => {
            this.commentCountText = ViewUtil.tag('div');
            this.setCommentCount(commentCount);

            this.commentCountSlot.append(this.commentCountText);
        });
    }

    static formatCommentCount(commentCount) {
        if (commentCount == 0) return 'No Comments';
        else if (commentCount == 1) return '1 Comment';
        else return `${commentCount} Comments`;
    }

    remove() {
        this.setCommentCount(this.totalCommentCount - 1);
        Repo.removePost(this.postId);
        PostCard.postCards.forEach(c => {
            if (c.postId == this.postId) {
                ViewUtil.remove(c.tag);
                c = null;
            }
        });
        PostCard.postCards = Util.filterNulls(PostCard.postCards);
        delete this;
    }
    // to trigger the mutation observer which triggers a resize. the assigned id is never used.
    mutate() { this.rootElm.id = 'loadedPost'; }
}