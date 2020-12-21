var Util = (function () {
    function Util() {
    }
    Util.getElmHeight = function (elm) {
        return Math.max(elm.scrollHeight, elm.offsetHeight, elm.clientHeight);
    };
    Util.getElmWidth = function (elm) {
        return Math.max(elm.scrollWidth, elm.offsetWidth, elm.clientWidth);
    };
    Util.getDocumentHeight = function () {
        var d = document.documentElement;
        var b = document.body;
        return Math.max(b.scrollHeight, d.scrollHeight, b.offsetHeight, d.offsetHeight, b.clientHeight, d.clientHeight);
    };
    Util.formatDateTime = function (dateTime) {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var jsDateTime = new Date(Date.parse(dateTime)).toLocaleString();
        var date = jsDateTime.substring(0, jsDateTime.indexOf(','));
        var mdy = date.split('/');
        date = months[Number(mdy[0]) - 1] + " " + numSuffix(Number(mdy[1])) + ", " + mdy[2];
        var time = jsDateTime.substring(jsDateTime.indexOf(' ') + 1);
        var hm = time.split(':');
        var meridiem = time.substring(time.indexOf(' ') + 1) == 'PM' ? 'pm' : 'am';
        time = hm[0] + ":" + hm[1] + " " + meridiem;
        return date + " at " + time;
        function numSuffix(n) {
            if (n == 1 || n == 21 || n == 31)
                return n + 'st';
            if (n == 2 || n == 22)
                return n + 'nd';
            return n + 'th';
        }
    };
    Util.filterNulls = function (array) {
        array.filter(function (i) { return i != null; });
    };
    return Util;
}());
//# sourceMappingURL=Util.js.map