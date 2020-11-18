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
    This class contains the functionality for a context menu.
    It only needs to be provided options and a click event.
*/
var ContextModal = /** @class */ (function (_super) {
    __extends(ContextModal, _super);
    /*
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    function ContextModal(rootElm, optionsBoxElm) {
        var _this = _super.call(this, rootElm) || this;
        // Create a new content box using a modal HTML component and get a handle on it.
        _this.optionsBox = new ContentBox(optionsBoxElm);
        // Set up scroll event listener for window. Close on scroll.
        window.addEventListener('scroll', function () {
            // When window is scrolled, if this modal is open, close it.
            if (_this.optionsBox.tag.style.display != "none")
                _this.close();
        });
        // Set up click event on r-click menu to close when clicked on.
        // (The click event on the button on this modal will also be triggered.)
        _this.optionsBox.tag.onclick = function () { return _this.close(); };
        return _this;
    }
    /*
        Open this modal and display the provided options.

        PARAMETERS:
        e must be the click event.
        options can be an array of ContextOptions or a single ContextOption.
    */
    ContextModal.prototype.load = function (e, options) {
        // Clear options box.
        this.optionsBox.clear();
        // Fill options box with the provided options.
        this.optionsBox.add(options);
        // Open this modal.
        this.open();
        // Prevent the default r-click action.
        e.preventDefault();
        // Reposition this modal tag to the position of the mouse.
        this.optionsBox.tag.style.left = e.clientX - this.optionsBox.width;
        this.optionsBox.tag.style.top = e.clientY - this.optionsBox.height;
    };
    return ContextModal;
}(Modal));
//# sourceMappingURL=ContextModal.js.map