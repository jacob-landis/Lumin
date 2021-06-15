class Util {

    public static convertPrivacyLevel(level: number): string {
        switch (level) {
            case 0: return 'All';
            case 1: return 'Mutual friends';
            case 2: return 'Friends'; 
            case 3: return 'None';
        }
        return 'All';
    }

    public static getElmHeight(elm: HTMLElement): number {
        return Math.max(
            elm.scrollHeight,
            elm.offsetHeight,
            elm.clientHeight
        );
    }

    public static getElmWidth(elm: HTMLElement): number {
        return Math.max(
            elm.scrollWidth,
            elm.offsetWidth,
            elm.clientWidth,
        );
    }

    public static getDocumentHeight(): number {
        let d: HTMLElement = document.documentElement;
        let b: HTMLElement = document.body;
        return Math.max(
            b.scrollHeight, d.scrollHeight,
            b.offsetHeight, d.offsetHeight,
            b.clientHeight, d.clientHeight
        );
    }
    
    public static formatDateTime(dateTime: string): string {

        let months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let jsDateTime: string = new Date(Date.parse(dateTime)).toLocaleString();

        let date: string = jsDateTime.substring(0, jsDateTime.indexOf(','));
        let mdy: string[] = date.split('/');
        date = `${months[Number(mdy[0]) - 1]} ${numSuffix(Number(mdy[1]))}, ${mdy[2]}`;

        let time: string = jsDateTime.substring(jsDateTime.indexOf(' ') + 1);
        let hm: string[] = time.split(':');
        let meridiem: string = time.substring(time.indexOf(' ') + 1) == 'PM' ? 'pm' : 'am';
        time = `${hm[0]}:${hm[1]} ${meridiem}`;

        return `${date} at ${time}`;

        function numSuffix(n: number): string {
            
            // XXX replace with a switch case statement XXX
            if (n == 1 || n == 21 || n == 31) return n + 'st';
            if (n == 2 || n == 22) return n + 'nd';
            return n + 'th';
        }
    }
    
    public static filterNulls(array: any[]): void {
        array.filter((index: any) => index != null);
    }
}