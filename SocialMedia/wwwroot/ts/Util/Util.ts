class Util {

    static getDivHeight(div) {
        return Math.max(
            div.scrollHeight,
            div.offsetHeight,
            div.clientHeight
        );
    }

    static getDivWidth(div) {
        return Math.max(
            div.scrollWidth,
            div.offsetWidth,
            div.clientWidth,
        );
    }

    static getDocumentHeight() {
        let d = document.documentElement;
        let b = document.body;
        return Math.max(
            b.scrollHeight, d.scrollHeight,
            b.offsetHeight, d.offsetHeight,
            b.clientHeight, d.clientHeight
        );
    }

    static formatDateTime(dateTime: string) {

        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let jsDateTime = new Date(Date.parse(dateTime)).toLocaleString();

        let date = jsDateTime.substring(0, jsDateTime.indexOf(','));
        let mdy = date.split('/');
        date = `${months[mdy[0] - 1]} ${numSuffix(mdy[1])}, ${mdy[2]}`;

        let time = jsDateTime.substring(jsDateTime.indexOf(' ') + 1);
        let hm = time.split(':');
        let meridiem = time.substring(time.indexOf(' ') + 1) == 'PM' ? 'pm' : 'am';
        time = `${hm[0]}:${hm[1]} ${meridiem}`;

        return `${date} at ${time}`;

        function numSuffix(num) {
            num = parseInt(num);
            if (num == 1 || num == 21 || num == 31) return num + 'st';
            if (num == 2 || num == 22) return num + 'nd';
            return num + 'th';
        }
    }

    static filterNulls =array=> array.filter(i => i != null)
}