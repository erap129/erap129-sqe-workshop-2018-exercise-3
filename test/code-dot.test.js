import assert from 'assert';
import {makeGraph} from '../src/js/code-cfg';
import {createGraphScript} from '../src/js/code-dot.js';
import {parseCode} from '../src/js/code-analyzer';
import {colorCode} from '../src/js/code-analyzer.js';

describe('The graph string builder', () => {
    it('is creating graph string for a simple function graph with color', () => {
        let func = 'function testFunc(a){\n' +
            'let b = a + 1;\n' +
            'return a;\n' +
            '}';
        let inputVector = '{"a":1}';
        let pregraph = makeGraph(parseCode(func));
        colorCode(pregraph, parseCode(func), inputVector);
        let graph = createGraphScript(pregraph);
        assert.equal(graph, 'digraph {node_0 [label="1\n' +
            'let b = a + 1;" style=filled fillcolor=green; shape=box]\n' +
            'node_1 [label="2\n' +
            'return a;" style=filled fillcolor=green; shape=box]\n' +
            'node_0->node_1\n }');
    });

    it('is creating graph string for an if function graph', () => {
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
        let graph = createGraphScript(makeGraph(parseCode(func)));
        assert.equal(graph, 'digraph {node_0 [label="1\n' +
            'let b = a + 1;" shape=box]\n' +
            'node_1 [label="2\n' +
            'b > 2" shape=diamond]\n' +
            'node_2 [label="3\n' +
            'b = b + 1" shape=box]\n' +
            'node_3 [label="4\n' +
            'return b + a;" shape=box]\n' +
            'node_4 [label="5\n' +
            'b = b - 1" shape=box]\n' +
            'node_0->node_1\n' +
            'node_1->node_2\n' +
            'node_1->node_4\n' +
            'node_2->node_3\n' +
            'node_4->node_3\n }');
    });

    it('is creating graph string for a function with while', () => {
        let func = 'function ifFunc(a){\n' +
            'let b = a + 1;\n' +
            'while(b > 2){\n' +
            '   b = b + 1;\n' +
            '}\n' +
            'return b + a;\n' +
            '}';
        let graph = createGraphScript(makeGraph(parseCode(func)));
        assert.equal(graph, 'digraph {node_0 [label="1\n' +
            'let b = a + 1;" shape=box]\n' +
            'node_1 [label="2\n' +
            'b > 2" shape=diamond]\n' +
            'node_2 [label="3\n' +
            'b = b + 1" shape=box]\n' +
            'node_3 [label="4\n' +
            'return b + a;" shape=box]\n' +
            'node_0->node_1\n' +
            'node_1->node_2\n' +
            'node_1->node_3\n' +
            'node_2->node_1\n }');
    });
});
