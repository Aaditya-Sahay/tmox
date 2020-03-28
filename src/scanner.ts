import Token from './token'
import TokenType from './tokentype'

export default class Scanner {
    source: string;
    tokens: Array<Token>
    start: number
    current: number
    line: number
    constructor(source: string){
        this.source = source;
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
    }
    tokenize(): Array<Token> {
        while(!this.isEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", {}, this.line));
        return this.tokens;
    }
    scanToken() {
        let c = this.proceed(); 
        switch (c) {                                 
            case '(': this.addToken(TokenType.LEFT_PAREN); break;     
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;    
            case '{': this.addToken(TokenType.LEFT_BRACE); break;     
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;    
            case ',': this.addToken(TokenType.COMMA); break;          
            case '.': this.addToken(TokenType.DOT); break;            
            case '-': this.addToken(TokenType.MINUS); break;          
            case '+': this.addToken(TokenType.PLUS); break;           
            case ';': this.addToken(TokenType.SEMICOLON); break;      
            case '*': this.addToken(TokenType.STAR); break; 
          }
    }
    addToken(type: TokenType) {

    }
    proceed(): string {
        this.current++
        return this.source.charAt(this.current -1)
    }
    isEnd(): boolean {
        return this.current >= this.source.length;
    }
}