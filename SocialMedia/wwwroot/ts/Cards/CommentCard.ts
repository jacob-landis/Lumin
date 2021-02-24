/*
    This class is used to construct new image cards and holds logic for image card interaction.
*/
class CommentCard extends Card {
    
    public static commentCards: CommentCard[] = [];
    
    /*
        Creates a new comment card with the data from the one provided.
        Used to put a comment in multiple places. 
    */
    public static copy(commentCard): CommentCard {
        return new CommentCard(commentCard.comment);
    }

    /*
        Converts an array of comments into an array of comment cards.
    */
    public static list(comments: CommentRecord[]): CommentCard[] {
        let commentCards: CommentCard[] = [];
        comments.forEach(comment => commentCards.push(new CommentCard(comment)));
        return commentCards;
    }

    // /STATIC
    // ---------------------------------------------------------------------------------------------------------------
    // NON-STATIC
    
    // Comment data.
    public comment: CommentRecord;

    public commentEditor: Editor;

    /*
        Contructs a new comment card JS obj and HTML elm.

        Example:
        <div class="comment">
            <div class="commentMainSection">
                <div class="profileCard"></div>   // ProfileCard root element
                <div class="commentContentSection">
                    <div class="editor comment-editor"></div>   // Editor root element (contains caption element)
                </div>
                <div class="likeCard"></div>   // LikeCard root element
            </div>
            <div class="commentOptsSection">
                <i class="commentOpts threeDots fa fa-ellipsis-v"></i>
            </div>
        </div>

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
        this.commentEditor = new Editor(editIcon, comment.content, 'comment-editor', false, 125, // XXX 'comment-editor' should be provided from main. XXX
            (content: string) => {

                // Send update request to server.
                Ajax.updateComment(this.comment.commentId, content)

                // Change any other occurances of this comment.
                CommentCard.commentCards.forEach((c: CommentCard) => {
                    if (c.comment.commentId == this.comment.commentId)
                        c.commentEditor.setText(content);
                });
            }
        );
        
        // Append the comment editor.
        contentSection.append(this.commentEditor.rootElm);
        mainSection.append(
            new ProfileCard(comment.profile).rootElm,
            contentSection,
            new LikeCard(LikesRecord.copy(comment.likes), comment.dateTime).rootElm
        );
        this.rootElm.append(mainSection, optsSection);

        // If the user owns this comment, provide an options button.
        if (comment.profile.relationToUser == 'me') {

            // Append the options button to the options section.
            optsSection.append(btnOpts);

            // Set click callback of btnOpts to open context menu with an edit and delete option.
            btnOpts.onclick = (e: MouseEvent) => contextMenu.load(e, [

                // Edit: start comment edit.
                new ContextOption(editIcon, (e: MouseEvent) => this.commentEditor.start()),

                // Delete: prompt for confirmation to delete.
                new ContextOption(Icons.deleteComment(),
                    (e: MouseEvent) => confirmPrompt.load('Are you sure you want to delete this comment?',
                        (answer: boolean) => {
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

    public disputeHasSeen(): void {
        if (!this.comment.hasSeen) this.rootElm.classList.add("unseenComment");
    }

    public alertVisible(): void {

        Ajax.updateCommentHasSeen(this.comment.commentId);

        CommentCard.commentCards.forEach((commentCard: CommentCard) => {
            if (commentCard.comment.commentId == this.comment.commentId) {

                setTimeout(() => {
                    commentCard.rootElm.classList.remove("unseenComment");
                }, 1000);

                commentCard.comment.hasSeen = false;             
            }
        });
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
        CommentCard.commentCards.forEach((commentCard: CommentCard) => {

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
        PostCard.postCards.forEach((p: PostCard) => {

            // If this comment belongs to the current post.
            if (p.post.postId == this.comment.postId) {
                
                // Display the new comment count.
                p.setCommentCount(p.totalCommentCount - 1);
            }
        });
    }
}