import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

var values = {};
var input_vector = [];
var global_i = 0;
var inFunction = false;

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true});
};

const parseCodeNoLoc = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

function parseRegularBody(ast){
    if(ast.body.constructor === Array){
        let prev_global_i = global_i;
        global_i = 0;
        for (;global_i < ast.body.length; global_i++)
            substitute(ast.body[global_i], ast.body);
        if(ast.type == 'Program'){
            return ast;
        }
        global_i = prev_global_i;
    }
    else
        substitute(ast.body, ast);
}

function parseBody(ast){
    if(ast.type == 'FunctionDeclaration' && !inFunction)
        return parseBodyFuncDecl(ast);
    return parseRegularBody(ast);
}

function parseBodyFuncDecl(ast){
    inFunction = true;
    parseRegularBody(ast);
    inFunction = false;
}

function parseExpressionStatement(ast){
    let replaceStr = replaceSingleExpr(ast.expression.right, true);
    values[escodegen.generate(ast.expression.left)] = '('+replaceStr+')';
}

function storeArray(ast){
    let count = 0;
    for(let item in ast.init.elements){
        let replaceStr = escodegen.generate(ast.init.elements[item]);
        Object.keys(values).forEach(function(key) {
            replaceStr = replaceStr.replace(key, values[key]);
        });
        values[ast.id.name + '[' + count + ']'] = '('+replaceStr+')';
        count++;
    }
}

function parseVariableDeclaration(ast){
    for(let decl in ast.declarations){
        if(ast.declarations[decl].init.type == 'ArrayExpression')
            storeArray(ast.declarations[decl]);
        else{
            let replaceStr = escodegen.generate(ast.declarations[decl].init);
            Object.keys(values).forEach(function(key) {
                replaceStr = replaceStr.replace(key, values[key]);
            });
            values[ast.declarations[decl].id.name] = '('+replaceStr+')';
        }
    }
}

function parseFunctionDeclaration(ast){
    for(var param in ast.params){
        input_vector.push(ast.params[param].name);
    }
}

function parseWhileStatement(ast){
    ast.test = replaceSingleExpr(ast.test);
}

function parseReturnStatement(ast){
    ast.argument = replaceSingleExpr(ast.argument);
}

function parseIfStatement(ast){
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
        if(!input_vector.includes(key)) {
            replacedExpr = replacedExpr.replace(key, values[key]);
        }
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

function substitute(ast){
    if(ast == null)
        return;
    if(parseFunctions.hasOwnProperty(ast.type))
        parseFunctions[ast.type](ast);
    if(ast.hasOwnProperty('body')){
        parseBody(ast);
    }
}

function colorCode(graph, ast, input_vector) {
    let global_input_vector = JSON.parse(input_vector);
    input_vector = global_input_vector;
    Object.keys(global_input_vector).forEach(function (key) {
        values[key] = global_input_vector[key];
    });
    colorCodeCont(graph);
}

function colorCodeCont(graph){
    let loopAvoid = [];
    let currNode = graph[0];
    let beenThere = [];
    while(currNode.type != 'exit'){
        currNode.isColor = true;
        beenThere.push(currNode);
        if(currNode.normal){
            substitute(parseCode(currNode.label));
            currNode = currNode.normal;
        }
        else if(currNode.false || currNode.true){
            currNode = handleColorCodeCond(currNode, loopAvoid);
        }
    }
    currNode.isColor = true;
}

function handleColorCodeCond(currNode, loopAvoid){
    let nodeLabel = currNode.label;
    Object.keys(values).forEach(function (key) {
        nodeLabel = nodeLabel.replace(key, values[key]);
    });
    if(eval(nodeLabel) && !loopAvoid.includes(currNode.true)){
        loopAvoid.push(currNode.true);
        currNode = currNode.true;
    }
    else
        currNode = currNode.false;
    return currNode;
}


export {substitute};
export {parseCode};
export {parseCodeNoLoc};
export {colorCode};
