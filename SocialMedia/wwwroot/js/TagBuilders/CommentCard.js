/*
    This class is used to construct new image cards and holds logic for image card interaction.
*/
class CommentCard {
    
    // JSON obj that contains comment data.
    comment;

    // PUBLIC
    // The root HTML elm for this comment card.
    tag;

    // Only shown on user owned comment cards.
    // Opens context menu and provides user with an option to edit and an option to delete the comment.
    btnOpts;

    // Passed to Editor to include as a control and passed to ContextMenu as a ContextOption.
    editIcon; // XXX why is this saved when it's only used on one method? XXX
    
    // Editable comment text.
    commentEditor;

    /*
        Creates a new comment card with the data from the one provided.
        Used to put a comment in multiple places. 
    */
    static copy(commentCard) {
        return new CommentCard(commentCard.comment);
    }

    /*
        Converts an array of comments into an array of comment cards.
    */
    static list(comments) {
        let commentCards = [];
        comments.forEach(c => commentCards.push(new CommentCard(c)));
        return commentCards;
    }

    static commentCards = [];

    /*
        Contructs a new comment card JS obj and HTML elm.
    */
    constructor(comment) {

        // Get a handle on the comment record.
        this.comment = comment;

        // Create HTML elms and get handles on them.
        // HTML root.
        this.tag = ViewUtil.tag('div', { classList: 'comment' });

        // 
        let mainSection = ViewUtil.tag('div', { classList: 'commentMainSection' });
        let optsSection = ViewUtil.tag('div', { classList: 'commentOptsSection' });
        let contentSection = ViewUtil.tag('div', { classList: 'commentContentSection' });
        this.btnOpts = ViewUtil.tag('i', { classList: 'commentOpts threeDots fa fa-ellipsis-v' });
        this.editIcon = Icons.edit();

        // Create an Editor for the comment text.
        this.commentEditor = new Editor(this.editIcon, comment.content, 'comment-editor', 125,
            content => Repo.updateComment(this.comment.commentId, content));

        // Append the comment editor.
        contentSection.append(this.commentEditor.tag);
        mainSection.append(new ProfileCard(comment.profile).tag, contentSection, new LikeCard(comment.likes, 2, comment.dateTime))
        this.tag.append(mainSection, optsSection);

        // If the user owns this comment, provide an options button.
        if (comment.profile.relationToUser == 'me') {

            // Append the options button to the options section.
            optsSection.append(this.btnOpts);
            
            this.btnOpts.onclick = e => ContextModal.load(e, [
                new ContextOption(this.editIcon, () => this.commentEditor.start()),
                new ContextOption(Icons.deleteComment(),
                    () => ConfirmModal.load('Are you sure you want to delete this comment?',
                        confirmation => {
                            if (!confirmation) return;
                            this.remove();
                        }
                    )
                )
            ]);
        }
        CommentCard.commentCards.push(this);
    }

    /*
        PUBLIC

        Remove comment record from host.
        Remove any coppies of this comment card.
        Reduce comment count by one on every copy of the comment's parent post card.
    */
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