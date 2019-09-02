class LikeCard {

    static cardHandles = [];

    static btnLikeCallback;

    constructor(likes, type, dateTime) {
        let card = ViewUtil.tag('div', { classList: 'likeCard' });
        let dateTimeStamp = ViewUtil.tag('div', { classList: 'contentPostDate', innerText: Util.formatDateTime(dateTime) });

        this.contentId = likes.contentId;
        this.hasLiked = likes.hasLiked;
        this.type = type;
        this.btnLike = ViewUtil.tag('i', { classList: 'fa fa-thumbs-up likeIcon ' + (this.hasLiked ? 'hasLiked' : '') });
        this.count = ViewUtil.tag('div', { classList: 'likeCount', innerText: likes.count != 0 ? likes.count : '0' });

        card.append(this.btnLike, this.count, dateTimeStamp);

        this.btnLike.onclick = () => {
            
            if (this.hasLiked) Repo.dislike(this.type, likes.contentId);
            else Repo.like(this.type, likes.contentId);

            LikeCard.cardHandles.forEach(c => {
                if (c.contentId == this.contentId && c.type == this.type) {
                    c.count.innerText = parseInt(c.count.innerText) + (c.hasLiked ? -1 : 1);
                    c.btnLike.classList.toggle('hasLiked');
                    c.hasLiked = !c.hasLiked;
                }

            });
        }

        LikeCard.cardHandles.push(this);

        return card;
    }
}