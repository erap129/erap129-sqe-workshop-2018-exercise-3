import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {makeGraph} from './code-cfg';
import {createGraphScript} from './code-dot.js';
import {Module, render} from 'viz.js/full.render.js';
import {colorCode} from './code-analyzer.js';
import Viz from 'viz.js';

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
    let v = new Viz({Module,render});
    let graphPage = document.getElementById('Graph');
    v.renderSVGElement(graphDot)
        .then(function(element) {
            graphPage.appendChild(element);
        });
}
