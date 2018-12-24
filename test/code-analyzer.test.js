import assert from 'assert';
import {parseCode, parseCodeNoLoc, colorCode} from '../src/js/code-analyzer';
import {makeGraph} from '../src/js/code-cfg';

describe('The javascript parser', () => {

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

    it('testing code color for simple function graph', () => {
        let func = 'function testFunc(a){\n' +
            'let b = a + 1;\n' +
            'return a;\n' +
            '}';
        let inputVector = '{"a":1}';
        let graph = makeGraph(parseCode(func));
        colorCode(graph, parseCode(func), inputVector);
        assert.equal(graph[0].label, 'let b = a + 1;');
        assert.equal(graph[0].isColor, true);
        assert.equal(graph[1].label, 'return a;');
        assert.equal(graph[1].isColor, true);
    });

    it('testing code color for function with if', () => {
        let func = 'function ifFunc(a){\n' +
            'let b = a + 1;\n' +
            'if(b > 2){\n' +
            '   b = b + 1;\n' +
            '}\n' +
            'else{\n' +
            '   b = b-1;\n' +
            '}\n' +
            'return b + a;\n' +
            '}';
        let graph = makeGraph(parseCode(func));
        let inputVector = '{"a":1}';
        colorCode(graph, parseCode(func), inputVector);
        assert.equal(graph[1].true, graph[2]);
        assert.equal(graph[1].false, graph[4]);

        assert.equal(graph[0].label, 'let b = a + 1;');
        assert.equal(graph[0].isColor, true);
        assert.equal(graph[1].label, 'b > 2');
        assert.equal(graph[1].isColor, true);
        assert.equal(graph[2].label, 'b = b + 1');
        assert.equal(graph[2].isColor, undefined);
        assert.equal(graph[4].label, 'b = b - 1');
        assert.equal(graph[4].isColor, true);
        assert.equal(graph[3].label, 'return b + a;');
        assert.equal(graph[3].isColor, true);
    });

    it('testing code color for another function with if', () => {
        let func = 'function ifFunc(a){\n' +
            'let b = a + 1;\n' +
            'if(b < 3){\n' +
            '   b = b + 1;\n' +
            '}\n' +
            'else{\n' +
            '   b = b-1;\n' +
            '}\n' +
            'return b + a;\n' +
            '}';
        let graph = makeGraph(parseCode(func));
        let inputVector = '{"a":1}';
        colorCode(graph, parseCode(func), inputVector);
        assert.equal(graph[1].true, graph[2]);
        assert.equal(graph[1].false, graph[4]);

        assert.equal(graph[0].label, 'let b = a + 1;');
        assert.equal(graph[0].isColor, true);
        assert.equal(graph[1].label, 'b < 3');
        assert.equal(graph[1].isColor, true);
        assert.equal(graph[2].label, 'b = b + 1');
        assert.equal(graph[2].isColor, true);
        assert.equal(graph[4].label, 'b = b - 1');
        assert.equal(graph[4].isColor, undefined);
        assert.equal(graph[3].label, 'return b + a;');
        assert.equal(graph[3].isColor, true);
    });

    it('testing code color for a function with if and array', () => {
        let func = 'function ifFunc(a){\n' +
            'let b = [1, 2];\n' +
            'let d = 3;\n' +
            'if(b[0] < 2){\n' +
            '   a = a + 1;\n' +
            '}\n' +
            'else{\n' +
            '   a = a - 1;\n' +
            '}\n' +
            'return b[0] + a;\n' +
            '}';
        let graph = makeGraph(parseCode(func));
        let inputVector = '{"a":1}';
        colorCode(graph, parseCode(func), inputVector);
        assert.equal(graph[1].true, graph[2]);
        assert.equal(graph[1].false, graph[4]);

        assert.equal(graph[0].label, 'let b = [\n    1,\n    2\n];\nlet d = 3;');
        assert.equal(graph[1].label, 'b[0] < 2');
        assert.equal(graph[1].isColor, true);
        assert.equal(graph[2].label, 'a = a + 1');
        assert.equal(graph[4].label, 'a = a - 1');
        assert.equal(graph[3].label, 'return b[0] + a;');
    });

    it('testing code color for function with while', () => {
        let func = 'function whileFunc(a){\n' +
            'let b = a + 1;\n' +
            'while(b > 1){\n' +
            '   a = b + 1;\n' +
            '}\n' +
            'return b + a;\n' +
            '}';
        let graph = makeGraph(parseCode(func));
        let inputVector = '{"a":1}';
        colorCode(graph, parseCode(func), inputVector);
        assert.equal(graph[1].true, graph[2]);
        assert.equal(graph[1].false, graph[3]);

        assert.equal(graph[0].label, 'let b = a + 1;');
        assert.equal(graph[0].isColor, true);
        assert.equal(graph[1].label, 'b > 1');
        assert.equal(graph[1].isColor, true);
        assert.equal(graph[2].label, 'a = b + 1');
        assert.equal(graph[2].isColor, true);
        assert.equal(graph[3].label, 'return b + a;');
        assert.equal(graph[3].isColor, true);
    });
});
