/**
 * Kasza Patrik, 2019.
 */

class rock2js {
    constructor(source) {
        this.source = source;
        this.result = '';
        
        this.transpile();
    }
    
    transpile() {
        let result = this.source;
        
        // remove whitespaces from line start
        result = result
            .replace(/^[\t\f\v ]*/gm, '')
            // and from end of source
            .replace(/\s*$/s, '');
        
        // escape literals and "numbers"
        result = result
            .replace(/(?:(?<!(?:If|While|Until|Else).*)(?<=.*(?:is|was|are|were|\=|\'s|says)\s+(?:\"|.+).*))(?<=\s+)(mysterious|nothing|nowhere|nobody|empty|gone|null|right|yes|wrong|lies|minus|without|plus|with|times|over|was|are|were|the|my|your|ok|is|an|no|of|a)(?=\s+|$|\")/gm, `\\\\$1`)
            .replace(/\{/g, `ß`)
            .replace(/\}/g, `Ł`);
        
        // addition, subtraction, multiplication, division
        result = result
            .replace(/(?<=\s+)(?:minus|without)(?=\s+|$)/g, `-`)
            .replace(/(?<=\s+)(?:plus|with)(?=\s+|$)/g, `+`)
            .replace(/(?<=\s+)(?:times|of)(?=\s+|$)/g, `*`)
            .replace(/(?<=\s+)(?:over)(?=\s+|$)/g, `/`);
        
        // constants
        result = result
            .replace(/(?<!(?:says).*)(?<=\s+|\()(?:mysterious)(?=\s+|$|\))/gm, `undefined`)
            .replace(/(?<!(?:says).*)(?<=\s+|\()(?:nothing|nowhere|nobody|empty|gone|null)(?=\s+|$|\))/gm, `0`)
            .replace(/(?<!(?:says).*)(?<=\s+|\()(?:right|yes|ok)(?=\s+|$|\))/gm, `true`)
            .replace(/(?<!(?:says).*)(?<=\s+|\()(?:wrong|no|lies)(?=\s+|$|\))/gm, `false`);
        
        // Say, Shout, Whisper, Scream
        result = result
            .replace(/^(?:Say|Shout|Whisper|Scream)\s+(.*)/gm, (full, key) => {
                if (key.substr(0, 1) != `"`) {
                    const endings = '; , ? ! & .'.split(' ');
                    while (endings.indexOf(key.substr(-1)) > -1) key = key.substr(0, key.length - 1);
                }
                
                return `console.log(${key});`;
            });
        
        // Variable is ...
        result = result
            .replace(/(?:(?<!.*\s+is\s+.*)|(?<=(?:I|i)f.*\s+taking\s+.*))((?<=[a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ0-9_]+)\'s|(?<=[a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ0-9_]+)\s+(?:is|was|are|were))\s+/gm, ` = `);
        
        // Variable says ...
        result = result
            .replace(/(?<=(?<=[a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ0-9_])\s+)says (.*)/gm, (full, value) => {
                return `= "${value.replace(/\"/g, '\\"')}"`;
            });
        
        // remove single quotes
        result = result
            .replace(/(?<!\".*)\'|\,$/gm, '');
        
        // make some stuff on line "Variable is ..." but before "Put ... into ..."
        result = result
            .replace(/(?<!(?:While|Until|If|Else).*)(?<=^(?:[a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ0-9_]+ ?)+\s+\=\s+.*).+/gm, key => {
                if (key.match(/(?:^|\s+)(undefined|null|true|false)(?:\s+|;|$)/gm)) {
                    return `${key.replace(/\s+/g, '')};`;
                }
                
                if (key.match(/(^|^\s+)".*"(\s+$|$)/gm)) {
                    return `${key};`;
                }
                
                if (key.match(/^([A-ZÁÍŰŐÜÖÚÓÉ]+[a-záíűőüöúóé0-9_]* ?)+$/gm)) {
                    const realKey = key.replace(/\s+/g, '_').replace(/\s+/g, '');
                    const declared = !!(result.substr(0, result.indexOf('\n', result.indexOf(key))).match(`${realKey} = `));
                    
                    if (declared) {
                        return `${realKey};`;
                    }
                }
                
                let numbers = '';
                const keyMatch = key.replace(/\"/g, '').match(/[a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ]+/g);
                
                const decimalPosition = key.indexOf('.');
                let decimal = -1;
                if (decimalPosition) {
                    let wordPosition = 0;
                    decimal = 0;
                    
                    while (decimalPosition > wordPosition) {
                        wordPosition = key.indexOf(' ', wordPosition + 1);
                        decimal++;
                        if (wordPosition === -1) break;
                    }
                }
                
                if (keyMatch) {
                    keyMatch.forEach(piece => {
                        numbers += (piece.length % 10) + '';
                    });
                    
                    if (decimal) {
                        numbers = numbers.substr(0, decimal) + `.` + numbers.substr(decimal);
                    }
                    
                    return `${numbers};`;
                }
                
                return `${key};`;
            });
        
        // Put ... into ...
        result = result
            .replace(/^Put\s+(.*)\s+into\s+(.*)/gm, `$2 = $1;`);
        
        // replace 1, 1, 1 ... to 1 + 1 + 1 ...
        result = result
            .replace(/(?<=(?:(?:\+|\-)=|(?:\+|\-)=.*,)\s*)1,/gm, `1 +`);
        
        // if
        result = result
            .replace(/^If\s+(.*)/gm, `if ($1) {`);
        
        // underscore instead space in variable names
        result = result
            .replace(/((?:[A-ZÁÍŰŐÜÖÚÓÉ]+[a-záíűőüöúóé]* ?)+)/gm, (full, varName) => {
                return varName.replace(/(?<=[A-ZÁÍŰŐÜÖÚÓÉ]+[a-záíűőüöúóé]*) (?=[A-ZÁÍŰŐÜÖÚÓÉ]+[a-záíűőüöúóé]*)/g, `_`);
            });
        
        // function
        result = result
            .replace(/(?<=^.*takes.*)\s+(\, and|\,|\&|and|\'n\')\s+/gm, `, `)
            .replace(/(?<=^.*takes.*)\,+/g, `,`)
            .replace(/((?:[A-ZÁÍŰŐÜÖÚÓÉ]+[a-záíűőüöúóé]*_?)+)\s+takes\s+(.*)/gm, `function $1($2) {`)
            .replace(/(?<=function\s+[a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ]+)\s+/gm, '');
        
        // return, break, continue
        result = result
            .replace(/^Give back not\s+(.*)/gm, `return !($1);`)
            .replace(/^Give back\s+(.*)/gm, `return $1;`)
            .replace(/^Break it down(?:$|\n|\s+$)/gm, `break;`)
            .replace(/^Take it to the[ _]top(?:$|\n|\s+$)/gm, `continue;`);
        
        // while
        result = result
            .replace(/^While(?:\s+|_)(.*)/gm, `while ($1) {`)
            .replace(/^Until(?:\s+|_)(.*)/gm, `while (!($1)) {`);
        
        // comparsion
        result = result
            .replace(/(?<=\(.+\s*) (=|is)\s+(higher|greater|bigger|stronger)\s+than\s+/gm, ` > `)
            .replace(/(?<=\(.+\s*) (=|is)\s+(lower|less|smaller|weaker)\s+than\s+/gm, ` < `)
            .replace(/(?<=\(.+\s*) (=|is)\s+as\s+(high|great|big|strong)\s+as\s+/gm, ` >= `)
            .replace(/(?<=\(.+\s*) (=|is)\s+as\s+(low|little|small|weak)\s+as\s+/gm, ` <= `)
            .replace(/(?<=^(while|if)\s+\(.*)(?<!(=|<|>))=(?!(=|<|>))(?=.+)/gm, `==`);
        
        // call function
        result = result
            .replace(/([A-ZÁÍŰŐÜÖÚÓÉ]+[a-záíűőüöúóé]*)\s+taking\s+((?: *[a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ0-9_]+(?:\,|\&|\, and|\'n\')*)+)/gm, (full, func, args) => {
                const argsComma = args.replace(/\s*(?:\,|\&|\, and|\'n\')\s*/g, `, `);
                
                return `${func}(${argsComma})`;
            });
        
        // logical operators
        result = result
            .replace(/(?<![a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ0-9_]+\([a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ0-9_, ]+)\s+and\s+/g, ` && `)
            .replace(/(?<=[a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ0-9_]+\([a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ0-9_, ]+)\s+(?:and|&&)\s+/g, `, `)
            .replace(/\s+or\s+/g, ` || `)
            .replace(/\s+not\s+/g, ` !`)
            .replace(/\s+ain'?t\s+/g, ` != `);
        
        // a, an, the, my, your
        result = result
            .replace(/(?<!\\\\)((?:A|a)|(?:A|a)n|(?:T|t)he|(?:M|m)y|(?:Y|y)our)\s+([a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ]+)/gm, (full, first, second) => {
                return `${first.toLocaleLowerCase()}_${second.toLocaleLowerCase()}`;
            });
        
        // Build VAR up
        result = result
            .replace(/^Build(?:\s+|_)([a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ0-9_]*)?\s+(.*)/gm, `$1 += $2;`)
            .replace(/(?<=(?:\+=|\+=.*,)\s*)up/gm, `1`);
        
        // Knock VAR down
        result = result
            .replace(/^Knock(?:\s+|_)([a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ0-9_]*)?\s+(.*)/gm, `$1 -= $2;`)
            .replace(/(?<=(?:\-=|\-=.*,)\s*)down/gm, `1`);
        
        // Listen to ...
        result = result
            .replace(/Listen\s+to\s+(.*)/gm, (full, varName) => {
                const prevLineEnd = result.substr(0, result.indexOf(full)).lastIndexOf(`\n`);
                const prevLineStart = result.substr(0, prevLineEnd - 1).lastIndexOf(`\n`);
                const prevLine = result.substr(prevLineStart, prevLineEnd - prevLineStart);
                
                const prevLineMatch = prevLine.match(/(?<=console\.log\()(.*)(?=\))/g);
                
                const title = (prevLineMatch ? prevLineMatch[0] : '');
                
                return `${varName} = window.prompt(${title});\nif (!isNaN(${varName})) ${varName} = Number(${varName});`;
            });
        
        // add 'var' before variables
        result = result
            .replace(/^(?<!(?:var|if|while|else|function) )([a-záíűőüöúóéA-ZÁÍŰŐÜÖÚÓÉ0-9_]+)(?=\s+=\s+.*)/gm, `var $1`);
        
        // close the blocks
        const openBlockQuery = /\{/gm;
        let openBlock;

        while ((openBlock = openBlockQuery.exec(result)) !== null) {
            if (openBlock.index === openBlockQuery.lastIndex) {
                openBlockQuery.lastIndex++;
            }
            
            const blockClosingPosition = result.indexOf(`\n\n`, openBlock.index);
            
            if(blockClosingPosition !== -1) {
                result = result.substr(0, blockClosingPosition + 1) + `}` + result.substr(blockClosingPosition + 1);
            } else {
                result += `\n}`;
            }
        }
        
        // indent
        const indentSize = Number(document.getElementById('indent-size').value);
        
        const resultRows = result.split(`\n`);
        let row = 0;
        let rowsCount = resultRows.length;
        
        let indent = 0;
        
        while (row < rowsCount) {
            if (resultRows[row].indexOf(`}`) > -1) indent--;
            resultRows[row] = ''.padStart(indentSize * indent) + resultRows[row];
            if (resultRows[row].indexOf(`{`) > -1) indent++;
            
            
            row++;
        }
        
        result = resultRows.join(`\n`);
        
        // remove escaping
        result = result
            .replace(/(\\\\)(\w+)/gm, `$2`)
            .replace(/\ß/g, `{`)
            .replace(/\Ł/g, `}`);
        
        this.result = result;
    }
}

// TODO: Pronouns, string literal-replacements
