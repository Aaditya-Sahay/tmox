
import Scanner from './scanner'
import fs from 'fs'

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
        let string = fs.readFileSync(this.file).toString()
        this.run(string)
    }
    //executes prompts
    prompt(){

    }
    //scanner 
    run(source: string) {
        let scanner = new Scanner(source, this);
        let tokens = scanner.tokenize();
        for (let token of tokens) {
            console.log(token);
        }
    }

    report(line: number, where: string, message: string){
        console.log("[line " + line + "] Error" + where + ": " + message)
        this.hadError = true
    }
}
