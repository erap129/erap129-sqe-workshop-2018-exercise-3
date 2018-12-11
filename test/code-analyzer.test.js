import assert from 'assert';
import {parseCode, resetCodeParams} from '../src/js/code-analyzer';
import {parseCodeNoLoc} from '../src/js/code-analyzer';
import {substitute} from '../src/js/code-analyzer';
import {color, resetColorParams} from '../src/js/code-color';
import * as escodegen from 'escodegen';

describe('The javascript parser', () => {

    beforeEach(function() {
        resetColorParams();
        resetCodeParams();
    });

    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCodeNoLoc('')),
            '{"type":"Program","body":[],"sourceType":"script"}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCodeNoLoc('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });

    it('test1_substitution', () => {
        assert.equal(
            escodegen.generate(substitute(parseCode('function foo(x, y, z){\n' +
           '    let a = x + 1;\n' +
           '    let b = a + y;\n' +
           '    let c = 0;\n' +
           '    \n' +
           '    if (b < z) {\n' +
           '        c = c + 5;\n' +
           '        return x + y + z + c;\n' +
           '    } else if (b < z * 2) {\n' +
           '        c = c + x + 5;\n' +
           '        return x + y + z + c;\n' +
           '    } else {\n' +
           '        c = c + z + 5;\n' +
           '        return x + y + z + c;\n' +
           '    }\n' +
           '}'))),
            'function foo(x, y, z) {\n' +
           '    if (x + 1 + y < z) {\n' +
           '        return x + y + z + (0 + 5);\n' +
           '    } else if (x + 1 + y < z * 2) {\n' +
           '        return x + y + z + (0 + x + 5);\n' +
           '    } else {\n' +
           '        return x + y + z + (0 + z + 5);\n' +
           '    }\n' +
           '}'
        );
    });

    it('test2_substitution', () => {
        assert.equal(
            escodegen.generate(substitute(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '}'))),
            'function foo(x, y, z) {\n' +
            '    while (x + 1 < z) {\n' +
            '        z = (x + 1 + (x + 1 + y)) * 2;\n' +
            '    }\n' +
            '    return z;\n' +
            '}'
        );
    });

    it('test3_color', () => {
        assert.deepEqual(
            color(parseCode(escodegen.generate(substitute(parseCode(
                'function foo(x, y, z){\n'+
                '    let a = x + 1;\n'+
                '    let b = a + y;\n'+
                '    let c = 0;\n'+
                '    \n'+
                '    if (b < z) {\n'+
                '        c = c + 5;\n'+
                '        return x + y + z + c;\n'+
                '    } else if (b < z * 2) {\n'+
                '        c = c + x + 5;\n'+
                '        return x + y + z + c;\n'+
                '    } else {\n'+
                '        c = c + z + 5;\n'+
                '        return x + y + z + c;\n'+
                '    }\n'+
                '}'
            )))), '{"x": 1, "y": 2, "z": 3}'),
            [[4],[2]]
        );
    });

    it('test4_color', () => {
        assert.deepEqual(
            color(parseCode(escodegen.generate(substitute(parseCode(
                'function foo(x, y, z){\n'+
                '    let a = x + 1;\n'+
                '    let b = a + y;\n'+
                '    let c = 0;\n'+
                '    \n'+
                '    if (b < z) {\n'+
                '        c = c + 5;\n'+
                '        return x + y + z + c;\n'+
                '    } else if (b < z * 2) {\n'+
                '        c = c + x + 5;\n'+
                '        return x + y + z + c;\n'+
                '    } else {\n'+
                '        c = c + z + 5;\n'+
                '        return x + y + z + c;\n'+
                '    }\n'+
                '}'
            )))), '{"x": 7, "y": 2, "z": 3}'),
            [[],[2, 4]]
        );
    });
});
