var Behavior = (function () {
    function Behavior() {
    }
    Behavior.singleFullSizeImage = function (imageCard) { return function () {
        fullSizeImageModal.loadSingle(imageCard.image.imageId);
    }; };
    return Behavior;
}());
//# sourceMappingURL=Behavior.js.map