import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {substitution} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let substitution = substitute(parsedCode)
        $('#parsedCode').val(JSON.stringify(substitution, null, 2));
    });
});
