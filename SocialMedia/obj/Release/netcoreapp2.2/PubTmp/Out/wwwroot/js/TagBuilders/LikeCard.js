var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LikeCard = (function (_super) {
    __extends(LikeCard, _super);
    function LikeCard(likes, dateTime) {
        var _this = _super.call(this, ViewUtil.tag('div', { classList: 'likeCard' })) || this;
        var dateTimeStamp = ViewUtil.tag('div', { classList: 'contentPostDate', innerText: Util.formatDateTime(dateTime) });
        _this.likesRecord = likes;
        _this.btnLike = ViewUtil.tag('i', { classList: 'fa fa-thumbs-up likeIcon ' + (_this.likesRecord.hasLiked ? 'hasLiked' : '') });
        _this.countDisplayElm = ViewUtil.tag('div', { classList: 'likeCount', innerText: _this.likesRecord.count != 0 ? _this.likesRecord.count : '0' });
        _this.rootElm.append(_this.btnLike, _this.countDisplayElm, dateTimeStamp);
        _this.btnLike.onclick = function (e) {
            if (_this.likesRecord.hasLiked)
                Ajax.unlike(_this.likesRecord.contentType, _this.likesRecord.contentId);
            else
                Ajax.postLike(_this.likesRecord.contentType, _this.likesRecord.contentId);
            LikeCard.changeAllContentInstances(_this.likesRecord);
        };
        LikeCard.likeCards.push(_this);
        return _this;
    }
    LikeCard.changeAllContentInstances = function (referenceLikesRecord) {
        this.likeCards.forEach(function (likeCard) {
            if (likeCard.likesRecord.contentId == referenceLikesRecord.contentId
                && likeCard.likesRecord.contentType == referenceLikesRecord.contentType) {
                likeCard.likesRecord.count += likeCard.likesRecord.hasLiked ? -1 : 1;
                likeCard.countDisplayElm.innerText = "" + likeCard.likesRecord.count;
                likeCard.btnLike.classList.toggle('hasLiked');
                likeCard.likesRecord.hasLiked = !likeCard.likesRecord.hasLiked;
            }
        });
    };
    LikeCard.likeCards = [];
    return LikeCard;
}(Card));
//# sourceMappingURL=LikeCard.js.map