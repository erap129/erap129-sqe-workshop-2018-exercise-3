import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

var values = {};
var input_vector = [];
var global_i = 0;

function resetCodeParams(){
    values = {};
    input_vector = [];
    global_i = [];
}

function jsonEqual(a,b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true});
};

function parseBody(ast){
    if(ast.body.constructor === Array){
        for (global_i = 0; global_i < ast.body.length; global_i++)
            substitute(ast.body[global_i], ast.body)
        if(ast.type == 'Program')
            return ast;
    }
    else
        substitute(ast.body, ast);
}

function removeFromFather(ast, father){
    for(var row in father)
        if(jsonEqual(father[row], ast)){
            father.splice(row, 1);
            global_i--;
        }
}

function parseExpressionStatement(ast, father){
    let replaceStr = replaceSingleExpr(ast.expression.right, true);
    values[escodegen.generate(ast.expression.left)] = '('+replaceStr+')';
    ast.expression.right = esprima.parseScript(replaceStr).body[0].expression;
    if(!input_vector.includes(ast.expression.left.name))
        removeFromFather(ast, father);
}

function parseVariableDeclaration(ast, father){
    for(let decl in ast.declarations){
        let replaceStr = escodegen.generate(ast.declarations[decl].init)
        Object.keys(values).forEach(function(key) {
            replaceStr = replaceStr.replace(key, values[key]);
        });
        values[ast.declarations[decl].id.name] = '('+replaceStr+')';
    }
    removeFromFather(ast, father);
}

function parseFunctionDeclaration(ast, father){
    for(var param in ast.params){
        values[ast.params[param].name] = ast.params[param].name;
        input_vector.push(ast.params[param].name);
    }
}

function parseWhileStatement(ast, father){
    ast.test = replaceSingleExpr(ast.test);
}

function parseReturnStatement(ast, father){
    ast.argument = replaceSingleExpr(ast.argument);
}

function parseIfStatement(ast, father){
    ast.test = replaceSingleExpr(ast.test);
    let old_values = JSON.parse(JSON.stringify(values));
    substitute(ast.consequent);
    values = JSON.parse(JSON.stringify(old_values));
    substitute(ast.alternate);
    values = JSON.parse(JSON.stringify(old_values));
}

function replaceSingleExpr(exprAst, raw=false){
    let replacedExpr = escodegen.generate(exprAst);
    Object.keys(values).forEach(function (key) {
        replacedExpr = replacedExpr.replace(key, values[key]);
    });
    if(raw)
        return replacedExpr;
    return esprima.parseScript(replacedExpr).body[0].expression;
}

var parseFunctions = {
    'ExpressionStatement': parseExpressionStatement,
    'VariableDeclaration': parseVariableDeclaration,
    'FunctionDeclaration': parseFunctionDeclaration,
    'IfStatement': parseIfStatement,
    'ReturnStatement': parseReturnStatement,
    'WhileStatement': parseWhileStatement
};

function substitute(ast, father=null){
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
export {resetCodeParams};
