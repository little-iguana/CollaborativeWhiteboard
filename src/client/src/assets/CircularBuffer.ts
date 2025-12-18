
export default class CircularBuffer<T> {
	
	private buffer : Array<T | null>;
	
	private writeIndex : number = 0;
	
	constructor(capacity : number) {
		this.buffer = new Array<T>(capacity);
		this.buffer.fill(null);
	}
	
	private incrementPointer(pointer : number) : void {
		pointer++;
		if (pointer >= this.buffer.length) {
			pointer %= this.buffer.length
		}
		return pointer;
	}
	
	readAll() : Array<T> {
		let allItems = [];
		// the condition in the for loop has to be true to continue, and will stop when false.
		for (let i = this.incrementPointer(this.writeIndex); i != this.writeIndex; i = this.incrementPointer(i)) {
			if (this.buffer[i] != null) {
				allItems.push(this.buffer[i]);
			}
		}
		return allItems;
	}
	
	write(value : T) : void {
		// read index is ignored because the read() method was never called.
		this.buffer[this.writeIndex] = value;
		this.writeIndex = this.incrementPointer(this.writeIndex);
	}
	
	getSize() {
		return this.buffer.length;
	}
	
	toString() {
		return "" + this.buffer[0] + ", " + this.buffer[1] + ", " + this.buffer[2] + ", " + this.buffer[3] + "";
	}
}







