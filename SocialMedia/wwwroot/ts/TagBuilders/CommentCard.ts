/*
    This class is used to construct new image cards and holds logic for image card interaction.
*/
class CommentCard extends Card {
    
    public static commentCards: CommentCard[] = [];

    /*
        Creates a new comment card with the data from the one provided.
        Used to put a comment in multiple places. 
    */
    public static copy(commentCard) {
        return new CommentCard(commentCard.comment);
    }

    /*
        Converts an array of comments into an array of comment cards.
    */
    public static list(comments: CommentRecord[]) {
        let commentCards: CommentCard[] = [];
        comments.forEach(comment => commentCards.push(new CommentCard(comment)));
        return commentCards;
    }

    // /STATIC
    // ---------------------------------------------------------------------------------------------------------------
    // NON-STATIC

    // Comment data.
    public comment: CommentRecord;

    /*
        Contructs a new comment card JS obj and HTML elm.
    */
    public constructor(comment: CommentRecord) {

        super(ViewUtil.tag('div', { classList: 'comment' }));

        // Get a handle on the comment record.
        this.comment = comment;
        
        // Sibling to OptsSection. Contains all but btnOpts.
        let mainSection: HTMLElement = ViewUtil.tag('div', { classList: 'commentMainSection' });
        let optsSection: HTMLElement = ViewUtil.tag('div', { classList: 'commentOptsSection' });
        let contentSection: HTMLElement = ViewUtil.tag('div', { classList: 'commentContentSection' });
        let btnOpts: HTMLElement = ViewUtil.tag('i', { classList: 'commentOpts threeDots fa fa-ellipsis-v' });
        let editIcon: HTMLElement = Icons.edit();

        // Create an Editor for the comment text.
        let commentEditor: Editor = new Editor(editIcon, comment.content, 'comment-editor', 125,
            content => Ajax.updateComment(this.comment.commentId, content));

        // Append the comment editor.
        contentSection.append(commentEditor.rootElm);
        mainSection.append(
            new ProfileCard(comment.profile).rootElm,
            contentSection,
            new LikeCard(comment.likes, ContentType.Comment, comment.dateTime).rootElm
        );
        this.rootElm.append(mainSection, optsSection);

        // If the user owns this comment, provide an options button.
        if (comment.profile.relationToUser == 'me') {

            // Append the options button to the options section.
            optsSection.append(btnOpts);

            // Set click callback of btnOpts to open context menu with an edit and delete option.
            btnOpts.onclick = e => contextModal.load(e, [

                // Edit: start comment edit.
                new ContextOption(editIcon, () => commentEditor.start()),

                // Delete: prompt for confirmation to delete.
                new ContextOption(Icons.deleteComment(),
                    () => confirmModal.load('Are you sure you want to delete this comment?',
                        answer => {
                            if (answer == false) return;
                            else this.remove(); // Delete comment.
                        }
                    )
                )
            ]);
        }

        // Add this comment to the collection.
        CommentCard.commentCards.push(this);
    }

    /*
        PUBLIC

        Remove this comment's record from the host.
        Remove any copies of this comment card.
        Reduce comment count by one on every copy of the comment's parent post card.
    */
    public remove(): void {

        // Remove this comment's record from the host.
        Ajax.deleteComment(this.comment.commentId);

        // For each comment card in the collection,
        CommentCard.commentCards.forEach(commentCard => {

            // if it's CommentID matches this one,
            if (commentCard.comment.commentId == this.comment.commentId) {

                // remove it's root elm,
                ViewUtil.remove(commentCard.rootElm);

                // and override it's collection reference with null.
                commentCard = null;
            }
        });

        // Clean up collection by filtering out nulls.
        Util.filterNulls(CommentCard.commentCards);

        // Delete this comment data from memory. XXX do other copies get deleted from memory? XXX Do the next lines run correctly? XXX
        //delete this;

        // For each post card in collection,
        PostCard.postCards.forEach(p => {

            // if this comment belongs to the post,
            if (p.post.postId == this.comment.postId) {

                // decrement the comment count display elm,
                p.setCommentCount(p.totalCommentCount - 1);

                // and decrement the count data property.
                p.totalCommentCount--;
            }
        });
    }
}