class CommentCard {

    static copy(commentCard) {
        return new CommentCard(commentCard.comment);
    }

    static list(comments) {
        let commentCards = [];
        comments.forEach(c => commentCards.push(new CommentCard(c)));
        return commentCards;
    }

    static commentCards = [];

    constructor(comment) {
        this.comment = comment;
        //this.commentId = comment.commentId;
        //this.postId = comment.postId;
        this.tag = ViewUtil.tag('div', { classList: 'comment' });
        let mainSection = ViewUtil.tag('div', { classList: 'commentMainSection' });
        let optsSection = ViewUtil.tag('div', { classList: 'commentOptsSection' });
        let contentSection = ViewUtil.tag('div', { classList: 'commentContentSection' });

        this.btnOpts = ViewUtil.tag('i', { classList: 'commentOpts threeDots fa fa-ellipsis-v' });
        this.editIcon = Icons.edit();
        this.commentEditor = new Editor(this.editIcon, comment.content, 'comment-editor', 125,
            content => Repo.updateComment(this.comment.commentId, content));

        contentSection.append(this.commentEditor.tag);
        mainSection.append(new ProfileCard(comment.profile).tag, contentSection, new LikeCard(comment.likes, 2, comment.dateTime))
        this.tag.append(mainSection, optsSection);
        
        if (comment.profile.relationToUser == 'me') {
            optsSection.append(this.btnOpts);
            
            this.btnOpts.onclick = e => ContextModal.load(e, [
                new ContextOption(this.editIcon, () => this.commentEditor.start()),
                new ContextOption(Icons.deleteComment(),
                    () => ConfirmModal.load('Are you sure you want to delete this comment?', confirmation => {
                        if (!confirmation) return;
                        this.remove();
                }))
            ]);
        }
        CommentCard.commentCards.push(this);
    }

    remove() {
        Repo.removeComment(this.comment.commentId);
        CommentCard.commentCards.forEach(c => {
            if (c.comment.commentId == this.comment.commentId) {
                ViewUtil.remove(c.tag);
                c = null;
            }
        });
        Util.filterNulls(CommentCard.commentCards);
        delete this;

        PostCard.postCards.forEach(p => {
            if (p.post.postId == this.comment.postId) {
                p.setCommentCount(p.totalCommentCount - 1);
                p.loadedCommentCount--;
            }
        });
    }
}