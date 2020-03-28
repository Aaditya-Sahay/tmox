
import Scanner from './scanner'
export default class Tmox {
    file: string
    hadError: boolean
    constructor(file: string){
        this.file = file;

        this.hadError = false;
    }
    init(){
        if (this.file) {
            if (this.hadError) process.exit(42); 
            this.execute();

        }
        else {
            this.prompt(); // TODO
        }
    }
    // executes file 
    execute(){

    }
    //executes prompts
    prompt(){

    }
    //scanner 
    run() {
        let scanner = new Scanner("source");
        let tokens = scanner.tokenize();
        // for (let token in tokens) {
        //     console.log(token);
        // }
    }

    report(line: number, where: string, message: string){
        console.log("[line " + line + "] Error" + where + ": " + message)
        this.hadError = true
    }
}
