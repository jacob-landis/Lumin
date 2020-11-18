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
/*
    This class is a sudo-extension of ContentBox.
    It manages the logic of a content box that specifically stores a single profile's images.

    First images request is sent to the host upon contruction.
*/
var ProfileImagesBox = /** @class */ (function (_super) {
    __extends(ProfileImagesBox, _super);
    /*
        PARAMETERS:
        profileId can be null.
        click can be null.
    */
    function ProfileImagesBox(profileId, click) {
        var _this = _super.call(this, null, 'images-box', 20, 
        // When content box is ready for more content,
        function (skip, take) {
            // send an images request to the host with the set skip and take values along with the ProfileID of this image box,
            Repo.images(_this.profileId, skip, take, 'listImage sqr', _this.click, 
            // and when they return as image cards with the click value that was just provided,
            function (imageCards) {
                // add them to this image box's content box.
                return _this.add(imageCards);
            });
        }) || this;
        // Get handle on ProfileID.
        // If a ProfileID was provided, this.profileID is profileId, else this.profileId is the current user's ProfileID.
        _this.profileId = profileId ? profileId : User.id;
        // Get handle on click action.
        _this.click = click;
        // Send first request to host.
        _this.request(40);
        // Add this image box to the collection.
        ProfileImagesBox.profileImageBoxes.push(_this);
        return _this;
    }
    /*
        Takes an image card and does some final preparation before adding it to this image box's content box.
    */
    ProfileImagesBox.prototype.addImageCard = function (imageCard) {
        // Imbed click action stored in this image box to image card.
        imageCard.click = this.click;
        // Update classList of image card so it is square and fits in the grid.
        imageCard.tag.classList = 'listImage sqr';
        // Add image card to this image box's content box.
        this.add(imageCard, true);
    };
    // A global collection of ImageBox instances.
    ProfileImagesBox.profileImageBoxes = [];
    return ProfileImagesBox;
}(ContentBox));
//# sourceMappingURL=ProfileImagesBox.js.map