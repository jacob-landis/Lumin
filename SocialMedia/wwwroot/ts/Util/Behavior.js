var Behavior = /** @class */ (function () {
    function Behavior() {
    }
    //static userImageContextOpts =imageCard=> e=> {
    //    ContextModal.load(e, true, [
    //        new ContextOption(Icons.createPost(), () => {
    //            ImageDropdown.close();
    //            CreatePostModal.load(imageCard);
    //        }),
    //        new ContextOption(Icons.deleteImage(), () => {
    //            console.log(imageCard);
    //        })
    //    ]);
    //}
    Behavior.singleFullSizeImage = function (imageCard) { return function () {
        FullSizeImageModal.loadSingle(imageCard.rawImage.id);
    }; };
    return Behavior;
}());
//# sourceMappingURL=Behavior.js.map