import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

function parseBody(ast, rows){
    if(ast.body.constructor === Array){
        for(var row in ast.body)
            substitute(ast.body[row], ast);
        if(ast.type == 'Program')
            return rows;
    }
    else
        substitute(ast.body, ast);
}

function parseExpressionStatement(ast, father){
    father.remove(ast);
}

var parseFunctions = {
    'ExpressionStatement': parseExpressionStatement,
};

function substitute (ast, father=null){
    if(ast == null)
        return;
    if(parseFunctions.hasOwnProperty(ast.type))
        parseFunctions[ast.type](ast, father);
    if(ast.hasOwnProperty('body')){
        let res = parseBody(ast);
        if(ast.type == 'Program')
            return res;
    }
}

export {substitute};
export {parseCode};
