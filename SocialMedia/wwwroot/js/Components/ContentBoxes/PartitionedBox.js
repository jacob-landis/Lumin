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
var PartitionedBox = (function (_super) {
    __extends(PartitionedBox, _super);
    function PartitionedBox(rootElm, buttons, mainBox, subBoxes, onSearch) {
        var _this = _super.call(this, rootElm) || this;
        _this.mainBox = mainBox;
        _this.subBoxes = subBoxes;
        _this.onSearch = onSearch;
        var searchIcon = Icons.search();
        buttons.push(new ToggleButton('btnSearchComments', searchIcon, searchIcon.childNodes[0], [
            new ToggleState('fa-search', 'Search comments', function () { return _this.showSearchBar(); }),
            new ToggleState('fa-times', 'Close search', function () { return _this.hideSearchBar(); })
        ]).rootElm);
        _this.txtSearch = ViewUtil.tag('input', { type: 'text', classList: 'txtSearch myTextBtnPair' });
        _this.btnSearch = Icons.search();
        _this.btnSearch.classList.add('btnSearch', 'myBtnTextPair');
        _this.btnSearch.title = 'Search';
        _this.btnSearch.onclick = function (event) { return _this.search(); };
        buttons.push(_this.txtSearch, _this.btnSearch);
        buttons.forEach(function (button) { return _this.rootElm.append(button); });
        _this.add(subBoxes);
        _this.add(mainBox);
        mainBox.request(10);
        return _this;
    }
    PartitionedBox.prototype.setFeedFilter = function (feedFilter) {
        var _this = this;
        this.feedFilter = feedFilter;
        this.stage = new Stage([this.mainBox.staged], function () { return _this.display(); });
        ViewUtil.hide(this.rootElm);
        this.mainBox.clear();
        this.mainBox.request(10);
        this.mainBox.messageElm.innerText = '';
        this.subBoxes.forEach(function (box) {
            if (box.content.length > 0) {
                _this.stage.flags.push(box.staged);
                box.clear();
                box.request(10);
            }
        });
    };
    PartitionedBox.prototype.refresh = function () {
        var _this = this;
        this.stage = new Stage([this.mainBox.staged], function () { return _this.display(); });
        ViewUtil.hide(this.rootElm);
        this.mainBox.refresh(function () {
            _this.subBoxes.forEach(function (box) {
                if (box.content.length > 0)
                    _this.mainBox.messageElm.innerText = 'All';
            });
            _this.stage.updateStaging(_this.mainBox.staged);
        });
        this.subBoxes.forEach(function (box) {
            if (box.content.length > 0) {
                _this.stage.flags.push(box.staged);
                box.refresh(function () { return _this.stage.updateStaging(box.staged); });
            }
        });
    };
    PartitionedBox.prototype.display = function () {
        ViewUtil.show(this.rootElm, 'block');
    };
    PartitionedBox.prototype.showSubBoxes = function () {
        var _this = this;
        this.stage = new Stage([], function () { return _this.display(); });
        ViewUtil.hide(this.rootElm);
        this.subBoxes.forEach(function (box) {
            _this.stage.flags.push(box.staged);
            box.request(10);
        });
        this.mainBox.messageElm.innerText = 'All';
    };
    PartitionedBox.prototype.hideSubBoxes = function () {
        this.subBoxes.forEach(function (box) {
            box.clear();
            box.messageElm.innerText = '';
        });
        this.mainBox.messageElm.innerText = '';
    };
    PartitionedBox.prototype.search = function () {
        var _this = this;
        this.onSearch(this.txtSearch.value, function (cards) {
            _this.mainBox.clear();
            if (cards != null) {
                _this.hideSubBoxes();
                _this.mainBox.add(cards);
                _this.mainBox.messageElm.innerText = 'Search results';
            }
            else
                _this.mainBox.messageElm.innerText = 'Search results - No comments found';
        });
    };
    PartitionedBox.prototype.showSearchBar = function () {
        ViewUtil.show(this.txtSearch);
        ViewUtil.show(this.btnSearch);
        this.txtSearch.focus();
    };
    PartitionedBox.prototype.hideSearchBar = function () {
        ViewUtil.hide(this.txtSearch);
        ViewUtil.hide(this.btnSearch);
        this.txtSearch.value = '';
        this.mainBox.clear();
        this.mainBox.request(10);
        this.mainBox.messageElm.innerText = '';
    };
    return PartitionedBox;
}(ContentBox));
//# sourceMappingURL=PartitionedBox.js.map