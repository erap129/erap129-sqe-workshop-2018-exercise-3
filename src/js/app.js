import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {makeGraph} from './code-cfg';
import {createGraphScript} from './code-dot.js';
import {colorCode} from './code-analyzer.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let graph = makeGraph(parsedCode);
        let inputVector = $('#inputVector').val();
        colorCode(graph, parsedCode, inputVector);
        let graphDot = createGraphScript(graph);
        printGraph(graphDot);
        $('#ParsedCode').val(JSON.stringify(parsedCode));
    });
});

function printGraph(graphDot){
    var d3 = require('d3-graphviz');
    d3.graphviz('#Graph').renderDot(graphDot);
}
