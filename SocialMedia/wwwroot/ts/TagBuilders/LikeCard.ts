class LikeCard extends Card {

    static likeCards: LikeCard[] = [];

    static btnLikeCallback; // XXX don't know where this is used. XXX

    public static changeAllContentInstances(referenceLikesRecord: LikesRecord) {
        this.likeCards.forEach(c => {
            if (
                c.likesRecord.contentId == referenceLikesRecord.contentId
                && c.likesRecord.contentType == referenceLikesRecord.contentType
            ) {
                c.likesRecord.count += c.likesRecord.hasLiked ? -1 : 1;
                c.countDisplayElm.innerText = `${c.likesRecord.count}`;

                c.btnLike.classList.toggle('hasLiked');

                c.likesRecord.hasLiked = !c.likesRecord.hasLiked;
            }
        });
    }

    private likesRecord: LikesRecord;
    private countDisplayElm: HTMLElement;
    private btnLike: HTMLElement;

    constructor(likes: LikesRecord, dateTime: string) {
        
        super(ViewUtil.tag('div', { classList: 'likeCard' }));
        
        let dateTimeStamp = ViewUtil.tag('div', { classList: 'contentPostDate', innerText: Util.formatDateTime(dateTime) });

        this.likesRecord = likes;
        this.btnLike = ViewUtil.tag('i', { classList: 'fa fa-thumbs-up likeIcon ' + (this.likesRecord.hasLiked ? 'hasLiked' : '') });
        this.countDisplayElm = ViewUtil.tag('div', { classList: 'likeCount', innerText: this.likesRecord.count != 0 ? this.likesRecord.count : '0' });

        this.rootElm.append(this.btnLike, this.countDisplayElm, dateTimeStamp);

        this.btnLike.onclick = () => {
            
            // Update the record on the host.
            if (this.likesRecord.hasLiked) Ajax.unlike(this.likesRecord.contentType, this.likesRecord.contentId);
            else Ajax.postLike(this.likesRecord.contentType, this.likesRecord.contentId);

            // Adjust like cards on all occurences of this content.
            LikeCard.changeAllContentInstances(this.likesRecord);
        }

        LikeCard.likeCards.push(this);
    }


}