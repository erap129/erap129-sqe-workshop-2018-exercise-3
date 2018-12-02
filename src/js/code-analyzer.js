import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

var values = {}
var global_i = 0

function jsonEqual(a,b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
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

function parseExpressionStatement(ast, father){
    Object.keys(values).forEach(function(key) {
        let val = escodegen.generate(ast.declarations[decl].init).replace(key, values[key]);
        values[ast.declarations[decl].id.name] = val;
    });
    for(var row in father)
        if(jsonEqual(father[row], ast))
            father.splice(row, 1);
}

function parseVariableDeclaration(ast, father){
    for(let decl in ast.declarations){
        Object.keys(values).forEach(function(key) {
            let val = escodegen.generate(ast.declarations[decl].init).replace(key, values[key]);
            values[ast.declarations[decl].id.name] = val;
        });
    }
    for(var row in father)
        if(jsonEqual(father[row], ast)){
            father.splice(row, 1);
            global_i--;
        }

}

function parseFunctionDeclaration(ast, father){
    for(var param in ast.params)
        values[ast.params[param].name] = ast.params[param].name;
}

var parseFunctions = {
    'ExpressionStatement': parseExpressionStatement,
    'VariableDeclaration': parseVariableDeclaration,
    'FunctionDeclaration': parseFunctionDeclaration
};

function substitute (ast, father=null){
    console.log(values);
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
