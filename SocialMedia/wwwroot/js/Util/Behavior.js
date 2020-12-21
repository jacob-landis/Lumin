var Behavior = (function () {
    function Behavior() {
    }
    Behavior.singleFullSizeImage = function (imageCard) { return function () {
        fullSizeImageModal.loadSingle(imageCard.rawImage.id);
    }; };
    return Behavior;
}());
//# sourceMappingURL=Behavior.js.map