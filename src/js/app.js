import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {substitute} from './code-analyzer';
import {resetCodeParams} from './code-analyzer';
import {color} from './code-color';
import {resetColorParams} from './code-color';
import * as escodegen from 'escodegen';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        resetStuff();
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let substitution = substitute(parsedCode);
        substitution = parseCode(escodegen.generate(substitution));
        let input_vector = {x: 1, y: 2, z: 3};
        let lines = color(substitution, input_vector);
        printColoredLines(escodegen.generate(substitution), lines);
        $('#beforeEscodegen').val(JSON.stringify(substitution, null, 2));
    });
});

function printColoredLines(code, lines) {
    document.getElementById('coloredCode').innerHTML = '';
    let codeLines = code.split("\n");
    console.log(codeLines);
    for (let i = 0; i < codeLines.length; i++) {
        if (lines[0].includes(i + 1))
            document.getElementById('coloredCode').innerHTML += "<pre style='background-color:green; vertical-align: top'>" +
                codeLines[i] + "</pre>";
        else if (lines[1].includes(i + 1))
            document.getElementById('coloredCode').innerHTML += "<pre style='background-color:red; vertical-align: top'>" + codeLines[i] + "</pre>";
        else
            document.getElementById('coloredCode').innerHTML += "<pre style='vertical-align: top'>" + codeLines[i] + "</pre>";
    }
}

function resetStuff(){
    resetColorParams();
    resetCodeParams();
    document.getElementById('coloredCode').innerHTML = '';
}
