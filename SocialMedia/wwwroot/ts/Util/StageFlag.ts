/*
    Used to pass primative boolean values by reference.
*/
class StageFlag {

    private _flag: boolean = false;
    public get isRaised(): boolean { return this._flag; }

    public raise() { this._flag = true; }
    public lower() { this._flag = false; }
}