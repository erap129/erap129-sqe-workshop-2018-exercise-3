import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {substitute} from './code-analyzer';
import * as escodegen from 'escodegen';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let substitution = substitute(parsedCode)
        $('#parsedCode').val(escodegen.generate(substitution));
    });
});
