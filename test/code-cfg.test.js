import assert from 'assert';
import {makeGraph} from '../src/js/code-cfg';
import {parseCode} from '../src/js/code-analyzer';

describe('The graph builder', () => {
    it('is building a simple function graph', () => {
        let func = 'function testFunc(a){\n' +
            'let b = a + 1;\n' +
            'return a;\n' +
            '}';
        let graph = makeGraph(parseCode(func));
        assert.equal(graph[0].label, 'let b = a + 1;');
        assert.equal(graph[1].label, 'return a;');
    });

    it('is building a function with if and array', () => {
        let func = 'function ifFunc(a){\n' +
            'let b = [1, 2];\n' +
            'if(b[0] < 2){\n' +
            '   a = a + 1;\n' +
            '}\n' +
            'else{\n' +
            '   a = a - 1;\n' +
            '}\n' +
            'return b[0] + a;\n' +
            '}';
        let graph = makeGraph(parseCode(func));
        assert.equal(graph[1].true, graph[2]);
        assert.equal(graph[1].false, graph[4]);

        assert.equal(graph[0].label, 'let b = [\n    1,\n    2\n];');
        assert.equal(graph[1].label, 'b[0] < 2');
        assert.equal(graph[2].label, 'a = a + 1');
        assert.equal(graph[4].label, 'a = a - 1');
        assert.equal(graph[3].label, 'return b[0] + a;');
    });

    it('is building a function with while', () => {
        let func = 'function ifFunc(a){\n' +
            'let b = a + 1;\n' +
            'while(b > 2){\n' +
            '   b = b + 1;\n' +
            '}\n' +
            'return b + a;\n' +
            '}';
        let graph = makeGraph(parseCode(func));
        assert.equal(graph[1].true, graph[2]);
        assert.equal(graph[1].false, graph[3]);

        assert.equal(graph[0].label, 'let b = a + 1;');
        assert.equal(graph[1].label, 'b > 2');
        assert.equal(graph[2].label, 'b = b + 1');
        assert.equal(graph[3].label, 'return b + a;');
    });
});
